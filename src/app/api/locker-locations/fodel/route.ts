import { NextRequest, NextResponse } from "next/server";

import { operationsApiRequest } from "@/lib/clients/operations";
import { OPERATIONS_FODEL_APPKEY } from "@/lib/config/server-env";
import { OPERATIONS_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { STATUS } from "@/lib/constants/service-result";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, language, latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({
        data: null,
        error: "Latitude and longitude are required",
        status: STATUS.ERROR,
      });
    }

    const { data } = await operationsApiRequest({
      body: {
        appkey: OPERATIONS_FODEL_APPKEY,
        country: country,
        language: language,
        latitude: String(latitude),
        longitude: String(longitude),
        warehouse: null,
      },
      endpoint: OPERATIONS_ENDPOINTS.FODEL_POINTS,
    });

    return NextResponse.json({
      data,
      status: STATUS.OK,
    });
  } catch (error) {
    console.error("Error fetching Fodel locations:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({
      data: null,
      error: errorMessage,
      status: STATUS.ERROR,
    });
  }
}
