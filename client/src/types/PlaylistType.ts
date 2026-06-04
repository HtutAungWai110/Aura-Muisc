import type { Track } from "./TrackType";

export type Playlist = {
  _id: string;
  title: string;
  userId: string;
  tracks: Track[];
  createdAt: Date;
  coverPhotoUrl: string | null;
};
