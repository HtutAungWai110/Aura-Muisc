export interface Track {
  _id: string;
  title: string;
  artist: string;
  addedAt: string;
  thumbnailUrl?: string;
  fileUrl: string;
  userId: string;
  __v: number;
  duration: number;
}
