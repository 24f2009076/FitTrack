import { create } from "zustand";

export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type DayRoutine = {
  configured: boolean;
  title?: string;       // e.g. "Chest + Triceps"
  exercises: Exercise[];
  isRestDay?: boolean;
};

type RoutineStore = {
  days: Record<DayKey, DayRoutine>;
  updateDay: (day: DayKey, data: Partial<DayRoutine>) => void;
  clearRoutine: () => void;
};

const emptyDay: DayRoutine = { configured: false, exercises: [] };

export const useRoutineStore = create<RoutineStore>((set) => ({
  days: {
    monday: emptyDay, tuesday: emptyDay, wednesday: emptyDay,
    thursday: emptyDay, friday: emptyDay, saturday: emptyDay, sunday: emptyDay,
  },
  updateDay: (day, data) =>
    set((state) => ({
      days: { ...state.days, [day]: { ...state.days[day], ...data } },
    })),
  clearRoutine: () =>
    set(() => ({
      days: { monday: emptyDay, tuesday: emptyDay, wednesday: emptyDay,
        thursday: emptyDay, friday: emptyDay, saturday: emptyDay, sunday: emptyDay },
      })),
}));