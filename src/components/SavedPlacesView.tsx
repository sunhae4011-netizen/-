import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { Place, PlaceCategory, PlacePriority } from '../types';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  ExternalLink,
  CheckCircle,
  Circle,
  Trash2,
  Edit2,
  CalendarPlus,
  Instagram,
  Utensils,
  Coffee,
  Compass,
  ShoppingBag,
  Building,
  MoreHorizontal,
} from 'lucide-react';

interface SavedPlacesViewProps {
  onOpenAddPlaceModal: () => void;
  onEditPlace: (place: Place) => void;
  onOpenQuickAddToItinerary: (placeId: string) => void;
}

export const SavedPlacesView: React.FC<SavedPlacesViewProps> = ({
  onOpenAddPlaceModal,
  onEditPlace,
  onOpenQuickAddToItinerary,
}) => {
  const { activeTrip, activeTripPlaces, deletePlace, togglePlaceVisited } = useTrip();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'ALL'>('ALL');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<PlacePriority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'latest'>('priority');

  // Distinct areas from places
  const areas = useMemo(() => {
    const set = new Set<string>();
    activeTripPlaces.forEach((p) => {
      if (p.area) set.add(p.area);
    });
    return Array.from(set);
  }, [activeTripPlaces]);

  // Filter & Sort
  const filteredPlaces = useMemo(() => {
    return activeTripPlaces
      .filter((place) => {
        const matchesSearch =
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'ALL' || place.category === selectedCategory;
        const matchesArea = selectedArea === 'ALL' || place.area === selectedArea;
        const matchesPriority =
          selectedPriority === 'ALL' || place.priority === selectedPriority;
        return matchesSearch && matchesCategory && matchesArea && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const rank = { MUST: 1, WANT: 2, IF_POSSIBLE: 3 };
          return rank[a.priority] - rank[b.priority];
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [activeTripPlaces, searchQuery, selectedCategory, selectedArea, selectedPriority, sortBy]);

  const categoryIcons: Record<PlaceCategory, React.ReactNode> = {
    RESTAURANT: <Utensils className="w-3.5 h-3.5 text-[#C85A32]" />,
    CAFE: <Coffee className="w-3.5 h-3.5 text-[#B87A3E]" />,
    TOUR: <Compass className="w-3.5 h-3.5 text-[#4A7C59]" />,
    SHOPPING: <ShoppingBag className="w-3.5 h-3.5 text-[#5A6B8C]" />,
    ACCOMMODATION: <Building className="w-3.5 h-3.5 text-[#735A8C]" />,
    ETC: <MoreHorizontal className="w-3.5 h-3.5 text-[#8C8476]" />,
  };

  const categoryLabels: Record<PlaceCategory, string> = {
    RESTAURANT: '맛집',
    CAFE: '카페',
    TOUR: '관광지',
    SHOPPING: '쇼핑 매장',
    ACCOMMODATION: '숙소',
    ETC: '기타',
  };

  const priorityLabels: Record<PlacePriority, { text: string; color: string }> = {
    MUST: { text: '반드시 방문', color: 'text-[#C85A32] font-semibold' },
    WANT: { text: '가고 싶은 곳', color: 'text-[#4A7C59]' },
    IF_POSSIBLE: { text: '시간 되면 방문', color: 'text-[#8C8275]' },
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275] uppercase tracking-wider">
            <span>{activeTrip?.city || '저장 장소'}</span>
            <span>·</span>
            <span>총 {activeTripPlaces.length}곳 저장됨</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-1">
            저장한 여행 스폿 아카이브
          </h1>
          <p className="text-xs text-[#7A7265] mt-1 font-light">
            SNS에서 발견한 미식, 카페, 편집숍, 명소를 지역과 카테고리별로 정돈하고 여행 일정으로 연결하세요.
          </p>
        </div>

        <button
          onClick={onOpenAddPlaceModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>새 장소 저장하기</span>
        </button>
      </div>

      {/* Filter and Search Controls (Anti-Slop Clean Segmented Controls) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D5] space-y-4 shadow-xs">
        {/* Search bar + Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9487]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소명, 메모, 주소 검색..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32] text-[#1E1E1E] placeholder-[#9E9586]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8C8476] whitespace-nowrap">정렬:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg text-xs text-[#1E1E1E] focus:outline-none focus:border-[#C85A32] cursor-pointer"
            >
              <option value="priority">우선순위순</option>
              <option value="name">이름 가나다순</option>
              <option value="latest">최신 저장순</option>
            </select>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer text-xs ${
              selectedCategory === 'ALL'
                ? 'bg-[#1E1E1E] text-white font-medium'
                : 'text-[#6B6457] hover:bg-[#EFECE4]'
            }`}
          >
            전체 ({activeTripPlaces.length})
          </button>
          {(['RESTAURANT', 'CAFE', 'SHOPPING', 'TOUR', 'ACCOMMODATION', 'ETC'] as PlaceCategory[]).map(
            (cat) => {
              const count = activeTripPlaces.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer text-xs ${
                    selectedCategory === cat
                      ? 'bg-[#1E1E1E] text-white font-medium'
                      : 'text-[#6B6457] hover:bg-[#EFECE4]'
                  }`}
                >
                  {categoryIcons[cat]}
                  <span>{categoryLabels[cat]}</span>
                  <span className="text-[10px] opacity-75 tabular-nums">({count})</span>
                </button>
              );
            }
          )}
        </div>

        {/* Secondary filters: Area & Priority */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#F2EEE6] text-xs">
          {/* Area Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#8C8476]">지역:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-2.5 py-1 bg-[#FAF8F3] border border-[#E0D8C8] rounded text-xs text-[#1E1E1E] cursor-pointer"
            >
              <option value="ALL">모든 지역</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#8C8476]">우선순위:</span>
            <select
              value={selectedPriority}
              onChange={(e: any) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1 bg-[#FAF8F3] border border-[#E0D8C8] rounded text-xs text-[#1E1E1E] cursor-pointer"
            >
              <option value="ALL">전체 우선순위</option>
              <option value="MUST">반드시 방문</option>
              <option value="WANT">가고 싶은 곳</option>
              <option value="IF_POSSIBLE">시간 되면 방문</option>
            </select>
          </div>
        </div>
      </div>

      {/* Places Cards Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[#E8E2D5] space-y-3">
          <Compass className="w-8 h-8 text-[#9C9487] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">조건에 맞는 저장 장소가 없습니다</h3>
          <p className="text-xs text-[#7A7265] max-w-sm mx-auto">
            새로운 스폿을 저장하거나 검색 필터를 초기화해보세요.
          </p>
          <button
            onClick={onOpenAddPlaceModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white text-xs font-medium rounded-lg hover:bg-[#b04b25] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>장소 추가하기</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <article
              key={place.id}
              className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-md flex flex-col group ${
                place.visited ? 'border-[#D9E3D8] bg-[#FAFCFA]' : 'border-[#E8E2D5]'
              }`}
            >
              {/* Card Image Slot (Zero Broken Image Fallback) */}
              <div className="relative aspect-16/10 bg-[#EFECE4] overflow-hidden">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Priority and Category Overlays */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 text-[10px] font-medium bg-white/95 text-[#1A1A1A] rounded shadow-xs backdrop-blur-xs flex items-center gap-1">
                    {categoryIcons[place.category]}
                    <span>{categoryLabels[place.category]}</span>
                  </span>
                  {place.area && (
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-black/60 text-white rounded backdrop-blur-xs">
                      {place.area}
                    </span>
                  )}
                </div>

                {/* Visited Checkbox */}
                <button
                  onClick={() => togglePlaceVisited(place.id)}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white text-[#1A1A1A] rounded-full shadow-xs transition-colors cursor-pointer"
                  title={place.visited ? '방문 취소' : '방문 완료 체크'}
                >
                  {place.visited ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#8C8476]" />
                  )}
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-[#8C8275] mb-1">
                    <span className={priorityLabels[place.priority].color}>
                      {priorityLabels[place.priority].text}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate max-w-[150px]">{place.address}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1A1A1A] group-hover:text-[#C85A32] transition-colors leading-snug">
                    {place.name}
                  </h3>

                  {place.notes && (
                    <p className="text-xs text-[#5C554B] mt-2 line-clamp-2 leading-relaxed">
                      {place.notes}
                    </p>
                  )}
                </div>

                {/* External links & Actions */}
                <div className="pt-3 border-t border-[#F0ECE3] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {place.googleMapsUrl && (
                      <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6B6457] hover:text-[#C85A32] flex items-center gap-1 text-[11px]"
                        title="구글 지도 열기"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>지도</span>
                      </a>
                    )}
                    {place.snsUrl && (
                      <a
                        href={place.snsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6B6457] hover:text-[#C85A32] flex items-center gap-1 text-[11px]"
                        title="SNS 원본 링크"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        <span>SNS</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenQuickAddToItinerary(place.id)}
                      className="p-1.5 text-[#5C554B] hover:text-[#C85A32] hover:bg-[#F4EFE6] rounded transition-colors cursor-pointer"
                      title="내 여행 일정표에 추가"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditPlace(place)}
                      className="p-1.5 text-[#5C554B] hover:text-[#1A1A1A] hover:bg-[#F4EFE6] rounded transition-colors cursor-pointer"
                      title="장소 정보 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`'${place.name}' 장소를 삭제하시겠습니까?`)) {
                          deletePlace(place.id);
                        }
                      }}
                      className="p-1.5 text-[#9C9487] hover:text-rose-600 hover:bg-[#FDF0EE] rounded transition-colors cursor-pointer"
                      title="장소 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
