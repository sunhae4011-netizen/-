import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import {
  Trip,
  Place,
  ShoppingItem,
  Expense,
  PlaceCategory,
  PlacePriority,
  ShoppingCategory,
  ExpenseCategory,
  SocialPlatform,
} from '../types';
import {
  X,
  Upload,
  Sparkles,
  MapPin,
  Link,
  Plus,
  Check,
  ShoppingBag,
  ExternalLink,
  Instagram,
  DollarSign,
  Download,
  Database,
  RefreshCw,
} from 'lucide-react';

/* ========================================================
   1. TRIP MODAL (Create / Edit Trip)
======================================================== */
interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripToEdit?: Trip | null;
}

export const TripModal: React.FC<TripModalProps> = ({ isOpen, onClose, tripToEdit }) => {
  const { createTrip, updateTrip } = useTrip();

  const [name, setName] = useState(tripToEdit?.name || '');
  const [country, setCountry] = useState(tripToEdit?.country || '일본');
  const [city, setCity] = useState(tripToEdit?.city || '도쿄');
  const [startDate, setStartDate] = useState(tripToEdit?.startDate || '2026-04-10');
  const [endDate, setEndDate] = useState(tripToEdit?.endDate || '2026-04-14');
  const [companionsText, setCompanionsText] = useState(
    tripToEdit?.companions ? tripToEdit.companions.join(', ') : '나 (Me)'
  );
  const [totalBudget, setTotalBudget] = useState(tripToEdit?.totalBudget || 2000000);
  const [perPersonBudget, setPerPersonBudget] = useState(tripToEdit?.perPersonBudget || 1000000);
  const [currency, setCurrency] = useState(tripToEdit?.currency || 'JPY');
  const [exchangeRate, setExchangeRate] = useState(tripToEdit?.exchangeRate || 9.15);
  const [coverImage, setCoverImage] = useState(
    tripToEdit?.coverImage || '/src/assets/images/magazine_hero_tokyo_1793689863477.jpg'
  );
  const [notes, setNotes] = useState(tripToEdit?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const companions = companionsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    if (tripToEdit) {
      updateTrip(tripToEdit.id, {
        name,
        country,
        city,
        startDate,
        endDate,
        durationDays: diff,
        companions,
        totalBudget,
        perPersonBudget,
        currency,
        exchangeRate,
        coverImage,
        notes,
      });
    } else {
      createTrip({
        name,
        country,
        city,
        startDate,
        endDate,
        durationDays: diff,
        companions,
        totalBudget,
        perPersonBudget,
        currency,
        exchangeRate,
        coverImage,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E8E2D5] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">
            {tripToEdit ? '여행 정보 수정' : '새로운 여행 생성'}
          </h2>
          <button onClick={onClose} className="p-1 text-[#8C8476] hover:text-[#1E1E1E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">여행 이름 *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 2026 도쿄 스프링 라이프스타일 & 쇼핑 아카이브"
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">국가 *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="예: 일본, 대만, 프랑스"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">도시 *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="예: 도쿄, 타이베이, 파리"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">시작일 *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">종료일 *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">
              동행인 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={companionsText}
              onChange={(e) => setCompanionsText(e.target.value)}
              placeholder="예: 나 (Me), 소희, 준호"
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">전체 예산 (KRW) *</label>
              <input
                type="number"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">1인당 예산 (KRW)</label>
              <input
                type="number"
                value={perPersonBudget}
                onChange={(e) => setPerPersonBudget(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">현지 통화 코드</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="예: JPY, TWD, USD, EUR"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">환율 (1단위당 KRW)</label>
              <input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">대표 커버 이미지 URL</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... 또는 /src/assets/images/..."
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">여행 메모 / 테마</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="이번 여행에서 꼭 경험하고 싶은 라이프스타일 분위기나 테마..."
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="pt-3 border-t border-[#F0ECE3] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#7A7265] hover:text-[#1E1E1E]"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {tripToEdit ? '수정 완료' : '여행 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ========================================================
   2. PLACE MODAL (Add / Edit Place)
======================================================== */
interface PlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeToEdit?: Place | null;
  initialCoords?: { lat: number; lng: number } | null;
}

export const PlaceModal: React.FC<PlaceModalProps> = ({
  isOpen,
  onClose,
  placeToEdit,
  initialCoords,
}) => {
  const { activeTrip, addPlace, updatePlace } = useTrip();

  const [name, setName] = useState(placeToEdit?.name || '');
  const [address, setAddress] = useState(placeToEdit?.address || '');
  const [area, setArea] = useState(placeToEdit?.area || '시부야');
  const [category, setCategory] = useState<PlaceCategory>(placeToEdit?.category || 'RESTAURANT');
  const [lat, setLat] = useState(placeToEdit?.lat || initialCoords?.lat || 35.6580);
  const [lng, setLng] = useState(placeToEdit?.lng || initialCoords?.lng || 139.7016);
  const [imageUrl, setImageUrl] = useState(
    placeToEdit?.imageUrl ||
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
  );
  const [googleMapsUrl, setGoogleMapsUrl] = useState(placeToEdit?.googleMapsUrl || '');
  const [snsUrl, setSnsUrl] = useState(placeToEdit?.snsUrl || '');
  const [notes, setNotes] = useState(placeToEdit?.notes || '');
  const [priority, setPriority] = useState<PlacePriority>(placeToEdit?.priority || 'MUST');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    if (placeToEdit) {
      updatePlace(placeToEdit.id, {
        name,
        address,
        area,
        category,
        lat,
        lng,
        imageUrl,
        googleMapsUrl,
        snsUrl,
        notes,
        priority,
      });
    } else {
      addPlace({
        tripId: activeTrip.id,
        name,
        address,
        area,
        category,
        lat,
        lng,
        imageUrl,
        googleMapsUrl,
        snsUrl,
        notes,
        priority,
        visited: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E8E2D5] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">
            {placeToEdit ? '장소 정보 수정' : '새 장소 저장'}
          </h2>
          <button onClick={onClose} className="p-1 text-[#8C8476] hover:text-[#1E1E1E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">장소명 *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 푸글렌 도쿄 (Fuglen Tokyo)"
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">카테고리 *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PlaceCategory)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              >
                <option value="RESTAURANT">맛집 (RESTAURANT)</option>
                <option value="CAFE">카페 (CAFE)</option>
                <option value="TOUR">관광지/명소 (TOUR)</option>
                <option value="SHOPPING">쇼핑 매장 (SHOPPING)</option>
                <option value="ACCOMMODATION">숙소 (ACCOMMODATION)</option>
                <option value="ETC">기타 (ETC)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">지역 / 동네 *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="예: 시부야, 다이칸야마, 긴자"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">상세 주소 *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="예: 1-7-11 Tomigaya, Shibuya, Tokyo"
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">위도 (Latitude)</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">경도 (Longitude)</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">방문 우선순위</label>
            <div className="flex gap-2">
              {[
                { id: 'MUST', label: '반드시 방문 (MUST)' },
                { id: 'WANT', label: '가고 싶은 곳 (WANT)' },
                { id: 'IF_POSSIBLE', label: '시간 되면 (IF POSSIBLE)' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as PlacePriority)}
                  className={`flex-1 py-1.5 px-2 rounded border text-center transition-colors cursor-pointer ${
                    priority === p.id
                      ? 'bg-[#1E1E1E] text-white border-[#1E1E1E]'
                      : 'bg-[#FAF8F3] text-[#4A453E] border-[#EDE7DC]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">대표 이미지 URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... 또는 /src/assets/images/..."
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">구글맵 링크</label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">인스타그램/SNS 링크</label>
              <input
                type="text"
                value={snsUrl}
                onChange={(e) => setSnsUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">장소 메모 & 방문 팁</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="추천 메뉴, 웨이팅 시간, 사진 명당 자리..."
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="pt-3 border-t border-[#F0ECE3] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#7A7265] hover:text-[#1E1E1E]"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {placeToEdit ? '수정 저장' : '장소 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ========================================================
   3. SHOPPING ITEM MODAL (Add / Edit Shopping Wishlist)
======================================================== */
interface ShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: ShoppingItem | null;
}

export const ShoppingItemModal: React.FC<ShoppingItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { activeTrip, addShoppingItem, updateShoppingItem, extractSnsItem } = useTrip();

  const [snsUrlInput, setSnsUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const [title, setTitle] = useState(itemToEdit?.title || '');
  const [brand, setBrand] = useState(itemToEdit?.brand || '');
  const [price, setPrice] = useState(itemToEdit?.price || 15000);
  const [currency, setCurrency] = useState(itemToEdit?.currency || activeTrip?.currency || 'JPY');
  const [imageUrl, setImageUrl] = useState(
    itemToEdit?.imageUrl || '/src/assets/images/moodboard_fashion_bag_1793689862963.jpg'
  );
  const [platform, setPlatform] = useState<SocialPlatform>(itemToEdit?.platform || 'Instagram');
  const [category, setCategory] = useState<ShoppingCategory>(itemToEdit?.category || 'BAG');
  const [boardName, setBoardName] = useState(itemToEdit?.boardName || 'Spring Wardrobe');
  const [targetStore, setTargetStore] = useState(itemToEdit?.targetStore || '');
  const [storeAddress, setStoreAddress] = useState(itemToEdit?.storeAddress || '');
  const [storeArea, setStoreArea] = useState(itemToEdit?.storeArea || '시부야');
  const [notes, setNotes] = useState(itemToEdit?.notes || '');

  if (!isOpen) return null;

  // AI Smart Extraction from SNS URL
  const handleExtractSns = async () => {
    if (!snsUrlInput.trim()) return;
    setIsExtracting(true);
    try {
      const res = await extractSnsItem(snsUrlInput);
      if (res && res.data) {
        const d = res.data;
        if (d.title) setTitle(d.title);
        if (d.brand) setBrand(d.brand);
        if (d.price || d.estimatedPrice) setPrice(d.price || d.estimatedPrice);
        if (d.category) setCategory(d.category);
        if (d.storeName) setTargetStore(d.storeName);
        if (d.storeArea) setStoreArea(d.storeArea);
        if (d.storeAddress) setStoreAddress(d.storeAddress);
        if (d.notes) setNotes(d.notes);
        if (d.sourcePlatform) setPlatform(d.sourcePlatform as SocialPlatform);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  // Image Upload simulation (Data URL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    if (itemToEdit) {
      updateShoppingItem(itemToEdit.id, {
        title,
        brand,
        price,
        currency,
        imageUrl,
        platform,
        category,
        boardName,
        targetStore,
        storeAddress,
        storeArea,
        notes,
      });
    } else {
      addShoppingItem({
        tripId: activeTrip.id,
        title,
        brand,
        price,
        currency,
        imageUrl,
        snsUrl: snsUrlInput || undefined,
        platform,
        category,
        boardName,
        targetStore: targetStore || `${activeTrip.city} 플래그십 매장`,
        storeAddress: storeAddress || `${activeTrip.city} 중심가`,
        storeArea,
        notes,
        purchased: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E8E2D5] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">
              {itemToEdit ? '위시 아이템 수정' : '쇼핑 무드보드 아이템 수집'}
            </h2>
            <p className="text-[11px] text-[#7A7265] mt-0.5">
              SNS 링크를 입력하면 정보가 자동 추출되거나, 직접 이미지를 등록할 수 있습니다.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-[#8C8476] hover:text-[#1E1E1E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SNS Auto-Extraction Box */}
        {!itemToEdit && (
          <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#EDE7DC] space-y-2 text-xs">
            <label className="font-semibold text-[#1E1E1E] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>SNS 링크 붙여넣기 (인스타그램, 핀터레스트, 유튜브)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={snsUrlInput}
                onChange={(e) => setSnsUrlInput(e.target.value)}
                placeholder="https://www.instagram.com/p/... or https://pinterest.com/..."
                className="flex-1 px-3 py-1.5 bg-white border border-[#E0D8C8] rounded-md focus:outline-none focus:border-[#C85A32] text-xs"
              />
              <button
                type="button"
                onClick={handleExtractSns}
                disabled={isExtracting || !snsUrlInput}
                className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#b04b25] disabled:opacity-50 text-white font-medium rounded-md cursor-pointer whitespace-nowrap text-xs"
              >
                {isExtracting ? '분석 중...' : '자동 채우기'}
              </button>
            </div>
            <p className="text-[10px] text-[#8C8476]">
              * 외부 보안 정책으로 크롤링이 제한될 경우 스마트 템플릿 필드로 지원합니다.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Image preview & upload */}
          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">제품 이미지 *</label>
            <div className="flex gap-3 items-center">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#FAF8F3] border border-[#E0D8C8] shrink-0">
                <img
                  src={imageUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="이미지 URL 직접 입력..."
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F3] border border-[#E0D8C8] rounded text-xs focus:outline-none"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E0D8C8] hover:bg-[#F8F6F0] rounded cursor-pointer text-xs font-medium text-[#4A453E]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>내 기기에서 사진 업로드</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">제품명 *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 미니멀 스무스 레더 토트백"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">브랜드 *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="예: LEMAIRE, KINTO, COS"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">카테고리 *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
                className="w-full px-2.5 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              >
                <option value="CLOTHING">의류 (CLOTHING)</option>
                <option value="BAG">가방 (BAG)</option>
                <option value="SHOES">신발 (SHOES)</option>
                <option value="ACCESSORIES">액세서리 (ACCESSORIES)</option>
                <option value="BEAUTY">뷰티 (BEAUTY)</option>
                <option value="LIFESTYLE">라이프스타일 (LIFESTYLE)</option>
                <option value="VINTAGE">빈티지/편집숍 (VINTAGE)</option>
                <option value="ETC">기타 (ETC)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">예상 가격 *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">통화</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Travel Destination Store Linking */}
          <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#EDE7DC] space-y-3">
            <p className="font-semibold text-[#1E1E1E] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>여행지 오프라인 판매 매장 연동</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#6B6457] mb-1">구매하고 싶은 매장명</label>
                <input
                  type="text"
                  value={targetStore}
                  onChange={(e) => setTargetStore(e.target.value)}
                  placeholder="예: LEMAIRE 도쿄 에비스 플래그십"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8C8] rounded text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#6B6457] mb-1">매장 구역/동네</label>
                <input
                  type="text"
                  value={storeArea}
                  onChange={(e) => setStoreArea(e.target.value)}
                  placeholder="예: 에비스, 시부야, 긴자"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8C8] rounded text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#6B6457] mb-1">매장 주소</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="예: Ebisu Nishi, Shibuya, Tokyo"
                className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8C8] rounded text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">발견한 플랫폼</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              >
                <option value="Instagram">Instagram</option>
                <option value="Pinterest">Pinterest</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="WebShop">공식 온라인몰</option>
                <option value="Other">기타</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">보드 이름</label>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="예: Daily Essentials, Spring Wishlist"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">메모</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="텍스프리 여부, 정사이즈 피팅 여부, 컬러 옵션..."
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#F0ECE3] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#7A7265] hover:text-[#1E1E1E]"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {itemToEdit ? '수정 완료' : '위시리스트 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ========================================================
   4. SHOPPING DETAIL MODAL
======================================================== */
interface ShoppingDetailModalProps {
  item: ShoppingItem | null;
  onClose: () => void;
  onEdit: (item: ShoppingItem) => void;
}

export const ShoppingDetailModal: React.FC<ShoppingDetailModalProps> = ({
  item,
  onClose,
  onEdit,
}) => {
  const { toggleShoppingItemPurchased, activeTrip } = useTrip();

  if (!item) return null;

  const rate = activeTrip?.exchangeRate || 9.15;
  const inKRW = item.currency === 'KRW' ? item.price : Math.round(item.price * rate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E8E2D5] shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
          <span className="font-mono text-xs text-[#C85A32] uppercase tracking-wider font-semibold">
            {item.brand} · {item.category}
          </span>
          <button onClick={onClose} className="p-1 text-[#8C8476] hover:text-[#1E1E1E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#FAF8F3] border border-[#EDE7DC]">
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#1A1A1A]">{item.title}</h2>
              <p className="text-xs text-[#7A7265] mt-1">보드: {item.boardName || '기본 컬렉션'}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold font-display text-[#1E1E1E] tabular-nums">
                {item.currency} {item.price.toLocaleString()}
              </p>
              <p className="text-xs font-mono text-[#8C8476]">약 {inKRW.toLocaleString()}원</p>
            </div>
          </div>

          {/* Store Pin Info */}
          <div className="p-4 bg-[#FAF8F3] rounded-xl border border-[#EDE7DC] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1E1E1E] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C85A32]" />
                <span>{item.targetStore}</span>
              </span>
              {item.storeArea && (
                <span className="font-mono text-[11px] text-[#8C8476] bg-white px-2 py-0.5 rounded border border-[#E8E2D5]">
                  {item.storeArea}
                </span>
              )}
            </div>
            {item.storeAddress && <p className="text-[#6B6457]">{item.storeAddress}</p>}
          </div>

          {item.notes && (
            <div className="text-xs text-[#4A453E] bg-white p-3 rounded-lg border border-[#EDE7DC] leading-relaxed">
              <p className="font-semibold text-[#1E1E1E] mb-1">메모</p>
              <p>{item.notes}</p>
            </div>
          )}

          {/* External Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            {item.snsUrl && (
              <a
                href={item.snsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#6B6457] hover:text-[#C85A32] underline"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>SNS 원본 포스트</span>
              </a>
            )}
            {item.productUrl && (
              <a
                href={item.productUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#6B6457] hover:text-[#C85A32] underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>온라인 스토어</span>
              </a>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#F0ECE3] flex items-center justify-between">
          <button
            onClick={() => {
              toggleShoppingItemPurchased(item.id);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              item.purchased
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-[#1E1E1E] hover:bg-[#C85A32] text-white shadow-xs'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{item.purchased ? '구매 완료됨 (경비 반영)' : '구매 완료로 체크'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onEdit(item);
            }}
            className="px-4 py-2 text-xs text-[#7A7265] hover:text-[#1E1E1E] underline cursor-pointer"
          >
            정보 수정
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================================================
   5. ADD STOP TO ITINERARY MODAL
======================================================== */
interface AddStopToItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  preselectedPlaceId?: string | null;
}

export const AddStopToItineraryModal: React.FC<AddStopToItineraryModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  preselectedPlaceId,
}) => {
  const { activeTripPlaces, addStopToDay } = useTrip();

  const [placeId, setPlaceId] = useState(
    preselectedPlaceId || activeTripPlaces[0]?.id || ''
  );
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeId) return;
    addStopToDay(dayNumber, placeId, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8E2D5] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A]">
            DAY {dayNumber}에 장소 추가
          </h2>
          <button onClick={onClose} className="p-1 text-[#8C8476] hover:text-[#1E1E1E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">방문할 장소 선택 *</label>
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
            >
              {activeTripPlaces.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.area || p.category}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">방문 메모</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 웨이팅 확인 후 입장, 2층 창가석"
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#F0ECE3] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#7A7265] hover:text-[#1E1E1E]"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              일정에 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ========================================================
   6. EXPENSE MODAL (Add Expense)
======================================================== */
interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { activeTrip, addExpense } = useTrip();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(30000);
  const [currency, setCurrency] = useState('KRW');
  const [category, setCategory] = useState<ExpenseCategory>('FOOD');
  const [payer, setPayer] = useState('나 (Me)');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH' | 'PAY'>('CARD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    const rate = activeTrip.exchangeRate || 9.15;
    const amountKRW = currency === 'KRW' ? amount : Math.round(amount * rate);

    addExpense({
      tripId: activeTrip.id,
      title,
      amount,
      currency,
      amountKRW,
      date,
      category,
      payer,
      paymentMethod,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8E2D5] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A]">지출 내역 등록</h2>
          <button onClick={onClose} className="p-1 text-[#8C8476] hover:text-[#1E1E1E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">지출 항목 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 긴자 카가리 라멘 저녁 식사"
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">금액 *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">통화</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              >
                <option value="KRW">원화 (KRW)</option>
                <option value="JPY">엔화 (JPY)</option>
                <option value="USD">달러 (USD)</option>
                <option value="TWD">대만달러 (TWD)</option>
                <option value="EUR">유로 (EUR)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              >
                <option value="FOOD">식비 (FOOD)</option>
                <option value="CAFE">카페/디저트 (CAFE)</option>
                <option value="SHOPPING">쇼핑 (SHOPPING)</option>
                <option value="TRANSPORT">교통비 (TRANSPORT)</option>
                <option value="HOTEL">숙소 (HOTEL)</option>
                <option value="FLIGHT">항공권 (FLIGHT)</option>
                <option value="TOUR">관광/입장료 (TOUR)</option>
                <option value="ETC">기타 (ETC)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">결제일</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">결제자</label>
              <input
                type="text"
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                placeholder="예: 나 (Me), 친구 이름"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1E1E1E] mb-1">결제 수단</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
              >
                <option value="CARD">신용/체크카드 (CARD)</option>
                <option value="CASH">현금 (CASH)</option>
                <option value="PAY">간편결제/페이 (PAY)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1E1E1E] mb-1">메모</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="영수증 메모 등..."
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#F0ECE3] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#7A7265] hover:text-[#1E1E1E]"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              지출 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ========================================================
   7. BACKUP / RESTORE MODAL (JSON Persistence)
======================================================== */
interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportDataJson, importDataJson, resetToDefaultData } = useTrip();
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleDownload = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRIPLOG_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('백업 파일이 성공적으로 다운로드되었습니다.');
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDataJson(importText);
    if (ok) {
      setMessage('성공적으로 데이터를 복원했습니다!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMessage('JSON 형식이 올바르지 않습니다.');
    }
  };

  const handleReset = () => {
    if (confirm('초기 데모 데이터로 복원하시겠습니까? 현재 변경사항이 리셋됩니다.')) {
      resetToDefaultData();
      setMessage('기본 큐레이션 데이터로 복원되었습니다.');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E8E2D5] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#C85A32]" />
            <span>데이터 영구 백업 & 복원</span>
          </h2>
          <button onClick={onClose} className="p-1 text-[#8C8476] hover:text-[#1E1E1E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#7A7265] leading-relaxed">
          TRIPLOG의 모든 데이터는 브라우저의 로컬 스토리지에 영구 저장되며, 새로고침 시에도 유지됩니다.
          다른 컴퓨터나 기기에서도 사용하려면 JSON 파일로 백업하고 복원할 수 있습니다.
        </p>

        {message && (
          <div className="p-3 bg-[#FAF8F3] border border-[#C85A32] text-[#C85A32] rounded-lg text-xs font-medium">
            {message}
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Export */}
          <div className="p-4 bg-[#FAF8F3] rounded-xl border border-[#EDE7DC] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#1E1E1E]">현재 데이터 백업 다운로드</p>
              <p className="text-[11px] text-[#8C8476]">모든 여행, 저장 장소, 쇼핑 무드보드 포함</p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#C85A32] text-white rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON 내보내기</span>
            </button>
          </div>

          {/* Import */}
          <div className="space-y-2">
            <label className="font-semibold text-[#1E1E1E] block">백업 JSON 텍스트 붙여넣기</label>
            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="백업 JSON 파일 내용을 여기에 붙여넣으세요..."
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E0D8C8] rounded-lg font-mono text-[11px] focus:outline-none"
            />
            <button
              onClick={handleImport}
              className="w-full py-2 bg-[#1E1E1E] hover:bg-[#C85A32] text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              JSON 데이터 복원 적용
            </button>
          </div>

          {/* Demo Reset */}
          <div className="pt-3 border-t border-[#F0ECE3] flex justify-between items-center">
            <button
              onClick={handleReset}
              className="text-[#9C9487] hover:text-[#C85A32] text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>초기 큐레이션 데이터로 리셋</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-[#7A7265] hover:text-[#1E1E1E]"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
