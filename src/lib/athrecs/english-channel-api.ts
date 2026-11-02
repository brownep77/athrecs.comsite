import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
export const getChannelDirectory = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "private, no-store");
  return (await import("./english-channel.server")).listPublishedChannel();
});
export const getChannelSwimmer = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    return (await import("./english-channel.server")).publishedChannel(data);
  });
