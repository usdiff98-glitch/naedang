// Every fact on the site comes from this file. Each value is taken from
// research.md (2026-09-27); unconfirmed claims (1++ grade, 암소, 홍성한우 brand,
// free parking ticket, owner name) are intentionally absent.

export const info = {
  name: '내당한우',
  hanja: '內堂',
  romanized: 'Naedang Hanwoo',
  signLine: '한우생고기 전문점',
  phone: '041-632-0156',
  phoneHref: 'tel:041-632-0156',
  phoneE164: '+82-41-632-0156',
  address: {
    road: '충남 홍성군 홍성읍 아문길52번길 6',
    jibun: '충남 홍성군 홍성읍 오관리 393-2',
    postalCode: '32230',
    region: '충청남도',
    locality: '홍성군',
    street: '홍성읍 아문길52번길 6',
  },
  geo: { lat: 36.600216, lng: 126.6634879 },
  hours: {
    days: '매일',
    open: '11:00',
    close: '22:00',
    breakStart: '15:00',
    breakEnd: '17:00',
  },
  holiday: '설날·추석 연휴 3일 휴무',
  parking: '식당 맞은편 홍주성(역사공원) 옆 공영주차장',
  payment: '신용카드',
  links: {
    naverPlace: 'https://m.place.naver.com/restaurant/13548133/home',
    kakaoMap: `https://map.kakao.com/link/search/${encodeURIComponent('홍성 내당한우')}`,
  },
  menuUpdated: { iso: '2026-04-16', label: '2026년 4월 16일' },
} as const;

export type MenuItem = {
  name: string;
  price: number;
  weight?: string;
  signature?: boolean;
  hanwoo?: boolean;
  detail?: string;
  note?: string;
  tag?: string;
};

// 네이버 플레이스 메뉴 + 사업주 메뉴판 사진, 2026-04-16
export const meatMenu: MenuItem[] = [
  {
    name: '오늘뭐먹지?',
    weight: '150g',
    price: 45000,
    signature: true,
    detail: '내당한우 스페셜 메뉴(부채·치마·갈비)',
    note: '상황에 따라 등심으로 바뀔 수 있음',
  },
  { name: '안창', weight: '150g', price: 60000 },
  { name: '살치살', weight: '150g', price: 60000 },
  { name: '새우살', weight: '150g', price: 70000 },
  { name: '치마살', weight: '150g', price: 50000 },
  { name: '알등심', weight: '150g', price: 50000 },
  { name: '육회', weight: '200g', price: 35000 },
  { name: '육사시미', weight: '180g', price: 35000 },
];

export const mealMenu: MenuItem[] = [
  { name: '갈비&제비추리탕', price: 15000, hanwoo: true },
  { name: '육회비빔밥', price: 14000, hanwoo: true },
  { name: '얼갈이해장국', price: 10000, hanwoo: true },
  { name: '물냉면', price: 7000, tag: '여름 한정' },
  { name: '비빔냉면', price: 7000, tag: '여름 한정' },
  { name: '소면', price: 4000, tag: '겨울 한정' },
  { name: '누룽지', price: 4000, note: '된장찌개 포함' },
  { name: '공기밥', price: 2000, note: '된장찌개 포함' },
];

export const menuBoardStatement =
  '저희 업소에서는 한우만 취급하며 배추, 쌀, 고춧가루, 꽃게, 두부는 국내산만 사용합니다.';

export const packaging = ['선물포장', '구이포장'] as const;

export const broadcasts = [
  {
    date: '2015-11-02',
    channel: 'Olive',
    program: '신동엽, 성시경의 오늘 뭐 먹지?',
    episode: '105회',
    topic: '특수부위',
  },
  {
    date: '2019-01-25',
    channel: 'Comedy TV',
    program: '맛있는 녀석들',
    episode: '205회',
    topic: '한우',
  },
  {
    date: '2019-12-27',
    channel: 'Comedy TV',
    program: '맛있는 녀석들',
    episode: '253회',
    topic: '육회 · 한우',
  },
  {
    date: '2024-12-10',
    channel: 'KBS1',
    program: '6시 내고향',
    episode: '8178회',
    topic: '한우',
  },
] as const;

// 사장님 소개글(네이버 플레이스)에 적힌 기본 제공 구성
export const tableExtras = ['육회', '생간', '허파전', '더덕구이', '알밥'] as const;

export const quotes = {
  extras:
    '메인 메뉴 주문 시 육회, 생간, 허파전, 더덕구이, 알밥 등이 제공됩니다. 꼬리살 육사시미도 물량이 있으면 거의 서비스로 나갑니다.',
  regulars: '유명인들이 많이 찾고, 한번 오신 분들은 잊지 않고 다시 찾아주심에 감사드립니다.',
  butcher: '내당한우 정육점도 운영하고 있습니다. 최고의 고기를 댁에서도 맛보실 수 있습니다.',
  rooms: '단체 모임을 위한 크기가 다른 룸 완비',
  reservation: '미리 예약해 주시면 보다 정성된 마음으로 모시겠습니다.',
} as const;

export const hongjuFortress = {
  name: '홍주읍성',
  rebuilt: '1451년(문종 1년)',
  landmarks: ['조양문', '홍주아문', '안회당', '여하정'],
  nearby: ['홍주성 역사관', '홍주읍성 천년여행길'],
  regional: ['남당항', '오서산'],
} as const;

export const formatPrice = (won: number) => won.toLocaleString('ko-KR');
