import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND = "http://192.168.4.8:8000";
const BASKET_ID = 1;

type ApiData = Record<string, any>;

async function postBackend(
  path: string,
  body: Record<string, unknown>
): Promise<ApiData> {
  const response = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data: ApiData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || `${path} failed (${response.status})`
    );
  }

  return data;
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function recoverBasket(): Promise<ApiData> {
  return postBackend("/hardware/recover", {
    basket_id: BASKET_ID,
  });
}

async function transitionBasket(nextState: string): Promise<ApiData> {
  return postBackend(`/baskets/${BASKET_ID}/state/transition`, {
    next_state: nextState,
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Smart Basket hardware route is loaded",
  });
}

export async function POST(request: Request) {
  let workflowStarted = false;

  try {
    const body = await request.json();
    const productId = Number(body.product_id);

    if (!Number.isInteger(productId) || productId < 1) {
      return NextResponse.json(
        { error: "A valid product_id is required." },
        { status: 400 }
      );
    }

    workflowStarted = true;

    // STEP 1: Register the add request.
    await postBackend("/verification/scan", {
      basket_id: BASKET_ID,
      selected_product_id: productId,
      action: "add",
    });

    // STEP 2: Allow time for the camera to capture the product.
    await delay(2000);

    // STEP 3: Verify the product using the camera.
    const camera = await postBackend("/verification/camera-result", {
      basket_id: BASKET_ID,
      action: "add",
    });

    // CAMERA FAILURE: Recover the basket.
    if (camera.outcome !== "MATCH" || !camera.authorization_token) {
      let recovery: ApiData;

      try {
        recovery = await recoverBasket();
      } catch (recoveryError) {
        return NextResponse.json(
          {
            success: false,
            error: "Camera verification failed.",
            recoverySuccess: false,
            recoveryError:
              recoveryError instanceof Error
                ? recoveryError.message
                : "Basket recovery failed.",
            camera,
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Camera verification failed. Product was not added.",
          recoverySuccess: recovery.success === true,
          recovery,
          camera,
        },
        { status: 409 }
      );
    }

    // STEP 4: Capture the current basket weight BEFORE opening the doors.
    // This baseline is used to calculate the weight of the added product.
    const baseline = await postBackend("/hardware/weight/baseline", {
      basket_id: BASKET_ID,
    });

    // STEP 5: Open the doors using the camera authorization token.
    await postBackend("/hardware/servos/open-all", {
      basket_id: BASKET_ID,
      product_id: productId,
      authorization_token: camera.authorization_token,
    });

    // STEP 6: Give the user time to place the product.
    await delay(8000);

    // STEP 7: Verify the weight against the captured baseline.
    const weight = await postBackend("/hardware/verify-weight", {
      basket_id: BASKET_ID,
      product_id: productId,
    });

    // WEIGHT FAILURE: Recover the basket.
    if (weight.verified !== true) {
      let recovery: ApiData;

      try {
        recovery = await recoverBasket();
      } catch (recoveryError) {
        return NextResponse.json(
          {
            success: false,
            error: "Weight verification failed. Product was not added.",
            recoverySuccess: false,
            recoveryError:
              recoveryError instanceof Error
                ? recoveryError.message
                : "Basket recovery failed.",
            camera,
            baseline,
            weight,
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Weight verification failed. Product was not added.",
          recoverySuccess: recovery.success === true,
          recovery,
          camera,
          baseline,
          weight,
        },
        { status: 409 }
      );
    }

    // STEP 8: Follow the permitted state transitions.
    await transitionBasket("verifying_add");

    await transitionBasket("servo_closing");

    // STEP 9: Close the doors.
    // The backend sets the basket state to shopping after closing.
    await postBackend("/hardware/servos/close-all", {
      basket_id: BASKET_ID,
    });

    return NextResponse.json({
      success: true,
      message: "Camera and weight verification passed.",
      product_id: productId,
      camera,
      baseline,
      weight,
      current_state: "shopping",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Hardware workflow failed.";

    // Recover after any unexpected error during the workflow.
    if (workflowStarted) {
      try {
        const recovery = await recoverBasket();

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            recoverySuccess: recovery.success === true,
            recovery,
          },
          { status: 502 }
        );
      } catch (recoveryError) {
        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            recoverySuccess: false,
            recoveryError:
              recoveryError instanceof Error
                ? recoveryError.message
                : "Basket recovery failed.",
            warning:
              "The doors' physical closed position is not confirmed. Do not retry until the basket is checked.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 502 }
    );
  }
}