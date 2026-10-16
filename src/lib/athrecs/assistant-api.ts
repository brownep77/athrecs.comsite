import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";
import { assistantInput } from "./assistant";

export const getAssistantStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { assistantConfig, privateAssistantResponse } = await import("./assistant.server");
  privateAssistantResponse();
  const { enabled, whatsappUrl } = assistantConfig();
  return { enabled, whatsappUrl };
});
export const getAssistantHistory = createServerFn({ method: "POST" }).handler(async () => {
  const { assistantHistory } = await import("./assistant.server");
  return assistantHistory();
});
export const sendAssistantMessage = createServerFn({ method: "POST" })
  .validator(assistantInput)
  .handler(async ({ data }) => {
    const { assistantSend } = await import("./assistant.server");
    return assistantSend(data);
  });
export const getStaffAssistantChats = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator(z.object({ page: z.number().int().min(0).max(400).default(0) }))
  .handler(async ({ data }) => {
    const { listAssistantChats } = await import("./assistant.server");
    return listAssistantChats(data.page);
  });
export const getStaffAssistantTranscript = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { assistantTranscript } = await import("./assistant.server");
    return assistantTranscript(data.id);
  });
export const deleteStaffAssistantTranscript = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const sql = await getSql();
    await sql`DELETE FROM assistant_conversations WHERE id = ${data.id}`;
    return { deleted: true };
  });
