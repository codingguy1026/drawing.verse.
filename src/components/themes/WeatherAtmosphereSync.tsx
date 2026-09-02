"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWeatherStore, type WeatherState } from "@/store/useWeatherStore";

type WeatherApiResponse = {
  configured?: boolean;
  weather?: WeatherState;
  source?: "KMA";
  temperature?: number | null;
  humidity?: number | null;
  windSpeed?: number | null;
  sky?: number | null;
  precipitationType?: number | null;
  forecastAt?: string | null;
  updatedAt?: string | null;
  error?: string;
};

const REFRESH_MS = 10 * 60 * 1000;

export default function WeatherAtmosphereSync() {
  const mode = useWeatherStore((state) => state.mode);
  const setStatus = useWeatherStore((state) => state.setStatus);
  const setAutomaticWeather = useWeatherStore((state) => state.setAutomaticWeather);
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const syncWeather = useCallback(() => {
    if (mode !== "auto" || typeof window === "undefined" || runningRef.current) return;

    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }

    runningRef.current = true;
    setStatus("locating");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          setStatus("syncing");

          const params = new URLSearchParams({
            lat: coords.latitude.toFixed(5),
            lon: coords.longitude.toFixed(5),
          });
          const response = await fetch(`/api/weather?${params.toString()}`, {
            cache: "no-store",
          });
          const data = (await response.json()) as WeatherApiResponse;

          if (!response.ok || !data.weather) {
            throw new Error(data.error || `Weather request failed with ${response.status}`);
          }

          setAutomaticWeather(data.weather, {
            source: "KMA",
            temperature: data.temperature ?? null,
            humidity: data.humidity ?? null,
            windSpeed: data.windSpeed ?? null,
            sky: data.sky ?? null,
            precipitationType: data.precipitationType ?? null,
            forecastAt: data.forecastAt ?? null,
            updatedAt: data.updatedAt ?? new Date().toISOString(),
          });
        } catch (error) {
          console.warn("[Verse Atmosphere] Weather sync skipped:", error);
          setStatus("error");
        } finally {
          runningRef.current = false;
        }
      },
      (error) => {
        runningRef.current = false;
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      {
        enableHighAccuracy: false,
        maximumAge: REFRESH_MS,
        timeout: 8000,
      }
    );
  }, [mode, setAutomaticWeather, setStatus]);

  useEffect(() => {
    if (mode !== "auto") {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    syncWeather();
    timerRef.current = window.setInterval(syncWeather, REFRESH_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") syncWeather();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [mode, syncWeather]);

  return null;
}
