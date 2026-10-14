import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { operationInput } from "./operations";

export const getCollectionOperations = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => operationInput.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { readCollectionOperations } = await import("./operations.server");
    return readCollectionOperations(await getSql(), data);
  });
