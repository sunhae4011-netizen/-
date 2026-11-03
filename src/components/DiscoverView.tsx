import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { DiscoverSpot, PlaceCategory } from '../types';
import {
  Search,
  Sparkles,
  MapPin,
  Star,
  Plus,
  Clock,
  Compass,
  Check,
  Utensils,
  Coffee,
  ShoppingBag,
} from 'lucide-react';

interface DiscoverViewProps {
  onSavedToMyTripSuccess: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onSavedToMyTripSuccess }) => {
  const { activeTrip, discoverSpots, addPlace, activeTripPlaces } = useTrip();

  const [searchQuery, setSearchQuery] = useState('');
  const [spots, setSpots] = useState<DiscoverSpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedSpotNames, setSavedSpotNames] = useState<Set<string>>(new Set());

  // Quick preset search chips
  const quickSearches = [
    `${activeTrip?.city || '도쿄'} 현지인 라멘 숨은 맛집`,
    `${activeTrip?.city || '도쿄'} 로컬 스페셜티 카페`,
    `${activeTrip?.city || '도쿄'} 디자이너 빈티지 & 편집숍`,
    `${activeTrip?.city || '도쿄'} 한적한 갤러리 & 산책로`,
    `${activeTrip?.city || '도쿄'} 심야 이자카야 & 와인바`,
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await discoverSpots(queryText);
      setSpots(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToTrip = (spot: DiscoverSpot) => {
    if (!activeTrip) return;

    addPlace({
      tripId: activeTrip.id,
      name: spot.name,
      address: spot.address,
      lat: spot.lat || 35.6762 + (Math.random() - 0.5) * 0.05,
      lng: spot.lng || 139.6503 + (Math.random() - 0.5) * 0.05,
      area: spot.area || '로컬 구역',
      category: spot.category || 'RESTAURANT',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      notes: `[현지인 추천] ${spot.signature} · ${spot.reason}`,
      priority: 'WANT',
      visited: false,
    });

    setSavedSpotNames((prev) => new Set(prev).add(spot.name));
    onSavedToMyTripSuccess();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275] uppercase tracking-wider">
            <span>Local Curated Gems</span>
            <span>·</span>
            <span>{activeTrip?.city} 현지 큐레이션</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-1">
            현지인 추천 & 숨겨진 스폿 탐색
          </h1>
          <p className="text-xs text-[#7A7265] mt-1 font-light max-w-2xl">
            뻔한 관광지가 아닌 현지 트렌드세터와 로컬들이 애정하는 숨은 맛집, 카페, 빈티지숍을
            자연어로 검색하고 내 여행 플랜에 바로 수집하세요.
          </p>
        </div>
      </div>

      {/* Natural Language Search Box */}
      <div className="bg-white p-5 rounded-xl border border-[#E8E2D5] space-y-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row items-stretch gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9487]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="예: 시부야 빈티지숍, 나카메구로 로컬 브런치, 조용한 킷사텐..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32] text-[#1E1E1E] placeholder-[#9E9586]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E1E1E] hover:bg-[#C85A32] disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>{isLoading ? '현지 스폿 탐색 중...' : '검색하기'}</span>
          </button>
        </form>

        {/* Quick Search Recommendations */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-[#8C8476] whitespace-nowrap">추천 검색어:</span>
          {quickSearches.map((qs) => (
            <button
              key={qs}
              onClick={() => {
                setSearchQuery(qs);
                handleSearch(qs);
              }}
              className="px-2.5 py-1 bg-[#FAF8F3] hover:bg-[#F2ECE1] text-[#4A453E] rounded-md border border-[#EDE7DC] transition-colors cursor-pointer text-xs"
            >
              {qs}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-16 text-center border border-[#E8E2D5] space-y-3">
          <Sparkles className="w-8 h-8 text-[#C85A32] animate-spin mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">현지 스폿 큐레이션 중...</h3>
          <p className="text-xs text-[#7A7265]">
            현지 로컬들의 호평과 최신 트렌드를 종합 분석하고 있습니다.
          </p>
        </div>
      ) : spots.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#7A7265] px-1">
            <span>발견된 로컬 스폿 {spots.length}곳</span>
            <span className="font-mono text-[11px]">TRIPLOG AI DISCOVER</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spots.map((spot, idx) => {
              const isAlreadySaved =
                savedSpotNames.has(spot.name) ||
                activeTripPlaces.some((p) => p.name === spot.name);

              return (
                <article
                  key={idx}
                  className="bg-white rounded-xl p-5 border border-[#E8E2D5] hover:border-[#C85A32] transition-all shadow-xs flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-[#8C8275]">
                          <span className="font-mono text-[#C85A32] font-semibold">{spot.category}</span>
                          <span>·</span>
                          <span>{spot.area}</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mt-1 group-hover:text-[#C85A32] transition-colors">
                          {spot.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-1 bg-[#FDF9F0] rounded border border-[#F3EAD5] text-xs font-bold text-[#B87A3E] shrink-0">
                        <Star className="w-3.5 h-3.5 fill-[#B87A3E] text-[#B87A3E]" />
                        <span>{spot.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#7A7265] flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#9C9487] shrink-0" />
                      <span>{spot.address}</span>
                    </p>

                    <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#EDE7DC] space-y-1.5 text-xs">
                      <p className="font-semibold text-[#1E1E1E]">
                        ✨ 대표 특징: <span className="font-normal text-[#4A453E]">{spot.signature}</span>
                      </p>
                      <p className="text-[#6B6457] leading-relaxed">
                        💬 <span className="italic">{spot.reason}</span>
                      </p>
                      {spot.openingHours && (
                        <p className="text-[11px] text-[#8C8476] flex items-center gap-1 pt-1">
                          <Clock className="w-3 h-3" />
                          <span>{spot.openingHours}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F2EEE6] flex items-center justify-between">
                    <span className="text-[11px] text-[#8C8476]">
                      {isAlreadySaved ? '내 여행에 저장됨' : '저장하여 동선에 추가'}
                    </span>

                    <button
                      onClick={() => handleSaveToTrip(spot)}
                      disabled={isAlreadySaved}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isAlreadySaved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#1E1E1E] hover:bg-[#C85A32] text-white shadow-xs'
                      }`}
                    >
                      {isAlreadySaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>저장 완료</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>내 여행에 저장</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[#E8E2D5] space-y-2">
          <Compass className="w-8 h-8 text-[#9C9487] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">검색 결과가 없습니다</h3>
          <p className="text-xs text-[#7A7265]">다른 검색어로 다시 시도해보세요.</p>
        </div>
      ) : (
        /* Discovery Inspiration Guide */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D5] space-y-2">
            <Utensils className="w-5 h-5 text-[#C85A32]" />
            <h4 className="font-serif font-bold text-base text-[#1A1A1A]">미식 & 노포 로컬</h4>
            <p className="text-xs text-[#7A7265] leading-relaxed">
              관광객 줄이 긴 곳 대신 현지 미식가들이 단골로 찾는 뒷골목 식당과 야키토리, 시오 라멘 명가.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D5] space-y-2">
            <Coffee className="w-5 h-5 text-[#A86F3D]" />
            <h4 className="font-serif font-bold text-base text-[#1A1A1A]">스페셜티 카페 & 킷사텐</h4>
            <p className="text-xs text-[#7A7265] leading-relaxed">
              도쿄의 오래된 쇼와 시대 클래식 킷사텐부터 감각적인 인테리어의 제3의 물결 커피 로스터리.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D5] space-y-2">
            <ShoppingBag className="w-5 h-5 text-[#3D5A80]" />
            <h4 className="font-serif font-bold text-base text-[#1A1A1A]">빈티지 & 아티잔 숍</h4>
            <p className="text-xs text-[#7A7265] leading-relaxed">
              다이칸야마와 시모키타자와의 희귀 빈티지 의류, 핸드크래프트 세라믹 및 감도 높은 라이프웨어.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
