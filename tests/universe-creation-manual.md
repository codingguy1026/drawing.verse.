# Universe creation verification

- `npm ci` then copy `.env.example` to `.env.local` (public settings only).
- `npm run dev`; `/universe/create?demo=1` enables development-only UI preview without authentication or persistence. Production ignores this parameter.
- For real creation, sign in through `/auth/login` and visit `/universe/create`.
- Empty names, invalid/reserved/taken slugs and empty/duplicate sections must be blocked.
- Edit an auto-generated slug, change the name, and verify the custom slug remains.
- Change settings; add/rename/remove/reorder sections; go back and verify values remain.
- Preview, double-click Create, and confirm only one Universe exists and the browser redirects.
- Confirm its sections filter posts and appear in the existing write form's category selector.
- Private v1 Universes are owner-only; there is no invitation/membership management in this scope.

`universes.owner_id` is the existing ownership authority. `universes.sections` is an ordered list of existing `posts.category` values, stored in the same insert as the Universe to avoid partial creation. No separate board model or section table is introduced.

The migration was applied to the connected project. SQL transaction tests with temporary owner/member fixtures verified owner access, section order, duplicate rejection (including hidden private slugs), owner spoof rejection, private post visibility, member-post restrictions, and comment restrictions. All test fixtures were rolled back.

Automated validation: `node tests/universe-creation.test.cjs`.

Production HTTP checks confirmed the unauthenticated page emits the Next.js streamed login redirect, and both creation POST and availability GET return 401. The production build and shared validation checks passed. Browser automation could not start in this environment (agent-browser daemon startup failure); authenticated click-through and visual verification remain manual checks.
