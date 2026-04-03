import { NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";

export async function GET() {
  const response = await getCurrentCustomer();

  return NextResponse.json(response);
}
