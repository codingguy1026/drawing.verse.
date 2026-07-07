// src/lib/postsStore.ts

export type Comment = {
  id: number;
  author: string;
  content: string;
  date: string;
};

export type Post = {
  id: number;
  title: string;
  author: string;
  content: string;
  date: string;
  views: number;
  comments: Comment[];
  tag?: string | null;
  universeId?: string | null;
  likes: number;
};

// -------------------------------
// 초기 더미 데이터
// -------------------------------
let posts: Post[] = [
  {
    id: 1,
    title: "첫 웹툰 에피소드 연습작 올려봅니다! 조언 환영해요 :)",
    author: "웹툰쟁이",
    content:
      "웹툰 1화 콘티 연습해봤어요! 컷 구성이나 말풍선 배치 피드백 환영합니다 🙏",
    date: "1분 전",
    views: 125,
    comments: [],
    tag: "연습",
    universeId: "webtoon",
    likes: 25,
  },
  {
    id: 2,
    title: "파스텔톤 일러스트! 드디어 완성했어요~",
    author: "색연필홀릭",
    content:
      "파스텔톤으로 몽환적인 분위기 연습했어요. 색 조합 어색한 부분 있으면 알려주세요!",
    date: "5분 전",
    views: 88,
    comments: [],
    tag: "완성",
    universeId: "illust",
    likes: 45,
  },
  {
    id: 3,
    title: "제가 만든 귀여운 캐릭터 팝니다 ㅋㅋㅋ",
    author: "캐릭터굿즈",
    content: "굿즈용으로 만든 캐릭터입니다. 이름 추천도 받습니다 ㅋㅋ",
    date: "10분 전",
    views: 210,
    comments: [],
    tag: "자작",
    universeId: "character",
    likes: 78,
  },
];

// -------------------------------
// 게시글 목록 가져오기
// -------------------------------
export function getPosts(): Post[] {
  return posts;
}

// -------------------------------
// 특정 게시글 가져오기
// -------------------------------
export function getPostById(id: number): Post | undefined {
  return posts.find((p) => p.id === id);
}

// -------------------------------
// 새 게시글 추가 ✅ (필수값 최소화)
// -------------------------------
type NewPostInput = Omit<
  Post,
  "id" | "comments" | "views" | "likes" | "date"
> & {
  date?: string;
};

export function addPost(post: NewPostInput): Post {
  const newPost: Post = {
    ...post,
    id: Date.now(), // ✅ 중복 거의 없음
    comments: [],
    views: 0,
    likes: 0,
    date: post.date ?? "방금 전",
  };

  posts.unshift(newPost); // ✅ 최신글 위로
  return newPost;
}

// -------------------------------
// 게시글에 댓글 추가 ✅ (id/date 자동)
// -------------------------------
type NewCommentInput = Omit<Comment, "id" | "date"> & { date?: string };

export function addComment(
  postId: number,
  comment: NewCommentInput
): Comment | null {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const newComment: Comment = {
    ...comment,
    id: Date.now(),
    date: comment.date ?? "방금 전",
  };

  post.comments.push(newComment);
  return newComment;
}
