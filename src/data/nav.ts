export const sections = [
  { id: 'menu', label: '차림표', en: 'Menu', inHeader: true },
  { id: 'signature', label: '오늘뭐먹지', en: 'Signature', inHeader: true },
  { id: 'visit', label: '오시는 길', en: 'Visit', inHeader: true },
] as const;

export type SectionId = (typeof sections)[number]['id'];

export const sectionNo = (id: SectionId) =>
  String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0');
