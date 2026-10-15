export type PhotoPurpose = 'hobby' | 'feedback' | 'commercial';

export interface ExifData {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutter?: string;
  focalLength?: string;
}

export interface Photo {
  id: string;
  url: string;
  purpose: PhotoPurpose;
  exif: ExifData;
  upvotes: number;
  title: string;
  author: string;
  createdAt: string;
  price?: number;
}
