export type UniverseCategory =
  | "전체"
  | "인기"
  | "최신"
  | "팬아트"
  | "창작 세계관"
  | "소설"
  | "캐릭터"
  | "구독 중";

export interface UniverseItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: UniverseCategory;
  subscribers: number;
  posts: number;
  updatedAt: string;
  isTrending?: boolean;
  isNew?: boolean;
  tags?: string[];
}