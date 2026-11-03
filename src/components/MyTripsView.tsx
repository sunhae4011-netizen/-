import React from 'react';
import { useTrip } from '../context/TripContext';
import { NavTab } from './Navigation';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  ShoppingBag,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface MyTripsViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenTripModal: () => void;
  onOpenShoppingModal: () => void;
}

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  onNavigate,
  onOpenTripModal,
  onOpenShoppingModal,
}) => {
  const {
    trips,
    activeTrip,
    setActiveTripId,
    deleteTrip,
    activeTripPlaces,
    activeTripShoppingItems,
    activeTripItinerary,
    budgetSummary,
  } = useTrip();

  // D-Day calculation
  const calculateDDay = (startDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const pendingShopping = activeTripShoppingItems.filter((i) => !i.purchased);
  const completedStopsCount = activeTripItinerary.reduce(
    (acc, day) => acc + day.stops.filter((s) => s.completed).length,
    0
  );
  const totalStopsCount = activeTripItinerary.reduce((acc, day) => acc + day.stops.length, 0);

  return (
    <div className="space-y-10 pb-16">
      {/* Editorial Hero Header for Active Trip */}
      {activeTrip && (
        <section className="relative rounded-2xl overflow-hidden bg-[#1A1A1A] text-white shadow-xl">
          <div className="absolute inset-0">
            <img
              src={activeTrip.coverImage}
              alt={activeTrip.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105 hover:scale-100 transition-transform duration-700"
              onError={(e) => {
                // Fallback elegant background
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent" />
          </div>

          <div className="relative p-6 sm:p-10 lg:p-12 max-w-4xl">
            {/* Editorial Kicker */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#D8CFBF] mb-3">
              <span>{activeTrip.country}</span>
              <span aria-hidden="true">·</span>
              <span>{activeTrip.city}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#E07A5F] font-bold">{calculateDDay(activeTrip.startDate)}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white mb-4 leading-tight">
              {activeTrip.name}
            </h1>

            <p className="text-sm sm:text-base text-[#D0C8B8] max-w-2xl font-light mb-8 leading-relaxed">
              {activeTrip.notes || '기록하고 싶은 감각적인 장소와 쇼핑 위시리스트를 채워가는 나만의 여행 아카이브.'}
            </p>

            {/* Quick Metrics Bar (Clean, Unboxed Metadata) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-white/15">
              <div>
                <p className="text-[11px] font-mono tracking-wider uppercase text-[#A89F8F]">저장 장소</p>
                <p className="text-2xl font-display font-bold text-white tabular-nums">
                  {activeTripPlaces.length}
                  <span className="text-xs font-normal text-[#B5AC9E] ml-1">스폿</span>
                </p>
              </div>

              <div>
                <p className="text-[11px] font-mono tracking-wider uppercase text-[#A89F8F]">쇼핑 위시리스트</p>
                <p className="text-2xl font-display font-bold text-white tabular-nums">
                  {activeTripShoppingItems.length}
                  <span className="text-xs font-normal text-[#B5AC9E] ml-1">아이템</span>
                </p>
              </div>

              <div>
                <p className="text-[11px] font-mono tracking-wider uppercase text-[#A89F8F]">예산 대비 실지출</p>
                <p className="text-2xl font-display font-bold text-white tabular-nums">
                  {Math.round((budgetSummary.actualSpent / Math.max(1, budgetSummary.totalBudget)) * 100)}%
                </p>
              </div>

              <div>
                <p className="text-[11px] font-mono tracking-wider uppercase text-[#A89F8F]">일정 진행도</p>
                <p className="text-2xl font-display font-bold text-white tabular-nums">
                  {completedStopsCount} / {totalStopsCount}
                </p>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={() => onNavigate('AI_ROUTE_PLANNER')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] hover:bg-[#b04b25] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI 여행 코스 추천받기</span>
              </button>
              <button
                onClick={() => onNavigate('MAP')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer backdrop-blur-sm border border-white/20"
              >
                <MapPin className="w-4 h-4" />
                <span>지역별 지도 확인</span>
              </button>
              <button
                onClick={() => onNavigate('SHOPPING_MOODBOARD')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer backdrop-blur-sm border border-white/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>쇼핑 무드보드</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Grid: Travel Dashboard Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Trip Itinerary & Uncompleted Wishlist */}
        <div className="lg:col-span-2 space-y-8">
          {/* Day By Day Itinerary Preview */}
          <div className="bg-white rounded-xl p-6 border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE3] mb-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">여정 타임라인</h2>
                <p className="text-xs text-[#7A7265] mt-0.5">
                  총 {activeTripItinerary.length}일간의 날짜별 세부 일정 및 동선
                </p>
              </div>
              <button
                onClick={() => onNavigate('ITINERARY')}
                className="flex items-center gap-1 text-xs font-medium text-[#C85A32] hover:underline cursor-pointer"
              >
                <span>전체 일정 편집</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-6">
              {activeTripItinerary.slice(0, 3).map((day) => (
                <div key={day.dayNumber} className="border-l-2 border-[#E0D8C8] pl-4 relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-[#C85A32]">
                      DAY {day.dayNumber} · {day.date}
                    </span>
                    <span className="text-xs text-[#8C8476]">{day.stops.length}개 방문지</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1E1E1E]">
                    {day.title || `DAY ${day.dayNumber} 플랜`}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {day.stops.map((stop) => {
                      const place = activeTripPlaces.find((p) => p.id === stop.placeId);
                      return (
                        <div
                          key={stop.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#FBF9F5] rounded-md border border-[#ECE6D9]"
                        >
                          {stop.completed ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="w-3 h-3 text-[#9C9487] shrink-0" />
                          )}
                          <span className="font-medium text-[#333] truncate max-w-[140px]">
                            {place?.name || '저장 장소'}
                          </span>
                          {stop.time && <span className="text-[10px] text-[#8C8275]">· {stop.time}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Shopping Wishlist in Destination */}
          <div className="bg-white rounded-xl p-6 border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE3] mb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">미완료 쇼핑 위시리스트</h2>
                <p className="text-xs text-[#7A7265] mt-0.5">
                  여행지에서 실물 확인 및 구매 예정인 아이템 {pendingShopping.length}개
                </p>
              </div>
              <button
                onClick={() => onNavigate('SHOPPING_MOODBOARD')}
                className="flex items-center gap-1 text-xs font-medium text-[#C85A32] hover:underline cursor-pointer"
              >
                <span>무드보드 전체보기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingShopping.length === 0 ? (
              <p className="text-xs text-[#8C8275] py-4 text-center">모든 쇼핑 위시리스트를 구매 완료했습니다!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingShopping.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-[#FAF8F3] rounded-lg border border-[#EDE7DC] hover:border-[#D5CDBD] transition-all"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-[#ECE7DC] shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-mono uppercase text-[#8C8275]">{item.brand}</p>
                      <h4 className="text-xs font-semibold text-[#1E1E1E] truncate">{item.title}</h4>
                      <p className="text-xs font-medium text-[#C85A32] mt-0.5">
                        {item.currency} {item.price.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-[#7A7265] truncate flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-[#9E9586]" />
                        <span>{item.targetStore}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Budget Quick Glance & All Trips List */}
        <div className="space-y-8">
          {/* Budget Widget */}
          <div className="bg-white rounded-xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">경비 한눈에 보기</h3>
              <button
                onClick={() => onNavigate('BUDGET')}
                className="text-xs text-[#C85A32] hover:underline cursor-pointer"
              >
                상세 관리
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#6E675B]">전체 여행 예산</span>
                <span className="font-semibold tabular-nums">
                  {budgetSummary.totalBudget.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6E675B]">현재 실제 지출</span>
                <span className="font-bold text-[#1E1E1E] tabular-nums">
                  {budgetSummary.actualSpent.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6E675B]">쇼핑 위시 예정액</span>
                <span className="text-[#7A7265] tabular-nums">
                  +{budgetSummary.pendingWishlistAmount.toLocaleString()}원
                </span>
              </div>
              <div className="pt-2 border-t border-[#F0ECE3] flex justify-between text-xs font-semibold">
                <span className="text-[#1E1E1E]">예상 총 지출</span>
                <span
                  className={`tabular-nums ${
                    budgetSummary.projectedTotalSpent > budgetSummary.totalBudget
                      ? 'text-[#C85A32]'
                      : 'text-emerald-700'
                  }`}
                >
                  {budgetSummary.projectedTotalSpent.toLocaleString()}원
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#EFECE4] rounded-full h-2 overflow-hidden mt-3">
                <div
                  className="bg-[#1E1E1E] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (budgetSummary.actualSpent / Math.max(1, budgetSummary.totalBudget)) * 100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#8C8476] text-right font-mono">
                남은 예산: {Math.max(0, budgetSummary.remainingBudget).toLocaleString()}원
              </p>
            </div>
          </div>

          {/* All Trips Archive Switcher */}
          <div className="bg-white rounded-xl p-6 border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">나의 여행 아카이브</h3>
              <button
                onClick={onOpenTripModal}
                className="flex items-center gap-1 text-xs text-[#C85A32] font-medium hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 여행</span>
              </button>
            </div>

            <div className="space-y-3">
              {trips.map((trip) => {
                const isCurrent = trip.id === activeTrip?.id;
                return (
                  <div
                    key={trip.id}
                    onClick={() => setActiveTripId(trip.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-[#F7F4EC] border-[#C85A32] ring-1 ring-[#C85A32]/20'
                        : 'bg-[#FAF8F3] border-[#EDE7DC] hover:border-[#D5CDBD]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#8C8275]">{trip.city}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono text-[#C85A32] font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-[#1E1E1E] truncate mt-0.5">
                        {trip.name}
                      </h4>
                      <p className="text-[11px] text-[#7A7265] mt-1 flex items-center gap-2">
                        <span>{trip.startDate} ~ {trip.endDate}</span>
                        <span>·</span>
                        <span>{trip.durationDays}일간</span>
                      </p>
                    </div>

                    {trips.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`'${trip.name}' 여행을 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.`)) {
                            deleteTrip(trip.id);
                          }
                        }}
                        className="p-1.5 text-[#9C9487] hover:text-rose-600 rounded-md transition-colors"
                        title="여행 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
