/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TripProvider, useTrip } from './context/TripContext';
import { Navigation, NavTab } from './components/Navigation';
import { MyTripsView } from './components/MyTripsView';
import { SavedPlacesView } from './components/SavedPlacesView';
import { ShoppingMoodboardView } from './components/ShoppingMoodboardView';
import { MapView } from './components/MapView';
import { AiRoutePlannerView } from './components/AiRoutePlannerView';
import { ItineraryView } from './components/ItineraryView';
import { DiscoverView } from './components/DiscoverView';
import { BudgetView } from './components/BudgetView';
import {
  TripModal,
  PlaceModal,
  ShoppingItemModal,
  ShoppingDetailModal,
  AddStopToItineraryModal,
  ExpenseModal,
  BackupModal,
} from './components/Modals';
import { Place, ShoppingItem, Trip } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('MY_TRIPS');

  // Modal States
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);

  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);
  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [shoppingToEdit, setShoppingToEdit] = useState<ShoppingItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ShoppingItem | null>(null);

  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [selectedDayForStop, setSelectedDayForStop] = useState<number>(1);
  const [preselectedPlaceIdForStop, setPreselectedPlaceIdForStop] = useState<string | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Quick Action Handler from Top Navigation
  const handleQuickAdd = () => {
    if (activeTab === 'SHOPPING_MOODBOARD') {
      setShoppingToEdit(null);
      setIsShoppingModalOpen(true);
    } else if (activeTab === 'BUDGET') {
      setIsExpenseModalOpen(true);
    } else {
      setPlaceToEdit(null);
      setInitialCoords(null);
      setIsPlaceModalOpen(true);
    }
  };

  const handleOpenAddPlaceWithCoords = (coords?: { lat: number; lng: number }) => {
    setPlaceToEdit(null);
    setInitialCoords(coords || null);
    setIsPlaceModalOpen(true);
  };

  const handleEditPlace = (place: Place) => {
    setPlaceToEdit(place);
    setInitialCoords(null);
    setIsPlaceModalOpen(true);
  };

  const handleOpenQuickAddToItinerary = (placeId: string) => {
    setPreselectedPlaceIdForStop(placeId);
    setSelectedDayForStop(1);
    setIsAddStopModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E1E1E] flex flex-col font-sans selection:bg-[#EAE4D6]">
      {/* 3-Zone Navigation Header */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTripModal={() => {
          setTripToEdit(null);
          setIsTripModalOpen(true);
        }}
        onOpenQuickAdd={handleQuickAdd}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'MY_TRIPS' && (
          <MyTripsView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenTripModal={() => {
              setTripToEdit(null);
              setIsTripModalOpen(true);
            }}
            onOpenShoppingModal={() => {
              setShoppingToEdit(null);
              setIsShoppingModalOpen(true);
            }}
          />
        )}

        {activeTab === 'SAVED_PLACES' && (
          <SavedPlacesView
            onOpenAddPlaceModal={() => {
              setPlaceToEdit(null);
              setInitialCoords(null);
              setIsPlaceModalOpen(true);
            }}
            onEditPlace={handleEditPlace}
            onOpenQuickAddToItinerary={handleOpenQuickAddToItinerary}
          />
        )}

        {activeTab === 'SHOPPING_MOODBOARD' && (
          <ShoppingMoodboardView
            onOpenAddModal={() => {
              setShoppingToEdit(null);
              setIsShoppingModalOpen(true);
            }}
            onEditItem={(item) => {
              setShoppingToEdit(item);
              setIsShoppingModalOpen(true);
            }}
            onViewItemDetail={(item) => setSelectedDetailItem(item)}
          />
        )}

        {activeTab === 'MAP' && (
          <MapView
            onOpenAddPlaceModal={handleOpenAddPlaceWithCoords}
            onOpenAddToItinerary={handleOpenQuickAddToItinerary}
          />
        )}

        {activeTab === 'AI_ROUTE_PLANNER' && (
          <AiRoutePlannerView
            onNavigateToItinerary={() => setActiveTab('ITINERARY')}
            onOpenQuickAddToItinerary={handleOpenQuickAddToItinerary}
          />
        )}

        {activeTab === 'ITINERARY' && (
          <ItineraryView
            onNavigateToAi={() => setActiveTab('AI_ROUTE_PLANNER')}
            onOpenAddStopModal={(dayNum) => {
              setSelectedDayForStop(dayNum);
              setPreselectedPlaceIdForStop(null);
              setIsAddStopModalOpen(true);
            }}
          />
        )}

        {activeTab === 'DISCOVER' && (
          <DiscoverView
            onSavedToMyTripSuccess={() => {
              // Notification or toast
            }}
          />
        )}

        {activeTab === 'BUDGET' && (
          <BudgetView onOpenAddExpenseModal={() => setIsExpenseModalOpen(true)} />
        )}
      </main>

      {/* Editorial Footer (Section 1.B: Quiet, natural prose, no fake telemetry) */}
      <footer className="mt-auto border-t border-[#E8E2D5] bg-[#F7F4EC] py-8 text-xs text-[#7A7265]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-base tracking-tight text-[#1A1A1A]">
              TRIPLOG
            </span>
            <span>·</span>
            <span>나만의 감각적인 올인원 여행 플래너 & 라이프스타일 아카이브</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-[#8C8476]">
            <span>LOCAL STORAGE DURABLE</span>
            <span>·</span>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-[#1E1E1E] underline cursor-pointer"
            >
              DATA BACKUP
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        tripToEdit={tripToEdit}
      />

      <PlaceModal
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        placeToEdit={placeToEdit}
        initialCoords={initialCoords}
      />

      <ShoppingItemModal
        isOpen={isShoppingModalOpen}
        onClose={() => setIsShoppingModalOpen(false)}
        itemToEdit={shoppingToEdit}
      />

      <ShoppingDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onEdit={(item) => {
          setShoppingToEdit(item);
          setIsShoppingModalOpen(true);
        }}
      />

      <AddStopToItineraryModal
        isOpen={isAddStopModalOpen}
        onClose={() => setIsAddStopModalOpen(false)}
        dayNumber={selectedDayForStop}
        preselectedPlaceId={preselectedPlaceIdForStop}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <TripProvider>
      <MainApp />
    </TripProvider>
  );
}
