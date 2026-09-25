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
    day_1: createEmptyDay(), day_2: createEmptyDay(), day_3: createEmptyDay(),
    day_4: createEmptyDay(), day_5: createEmptyDay(), day_6: createEmptyDay(), day_7: createEmptyDay(),
  },
  updateDay: (day, data) =>
    set((state) => ({
      days: { ...state.days, [day]: { ...state.days[day], ...data } },
    })),
  clearRoutine: () =>
    set(() => ({
    days: { day_1: createEmptyDay(), day_2: createEmptyDay(), day_3: createEmptyDay(),
        day_4: createEmptyDay(), day_5: createEmptyDay(), day_6: createEmptyDay(), day_7: createEmptyDay() },
      })),
}));