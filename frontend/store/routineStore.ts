import { create } from "zustand";

import type { DayKey, DayRoutine } from "@/types/routine";

type RoutineStore = {
  days: Record<DayKey, DayRoutine>;
  updateDay: (day: DayKey, data: Partial<DayRoutine>) => void;
  clearRoutine: () => void;
};

const createEmptyDay = (): DayRoutine => ({ configured: false, exercises: [] });

export const useRoutineStore = create<RoutineStore>((set) => ({
  days: {
    monday: createEmptyDay(), tuesday: createEmptyDay(), wednesday: createEmptyDay(),
    thursday: createEmptyDay(), friday: createEmptyDay(), saturday: createEmptyDay(), sunday: createEmptyDay(),
  },
  updateDay: (day, data) =>
    set((state) => ({
      days: { ...state.days, [day]: { ...state.days[day], ...data } },
    })),
  clearRoutine: () =>
    set(() => ({
      days: { monday: createEmptyDay(), tuesday: createEmptyDay(), wednesday: createEmptyDay(),
        thursday: createEmptyDay(), friday: createEmptyDay(), saturday: createEmptyDay(), sunday: createEmptyDay() },
      })),
}));