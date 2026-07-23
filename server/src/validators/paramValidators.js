import z from "zod";

// ObjectId validation (assuming 24 character hex string)
const objectId = z.string().length(24).regex(/^[0-9a-fA-F]{24}$/);

export const playlistIdSchema = z.object({
  id: objectId,
});

export const trackIdSchema = z.object({
  trackId: objectId,
});

export const playlistAndTrackIdSchema = z.object({
  id: objectId,
  trackId: objectId,
});

export const idSchema = z.object({
  id: objectId,
});

// Body validation schemas for batch operations
export const batchIdsSchema = z.object({
  ids: z.array(objectId).min(1, "At least one ID is required"),
});

export const batchTrackIdsSchema = z.object({
  trackIds: z.array(objectId).min(1, "At least one track ID is required"),
});
