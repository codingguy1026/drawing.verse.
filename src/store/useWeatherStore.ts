import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WeatherState = 'deep_space' | 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'night';

interface WeatherStore {
  weather: WeatherState;
  setWeather: (weather: WeatherState) => void;
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set) => ({
      weather: 'deep_space',
      setWeather: (weather) => set({ weather }),
    }),
    {
      name: 'weather-storage',
    }
  )
);
