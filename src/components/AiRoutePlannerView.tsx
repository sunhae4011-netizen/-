import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { AIRoutePlan, Place } from '../types';
import {
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface AiRoutePlannerViewProps {
  onNavigateToItinerary: () => void;
  onOpenQuickAddToItinerary: (placeId: string) => void;
}

export const AiRoutePlannerView: React.FC<AiRoutePlannerViewProps> = ({
  onNavigateToItinerary,
  onOpenQuickAddToItinerary,
}) => {
  const {
    activeTrip,
    activeTripPlaces,
    aiRoutes,
    fetchAiRoutes,
    isAiLoading,
    applyAiRouteToItinerary,
  } = useTrip();

  const [selectedStyle, setSelectedStyle] = useState<'relaxed' | 'balanced' | 'packed' | 'ambitious'>(
    'balanced'
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Auto-fetch if no routes exist yet
  useEffect(() => {
    if (aiRoutes.length === 0 && activeTripPlaces.length > 0) {
      fetchAiRoutes(selectedStyle);
    }
  }, [activeTrip?.id]);

  useEffect(() => {
    if (aiRoutes.length > 0 && !selectedCourseId) {
      setSelectedCourseId(aiRoutes[0].id);
    }
  }, [aiRoutes]);

  const activeCourse =
    aiRoutes.find((r) => r.id === selectedCourseId) || aiRoutes[0] || null;

  const handleGenerate = (style: typeof selectedStyle) => {
    setSelectedStyle(style);
    fetchAiRoutes(style);
  };

  const handleApplyToMyItinerary = () => {
    if (!activeCourse) return;
    if (
      confirm(
        `[${activeCourse.courseCode}: ${activeCourse.title}] 코스를 내 여행 일정표에 최종 반영하시겠습니까? (기존 일정표가 해당 코스로 갱신됩니다)`
      )
    ) {
      applyAiRouteToItinerary(activeCourse);
      setAppliedSuccess(true);
      setTimeout(() => {
        onNavigateToItinerary();
      }, 1000);
    }
  };

  // Calculate included vs unassigned stats
  const totalSavedPlacesCount = activeTripPlaces.length;
  const includedPlaceIds = new Set<string>();
  if (activeCourse) {
    activeCourse.days.forEach((d) => d.stops.forEach((s) => includedPlaceIds.add(s.placeId)));
  }
  const includedCount = includedPlaceIds.size;
  const unassignedCount = Math.max(0, totalSavedPlacesCount - includedCount);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275] uppercase tracking-wider">
            <span>AI Intelligent Curation</span>
            <span>·</span>
            <span>{activeTrip?.city} 맞춤 동선 제안</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-1">
            AI 여행 코스 제안 & 동선 최적화
          </h1>
          <p className="text-xs text-[#7A7265] mt-1 font-light max-w-3xl">
            AI는 계획을 강제로 결정하지 않습니다. 저장한 장소를 바탕으로 이동 시간, 체류 시간,
            테마를 고려한 <strong>여러 가지 선택지를 제안</strong>하며, 최종 일정 반영은 사용자가 직접 선택합니다.
          </p>
        </div>

        <button
          onClick={() => handleGenerate(selectedStyle)}
          disabled={isAiLoading || activeTripPlaces.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] hover:bg-[#b04b25] disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
          <span>{isAiLoading ? 'AI 코스 생성 중...' : '코스 새로 제안받기'}</span>
        </button>
      </div>

      {/* Travel Style Selector */}
      <div className="bg-white p-5 rounded-xl border border-[#E8E2D5] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">
            원하는 여행 스타일을 선택하세요
          </h3>
          <span className="text-xs text-[#8C8476]">
            선택한 페이스에 맞춰 AI가 하루 방문지 개수를 조절합니다
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'relaxed', label: '여유형', desc: '하루 3~4곳 (커피와 산책 중심)' },
            { id: 'balanced', label: '일반형 (추천)', desc: '하루 5~6곳 (균형 잡힌 일정)' },
            { id: 'packed', label: '알찬형', desc: '하루 7~9곳 (많은 스폿 탐방)' },
            { id: 'ambitious', label: '욕심쟁이형', desc: '저장한 장소 최대한 많이 포함' },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => handleGenerate(style.id as any)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selectedStyle === style.id
                  ? 'bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-sm'
                  : 'bg-[#FAF8F3] text-[#4A453E] border-[#EDE7DC] hover:border-[#D5CDBD]'
              }`}
            >
              <p className="text-xs font-bold">{style.label}</p>
              <p
                className={`text-[11px] mt-0.5 leading-snug ${
                  selectedStyle === style.id ? 'text-[#D0C8B8]' : 'text-[#8C8476]'
                }`}
              >
                {style.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Place Coverage Banner (No Missing Places Guarantee) */}
      <div className="bg-[#FAF8F3] border border-[#E8E2D5] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E0D8C8] shadow-2xs">
            <Sparkles className="w-5 h-5 text-[#C85A32]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E1E1E]">저장 장소 누락 방지 & 투명한 배정</h4>
            <p className="text-[11px] text-[#7A7265] mt-0.5">
              전체 저장 {totalSavedPlacesCount}개 중 현재 코스 포함 {includedCount}개 · 미배정 장소 {unassignedCount}개
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-white rounded border border-[#E0D8C8] font-mono text-[#1E1E1E]">
            포함율: {Math.round((includedCount / Math.max(1, totalSavedPlacesCount)) * 100)}%
          </span>
        </div>
      </div>

      {/* Courses Tab Bar (COURSE A ~ E) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {aiRoutes.map((course) => {
          const isSelected = activeCourse?.id === course.id;
          return (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`px-4 py-2.5 rounded-lg border text-left transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-sm'
                  : 'bg-white text-[#4A453E] border-[#E8E2D5] hover:bg-[#F8F6F0]'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                {course.courseCode}
              </span>
              <span className="text-xs font-semibold">{course.title}</span>
            </button>
          );
        })}
      </div>

      {/* Course Detail Split View */}
      {activeCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 Cols): Day by Day Timeline in Course */}
          <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-[#E8E2D5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#F0ECE3]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#C85A32] font-semibold uppercase">
                  <span>{activeCourse.courseCode}</span>
                  <span>·</span>
                  <span>총 예상 소요시간 {activeCourse.totalDurationHours}시간</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1">
                  {activeCourse.title}
                </h2>
                <p className="text-xs text-[#5C554B] mt-1.5 font-light leading-relaxed">
                  {activeCourse.description}
                </p>
              </div>

              {/* Commit Button */}
              <button
                onClick={handleApplyToMyItinerary}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C85A32] hover:bg-[#b04b25] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm shrink-0 self-start sm:self-auto"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>내 일정으로 저장하기</span>
              </button>
            </div>

            {appliedSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>코스가 여행 일정표(TRAVEL ITINERARY)에 성공적으로 저장되었습니다!</span>
              </div>
            )}

            {/* Days list */}
            <div className="space-y-8">
              {activeCourse.days.map((day) => (
                <div key={day.dayNumber} className="space-y-4">
                  <div className="flex items-center justify-between bg-[#FBF9F5] px-3.5 py-2 rounded-lg border border-[#EDE7DC]">
                    <span className="font-mono text-xs font-bold uppercase text-[#C85A32]">
                      DAY {day.dayNumber}
                    </span>
                    <span className="text-xs font-medium text-[#1E1E1E]">{day.dayTheme}</span>
                    <span className="text-xs text-[#8C8476]">{day.stops.length}곳 방문</span>
                  </div>

                  <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5DFD3]">
                    {day.stops.map((stop, idx) => {
                      const place = activeTripPlaces.find((p) => p.id === stop.placeId);
                      return (
                        <div
                          key={stop.placeId}
                          className="relative pl-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAF8F3] hover:bg-white rounded-lg border border-[#EDE7DC] transition-colors"
                        >
                          {/* Order Node */}
                          <div className="absolute left-2.5 top-4 -translate-x-1/2 w-6 h-6 rounded-full bg-[#1E1E1E] text-white text-[11px] font-mono font-bold flex items-center justify-center ring-4 ring-white">
                            {idx + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[11px] text-[#8C8476]">
                              <span className="font-mono font-medium">{stop.category}</span>
                              {stop.transitMinutes > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="text-[#C85A32] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{stop.transitSummary || `이동 ${stop.transitMinutes}분`}</span>
                                  </span>
                                </>
                              )}
                              <span>·</span>
                              <span>체류 약 {stop.stayMinutes}분</span>
                            </div>

                            <h4 className="font-semibold text-sm text-[#1E1E1E] mt-0.5">
                              {stop.placeName || place?.name}
                            </h4>

                            {stop.tip && (
                              <p className="text-xs text-[#6B6457] mt-1 italic">
                                💡 {stop.tip}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (4 Cols): Unassigned Places Inspector */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl p-5 border border-[#E8E2D5] shadow-xs space-y-4">
              <div className="pb-3 border-b border-[#F0ECE3]">
                <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
                  <span>일정 미배정 장소</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-[#F4EFE6] text-[#6B6457] rounded-full">
                    {activeCourse.unassignedPlaces?.length || 0}
                  </span>
                </h3>
                <p className="text-[11px] text-[#8C8476] mt-0.5">
                  AI가 해당 코스에서 제외한 사유를 확인하고 언제든 내 일정에 직접 추가할 수 있습니다.
                </p>
              </div>

              {(!activeCourse.unassignedPlaces || activeCourse.unassignedPlaces.length === 0) ? (
                <p className="text-xs text-[#8C8476] text-center py-4">
                  모든 저장 장소가 이 코스에 포함되었습니다!
                </p>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {activeCourse.unassignedPlaces.map((unassigned) => (
                    <div
                      key={unassigned.placeId}
                      className="p-3 bg-[#FAF8F3] rounded-lg border border-[#EDE7DC] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-[#1E1E1E] truncate max-w-[180px]">
                          {unassigned.placeName}
                        </h4>
                        <button
                          onClick={() => onOpenQuickAddToItinerary(unassigned.placeId)}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#C85A32] hover:underline cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>일정 추가</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-[#6B6457] bg-white p-2 rounded border border-[#EFECE4] leading-relaxed">
                        <span className="text-[#C85A32] font-medium">[제외 사유]</span>{' '}
                        {unassigned.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
