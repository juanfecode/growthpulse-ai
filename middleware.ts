import { NextResponse, type NextRequest } from "next/server";
import {
  AB_VARIANT_COOKIE,
  AB_ASSIGNMENT_COOKIE,
  assignNextAssignment,
  isValidVariant,
} from "@/lib/ab-testing";

export const config = {
  runtime: "nodejs",
  matcher: ["/"],
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function middleware(request: NextRequest) {
  const existingVariant = request.cookies.get(AB_VARIANT_COOKIE)?.value;
  const existingAssignment = request.cookies.get(AB_ASSIGNMENT_COOKIE)?.value;

  if (isValidVariant(existingVariant) && existingAssignment) {
    return NextResponse.next();
  }

  const assignment = await assignNextAssignment();
  const response = NextResponse.next();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  };

  response.cookies.set(AB_VARIANT_COOKIE, assignment.variant, cookieOptions);
  response.cookies.set(AB_ASSIGNMENT_COOKIE, assignment.id, cookieOptions);

  return response;
}
