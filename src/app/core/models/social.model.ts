export interface Vote {
  id: string;
  photoId: string;
  userId: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  photographerId: string;
  createdAt: string;
}
