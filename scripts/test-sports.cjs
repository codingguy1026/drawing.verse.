const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'drawing-sports-'));
for (const name of ['types', 'config', 'model', 'demo', 'validate']) {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/sports', `${name}.ts`), 'utf8');
  fs.writeFileSync(path.join(temp, `${name}.js`), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText);
}
const route = fs.readFileSync(path.join(__dirname, '../src/app/api/sports/route.ts'), 'utf8').replaceAll('@/lib/sports/', './');
fs.writeFileSync(path.join(temp, 'route.js'), ts.transpileModule(route, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
const { resolveSportsConfig, safeAsset } = require(path.join(temp, 'config'));
const { selectMatch, isStale } = require(path.join(temp, 'model'));
const { demoMatches } = require(path.join(temp, 'demo'));
const { parseMatches } = require(path.join(temp, 'validate'));
const { GET } = require(path.join(temp, 'route'));

(async () => {
  const now = Date.parse('2026-09-10T09:00:00Z');
  const samples = demoMatches(now);
  assert.equal(parseMatches({ matches: samples }).length, 4);
  const team = resolveSportsConfig('hanwha-eagles');
  assert.equal(team.sport, 'baseball'); assert.equal(team.leagueId, 'kbo');
  assert.equal(resolveSportsConfig('fan-art'), null);
  assert.equal(resolveSportsConfig('custom-baseball', '야구').sport, 'baseball');
  const live = samples[0];
  const next = { ...live, id: 'next', status: 'scheduled', state: null, startsAt: new Date(now + 3600000).toISOString() };
  const later = { ...next, id: 'later', startsAt: new Date(now + 7200000).toISOString() };
  assert.equal(selectMatch([later, next, live], team, now).id, live.id);
  assert.equal(selectMatch([{ ...live, status: 'final' }, later, next], team, now).id, 'next');
  assert.equal(selectMatch([{ ...next, leagueId: 'wrong-league' }], team, now), null);
  assert.equal(selectMatch([{ ...next, home: { id: 'other', name: '다른 팀' } }], team, now), null);
  assert.equal(selectMatch([{ ...next, status: 'cancelled' }, { ...next, status: 'postponed' }, { ...next, startsAt: new Date(now-1).toISOString() }], team, now), null);
  assert.equal(isStale(live, now + 61000), true); assert.equal(isStale(live, now + 59000), false);
  assert.throws(() => parseMatches({ matches: [{ ...live, state: { ...live.state, balls: 4 } }] }));
  assert.throws(() => parseMatches({ matches: [{ ...live, state: samples[1].state }] }));
  assert.throws(() => parseMatches({ matches: [{ ...live, state: null }] }));
  assert.throws(() => parseMatches({ matches: [live, live] }));
  assert.equal(safeAsset('javascript:alert(1)'), undefined); assert.equal(safeAsset('//unknown.test/image'), undefined);

  const oldUrl = process.env.SPORTS_FEED_URL, oldToken = process.env.SPORTS_FEED_TOKEN, oldFetch = global.fetch;
  try {
    delete process.env.SPORTS_FEED_URL;
    let called = false;
    global.fetch = async () => { called = true; throw new Error('should not fetch'); };
    assert.deepEqual(await (await GET(new Request('https://example.test/api/sports'))).json(), { mode: 'unconfigured', matches: [] });
    assert.equal(called, false);
    assert.equal((await (await GET(new Request('https://example.test/api/sports?demo=1'))).json()).mode, 'demo');
    assert.equal(called, false);
    process.env.SPORTS_FEED_URL = 'https://feed.example.test/scores';
    process.env.SPORTS_FEED_TOKEN = 'test-token-only';
    global.fetch = async (url, options) => {
      assert.equal(String(url), process.env.SPORTS_FEED_URL);
      assert.equal(options.headers.Authorization, 'Bearer test-token-only');
      assert.equal(options.redirect, 'error');
      return Response.json({ matches: samples });
    };
    const response = await GET(new Request('https://example.test/api/sports?url=https://untrusted.test'));
    const body = await response.text(); assert.equal(response.status, 200); assert.ok(!body.includes('test-token-only'));
    assert.equal(JSON.parse(body).mode, 'live');
    global.fetch = async () => Response.json({ matches: [{ ...live, score: [-1, 3] }] });
    assert.equal((await GET(new Request('https://example.test/api/sports'))).status, 503);
    global.fetch = async () => { throw new Error('private upstream failure'); };
    const failed = await GET(new Request('https://example.test/api/sports'));
    assert.equal(failed.status, 503); assert.ok(!(await failed.text()).includes('private upstream'));
  } finally {
    global.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.SPORTS_FEED_URL; else process.env.SPORTS_FEED_URL = oldUrl;
    if (oldToken === undefined) delete process.env.SPORTS_FEED_TOKEN; else process.env.SPORTS_FEED_TOKEN = oldToken;
  }
  console.log('PASS: selection, inheritance, filtering, freshness, validation, API fallback, demo isolation, upstream errors and token privacy');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => fs.rmSync(temp, { recursive: true, force: true }));
