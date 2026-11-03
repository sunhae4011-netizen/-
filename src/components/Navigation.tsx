import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Compass,
  Bookmark,
  Sparkles,
  MapPin,
  CalendarDays,
  ShoppingBag,
  Wallet,
  Plus,
  ChevronDown,
  Database,
  Menu,
  X,
} from 'lucide-react';

export type NavTab = 
  | 'MY_TRIPS' 
  | 'SAVED_PLACES' 
  | 'SHOPPING_MOODBOARD' 
  | 'MAP' 
  | 'AI_ROUTE_PLANNER' 
  | 'ITINERARY' 
  | 'DISCOVER' 
  | 'BUDGET';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenTripModal: () => void;
  onOpenQuickAdd: () => void;
  onOpenBackupModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenTripModal,
  onOpenQuickAdd,
  onOpenBackupModal,
}) => {
  const { trips, activeTrip, setActiveTripId } = useTrip();
  const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'MY_TRIPS', label: 'My Trips', icon: <Compass className="w-4 h-4" /> },
    { id: 'SAVED_PLACES', label: 'Saved Places', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'SHOPPING_MOODBOARD', label: 'Moodboard', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'MAP', label: 'Map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'AI_ROUTE_PLANNER', label: 'AI Route', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'ITINERARY', label: 'Itinerary', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'DISCOVER', label: 'Discover', icon: <Compass className="w-4 h-4" /> },
    { id: 'BUDGET', label: 'Budget', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E8E2D5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('MY_TRIPS')}
              className="text-left group cursor-pointer"
            >
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A] group-hover:text-[#C85A32] transition-colors">
                TRIPLOG
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest uppercase font-mono text-[#8C8275]">
                Lifestyle Archive
              </span>
            </button>

            {/* Active Trip Quick Selector */}
            {activeTrip && (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsTripDropdownOpen(!isTripDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#4A453E] bg-[#EFECE4] hover:bg-[#E5E0D5] rounded-md transition-colors cursor-pointer border border-[#E0D9CC]"
                  title="현재 활성화된 여행 전환"
                >
                  <span className="max-w-[130px] truncate">{activeTrip.city} · {activeTrip.name}</span>
                  <ChevronDown className="w-3 h-3 text-[#7A7265]" />
                </button>

                {isTripDropdownOpen && (
                  <div
                    className="absolute left-0 mt-1.5 w-64 bg-white rounded-lg shadow-xl border border-[#E8E2D5] py-1.5 z-50 text-xs"
                    onMouseLeave={() => setIsTripDropdownOpen(false)}
                  >
                    <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#9C9487] border-b border-[#F0ECE3] mb-1">
                      선택된 여행 전환
                    </div>
                    {trips.map((trip) => (
                      <button
                        key={trip.id}
                        onClick={() => {
                          setActiveTripId(trip.id);
                          setIsTripDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F8F6F0] cursor-pointer transition-colors ${
                          trip.id === activeTrip.id ? 'bg-[#F4F0E6] font-semibold text-[#1E1E1E]' : 'text-[#5C554B]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-medium">{trip.name}</p>
                          <p className="text-[10px] text-[#8C8476]">{trip.city} · {trip.startDate}</p>
                        </div>
                        {trip.id === activeTrip.id && (
                          <span className="text-[10px] font-mono text-[#C85A32]">ACTIVE</span>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-[#F0ECE3] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsTripDropdownOpen(false);
                          onOpenTripModal();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-[#C85A32] hover:bg-[#FDF6F0] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>새 여행 추가하기</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zone 2: Navigation Links (Clean Single-Line Typography) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-[#C85A32] text-[#1A1A1A] font-semibold'
                      : 'border-transparent text-[#6B6457] hover:text-[#1A1A1A] hover:border-[#D5CDBD]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action + Utility Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBackupModal}
              title="데이터 백업 및 복원"
              className="hidden sm:flex items-center gap-1 p-2 text-xs text-[#7A7265] hover:text-[#1A1A1A] hover:bg-[#EFECE4] rounded-md transition-colors cursor-pointer border border-transparent hover:border-[#E0D9CC]"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">BACKUP</span>
            </button>

            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E1E1E] hover:bg-[#C85A32] rounded-md transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>장소 / 위시 추가</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#4A453E] hover:text-[#1A1A1A] hover:bg-[#EFECE4] rounded-md transition-colors cursor-pointer"
              aria-label="메뉴 열기"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D5] bg-[#FBF9F5] px-4 pt-3 pb-6 space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#8C8476] mb-2 px-2">Navigation</div>
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-xs rounded-md text-left transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#1E1E1E] text-white font-medium'
                    : 'text-[#4A453E] hover:bg-[#EFECE4]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-between text-xs text-[#7A7265] px-2">
            <button
              onClick={() => {
                onOpenTripModal();
                setIsMobileMenuOpen(false);
              }}
              className="text-[#C85A32] font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 새 여행 생성
            </button>
            <button
              onClick={() => {
                onOpenBackupModal();
                setIsMobileMenuOpen(false);
              }}
              className="hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <Database className="w-3 h-3" /> 백업 / 복원
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
