import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Route Planner Endpoint
app.post('/api/ai/recommend-routes', async (req: Request, res: Response) => {
  try {
    const { places, tripCity, tripCountry, style = 'balanced', days = 3 } = req.body;

    if (!places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ error: '저장된 장소 데이터가 필요합니다.' });
    }

    if (!ai) {
      // Algorithmic intelligent fallback if API key is not yet set
      const fallbackRoutes = generateAlgorithmicRoutes(places, style, days);
      return res.json({ routes: fallbackRoutes, isAiGenerated: false });
    }

    const simplifiedPlaces = places.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      area: p.area || '기타',
      lat: p.lat,
      lng: p.lng,
      priority: p.priority,
      address: p.address,
    }));

    const prompt = `당신은 세계적인 여행 플래너이자 감각적인 여행 매거진 에디터입니다.
사용자가 ${tripCountry || ''} ${tripCity || '여행지'}에 저장해 둔 다음 장소 리스트를 바탕으로, 효율적이고 매력적인 4~5가지 맞춤 여행 코스를 추천해주세요.

사용자가 선택한 여행 스타일: ${style} (여유형: 하루 3-4곳 / 일반형: 하루 5-6곳 / 알찬형: 하루 7-9곳 / 욕심쟁이형: 최대 포함)
여행 기간: ${days}일

저장된 장소 리스트:
${JSON.stringify(simplifiedPlaces, null, 2)}

반드시 다음 5가지 코스를 제안해주세요:
1. COURSE A (이동 시간 최소화 효율 코스): 지리적으로 인접한 장소들을 묶어 동선 낭비가 가장 적은 코스
2. COURSE B (맛집 & 감성 카페 중심 코스): 미식과 카페 호핑에 집중한 라이프스타일 힐링 코스
3. COURSE C (트렌디 쇼핑 & 편집숍 중심 코스): 패션, 뷰티, 라이프스타일 매장 및 소품샵 중심 코스
4. COURSE D (관광 & 포토스팟 중심 코스): 주요 명소와 사진 찍기 좋은 랜드마크 중심 코스
5. COURSE E (저장 장소 최대 활용 알찬 코스): 저장한 명소를 가능한 한 골고루 많이 소화하는 코스

[중요 제약 조건]
- 절대 사용자가 저장하지 않은 가짜 장소를 임의로 추가하지 마세요. (주어진 장소 id와 이름을 사용)
- 각 코스마다 포함된 장소와 '포함되지 않은 미배정 장소(unassignedPlaces)' 목록을 명확히 분리하세요.
- 각 코스마다 추천 이유, 이동 동선 요약, 예상 총 소요시간을 산출하세요.
- 각 방문지마다 권장 순서(order), 예상 이동 시간(transitMinutes), 예상 체류 시간(stayMinutes), 방문 팁을 포함하세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            routes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  courseCode: { type: Type.STRING, description: "예: COURSE A, COURSE B" },
                  title: { type: Type.STRING, description: "코스 이름 및 테마" },
                  description: { type: Type.STRING, description: "코스 상세 설명 및 추천 이유" },
                  paceStyle: { type: Type.STRING, description: "여유형 / 일반형 / 알찬형" },
                  totalDurationHours: { type: Type.NUMBER, description: "예상 총 소요시간(시간 단위)" },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dayNumber: { type: Type.INTEGER },
                        dayTheme: { type: Type.STRING },
                        stops: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              placeId: { type: Type.STRING },
                              placeName: { type: Type.STRING },
                              category: { type: Type.STRING },
                              order: { type: Type.INTEGER },
                              transitMinutes: { type: Type.INTEGER, description: "이전 장소에서의 예상 이동 시간(분)" },
                              transitSummary: { type: Type.STRING, description: "예: 도보 8분, 지하철 2정거장(12분)" },
                              stayMinutes: { type: Type.INTEGER, description: "예상 체류 시간(분)" },
                              tip: { type: Type.STRING, description: "방문 추천 팁 또는 최적 시간대" },
                            },
                            required: ['placeId', 'placeName', 'order', 'stayMinutes'],
                          },
                        },
                      },
                      required: ['dayNumber', 'stops'],
                    },
                  },
                  unassignedPlaces: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        placeId: { type: Type.STRING },
                        placeName: { type: Type.STRING },
                        reason: { type: Type.STRING, description: "해당 코스에서 제외된 사유 (예: 동선 이탈, 테마 불일치)" },
                      },
                      required: ['placeId', 'placeName', 'reason'],
                    },
                  },
                },
                required: ['id', 'courseCode', 'title', 'description', 'days', 'unassignedPlaces'],
              },
            },
          },
          required: ['routes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      routes: parsed.routes || generateAlgorithmicRoutes(places, style, days),
      isAiGenerated: true,
    });
  } catch (err: any) {
    console.error('Gemini Route Recommendation Error:', err);
    // Graceful fallback to algorithmic cluster
    const fallbackRoutes = generateAlgorithmicRoutes(req.body.places || [], req.body.style || 'balanced', req.body.days || 3);
    return res.json({ routes: fallbackRoutes, isAiGenerated: false, note: 'AI 응답 지연으로 최적 동선 알고리즘으로 코스를 생성했습니다.' });
  }
});

// 2. Discover Local Gems Endpoint
app.post('/api/ai/discover', async (req: Request, res: Response) => {
  try {
    const { query, city = '도쿄' } = req.body;

    if (!query) {
      return res.status(400).json({ error: '검색어를 입력해주세요.' });
    }

    if (!ai) {
      return res.json({
        spots: getSampleDiscoverSpots(city, query),
        isSample: true,
      });
    }

    const prompt = `당신은 ${city} 현지 여행 큐레이터이자 트렌디한 라이프스타일 매거진 에디터입니다.
