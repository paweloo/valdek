import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export { parseGoogleSheetUrl } from "./sheets-url";

const FetchSchema = z.object({
  url: z.string().min(8).max(500),
});

export const fetchGoogleSheet = createServerFn({ method: "POST" })
  .validator((data) => FetchSchema.parse(data))
  .handler(async ({ data }) => {
    const { downloadGoogleSheet } = await import("./sheets.server");
    return downloadGoogleSheet(data.url);
  });
