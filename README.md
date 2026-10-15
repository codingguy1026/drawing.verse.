# Drawing Verse 🌌

**Drawing Verse (드버스)**는 사용자가 자신의 프로필로 활동하며 유니버스를 만들고, 글과 갤러리 콘텐츠로 세계를 확장하는 커뮤니티 프로젝트입니다. 익명 게시판이 아닌 **프로필 기반 서비스**를 지향합니다.

> 출시 준비 중입니다. 코드가 존재한다고 해서 모든 기능이 운영 환경에서 검증된 것은 아닙니다.

## 기술 구성

- **Frontend / Server:** Next.js App Router, React, TypeScript
- **Data / Auth:** Supabase
- **배포:** Railway 운영을 기준으로 환경을 점검합니다.
- **주요 영역:** 홈, 프로필, 게시글, 커뮤니티, 갤러리, 유니버스 생성과 탐색

## 로컬 개발

Node.js 22 환경을 권장합니다.

```bash
npm ci
cp .env.example .env.local
# .env.local에 본인이 관리하는 개발 환경의 실제 설정을 입력
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다. 비밀 키는 Git에 커밋하지 마세요. 공개 가능 키(`NEXT_PUBLIC_*`)와 서버 전용 키(`SUPABASE_SERVICE_ROLE_KEY`)는 용도가 다릅니다.

## 출시 전 검증

```bash
npm test       # 유니버스 생성 검증 + 스포츠 기능 테스트
npm run typecheck
npm run lint
npm run build
```

`main` 푸시 및 PR에 대해 [Launch readiness checks](.github/workflows/launch-readiness.yml)가 같은 검증을 실행하도록 설정되어 있습니다. 처음에는 기존 코드 문제로 검사가 실패할 수도 있으며, **성공 여부는 실제 Actions 실행 결과로 확인**해야 합니다.

출시 점검 항목과 수동 테스트는 [출시 체크리스트](docs/launch-readiness.md)를 확인하세요.

## 데이터베이스와 배포

- 데이터베이스 변경은 `supabase/migrations/`에 있습니다.
- `.env.example`은 필요한 변수 이름과 예시를 제공합니다. 운영 비밀 키의 실제 값은 **Railway 환경 변수 등 비공개 설정**으로만 관리하세요.
- 마이그레이션, 권한 정책(RLS), 로그인 세션, 게시물/갤러리 권한은 실제 환경에서 별도 검증이 필요합니다.
- **새 기능보다 기존 흐름의 정상 작동, 접근성, 오류 처리 및 배포 안정성**을 출시 우선순위로 둡니다.
