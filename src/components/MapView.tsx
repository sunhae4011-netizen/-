import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useTrip } from '../context/TripContext';
import { Place, PlaceCategory } from '../types';
import {
  MapPin,
  Filter,
  Navigation as NavIcon,
  Layers,
  Plus,
  CalendarPlus,
  ExternalLink,
  CheckCircle,
  Eye,
  Coffee,
  Utensils,
  Compass,
  ShoppingBag,
  Building,
} from 'lucide-react';

interface MapViewProps {
  onOpenAddPlaceModal: (initialCoords?: { lat: number; lng: number }) => void;
  onOpenAddToItinerary: (placeId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  onOpenAddPlaceModal,
  onOpenAddToItinerary,
}) => {
  const { activeTrip, activeTripPlaces, activeTripShoppingItems, togglePlaceVisited } = useTrip();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'ALL'>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showShoppingStoresOnly, setShowShoppingStoresOnly] = useState(false);

  // Group places by area automatically
  const areaGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        total: number;
        categories: Record<string, number>;
        places: Place[];
      }
    > = {};

    activeTripPlaces.forEach((place) => {
      const area = place.area || '기타 구역';
      if (!groups[area]) {
        groups[area] = {
          total: 0,
          categories: {},
          places: [],
        };
      }
      groups[area].total += 1;
      groups[area].categories[place.category] =
        (groups[area].categories[place.category] || 0) + 1;
      groups[area].places.push(place);
    });

    return groups;
  }, [activeTripPlaces]);

  // Color mapping by category
  const categoryColors: Record<PlaceCategory, { bg: string; text: string; hex: string }> = {
    RESTAURANT: { bg: 'bg-[#C85A32]', text: 'text-white', hex: '#C85A32' },
    CAFE: { bg: 'bg-[#A86F3D]', text: 'text-white', hex: '#A86F3D' },
    TOUR: { bg: 'bg-[#3D7A5A]', text: 'text-white', hex: '#3D7A5A' },
    SHOPPING: { bg: 'bg-[#3D5A80]', text: 'text-white', hex: '#3D5A80' },
    ACCOMMODATION: { bg: 'bg-[#6D597A]', text: 'text-white', hex: '#6D597A' },
    ETC: { bg: 'bg-[#666666]', text: 'text-white', hex: '#666666' },
  };

  const categoryNames: Record<PlaceCategory, string> = {
    RESTAURANT: '맛집',
    CAFE: '카페',
    TOUR: '관광지',
    SHOPPING: '쇼핑 매장',
    ACCOMMODATION: '숙소',
    ETC: '기타',
  };

  // Filter places to display on map
  const displayPlaces = useMemo(() => {
    return activeTripPlaces.filter((place) => {
      const matchesArea = selectedArea === 'ALL' || place.area === selectedArea;
      const matchesCategory =
        selectedCategory === 'ALL' || place.category === selectedCategory;
      const matchesShoppingOnly = !showShoppingStoresOnly || place.category === 'SHOPPING';
      return matchesArea && matchesCategory && matchesShoppingOnly;
    });
  }, [activeTripPlaces, selectedArea, selectedCategory, showShoppingStoresOnly]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Tokyo default or active places centroid
      const defaultCenter: [number, number] =
        activeTripPlaces.length > 0
          ? [activeTripPlaces[0].lat, activeTripPlaces[0].lng]
          : [35.6762, 139.6503];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: true,
      });

      // CartoDB Positron tiles for high-end editorial minimal feel
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Click to add place listener
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (confirm(`선택한 위치(위도 ${lat.toFixed(4)}, 경도 ${lng.toFixed(4)})에 새 장소를 추가하시겠습니까?`)) {
          onOpenAddPlaceModal({ lat, lng });
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers when displayPlaces changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (displayPlaces.length === 0) return;

    const bounds = L.latLngBounds([]);

    displayPlaces.forEach((place) => {
      const color = categoryColors[place.category] || categoryColors.ETC;
      const isSelected = selectedPlace?.id === place.id;

      // Custom HTML Marker Pin
      const customIcon = L.divIcon({
        className: 'custom-editorial-pin',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background-color: ${color.hex};
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: ${isSelected ? '12px' : '10px'};
            font-weight: 700;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 0.2s;
            transform: translate(-50%, -50%);
          ">
            <span>${place.category.slice(0, 1)}</span>
            ${
              place.visited
                ? `<div style="position:absolute; bottom:-2px; right:-2px; width:10px; height:10px; background:#10b981; border:1px solid #fff; border-radius:50%;"></div>`
                : ''
            }
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedPlace(place);
      });

      markersRef.current[place.id] = marker;
      bounds.extend([place.lat, place.lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [displayPlaces, selectedPlace]);

  // Pan to place when selected
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 15, { duration: 0.8 });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275] uppercase tracking-wider">
            <span>Spatial Distribution</span>
            <span>·</span>
            <span>{activeTrip?.city} 통합 지도</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-1">
            저장 장소 & 쇼핑 매장 통합 지도
          </h1>
          <p className="text-xs text-[#7A7265] mt-1 font-light">
            가까운 장소들이 지역별로 자동 그룹화되어 있습니다. 지도를 클릭해 새로운 장소를 바로 등록할 수도 있습니다.
          </p>
        </div>

        <button
          onClick={() => onOpenAddPlaceModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>새 장소 핀 추가</span>
        </button>
      </div>

      {/* Map Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-[#1E1E1E] text-white font-medium'
                : 'text-[#6B6457] hover:bg-[#EFECE4]'
            }`}
          >
            모든 카테고리
          </button>
          {(['RESTAURANT', 'CAFE', 'SHOPPING', 'TOUR', 'ACCOMMODATION'] as PlaceCategory[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#1E1E1E] text-white font-medium'
                    : 'text-[#6B6457] hover:bg-[#EFECE4]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryColors[cat].hex }}
                />
                <span>{categoryNames[cat]}</span>
              </button>
            )
          )}
        </div>

        {/* Toggle 쇼핑 매장만 보기 */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#4A453E]">
            <input
              type="checkbox"
              checked={showShoppingStoresOnly}
              onChange={(e) => setShowShoppingStoresOnly(e.target.checked)}
              className="rounded text-[#C85A32] focus:ring-0 cursor-pointer"
            />
            <span className="font-medium">쇼핑 매장만 모아보기</span>
          </label>
        </div>
      </div>

      {/* Main Map + Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map Viewport (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden border border-[#E8E2D5] shadow-sm relative">
          <div
            ref={mapContainerRef}
            className="w-full h-[520px] sm:h-[600px] z-10"
            style={{ backgroundColor: '#F4F1EA' }}
          />

          {/* Map Overlay Quick Legend */}
          <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#E8E2D5] shadow-md text-[11px] space-y-1">
            <p className="font-mono uppercase text-[#8C8476] text-[10px] pb-1 border-b border-[#F0ECE3]">
              지도 범례
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C85A32]" /> 맛집
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A86F3D]" /> 카페
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3D5A80]" /> 쇼핑 매장
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3D7A5A]" /> 관광/명소
              </span>
            </div>
            <p className="text-[10px] text-[#9C9487] pt-1">지도를 클릭하면 해당 위치에 장소 추가 가능</p>
          </div>
        </div>

        {/* Right Column: Automated Area Cluster Groups & Place Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Automated Regional Clusters Card */}
          <div className="bg-white rounded-xl p-5 border border-[#E8E2D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                  지역별 자동 그룹화 ({Object.keys(areaGroups).length}개 권역)
                </h3>
                <p className="text-[11px] text-[#8C8476] mt-0.5">
                  지역을 선택하면 해당 구역의 장소들을 모아봅니다.
                </p>
              </div>
              {selectedArea !== 'ALL' && (
                <button
                  onClick={() => setSelectedArea('ALL')}
                  className="text-xs text-[#C85A32] hover:underline cursor-pointer"
                >
                  전체 보기
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {Object.entries(areaGroups).map(([areaName, group]) => {
                const isAreaActive = selectedArea === areaName;
                return (
                  <div
                    key={areaName}
                    onClick={() => {
                      setSelectedArea(isAreaActive ? 'ALL' : areaName);
                      // Center map to first place in this area
                      if (group.places.length > 0 && mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(
                          [group.places[0].lat, group.places[0].lng],
                          14,
                          { duration: 0.8 }
                        );
                      }
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isAreaActive
                        ? 'bg-[#F7F4EC] border-[#C85A32] shadow-xs'
                        : 'bg-[#FAF8F3] border-[#EDE7DC] hover:border-[#D5CDBD]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#1E1E1E]">{areaName}</span>
                      <span className="text-[11px] font-mono text-[#8C8476] tabular-nums">
                        {group.total}개 스폿
                      </span>
                    </div>

                    {/* Category breakdowns */}
                    <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-[#6B6457]">
                      {Object.entries(group.categories).map(([cat, count]) => (
                        <span key={cat} className="px-1.5 py-0.5 bg-white rounded border border-[#E8E2D5]">
                          {categoryNames[cat as PlaceCategory] || cat} {count}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Place Details or Area Places List */}
          {selectedPlace ? (
            <div className="bg-white rounded-xl p-5 border border-[#C85A32] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C85A32] font-semibold">
                  선택된 장소 상세
                </span>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-xs text-[#8C8476] hover:text-[#1E1E1E]"
                >
                  닫기
                </button>
              </div>

              {selectedPlace.imageUrl && (
                <div className="aspect-16/9 rounded-lg overflow-hidden bg-[#F0ECE3]">
                  <img
                    src={selectedPlace.imageUrl}
                    alt={selectedPlace.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-[11px] text-[#8C8476] mb-1">
                  <span>{categoryNames[selectedPlace.category]}</span>
                  <span>·</span>
                  <span>{selectedPlace.area}</span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#1E1E1E]">
                  {selectedPlace.name}
                </h4>
                <p className="text-xs text-[#6B6457] mt-1">{selectedPlace.address}</p>
                {selectedPlace.notes && (
                  <p className="text-xs text-[#4A453E] bg-[#FAF8F3] p-2.5 rounded-md border border-[#EDE7DC] mt-2.5">
                    {selectedPlace.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onOpenAddToItinerary(selectedPlace.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#C85A32] hover:bg-[#b04b25] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>내 일정에 추가</span>
                </button>
                <button
                  onClick={() => togglePlaceVisited(selectedPlace.id)}
                  className="p-2 border border-[#E0D8C8] hover:bg-[#F4EFE6] rounded-lg transition-colors cursor-pointer"
                  title="방문 완료 토글"
                >
                  <CheckCircle
                    className={`w-4 h-4 ${
                      selectedPlace.visited ? 'text-emerald-600' : 'text-[#8C8476]'
                    }`}
                  />
                </button>
              </div>
            </div>
          ) : (
            /* Area Filtered Places List */
            <div className="bg-white rounded-xl p-5 border border-[#E8E2D5] shadow-xs space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                {selectedArea === 'ALL' ? '전체 지도 장소 목록' : `${selectedArea} 구역 장소`} (
                {displayPlaces.length}곳)
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {displayPlaces.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className="p-2.5 bg-[#FAF8F3] hover:bg-[#F4EFE6] rounded-lg border border-[#EDE7DC] transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#1E1E1E] truncate">
                        {place.name}
                      </p>
                      <p className="text-[10px] text-[#8C8476] truncate">
                        {categoryNames[place.category]} · {place.area}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddToItinerary(place.id);
                      }}
                      className="p-1 text-[#8C8476] hover:text-[#C85A32]"
                      title="일정에 추가"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
