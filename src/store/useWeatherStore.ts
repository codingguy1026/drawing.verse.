import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WeatherState =
  | "deep_space"
  | "sunny"
  | "rainy"
  | "cloudy"
  | "snowy"
  | "night";

export type WeatherMode = "auto" | "manual";
export type WeatherSyncStatus =
  | "idle"
  | "locating"
  | "syncing"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

export type WeatherMeta = {
  source: "KMA" | "manual" | null;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  sky: number | null;
  precipitationType: number | null;
  forecastAt: string | null;
  updatedAt: string | null;
};

interface WeatherStore {
  weather: WeatherState;
  mode: WeatherMode;
  status: WeatherSyncStatus;
  meta: WeatherMeta;
  setWeather: (weather: WeatherState) => void;
  setMode: (mode: WeatherMode) => void;
  setStatus: (status: WeatherSyncStatus) => void;
  setAutomaticWeather: (weather: WeatherState, meta: Partial<WeatherMeta>) => void;
}

const emptyMeta: WeatherMeta = {
  source: null,
  temperature: null,
  humidity: null,
  windSpeed: null,
  sky: null,
  precipitationType: null,
  forecastAt: null,
  updatedAt: null,
};

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set) => ({
      weather: "deep_space",
      mode: "auto",
      status: "idle",
      meta: emptyMeta,

      setWeather: (weather) =>
        set({
          weather,
          mode: "manual",
          status: "ready",
          meta: {
            ...emptyMeta,
            source: "manual",
            updatedAt: new Date().toISOString(),
          },
        }),

      setMode: (mode) =>
        set((state) => ({
          mode,
          status: mode === "auto" ? "idle" : "ready",
          meta:
            mode === "auto"
              ? { ...state.meta, source: state.meta.source === "manual" ? null : state.meta.source }
              : state.meta,
        })),

      setStatus: (status) => set({ status }),

      setAutomaticWeather: (weather, meta) =>
        set((state) => ({
          weather,
          mode: "auto",
          status: "ready",
          meta: {
            ...state.meta,
            ...meta,
            source: "KMA",
            updatedAt: meta.updatedAt ?? new Date().toISOString(),
          },
        })),
    }),
    {
      name: "weather-storage",
      version: 2,
      partialize: (state) => ({
        weather: state.weather,
        mode: state.mode,
        meta: state.meta,
      }),
    }
  )
);
