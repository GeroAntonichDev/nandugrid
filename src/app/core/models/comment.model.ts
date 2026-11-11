export interface Comment {
  id: string;
  photoId: string;
  authorId: string;
  text: string;
  tags?: string[];
  createdAt: string;
}
