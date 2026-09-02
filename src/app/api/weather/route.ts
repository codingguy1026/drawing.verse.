import { NextResponse } from "next/server";

const KMA_ENDPOINT =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";

const KST_OFFSET = 9 * 60 * 60 * 1000;

const RE = 6371.00877;
const GRID = 5.0;
const SLAT1 = 30.0;
const SLAT2 = 60.0;
const OLON = 126.0;
const OLAT = 38.0;
const XO = 43;
const YO = 136;

const DEGRAD = Math.PI / 180.0;
const re = RE / GRID;
const slat1 = SLAT1 * DEGRAD;
const slat2 = SLAT2 * DEGRAD;
const olon = OLON * DEGRAD;
const olat = OLAT * DEGRAD;

let sn =
  Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
  Math.tan(Math.PI * 0.25 + slat1 * 0.5);
sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
ro = (re * sf) / Math.pow(ro, sn);

type KmaItem = {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
};

type VerseWeather = "sunny" | "rainy" | "cloudy" | "snowy" | "night";

function toKmaGrid(lat: number, lon: number) {
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);

  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}

function toKstDate(date = new Date()) {
  return new Date(date.getTime() + KST_OFFSET);
}

function formatDate(date: Date) {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function getLatestUltraShortBase(now = new Date()) {
  // 초단기예보는 HH:30 기준 자료를 사용한다. 한 시간 전 발표본을 고르면
  // API 반영 지연 구간에서도 안정적으로 가장 가까운 예보를 얻을 수 있다.
  const kst = toKstDate(new Date(now.getTime() - 60 * 60 * 1000));
  return {
    baseDate: formatDate(kst),
    baseTime: `${String(kst.getUTCHours()).padStart(2, "0")}30`,
  };
}

function normalizeServiceKey(key: string) {
  try {
    return key.includes("%") ? decodeURIComponent(key) : key;
  } catch {
    return key;
  }
}

function forecastTimestamp(date: string, time: string) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(4, 6)) - 1;
  const day = Number(date.slice(6, 8));
  const hour = Number(time.slice(0, 2));
  const minute = Number(time.slice(2, 4));

  // UTC 객체에 KST 시각을 그대로 넣어 비교용 타임라인으로 쓴다.
  return Date.UTC(year, month, day, hour, minute);
}

function pickClosestForecast(items: KmaItem[], now = new Date()) {
  const nowKst = toKstDate(now);
  const current = Date.UTC(
    nowKst.getUTCFullYear(),
    nowKst.getUTCMonth(),
    nowKst.getUTCDate(),
    nowKst.getUTCHours(),
    nowKst.getUTCMinutes()
  );

  const grouped = new Map<string, KmaItem[]>();

  for (const item of items) {
    const key = `${item.fcstDate}${item.fcstTime}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(item);
    grouped.set(key, bucket);
  }

  const closestKey = [...grouped.keys()].sort((a, b) => {
    const aDiff = Math.abs(forecastTimestamp(a.slice(0, 8), a.slice(8)) - current);
    const bDiff = Math.abs(forecastTimestamp(b.slice(0, 8), b.slice(8)) - current);
    return aDiff - bDiff;
  })[0];

  return closestKey ? grouped.get(closestKey) ?? [] : [];
}

function valueOf(items: KmaItem[], category: string) {
  return items.find((item) => item.category === category)?.fcstValue ?? null;
}

function toNumber(value: string | null) {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveVerseWeather({
  pty,
  sky,
  hour,
}: {
  pty: number | null;
  sky: number | null;
  hour: number;
}): VerseWeather {
  // 기상청 강수형태: 비/소나기는 rainy, 진눈깨비/눈 계열은 snowy로 표현한다.
  if (pty !== null) {
    if ([2, 3, 6, 7].includes(pty)) return "snowy";
    if ([1, 4, 5].includes(pty)) return "rainy";
  }

  if (hour < 6 || hour >= 20) return "night";
  if (sky === 3 || sky === 4) return "cloudy";
  return "sunny";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  // 이 기능은 기상청 국내 격자 예보용이다.
  if (lat < 32 || lat > 40 || lon < 123 || lon > 133) {
    return NextResponse.json({ error: "location is outside the supported KMA grid" }, { status: 400 });
  }

  const rawKey = process.env.KMA_SERVICE_KEY || process.env.DATA_GO_KR_SERVICE_KEY;

  if (!rawKey) {
    return NextResponse.json(
      {
        configured: false,
        error: "KMA_SERVICE_KEY is not configured",
      },
      { status: 503 }
    );
  }

  const { nx, ny } = toKmaGrid(lat, lon);
  const { baseDate, baseTime } = getLatestUltraShortBase();
  const params = new URLSearchParams({
    serviceKey: normalizeServiceKey(rawKey),
    pageNo: "1",
    numOfRows: "1000",
    dataType: "JSON",
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  try {
    const response = await fetch(`${KMA_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`KMA request failed with ${response.status}`);
    }

    const payload = await response.json();
    const resultCode = payload?.response?.header?.resultCode;

    if (resultCode !== "00") {
      const resultMsg = payload?.response?.header?.resultMsg ?? "Unknown KMA error";
      throw new Error(`${resultCode}: ${resultMsg}`);
    }

    const items = (payload?.response?.body?.items?.item ?? []) as KmaItem[];
    const closest = pickClosestForecast(items);

    if (closest.length === 0) {
      throw new Error("No KMA forecast items were returned");
    }

    const sky = toNumber(valueOf(closest, "SKY"));
    const precipitationType = toNumber(valueOf(closest, "PTY"));
    const temperature = toNumber(valueOf(closest, "T1H"));
    const humidity = toNumber(valueOf(closest, "REH"));
    const windSpeed = toNumber(valueOf(closest, "WSD"));
    const nowKst = toKstDate();
    const weather = resolveVerseWeather({
      pty: precipitationType,
      sky,
      hour: nowKst.getUTCHours(),
    });

    const first = closest[0];
    const forecastAt = `${first.fcstDate.slice(0, 4)}-${first.fcstDate.slice(4, 6)}-${first.fcstDate.slice(
      6,
      8
    )}T${first.fcstTime.slice(0, 2)}:${first.fcstTime.slice(2, 4)}:00+09:00`;

    return NextResponse.json(
      {
        configured: true,
        weather,
        source: "KMA",
        temperature,
        humidity,
        windSpeed,
        sky,
        precipitationType,
        forecastAt,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=300",
        },
      }
    );
  } catch (error) {
    console.error("[Verse Atmosphere] KMA weather sync failed:", error);
    return NextResponse.json(
      {
        configured: true,
        error: "Unable to load KMA weather",
      },
      { status: 502 }
    );
  }
}
