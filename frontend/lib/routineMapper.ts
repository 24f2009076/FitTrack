import type {
  DayKey,
  DayRoutine,
} from "@/types/routine";

import type {
  RoutineCreateRequest,
  RoutineExerciseCreateRequest,
} from "@/types/routineApi";

const DAY_TO_NUMBER: Record<DayKey, number> = {
  day_1: 0,
  day_2: 1,
  day_3: 2,
  day_4: 3,
  day_5: 4,
  day_6: 5,
  day_7: 6,
};

const requirePositiveInteger = (value: number, field: string): number => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }

  return value;
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

      planned_sets: requirePositiveInteger(exercise.sets, "Sets"),
      planned_reps: requirePositiveInteger(exercise.reps, "Reps"),
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

      planned_sets: requirePositiveInteger(exercise.sets, "Sets"),
      planned_reps: null,
      planned_duration_seconds: requirePositiveInteger(
        exercise.durationSeconds,
        "Duration"
      ),
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