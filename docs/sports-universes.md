# 스포츠 유니버스

기존 `/universe/[slug]`의 배너 바로 아래에 스포츠 영역을 추가합니다. 게시글, 구독, 댓글, 프로필, 검색 로직은 변경하지 않습니다. 경기 클릭 시 `/universe/[slug]/live/[matchId]`로 이동합니다.

## 적용 대상과 팀 설정

`src/lib/sports/config.ts`의 `sportsUniverses` 키를 **실제 universes 테이블의 slug**에 맞춥니다. 이 변경은 DB에 새 커뮤니티를 생성하지 않습니다. 등록된 slug 또는 카테고리가 `스포츠`, `야구`, `축구`, `농구`, `배구`인 유니버스에만 스포츠 영역이 나타납니다. 나머지 유니버스는 기존 화면입니다.

```ts
"my-team": {
  parent: "kbo", // kbo → baseball → sports: 종목/리그/스타일 상속
  teamId: "provider-team-id", // 공급자와 동일한 ID
  color: "#c2410c",
  logo: "/teams/my-team.svg",
  banner: "/teams/my-team-banner.webp",
  tagline: "마지막 아웃까지 함께.",
},
```

모든 산하 팀/리그 slug를 parent 관계로 등록합니다. 임의의 DB 부모 관계를 자동 추측하지 않습니다. `teamId`와 `leagueId`는 연결하는 공급자 ID와 맞춰야 합니다. 로고/배너는 로컬 경로 또는 HTTPS 주소를 사용합니다. 로고가 없거나 로딩에 실패하면 팀 이름 두 글자를 표시합니다. 실제 팀 로고 파일은 포함하지 않았습니다.

## 실제 중계 연결

현재 저장소에 경기 데이터 공급자나 인증 정보가 없어 실제 경기 피드는 연결하지 않았습니다. `SPORTS_FEED_URL`을 서버 환경변수에 설정하면 **정규화한 JSON 피드**를 읽습니다. 인증이 필요한 경우 `SPORTS_FEED_TOKEN`은 Bearer 토큰으로 공급자에게만 전달합니다. 두 값 모두 `NEXT_PUBLIC_` 변수로 만들지 마세요.

이 엔드포인트는 일반 스포츠 API의 응답을 자동 해석하지 않습니다. 계약된 공급자의 응답을 아래 `Match` 형식으로 변환하는 서버 어댑터가 필요합니다. URL은 HTTPS만 허용하고 리다이렉트를 따르지 않습니다. 응답 제한은 2MB/1,000경기, 경기별 이벤트는 500개입니다. 잘못된 데이터는 표시하지 않고 503으로 응답합니다. `/api/sports`는 공개 경기 정보 전용이므로 원본 피드에 개인정보를 넣지 않습니다.

```json
{
  "matches": [{
    "id": "game-20260910-01", "sport": "baseball",
    "leagueId": "kbo", "league": "KBO",
    "home": { "id": "hanwha", "name": "한화", "logo": "/teams/hanwha.svg" },
    "away": { "id": "samsung", "name": "삼성", "logo": "/teams/samsung.svg" },
    "score": [0, 0], "status": "scheduled",
    "startsAt": "2026-09-10T09:30:00Z",
    "updatedAt": "2026-09-10T08:00:00Z",
    "state": null, "events": []
  }]
}
```

위 JSON은 형식 설명용이며 실제 일정이 아닙니다. 전체 타입은 `src/lib/sports/types.ts`에 있습니다.

- 모든 점수/파울/세트 배열은 **홈, 원정 순서**입니다. 배구 `score`는 현재 세트 점수, `state.sets`는 세트 스코어입니다.
- `state.kind`는 `sport`와 일치해야 합니다. 진행 중인 경기에는 상세 상태가 필수입니다.
- 야구 `bases`는 **1루, 2루, 3루**입니다. 볼은 0–3, 스트라이크는 0–2, 아웃은 0–3이며 타석 종료 시 공급자가 다음 타석 상태로 갱신합니다.
- `events`는 **최신순**, 경기 안에서 고유한 `id`를 사용합니다. 홈런·골·주요 득점에는 `major: true`를 지정합니다. 이벤트가 발생할 때 `updatedAt`도 갱신합니다.
- `updatedAt`은 단순 조회 시간이 아닌 **공급자가 경기 상태를 마지막 확인한 시간**이어야 합니다. 경기 중 이벤트가 없어도 공급자가 현재 상태를 확인한 heartbeat를 보내야 60초 지연 경고를 피할 수 있습니다.
- 화면은 10초마다 확인합니다. 탭이 숨겨지면 요청을 멈추고 복귀/온라인 전환 때 다시 조회합니다. 시계는 공급자 값을 사용하며 임의로 시간을 진행시키지 않습니다.
- 진행 중/휴식 경기가 우선이고, 없으면 가장 가까운 미래의 예정 경기로 전환합니다. 취소·연기·종료는 다음 경기 후보에서 제외합니다. 중계 상세 화면은 선택한 경기의 종료 기록을 유지합니다.
- 오류 시 마지막 정상 기록과 연결 오류를 표시합니다. 60초 이상 오래된 진행 중 기록에는 LIVE 대신 업데이트 지연을 표시합니다. 공급자가 경기 목록에서 기록을 제거하면 해당 기록 없음으로 전환합니다.
- 운영 환경에서는 공급자 요청 한도와 트래픽에 맞춰 중간 피드 서비스에서 공유 캐시/요청 제한을 적용하세요. 현재 서버 라우트는 사용자 요청마다 피드를 조회합니다.

## 예시 화면과 확장

점수판의 `예시 경기 보기`는 실제 피드와 분리된 고정 가상 데이터입니다. 가짜 이벤트를 타이머로 만들지 않습니다. `예시 · 실제 경기 아님` 표시가 중계 상세 화면에도 유지됩니다. 직접 확인할 주소:

- `/universe/baseball/live/demo-baseball?demo=1`
- `/universe/football/live/demo-football?demo=1`
- `/universe/basketball/live/demo-basketball?demo=1`
- `/universe/volleyball/live/demo-volleyball?demo=1`

새 스포츠는 먼저 `other`의 `period`/`details`로 표현할 수 있습니다. 전용 시각화가 필요하면 `MatchState`, `validMatch`, `progress`, `SportState`에 새 kind를 추가합니다.

## 검증

`node scripts/test-sports.cjs`는 실제/다음 경기 선택, 팀·리그 상속 및 필터링, 지연 상태, 데이터 검증, 환경 미설정/공급자 오류/예시 분리/API 토큰 비노출을 검증합니다. `npx tsc --noEmit --incremental false`로 전체 타입을 확인합니다. 실제 공급자 연결 후에는 진행 중 경기에서 점수/BSO/주자/플레이가 함께 갱신되고, 새 주요 이벤트와 점수 변화에만 짧은 강조가 나타나는지 확인해야 합니다. 브라우저 동작/모바일 시각 검증과 실제 공급자 종단간 검증은 별도입니다.
