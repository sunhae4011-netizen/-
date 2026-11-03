import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { ShoppingItem, ShoppingCategory } from '../types';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  MapPin,
  ExternalLink,
  Instagram,
  Youtube,
  Trash2,
  Edit2,
  Sparkles,
  ShoppingBag,
  Layers,
} from 'lucide-react';

interface ShoppingMoodboardViewProps {
  onOpenAddModal: () => void;
  onEditItem: (item: ShoppingItem) => void;
  onViewItemDetail: (item: ShoppingItem) => void;
}

export const ShoppingMoodboardView: React.FC<ShoppingMoodboardViewProps> = ({
  onOpenAddModal,
  onEditItem,
  onViewItemDetail,
}) => {
  const {
    activeTrip,
    activeTripShoppingItems,
    deleteShoppingItem,
    toggleShoppingItemPurchased,
  } = useTrip();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory | 'ALL'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedBoard, setSelectedBoard] = useState<string>('ALL');
  const [purchaseFilter, setPurchaseFilter] = useState<'ALL' | 'UNPURCHASED' | 'PURCHASED'>('ALL');

  // Distinct Brands and Boards
  const brands = useMemo(() => {
    const set = new Set<string>();
    activeTripShoppingItems.forEach((item) => {
      if (item.brand) set.add(item.brand);
    });
    return Array.from(set);
  }, [activeTripShoppingItems]);

  const boards = useMemo(() => {
    const set = new Set<string>();
    activeTripShoppingItems.forEach((item) => {
      if (item.boardName) set.add(item.boardName);
    });
    return Array.from(set);
  }, [activeTripShoppingItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return activeTripShoppingItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetStore.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesBrand = selectedBrand === 'ALL' || item.brand === selectedBrand;
      const matchesBoard = selectedBoard === 'ALL' || item.boardName === selectedBoard;
      const matchesPurchase =
        purchaseFilter === 'ALL' ||
        (purchaseFilter === 'UNPURCHASED' && !item.purchased) ||
        (purchaseFilter === 'PURCHASED' && item.purchased);

      return matchesSearch && matchesCategory && matchesBrand && matchesBoard && matchesPurchase;
    });
  }, [
    activeTripShoppingItems,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedBoard,
    purchaseFilter,
  ]);

  // Financial Sum
  const rate = activeTrip?.exchangeRate || 9.15;
  const totalWishlistKRW = filteredItems.reduce((acc, item) => {
    const inKRW = item.currency === 'KRW' ? item.price : Math.round(item.price * rate);
    return acc + inKRW;
  }, 0);

  const purchasedCount = activeTripShoppingItems.filter((i) => i.purchased).length;

  const categoryLabels: Record<ShoppingCategory, string> = {
    CLOTHING: '의류',
    BAG: '가방',
    SHOES: '신발',
    ACCESSORIES: '액세서리',
    BEAUTY: '뷰티',
    LIFESTYLE: '라이프스타일',
    VINTAGE: '빈티지/편집숍',
    ETC: '기타',
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275] uppercase tracking-wider">
            <span>Pinterest & SNS Wishlist</span>
            <span>·</span>
            <span>{activeTrip?.city} 셀렉션</span>
            <span>·</span>
            <span className="text-[#C85A32] font-semibold">
              구매완료 {purchasedCount} / {activeTripShoppingItems.length}
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-1">
            쇼핑 무드보드 & 위시리스트
          </h1>
          <p className="text-xs text-[#7A7265] mt-1 font-light max-w-2xl">
            인스타그램, 핀터레스트, 유튜브에서 발견한 워너비 아이템을 이미지 중심으로 수집하고,
            실제 여행지의 오프라인 매장 위치와 연결해 현지에서 바로 찾아가세요.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>위시 아이템 추가</span>
        </button>
      </div>

      {/* Filter and Moodboard Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D5] space-y-4 shadow-xs">
        {/* Search & Purchase Status Segmented Buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9487]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제품명, 브랜드, 매장명 검색..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32] text-[#1E1E1E] placeholder-[#9E9586]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Purchase filter segmented control */}
            <div className="flex items-center p-1 bg-[#F4EFE6] rounded-lg text-xs">
              <button
                onClick={() => setPurchaseFilter('ALL')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  purchaseFilter === 'ALL'
                    ? 'bg-white text-[#1E1E1E] font-medium shadow-xs'
                    : 'text-[#6B6457] hover:text-[#1E1E1E]'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setPurchaseFilter('UNPURCHASED')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  purchaseFilter === 'UNPURCHASED'
                    ? 'bg-white text-[#1E1E1E] font-medium shadow-xs'
                    : 'text-[#6B6457] hover:text-[#1E1E1E]'
                }`}
              >
                구매 예정
              </button>
              <button
                onClick={() => setPurchaseFilter('PURCHASED')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  purchaseFilter === 'PURCHASED'
                    ? 'bg-white text-emerald-800 font-medium shadow-xs'
                    : 'text-[#6B6457] hover:text-[#1E1E1E]'
                }`}
              >
                구매 완료
              </button>
            </div>
          </div>
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#1E1E1E] text-white font-medium'
                : 'text-[#6B6457] hover:bg-[#EFECE4]'
            }`}
          >
            전체 카테고리
          </button>
          {(
            [
              'CLOTHING',
              'BAG',
              'SHOES',
              'ACCESSORIES',
              'BEAUTY',
              'LIFESTYLE',
              'VINTAGE',
              'ETC',
            ] as ShoppingCategory[]
          ).map((cat) => {
            const count = activeTripShoppingItems.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1E1E1E] text-white font-medium'
                    : 'text-[#6B6457] hover:bg-[#EFECE4]'
                }`}
              >
                <span>{categoryLabels[cat]}</span>
                <span className="text-[10px] opacity-75 ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Brands & Boards selector bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F2EEE6] text-xs">
          <div className="flex items-center gap-3">
            {brands.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#8C8476]">브랜드:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-2.5 py-1 bg-[#FAF8F3] border border-[#E0D8C8] rounded text-xs text-[#1E1E1E] cursor-pointer"
                >
                  <option value="ALL">모든 브랜드</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {boards.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#8C8476]">무드보드:</span>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="px-2.5 py-1 bg-[#FAF8F3] border border-[#E0D8C8] rounded text-xs text-[#1E1E1E] cursor-pointer"
                >
                  <option value="ALL">모든 보드</option>
                  {boards.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-xs text-[#6B6457] font-mono">
            선택 합계: <span className="font-semibold text-[#1E1E1E]">약 {totalWishlistKRW.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {/* Pinterest-like Magazine Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[#E8E2D5] space-y-3">
          <ShoppingBag className="w-8 h-8 text-[#9C9487] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">수집된 위시 아이템이 없습니다</h3>
          <p className="text-xs text-[#7A7265] max-w-sm mx-auto">
            인스타그램이나 핀터레스트에서 발견한 사고 싶은 제품을 추가해보세요.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white text-xs font-medium rounded-lg hover:bg-[#b04b25] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>첫 위시템 추가하기</span>
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              onClick={() => onViewItemDetail(item)}
              className="break-inside-avoid bg-white rounded-xl overflow-hidden border border-[#E8E2D5] hover:border-[#C85A32] hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col"
            >
              {/* Product Image Slot */}
              <div className="relative bg-[#F4EFE6] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Purchased Overlay Ribbon */}
                {item.purchased && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-mono bg-emerald-800 text-white rounded shadow-xs font-semibold">
                    PURCHASED
                  </div>
                )}

                {/* Platform Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-black/60 text-white rounded backdrop-blur-xs flex items-center gap-1">
                    {item.platform === 'Instagram' && <Instagram className="w-2.5 h-2.5" />}
                    {item.platform === 'YouTube' && <Youtube className="w-2.5 h-2.5" />}
                    <span>{item.platform}</span>
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#8C8275]">
                      {item.brand}
                    </span>
                    <span className="text-[11px] font-semibold text-[#1E1E1E] tabular-nums">
                      {item.currency} {item.price.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-serif text-sm font-bold text-[#1A1A1A] group-hover:text-[#C85A32] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {item.notes && (
                    <p className="text-xs text-[#6B6457] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Store Pin in Destination */}
                <div className="pt-2.5 border-t border-[#F2EEE6] flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-[11px] text-[#4A453E] truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C85A32] shrink-0" />
                      <span className="truncate font-medium">{item.targetStore}</span>
                    </p>
                    {item.storeArea && (
                      <p className="text-[10px] text-[#8C8476] ml-4 truncate">{item.storeArea}</p>
                    )}
                  </div>

                  {/* Purchased Quick Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShoppingItemPurchased(item.id);
                    }}
                    className="p-1 text-[#8C8476] hover:text-emerald-700 transition-colors"
                    title={item.purchased ? '구매 취소' : '구매 완료 체크 (경비 자동 반영)'}
                  >
                    {item.purchased ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#A89F8F]" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
