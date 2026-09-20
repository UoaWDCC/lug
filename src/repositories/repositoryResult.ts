import { Prisma } from "@/generated/prisma/client";

export type RepositoryError = "not_found" | "duplicate" | "database";

export type RepositoryResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: { type: RepositoryError } };

export async function runRepositoryOperation<TData>(
  operation: () => Promise<TData>,
): Promise<RepositoryResult<TData>> {
  try {
    const data = await operation();

    return {
      ok: true,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        type: classifyPrismaError(error),
      },
    };
  }
}

export function classifyPrismaError(error: unknown): RepositoryError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "duplicate";
    }

    if (error.code === "P2025") {
      return "not_found";
    }
  }

  return "database";
}