사용자의 검색어 "${query}"에 맞춰, 관광객용 흔한 장소가 아닌 실제 현지인들과 트렌드세터들이 극찬하는 숨겨진 보석 같은 스폿 4~6곳을 추천해주세요.

스폿 정보에는 다음이 포함되어야 합니다:
- name: 장소명 (현지어 명칭 병기)
- category: RESTAURANT | CAFE | SHOPPING | TOUR | ACCOMMODATION
- area: 주요 동네/구역 (예: 나카메구로, 다이칸야마, 시모키타자와 등)
- address: 주소 (가능한 정확히)
- lat: 위도 (실제 좌표에 가까운 숫자)
- lng: 경도 (실제 좌표에 가까운 숫자)
- rating: 평점 (4.3 ~ 4.9 사이)
- signature: 대표 메뉴 또는 시그니처 아이템
- reason: 현지인 추천 이유 및 공간의 매력
- openingHours: 영업시간 (예: 11:00 - 20:00, 월요일 휴무)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  area: { type: Type.STRING },
                  address: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  rating: { type: Type.NUMBER },
                  signature: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  openingHours: { type: Type.STRING },
                },
                required: ['name', 'category', 'area', 'address', 'lat', 'lng', 'rating', 'signature', 'reason'],
              },
            },
          },
          required: ['spots'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      spots: parsed.spots || getSampleDiscoverSpots(city, query),
      isSample: false,
    });
  } catch (err) {
    console.error('Discover error:', err);
    return res.json({
      spots: getSampleDiscoverSpots(req.body.city || '도쿄', req.body.query || ''),
      isSample: true,
    });
  }
});

// 3. SNS Link Intelligence Extractor
app.post('/api/ai/extract-sns', async (req: Request, res: Response) => {
  try {
    const { url, destinationCity = '도쿄' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL을 입력해주세요.' });
    }

    if (!ai) {
      // Return smart inferred structure
      return res.json({
        data: inferSnsFallback(url, destinationCity),
        isAiGenerated: false,
      });
    }

    const prompt = `사용자가 여행 중 쇼핑 또는 방문을 위해 다음 SNS/웹 링크를 제공했습니다:
URL: "${url}"
여행지: "${destinationCity}"

이 URL의 형태나 도메인(인스타그램, 핀터레스트, 유튜브, 공식몰 등)과 연관될 법한 쇼핑 아이템 또는 스폿 정보를 큐레이션 전문가 시각에서 스마트하게 분석하고 정돈해주세요.
만약 외부 접근 제한으로 실시간 크롤링이 불가능하더라도, URL 패턴과 여행지 특성에 맞춰 템플릿 필드를 추론하여 사용자가 바로 수정/입력할 수 있도록 도와주세요.

반드시 다음 필드를 JSON으로 반환하세요:
- title: 제품명 또는 포스팅 제목
- brand: 브랜드명 또는 제작사
- category: CLOTHING | BAG | SHOES | ACCESSORIES | BEAUTY | LIFESTYLE | VINTAGE | ETC
- estimatedPrice: 현지 통화 기준 예상 가격 (숫자)
- currency: 통화 코드 (JPY, TWD, USD, EUR, KRW 등)
- storeName: 해당 여행지(${destinationCity})에서 이 브랜드나 제품을 취급하는 유력 매장명
- storeArea: 매장 위치 동네 (예: 긴자, 시부야, 오모테산도 등)
- storeAddress: 매장 예상 주소
- notes: 추천 포인트 및 스타일링 메모
- sourcePlatform: Instagram, Pinterest, YouTube, WebShop 중 하나`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            brand: { type: Type.STRING },
            category: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            storeName: { type: Type.STRING },
            storeArea: { type: Type.STRING },
            storeAddress: { type: Type.STRING },
            notes: { type: Type.STRING },
            sourcePlatform: { type: Type.STRING },
          },
          required: ['title', 'brand', 'category', 'estimatedPrice', 'currency', 'storeName'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ data: parsed, isAiGenerated: true });
  } catch (err) {
    console.error('SNS Extractor error:', err);
    return res.json({
      data: inferSnsFallback(req.body.url, req.body.destinationCity || '도쿄'),
      isAiGenerated: false,
    });
  }
});

