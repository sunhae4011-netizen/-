export type PlaceCategory = 
  | 'RESTAURANT' 
  | 'CAFE' 
  | 'TOUR' 
  | 'SHOPPING' 
  | 'ACCOMMODATION' 
  | 'ETC';

export type PlacePriority = 'MUST' | 'WANT' | 'IF_POSSIBLE';

export interface Place {
  id: string;
  tripId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  area: string; // e.g. '시부야', '신주쿠', '긴자', '다이칸야마', '하라주쿠'
  category: PlaceCategory;
  imageUrl: string;
  googleMapsUrl?: string;
  snsUrl?: string;
  notes: string;
  priority: PlacePriority;
  visited: boolean;
  relatedShoppingItemId?: string;
  createdAt: string;
}

export type ShoppingCategory = 
  | 'CLOTHING' 
  | 'BAG' 
  | 'SHOES' 
  | 'ACCESSORIES' 
  | 'BEAUTY' 
  | 'LIFESTYLE' 
  | 'VINTAGE' 
  | 'ETC';

export type SocialPlatform = 'Instagram' | 'Pinterest' | 'YouTube' | 'TikTok' | 'WebShop' | 'Other';

export interface ShoppingItem {
  id: string;
  tripId: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl?: string;
  snsUrl?: string;
  platform: SocialPlatform;
  targetStore: string;
  storeAddress: string;
  storeLat?: number;
  storeLng?: number;
  storeArea?: string;
  notes: string;
  purchased: boolean;
  category: ShoppingCategory;
  boardName?: string;
  createdAt: string;
}

export interface ItineraryStop {
  id: string;
  placeId: string;
  order: number;
  time?: string; // '10:30'
  stayMinutes: number;
  transitFromPrevMinutes?: number;
  transitSummary?: string;
  notes?: string;
  completed: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  title?: string;
  stops: ItineraryStop[];
}

export type ExpenseCategory = 
  | 'FLIGHT' 
  | 'HOTEL' 
  | 'TRANSPORT' 
  | 'FOOD' 
  | 'CAFE' 
  | 'SHOPPING' 
  | 'TOUR' 
  | 'ETC';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  amountKRW: number;
  date: string;
  category: ExpenseCategory;
  payer: string;
  paymentMethod: 'CARD' | 'CASH' | 'PAY';
  notes?: string;
  isShoppingItem?: boolean;
  shoppingItemId?: string;
}

export interface Trip {
  id: string;
  name: string;
  country: string;
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  companions: string[];
  totalBudget: number; // in KRW
  perPersonBudget: number; // in KRW
  currency: string; // 'JPY', 'USD', 'TWD', etc.
  exchangeRate: number; // e.g. 9.15 KRW per 1 JPY
  coverImage: string;
  notes: string;
  createdAt: string;
}

export interface AIRouteStop {
  placeId: string;
  placeName: string;
  category: string;
  order: number;
  transitMinutes: number;
  transitSummary?: string;
  stayMinutes: number;
  tip?: string;
}

export interface AIRouteDay {
  dayNumber: number;
  dayTheme: string;
  stops: AIRouteStop[];
}

export interface UnassignedPlace {
  placeId: string;
  placeName: string;
  reason: string;
}

export interface AIRoutePlan {
  id: string;
  courseCode: string; // 'COURSE A', 'COURSE B', etc.
  title: string;
  description: string;
  paceStyle: string; // '여유형' | '일반형' | '알찬형' | '욕심쟁이형'
  totalDurationHours: number;
  days: AIRouteDay[];
  unassignedPlaces: UnassignedPlace[];
}

export interface DiscoverSpot {
  name: string;
  category: PlaceCategory;
  area: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  signature: string;
  reason: string;
  openingHours?: string;
}
