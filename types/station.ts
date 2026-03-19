export type FuelStatus = 'available' | 'limited' | 'unavailable';
export type QueueLength = 'short' | 'medium' | 'long' | 'none';

export interface FuelType {
  type: string;
  status: FuelStatus;
  price: number;
  queueLength?: QueueLength;
  lastReportedAt?: string;
  reportCount?: number;
}

export interface UserReport {
  id: string;
  stationId: string;
  fuelType: string;
  availability: FuelStatus;
  queueLength: QueueLength;
  comment: string;
  submittedAt: string;
  upvotes: number;
  downvotes: number;
  isGeoverified: boolean;
  /** Milliseconds since submitted (computed on client) */
  ageMs?: number;
}

export interface Station {
  id: string;
  name: string;
  brand: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  lastUpdated: string;
  reportCount: number;
  fuelTypes: FuelType[];
  /** Geofence radius in metres — default 500 */
  geofenceRadius?: number;
}
