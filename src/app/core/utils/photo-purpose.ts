import { PhotoPurpose } from '../models/photo.model';

export const PHOTO_PURPOSE_LABELS: Record<PhotoPurpose, string> = {
  hobby: 'Hobby',
  feedback: 'Para feedback',
  commercial: 'Portafolio comercial',
};

export function purposeLabel(purpose: PhotoPurpose): string {
  return PHOTO_PURPOSE_LABELS[purpose];
}
