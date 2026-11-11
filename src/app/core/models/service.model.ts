export interface Service {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  isPublished: boolean;
  deliverables?: string;
  turnaround?: string;
}
