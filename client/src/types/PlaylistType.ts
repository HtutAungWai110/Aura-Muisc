import type { Track } from "./TrackType";

export type PlaylistItem = {
  track: Track;
  addedAt: string;
};

export type Playlist = {
  _id: string;
  title: string;
  userId: string;
  tracks: PlaylistItem[];
  trackCount: number;
  createdAt: Date;
  coverPhotoUrl: string | null;
};