// 4. Live Exchange Rates Endpoint
app.get('/api/exchange-rates', (_req: Request, res: Response) => {
  // Benchmark reference exchange rates with KRW base
  res.json({
    base: 'KRW',
    timestamp: new Date().toISOString(),
    rates: {
      JPY: 9.15,    // 1 JPY = 9.15 KRW (100 JPY ≈ 915 KRW)
      USD: 1395.0,  // 1 USD = 1395 KRW
      EUR: 1515.0,  // 1 EUR = 1515 KRW
      TWD: 43.5,    // 1 TWD = 43.5 KRW
      GBP: 1780.0,  // 1 GBP = 1780 KRW
      VND: 0.055,   // 100 VND = 5.5 KRW
      THB: 39.8,    // 1 THB = 39.8 KRW
      KRW: 1.0,
    },
    isLive: false,
    note: '공식 환율 기준 참고치이며, 앱 내에서 사용자가 직접 실시간 환율을 수정할 수도 있습니다.',
  });
});

// Helper: Algorithmic route clustering fallback
function generateAlgorithmicRoutes(places: any[], style: string, days: number) {
  const maxPerDay = style === 'relaxed' ? 4 : style === 'packed' ? 8 : style === 'ambitious' ? 10 : 5;
  const totalSlots = maxPerDay * days;

  // Course A: Geographical Area Cluster (Min Transit)
  const sortedByArea = [...places].sort((a, b) => (a.area || '').localeCompare(b.area || ''));
  const courseAPlaces = sortedByArea.slice(0, Math.min(places.length, totalSlots));
  const unassignedA = sortedByArea.slice(courseAPlaces.length).map(p => ({
    placeId: p.id,
    placeName: p.name,
    reason: '일정 이동 시간 최소화를 위해 동일 권역 중심 배치 후 잔여 배정',
  }));

  // Course B: Food & Cafe Focused
  const foodCafe = places.filter(p => p.category === 'RESTAURANT' || p.category === 'CAFE');
  const otherB = places.filter(p => p.category !== 'RESTAURANT' && p.category !== 'CAFE');
  const courseBPlaces = [...foodCafe, ...otherB].slice(0, Math.min(places.length, totalSlots));
  const unassignedB = places.filter(p => !courseBPlaces.some(cp => cp.id === p.id)).map(p => ({
    placeId: p.id,
    placeName: p.name,
    reason: '미식 및 카페 중심 테마 우선순위로 인해 제외됨',
  }));

  // Course C: Shopping & Lifestyle Focused
  const shopping = places.filter(p => p.category === 'SHOPPING');
  const otherC = places.filter(p => p.category !== 'SHOPPING');
  const courseCPlaces = [...shopping, ...otherC].slice(0, Math.min(places.length, totalSlots));
  const unassignedC = places.filter(p => !courseCPlaces.some(cp => cp.id === p.id)).map(p => ({
    placeId: p.id,
    placeName: p.name,
    reason: '쇼핑 무드보드 및 편집숍 중심 테마 우선순위로 인해 제외됨',
  }));

  // Helper to split into days
  const makeDays = (list: any[]) => {
    const dayBuckets: any[] = [];
    const count = Math.ceil(list.length / days) || 1;
    for (let d = 1; d <= days; d++) {
      const daySlice = list.slice((d - 1) * count, d * count);
      dayBuckets.push({
        dayNumber: d,
        dayTheme: `DAY ${d} 컬렉션`,
        stops: daySlice.map((p, idx) => ({
          placeId: p.id,
          placeName: p.name,
          category: p.category,
          order: idx + 1,
          transitMinutes: idx === 0 ? 0 : 15,
          transitSummary: idx === 0 ? '출발' : '도보/지하철 약 15분',
          stayMinutes: p.category === 'CAFE' ? 60 : p.category === 'SHOPPING' ? 90 : 75,
          tip: `${p.name}의 대표적인 매력을 즐기기 좋은 시간대입니다.`,
        })),
      });
    }
    return dayBuckets;
  };

  return [
    {
      id: 'course-a',
      courseCode: 'COURSE A',
      title: '동선 최적화 에디토리얼 코스',
      description: '인접한 지역끼리 그룹화하여 이동 시간을 획기적으로 줄이고 여유를 확보한 코스입니다.',
      paceStyle: style,
      totalDurationHours: Math.round(courseAPlaces.length * 1.5),
      days: makeDays(courseAPlaces),
      unassignedPlaces: unassignedA,
    },
    {
      id: 'course-b',
      courseCode: 'COURSE B',
      title: '미식 & 로컬 카페 호핑 코스',
      description: '저장해 둔 맛집과 감각적인 카페를 중심축으로 하루의 리듬을 구성한 힐링 코스입니다.',
      paceStyle: style,
      totalDurationHours: Math.round(courseBPlaces.length * 1.6),
      days: makeDays(courseBPlaces),
      unassignedPlaces: unassignedB,
    },
    {
      id: 'course-c',
      courseCode: 'COURSE C',
      title: '셀렉트샵 & 쇼핑 위시리스트 코스',
      description: '저장된 쇼핑 매장과 무드보드 제품 판매처를 중심으로 감도 높은 숍들을 순회하는 코스입니다.',
      paceStyle: style,
      totalDurationHours: Math.round(courseCPlaces.length * 1.4),
      days: makeDays(courseCPlaces),
      unassignedPlaces: unassignedC,
    },
  ];
}

