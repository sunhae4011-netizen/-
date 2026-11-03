import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { ItineraryStop, Place } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ItineraryViewProps {
  onNavigateToAi: () => void;
  onOpenAddStopModal: (dayNumber: number) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  onNavigateToAi,
  onOpenAddStopModal,
}) => {
  const {
    activeTrip,
    activeTripPlaces,
    activeTripItinerary,
    removeStopFromDay,
    reorderStops,
    toggleStopCompleted,
    createItineraryDay,
  } = useTrip();

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  const selectedDay =
    activeTripItinerary.find((d) => d.dayNumber === selectedDayNumber) ||
    activeTripItinerary[0] ||
    null;

  // Stops for current selected day
  const stops = selectedDay?.stops || [];

  // Calculate day total duration and busy schedule warning
  const dayStats = useMemo(() => {
    let totalStayMinutes = 0;
    let totalTransitMinutes = 0;

    stops.forEach((s) => {
      totalStayMinutes += s.stayMinutes || 60;
      totalTransitMinutes += s.transitFromPrevMinutes || 15;
    });

    const totalMinutes = totalStayMinutes + totalTransitMinutes;
    const totalHours = (totalMinutes / 60).toFixed(1);
    const isOvercrowded = stops.length >= 7 || totalMinutes >= 600; // 10 hours

    return {
      totalMinutes,
      totalHours,
      totalStayMinutes,
      totalTransitMinutes,
      isOvercrowded,
    };
  }, [stops]);

  // Move stop up or down
  const handleMoveStop = (index: number, direction: 'UP' | 'DOWN') => {
    if (!selectedDay) return;
    const newStops = [...stops];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    reorderStops(selectedDay.dayNumber, newStops);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275] uppercase tracking-wider">
            <span>Daily Itinerary</span>
            <span>·</span>
            <span>{activeTrip?.city} 실전 일정표</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-1">
            날짜별 확정 여행 일정표
          </h1>
          <p className="text-xs text-[#7A7265] mt-1 font-light max-w-2xl">
            AI가 추천한 코스를 바탕으로 직접 순서와 방문 시간을 조율하고, 실제 여행 중 체크리스트로 활용하세요.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onNavigateToAi}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F8F6F0] text-[#1E1E1E] text-xs font-medium rounded-lg border border-[#E0D8C8] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>AI 코스 불러오기</span>
          </button>
          <button
            onClick={() => createItineraryDay()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>DAY 추가</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {activeTripItinerary.map((day) => {
          const isSelected = selectedDayNumber === day.dayNumber;
          const completedCount = day.stops.filter((s) => s.completed).length;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-sm'
                  : 'bg-white text-[#4A453E] border-[#E8E2D5] hover:bg-[#F8F6F0]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  DAY {day.dayNumber}
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    isSelected ? 'text-[#D0C8B8]' : 'text-[#8C8476]'
                  }`}
                >
                  {day.date}
                </span>
              </div>
              <p className="text-xs font-medium mt-1 truncate max-w-[140px]">
                {day.title || `DAY ${day.dayNumber}`}
              </p>
              <p
                className={`text-[10px] mt-1 ${
                  isSelected ? 'text-[#E07A5F]' : 'text-[#8C8476]'
                }`}
              >
                {completedCount}/{day.stops.length} 완료
              </p>
            </button>
          );
        })}
      </div>

      {/* Overcrowded Warning Banner if busy */}
      {dayStats.isOvercrowded && (
        <div className="p-4 bg-[#FFF6EE] border border-[#F4D1B8] rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#8C3415]">일정 과밀 경고 (예상 총 {dayStats.totalHours}시간 소요)</p>
            <p className="text-[#A44A26] mt-0.5 leading-relaxed">
              하루에 {stops.length}곳이 배정되어 이동 피로도나 매장 웨이팅 등으로 일정이 지연될 수 있습니다.
              여유로운 여행을 위해 일부 장소를 다른 날로 분산하거나 체류 시간을 조정해보세요.
            </p>
          </div>
        </div>
      )}

      {/* Main Day Content */}
      {selectedDay && (
        <div className="bg-white rounded-xl p-6 border border-[#E8E2D5] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#F0ECE3]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#C85A32] font-semibold">
                <span>DAY {selectedDay.dayNumber}</span>
                <span>·</span>
                <span>{selectedDay.date}</span>
                <span>·</span>
                <span>총 예상 {dayStats.totalHours}시간 소요</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1">
                {selectedDay.title || `DAY ${selectedDay.dayNumber} 여행`}
              </h2>
            </div>

            <button
              onClick={() => onOpenAddStopModal(selectedDay.dayNumber)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF8F3] hover:bg-[#F2ECE1] text-[#1E1E1E] text-xs font-medium rounded-lg border border-[#E0D8C8] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>방문 장소 추가</span>
            </button>
          </div>

          {stops.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Calendar className="w-8 h-8 text-[#9C9487] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">아직 등록된 일정이 없습니다</h3>
              <p className="text-xs text-[#7A7265] max-w-sm mx-auto">
                AI 추천 코스를 불러오거나, 저장한 장소에서 원하는 스폿을 추가해보세요.
              </p>
              <button
                onClick={() => onOpenAddStopModal(selectedDay.dayNumber)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white text-xs font-medium rounded-lg hover:bg-[#b04b25] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>장소 추가하기</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {stops.map((stop, idx) => {
                const place = activeTripPlaces.find((p) => p.id === stop.placeId);
                return (
                  <div key={stop.id} className="space-y-2">
                    {/* Transit Connector Indicator */}
                    {idx > 0 && (
                      <div className="flex items-center gap-3 pl-8 py-1 text-[11px] text-[#8C8476] font-mono">
                        <div className="w-0.5 h-4 bg-[#E0D8C8] -ml-2" />
                        <span className="flex items-center gap-1 text-[#C85A32]">
                          <Clock className="w-3 h-3" />
                          <span>{stop.transitSummary || `이전 장소에서 약 ${stop.transitFromPrevMinutes || 15}분 이동`}</span>
                        </span>
                      </div>
                    )}

                    {/* Stop Card */}
                    <div
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        stop.completed
                          ? 'bg-[#F9FCF9] border-[#D1E0D1] opacity-75'
                          : 'bg-[#FAF8F3] border-[#EDE7DC] hover:border-[#D5CDBD]'
                      }`}
                    >
                      {/* Left: Order and Details */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        {/* Completed Checkbox */}
                        <button
                          onClick={() => toggleStopCompleted(selectedDay.dayNumber, stop.id)}
                          className="mt-0.5 sm:mt-0 p-1 text-[#8C8476] hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                          title={stop.completed ? '완료 취소' : '방문 완료 체크'}
                        >
                          {stop.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#A89F8F]" />
                          )}
                        </button>

                        <div className="w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[11px] text-[#8C8476]">
                            <span className="font-semibold text-[#1E1E1E]">{stop.time || '시간 미지정'}</span>
                            <span>·</span>
                            <span>체류 약 {stop.stayMinutes}분</span>
                            {place?.area && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-[#C85A32]">{place.area}</span>
                              </>
                            )}
                          </div>

                          <h3
                            className={`font-serif text-base font-bold text-[#1A1A1A] mt-0.5 ${
                              stop.completed ? 'line-through text-[#8C8476]' : ''
                            }`}
                          >
                            {place?.name || '저장 장소'}
                          </h3>

                          {place?.address && (
                            <p className="text-[11px] text-[#7A7265] truncate mt-0.5">
                              {place.address}
                            </p>
                          )}

                          {stop.notes && (
                            <p className="text-xs text-[#5C554B] bg-white p-2 rounded border border-[#EDE7DC] mt-2 leading-relaxed">
                              {stop.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0ECE3] w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleMoveStop(idx, 'UP')}
                          disabled={idx === 0}
                          className="p-1.5 text-[#7A7265] hover:text-[#1E1E1E] disabled:opacity-30 rounded hover:bg-[#EFECE4] transition-colors cursor-pointer"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveStop(idx, 'DOWN')}
                          disabled={idx === stops.length - 1}
                          className="p-1.5 text-[#7A7265] hover:text-[#1E1E1E] disabled:opacity-30 rounded hover:bg-[#EFECE4] transition-colors cursor-pointer"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('이 일정을 삭제하시겠습니까?')) {
                              removeStopFromDay(selectedDay.dayNumber, stop.id);
                            }
                          }}
                          className="p-1.5 text-[#9C9487] hover:text-rose-600 rounded hover:bg-[#FDF0EE] transition-colors cursor-pointer"
                          title="일정에서 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
