export type UniverseCategory =
  | "전체"
  | "인기"
  | "최신"
  | "게임"
  | "스포츠"
  | "일상"
  | "팬덤"
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
