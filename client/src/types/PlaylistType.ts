import type { Track } from "./TrackType";

export type Playlist = {
  _id: string;
  title: string;
  userId: string;
  tracksCount: number;
  tracks: (Track & { addedAt?: string })[];
  createdAt: Date;
  coverPhotoUrl: string | null;
};
