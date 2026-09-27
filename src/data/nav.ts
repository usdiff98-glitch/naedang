export const sections = [
  { id: 'story', label: '이야기', en: 'Story', inHeader: true },
  { id: 'signature', label: '오늘뭐먹지', en: 'Signature', inHeader: true },
  { id: 'menu', label: '차림표', en: 'Menu', inHeader: true },
  { id: 'table', label: '상차림', en: 'The Table', inHeader: false },
  { id: 'rooms', label: '공간', en: 'Rooms', inHeader: true },
  { id: 'butcher', label: '정육 · 선물', en: 'Butcher', inHeader: true },
  { id: 'visit', label: '오시는 길', en: 'Visit', inHeader: true },
] as const;

export type SectionId = (typeof sections)[number]['id'];

export const sectionNo = (id: SectionId) =>
  String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0');
