import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const getMyProfileRevision = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    const { getSql } = await import("@/lib/db");
    const { linkedProfileRevision } = await import("./profile-revision.server");
    return linkedProfileRevision(await getSql(), context.userId);
  });
