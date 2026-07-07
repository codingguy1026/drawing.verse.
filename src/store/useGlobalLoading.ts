// src/store/useGlobalLoading.ts
import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  message: string;
  subMessage: string;
  progress: number;
  setLoading: (value: boolean, options?: { message?: string; subMessage?: string }) => void;
  setProgress: (value: number) => void;
}

export const useGlobalLoading = create<LoadingState>((set) => ({
  isLoading: false,
  message: "Drawing Verse",
  subMessage: "당신의 그림 유니버스를 불러오고 있어요",
  progress: 0,
  setLoading: (value, options) => set((state) => ({ 
    isLoading: value,
    message: options?.message ?? (value ? state.message : "Drawing Verse"),
    subMessage: options?.subMessage ?? (value ? state.subMessage : "당신의 그림 유니버스를 불러오고 있어요"),
    progress: value ? 0 : 100 // Reset on start, full on end (initially)
  })),
  setProgress: (value) => set({ progress: value }),
}));
