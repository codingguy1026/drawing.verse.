export const universeCategories = { general: '일반', art: '미술', fantasy: '판타지', scifi: '공상과학', romance: '로맨스', horror: '공포' };
export type UniverseDraft = {
  name: string; slug: string; description: string; category: string; icon: string;
  visibility: 'public' | 'private'; allow_member_posts: boolean; allow_comments: boolean;
  rules: string; sections: string[];
};
export const initialUniverse: UniverseDraft = {
  name: '', slug: '', description: '', category: 'general', icon: '🌌',
  visibility: 'public', allow_member_posts: true, allow_comments: true,
  rules: '', sections: ['일반', '질문', '작품 소개', '공지'],
};
export function slugFromName(name: string) {
  return name.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64).replace(/-+$/g, '');
}
export function slugError(slug: unknown): string | null {
  if (typeof slug !== 'string' || !slug) return '주소를 입력해주세요.';
  if (slug.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return '주소는 영문 소문자, 숫자, 단어 사이 하이픈으로 64자 이내로 입력해주세요.';
  if (['create', 'new', 'edit', 'settings'].includes(slug)) return '이 주소는 사용할 수 없어요. 다른 주소를 골라주세요.';
  return null;
}
export function validateUniverse(value: unknown, step = 3): string | null {
  if (!value || typeof value !== 'object') return '입력 내용을 확인해주세요.';
  const d = value as UniverseDraft;
  if (typeof d.name !== 'string' || !d.name.trim() || d.name.trim().length > 60) return '유니버스 이름을 1~60자로 입력해주세요.';
  const slug = slugError(d.slug); if (slug) return slug;
  if (typeof d.description !== 'string' || d.description.length > 280) return '소개는 280자 이내로 입력해주세요.';
  if (!Object.hasOwn(universeCategories, d.category)) return '카테고리를 선택해주세요.';
  if (typeof d.icon !== 'string' || d.icon.length > 16) return '아이콘은 짧은 이모지로 입력해주세요.';
  if (step === 0) return null;
  if (!['public', 'private'].includes(d.visibility) || typeof d.allow_member_posts !== 'boolean' || typeof d.allow_comments !== 'boolean') return '공개 범위와 커뮤니티 설정을 확인해주세요.';
  if (typeof d.rules !== 'string' || d.rules.length > 2000) return '규칙은 2,000자 이내로 입력해주세요.';
  if (step === 1) return null;
  if (!Array.isArray(d.sections) || d.sections.length < 1 || d.sections.length > 8) return '섹션을 1~8개 만들어주세요.';
  if (d.sections.some(s => typeof s !== 'string' || !s.trim() || s.trim().length > 30)) return '각 섹션 이름을 1~30자로 입력해주세요.';
  if (new Set(d.sections.map(s => s.trim().toLowerCase())).size !== d.sections.length) return '섹션 이름이 겹치지 않게 입력해주세요.';
  return null;
}