function getSampleDiscoverSpots(city: string, _query: string) {
  return [
    {
      name: 'Fuglen Tokyo (푸글렌 도쿄)',
      category: 'CAFE',
      area: '시부야/요요기',
      address: '1-7-11 Tomigaya, Shibuya, Tokyo',
      lat: 35.6669,
      lng: 139.6917,
      rating: 4.6,
      signature: '노르웨이 로스팅 에어로프레스 & 빈티지 칵테일',
      reason: '오슬로 감성의 북유럽 빈티지 인테리어와 요요기 공원 산책로가 이어지는 도쿄 최고 로컬 카페',
      openingHours: '08:00 - 22:00',
    },
    {
      name: 'Kith Treats & Store Tokyo',
      category: 'SHOPPING',
      area: '시부야 미야시타파크',
      address: '6-20-10 Jingumae, Shibuya, Tokyo',
      lat: 35.6622,
      lng: 139.7024,
      rating: 4.7,
      signature: '커스텀 시리얼 아이스크림 & 한정판 스트리트웨어',
      reason: '미야시타 파크 옥상 정원과 연결된 도쿄 최신 트렌드의 성지',
      openingHours: '11:00 - 21:00',
    },
    {
      name: 'Daikanyama T-Site (츠타야 서점)',
      category: 'TOUR',
      area: '다이칸야마',
      address: '17-5 Sarugakucho, Shibuya, Tokyo',
      lat: 35.6491,
      lng: 139.7001,
      rating: 4.8,
      signature: '예술 서적, 빈티지 레코드 갤러리 & 테라스 카페',
      reason: '건축가 클라인 다이섬이 설계한 숲속의 서점이자 라이프스타일 큐레이션의 정점',
      openingHours: '09:00 - 22:00',
    },
    {
      name: 'Afuri Ebisu (아후리 에비스 본점)',
      category: 'RESTAURANT',
      area: '에비스',
      address: '1-1-7 Ebisu, Shibuya, Tokyo',
      lat: 35.6473,
      lng: 139.7126,
      rating: 4.5,
      signature: '천연 유자 시오 라멘 & 담백한 차슈',
      reason: '상큼한 유자 향과 깔끔한 닭 육수로 현지 여성과 미식가들에게 오랫동안 사랑받는 명점',
      openingHours: '11:00 - 05:00',
    },
  ];
}

function inferSnsFallback(url: string, city: string) {
  let platform = 'Web';
  if (url.includes('instagram.com')) platform = 'Instagram';
  else if (url.includes('pinterest.com') || url.includes('pin.it')) platform = 'Pinterest';
  else if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'YouTube';

  return {
    title: '큐레이션 위시리스트 아이템',
    brand: 'Curated Label',
    category: 'BAG',
    estimatedPrice: 38000,
    currency: 'JPY',
    storeName: `${city} 플래그십 스토어`,
    storeArea: '시부야/하라주쿠',
    storeAddress: `${city} 중심가 편집숍 거리`,
    notes: 'SNS 피드에서 저장한 감각적인 위시 아이템',
    sourcePlatform: platform,
  };
}

// Vite middleware or production static build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRIPLOG Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
