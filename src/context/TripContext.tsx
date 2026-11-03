import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Trip,
  Place,
  ShoppingItem,
  ItineraryDay,
  Expense,
  AIRoutePlan,
  DiscoverSpot,
} from '../types';
import {
  INITIAL_TRIPS,
  INITIAL_PLACES,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_ITINERARY,
  INITIAL_EXPENSES,
  STORAGE_KEYS,
  loadStoredData,
  saveStoredData,
} from '../data/initialData';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  setActiveTripId: (id: string) => void;
  createTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  // Places
  places: Place[];
  activeTripPlaces: Place[];
  addPlace: (place: Omit<Place, 'id' | 'createdAt'>) => Place;
  updatePlace: (id: string, updates: Partial<Place>) => void;
  deletePlace: (id: string) => void;
  togglePlaceVisited: (id: string) => void;

  // Shopping Items
  shoppingItems: ShoppingItem[];
  activeTripShoppingItems: ShoppingItem[];
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => ShoppingItem;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  toggleShoppingItemPurchased: (id: string) => void;

  // Itinerary
  itinerary: ItineraryDay[];
  activeTripItinerary: ItineraryDay[];
  addStopToDay: (dayNumber: number, placeId: string, notes?: string) => void;
  removeStopFromDay: (dayNumber: number, stopId: string) => void;
  reorderStops: (dayNumber: number, newStops: any[]) => void;
  toggleStopCompleted: (dayNumber: number, stopId: string) => void;
  applyAiRouteToItinerary: (route: AIRoutePlan) => void;
  createItineraryDay: (title?: string) => void;

  // Expenses & Budget
  expenses: Expense[];
  activeTripExpenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;
  budgetSummary: {
    totalBudget: number;
    actualSpent: number;
    remainingBudget: number;
    pendingWishlistAmount: number;
    projectedTotalSpent: number;
    perPersonBudget: number;
    perPersonSpent: number;
    isOverBudget: boolean;
  };

  // AI & Discovery
  isAiLoading: boolean;
  aiRoutes: AIRoutePlan[];
  fetchAiRoutes: (style?: string) => Promise<void>;
  discoverSpots: (query: string) => Promise<DiscoverSpot[]>;
  extractSnsItem: (url: string) => Promise<any>;

  // Data Persistence Backup
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  resetToDefaultData: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() =>
    loadStoredData(STORAGE_KEYS.TRIPS, INITIAL_TRIPS)
  );

  const [activeTripId, setActiveTripIdState] = useState<string>(() => {
    const saved = loadStoredData<string | null>(STORAGE_KEYS.ACTIVE_TRIP_ID, null);
    if (saved && trips.some((t) => t.id === saved)) return saved;
    return trips[0]?.id || '';
  });

  const [places, setPlaces] = useState<Place[]>(() =>
    loadStoredData(STORAGE_KEYS.PLACES, INITIAL_PLACES)
  );

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() =>
    loadStoredData(STORAGE_KEYS.SHOPPING, INITIAL_SHOPPING_ITEMS)
  );

  const [itinerary, setItinerary] = useState<ItineraryDay[]>(() =>
    loadStoredData(STORAGE_KEYS.ITINERARY, INITIAL_ITINERARY)
  );

  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadStoredData(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES)
  );

  const [aiRoutes, setAiRoutes] = useState<AIRoutePlan[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TRIPS, trips);
  }, [trips]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.ACTIVE_TRIP_ID, activeTripId);
  }, [activeTripId]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PLACES, places);
  }, [places]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.SHOPPING, shoppingItems);
  }, [shoppingItems]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.ITINERARY, itinerary);
  }, [itinerary]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.EXPENSES, expenses);
  }, [expenses]);

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0] || null;

  const setActiveTripId = (id: string) => {
    setActiveTripIdState(id);
  };

  const createTrip = (tripData: Omit<Trip, 'id' | 'createdAt'>): Trip => {
    const newId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...tripData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripIdState(newId);
    return newTrip;
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (activeTripId === id) {
      const remaining = trips.filter((t) => t.id !== id);
      if (remaining.length > 0) {
        setActiveTripIdState(remaining[0].id);
      }
    }
  };

  // Filtered views by active trip
  const activeTripPlaces = places.filter((p) => p.tripId === activeTripId);
  const activeTripShoppingItems = shoppingItems.filter((s) => s.tripId === activeTripId);
  const activeTripItinerary = itinerary; // Global itinerary can be scoped or per trip
  const activeTripExpenses = expenses.filter((e) => e.tripId === activeTripId);

  // Place Handlers
  const addPlace = (placeData: Omit<Place, 'id' | 'createdAt'>): Place => {
    const newPlace: Place = {
      ...placeData,
      id: `place-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlaces((prev) => [newPlace, ...prev]);
    return newPlace;
  };

  const updatePlace = (id: string, updates: Partial<Place>) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    // Also remove from itinerary stops if present
    setItinerary((prev) =>
      prev.map((day) => ({
        ...day,
        stops: day.stops.filter((s) => s.placeId !== id),
      }))
    );
  };

  const togglePlaceVisited = (id: string) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visited: !p.visited } : p))
    );
  };

  // Shopping Handlers
  const addShoppingItem = (
    itemData: Omit<ShoppingItem, 'id' | 'createdAt'>
  ): ShoppingItem => {
    const newItem: ShoppingItem = {
      ...itemData,
      id: `shop-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setShoppingItems((prev) => [newItem, ...prev]);

    // If store address is provided, auto-create a place in Saved Places if not present
    if (newItem.targetStore && newItem.storeAddress) {
      const alreadyHasPlace = places.some(
        (p) => p.tripId === itemData.tripId && p.name === newItem.targetStore
      );
      if (!alreadyHasPlace) {
        addPlace({
          tripId: itemData.tripId,
          name: newItem.targetStore,
          address: newItem.storeAddress,
          lat: newItem.storeLat || 35.6580 + (Math.random() - 0.5) * 0.05,
          lng: newItem.storeLng || 139.7016 + (Math.random() - 0.5) * 0.05,
          area: newItem.storeArea || '쇼핑 권역',
          category: 'SHOPPING',
          imageUrl: newItem.imageUrl,
          notes: `[쇼핑 위시리스트 연결] ${newItem.brand} - ${newItem.title} 구매 매장`,
          priority: 'MUST',
          visited: false,
          relatedShoppingItemId: newItem.id,
        });
      }
    }

    return newItem;
  };

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((s) => s.id !== id));
    // Also remove associated shopping expense if any
    setExpenses((prev) => prev.filter((e) => e.shoppingItemId !== id));
  };

  const toggleShoppingItemPurchased = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newPurchased = !item.purchased;

        // When toggled to purchased, auto-record into trip expenses
        if (newPurchased) {
          const rate = activeTrip?.exchangeRate || 9.15;
          const amountKRW =
            item.currency === 'KRW'
              ? item.price
              : Math.round(item.price * rate);

          const newExpense: Expense = {
            id: `exp-shop-${item.id}`,
            tripId: item.tripId,
            title: `${item.brand} ${item.title} (구매완료)`,
            amount: item.price,
            currency: item.currency,
            amountKRW: amountKRW,
            date: new Date().toISOString().split('T')[0],
            category: 'SHOPPING',
            payer: '나 (Me)',
            paymentMethod: 'CARD',
            notes: `쇼핑 무드보드 [${item.targetStore}]에서 구매 확인`,
            isShoppingItem: true,
            shoppingItemId: item.id,
          };

          setExpenses((exp) => {
            if (exp.some((e) => e.shoppingItemId === item.id)) return exp;
            return [newExpense, ...exp];
          });
        } else {
          // If untoggled, remove the auto-generated expense
          setExpenses((exp) => exp.filter((e) => e.shoppingItemId !== item.id));
        }

        return { ...item, purchased: newPurchased };
      })
    );
  };

  // Itinerary Handlers
  const addStopToDay = (dayNumber: number, placeId: string, notes?: string) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        const newOrder = day.stops.length + 1;
        const newStop = {
          id: `stop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          placeId,
          order: newOrder,
          time: '12:00',
          stayMinutes: 60,
          transitFromPrevMinutes: 15,
          transitSummary: '도보 또는 대중교통 약 15분',
          notes: notes || '',
          completed: false,
        };
        return {
          ...day,
          stops: [...day.stops, newStop],
        };
      })
    );
  };

  const removeStopFromDay = (dayNumber: number, stopId: string) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        const filtered = day.stops.filter((s) => s.id !== stopId);
        return {
          ...day,
          stops: filtered.map((s, idx) => ({ ...s, order: idx + 1 })),
        };
      })
    );
  };

  const reorderStops = (dayNumber: number, newStops: any[]) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          stops: newStops.map((s, idx) => ({ ...s, order: idx + 1 })),
        };
      })
    );
  };

  const toggleStopCompleted = (dayNumber: number, stopId: string) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          stops: day.stops.map((s) =>
            s.id === stopId ? { ...s, completed: !s.completed } : s
          ),
        };
      })
    );
  };

  const createItineraryDay = (title?: string) => {
    setItinerary((prev) => {
      const nextDayNum = prev.length + 1;
      const baseDate = new Date(activeTrip?.startDate || '2026-04-10');
      baseDate.setDate(baseDate.getDate() + nextDayNum - 1);
      const dateStr = baseDate.toISOString().split('T')[0];

      return [
        ...prev,
        {
          dayNumber: nextDayNum,
          date: dateStr,
          title: title || `DAY ${nextDayNum} 여정`,
          stops: [],
        },
      ];
    });
  };

  const applyAiRouteToItinerary = (route: AIRoutePlan) => {
    const newDays: ItineraryDay[] = route.days.map((d) => {
      const baseDate = new Date(activeTrip?.startDate || '2026-04-10');
      baseDate.setDate(baseDate.getDate() + d.dayNumber - 1);
      return {
        dayNumber: d.dayNumber,
        date: baseDate.toISOString().split('T')[0],
        title: d.dayTheme,
        stops: d.stops.map((s, idx) => ({
          id: `ai-stop-${Date.now()}-${idx}`,
          placeId: s.placeId,
          order: s.order,
          time: `${10 + idx * 2}:00`,
          stayMinutes: s.stayMinutes || 60,
          transitFromPrevMinutes: s.transitMinutes || 15,
          transitSummary: s.transitSummary || '이동 약 15분',
          notes: s.tip || '',
          completed: false,
        })),
      };
    });

    setItinerary(newDays);
  };

  // Expenses Handlers
  const addExpense = (expenseData: Omit<Expense, 'id'>): Expense => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Budget calculations
  const totalBudget = activeTrip?.totalBudget || 0;
  const actualSpent = activeTripExpenses.reduce((sum, e) => sum + e.amountKRW, 0);
  const remainingBudget = totalBudget - actualSpent;

  // Unpurchased shopping items converted to KRW
  const rate = activeTrip?.exchangeRate || 9.15;
  const pendingWishlistAmount = activeTripShoppingItems
    .filter((s) => !s.purchased)
    .reduce((sum, s) => {
      const inKRW = s.currency === 'KRW' ? s.price : Math.round(s.price * rate);
      return sum + inKRW;
    }, 0);

  const projectedTotalSpent = actualSpent + pendingWishlistAmount;
  const numCompanions = Math.max(1, activeTrip?.companions?.length || 1);
  const perPersonBudget = activeTrip?.perPersonBudget || Math.round(totalBudget / numCompanions);
  const perPersonSpent = Math.round(actualSpent / numCompanions);

  const budgetSummary = {
    totalBudget,
    actualSpent,
    remainingBudget,
    pendingWishlistAmount,
    projectedTotalSpent,
    perPersonBudget,
    perPersonSpent,
    isOverBudget: actualSpent > totalBudget,
  };

  // AI & Discovery Callers
  const fetchAiRoutes = async (style: string = 'balanced') => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/recommend-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          places: activeTripPlaces,
          tripCity: activeTrip?.city || '도쿄',
          tripCountry: activeTrip?.country || '일본',
          style,
          days: activeTrip?.durationDays || 3,
        }),
      });
      const data = await res.json();
      if (data.routes && Array.isArray(data.routes)) {
        setAiRoutes(data.routes);
      }
    } catch (e) {
      console.error('Failed to fetch AI routes:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const discoverSpots = async (query: string): Promise<DiscoverSpot[]> => {
    try {
      const res = await fetch('/api/ai/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          city: activeTrip?.city || '도쿄',
        }),
      });
      const data = await res.json();
      return data.spots || [];
    } catch (e) {
      console.error('Discover error:', e);
      return [];
    }
  };

  const extractSnsItem = async (url: string) => {
    try {
      const res = await fetch('/api/ai/extract-sns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          destinationCity: activeTrip?.city || '도쿄',
        }),
      });
      return await res.json();
    } catch (e) {
      console.error('Extract SNS error:', e);
      return null;
    }
  };

  // Export & Import
  const exportDataJson = () => {
    const data = {
      trips,
      activeTripId,
      places,
      shoppingItems,
      itinerary,
      expenses,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.trips && Array.isArray(parsed.trips)) {
        setTrips(parsed.trips);
        if (parsed.activeTripId) setActiveTripIdState(parsed.activeTripId);
        if (parsed.places) setPlaces(parsed.places);
        if (parsed.shoppingItems) setShoppingItems(parsed.shoppingItems);
        if (parsed.itinerary) setItinerary(parsed.itinerary);
        if (parsed.expenses) setExpenses(parsed.expenses);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import parse error:', e);
      return false;
    }
  };

  const resetToDefaultData = () => {
    setTrips(INITIAL_TRIPS);
    setActiveTripIdState(INITIAL_TRIPS[0].id);
    setPlaces(INITIAL_PLACES);
    setShoppingItems(INITIAL_SHOPPING_ITEMS);
    setItinerary(INITIAL_ITINERARY);
    setExpenses(INITIAL_EXPENSES);
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        setActiveTripId,
        createTrip,
        updateTrip,
        deleteTrip,
        places,
        activeTripPlaces,
        addPlace,
        updatePlace,
        deletePlace,
        togglePlaceVisited,
        shoppingItems,
        activeTripShoppingItems,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        toggleShoppingItemPurchased,
        itinerary,
        activeTripItinerary,
        addStopToDay,
        removeStopFromDay,
        reorderStops,
        toggleStopCompleted,
        applyAiRouteToItinerary,
        createItineraryDay,
        expenses,
        activeTripExpenses,
        addExpense,
        deleteExpense,
        budgetSummary,
        isAiLoading,
        aiRoutes,
        fetchAiRoutes,
        discoverSpots,
        extractSnsItem,
        exportDataJson,
        importDataJson,
        resetToDefaultData,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
