import z from "zod";

export const playlistTitleSchema = z.object({
  playlistTitle: z.string().min(1, "Playlist title is required"),
});
