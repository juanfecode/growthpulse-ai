import { prisma } from "@/lib/prisma";
import type { AbVariant } from "@/lib/generated/prisma/enums";

export const AB_VARIANT_COOKIE = "gp_variant";
export const AB_ASSIGNMENT_COOKIE = "gp_assignment";

export type Assignment = {
  id: string;
  variant: AbVariant;
};

export async function assignNextAssignment(): Promise<Assignment> {
  const count = await prisma.abAssignment.count();
  const variant: AbVariant = count % 2 === 0 ? "A" : "B";

  const row = await prisma.abAssignment.create({
    data: { variant },
    select: { id: true, variant: true },
  });

  return row;
}

export function isValidVariant(value: string | undefined): value is AbVariant {
  return value === "A" || value === "B";
}

export async function markConverted(assignmentId: string): Promise<void> {
  await prisma.abAssignment.update({
    where: { id: assignmentId },
    data: { converted: true },
  });
}
