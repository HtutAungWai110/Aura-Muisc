import z, { string } from "zod";

export const playlistTitleSchema = z.object({
  playlistTitle: string(),
});
