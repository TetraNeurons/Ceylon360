export type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  place: string;
  price: string;
  phone: string;
  organizer: string;
  ticketCount: number;
  images: string[];
  lat: number;
  lng: number;
};

export interface TravelerData { country: string; }
export interface GuideData { rating: number; totalReviews: number; }
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TRAVELER' | 'GUIDE' | 'ADMIN';
  gender?: string;
  travelerData?: TravelerData;
  guideData?: GuideData;
  createdAt: string;
}
export interface Stats {
  totalUsers: number;
  totalTravelers: number;
  totalGuides: number;
  totalAdmins: number;
}