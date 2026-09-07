import type {
    DayKey,
    DayRoutine,
} from "@/types/routine";

import type {
    RoutineCreateRequest,
    RoutineExerciseCreateRequest,
} from "@/types/routineApi";

const DAY_TO_NUMBER: Record<DayKey, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const mapExercise = (
  exercise: DayRoutine["exercises"][number],
  index: number
): RoutineExerciseCreateRequest => {

  if (
    exercise.trackingType === "reps" ||
    exercise.trackingType === "reps_weight"
  ) {
    return {
      exercise_id: exercise.id,
      exercise_order: index + 1,

      planned_sets: exercise.sets,
      planned_reps: exercise.reps,
      planned_duration_seconds: null,
    };
  }
  else if (
    exercise.trackingType === "duration" ||
    exercise.trackingType === "duration_weight"
  ) {
    return {
      exercise_id: exercise.id,
      exercise_order: index + 1,

      planned_sets: null,
      planned_reps: null,
      planned_duration_seconds: exercise.durationSeconds,
    };
  }

    throw new Error(`Unsupported tracking type: ${exercise.trackingType}`);
};


export const buildRoutineCreateRequest = (
  name: string,
  description: string,
  routine: Record<DayKey, DayRoutine>
): RoutineCreateRequest => {

  const days = (Object.keys(routine) as DayKey[])
    .filter((dayKey) => routine[dayKey].configured)

    .map((dayKey) => {
      const day = routine[dayKey];

      const isRestDay =
        day.isRestDay ?? day.exercises.length === 0;

      return {
        day_of_week: DAY_TO_NUMBER[dayKey],

        name: day.title ?? null,

        is_rest_day: isRestDay,

        exercises: day.exercises.map(mapExercise),
      };
    });

  return {
    name: name.trim(),

    description:
      description.trim() || null,

    is_active: true,

    days,
  };
};