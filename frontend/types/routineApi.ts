export type RoutineExerciseCreateRequest = {
  exercise_id: string;
  exercise_order: number;

  planned_sets: number | null;
  planned_reps: number | null;
  planned_duration_seconds: number | null;
};


export type RoutineDayCreateRequest = {
  day_of_week: number;
  name: string | null;
  is_rest_day: boolean;

  exercises: RoutineExerciseCreateRequest[];
};


export type RoutineCreateRequest = {
  name: string;
  description: string | null;
  is_active: boolean;

  days: RoutineDayCreateRequest[];
};