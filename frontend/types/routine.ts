export type DayKey =
    "monday" |
    "tuesday" |
    "wednesday" |
    "thursday" |
    "friday" |
    "saturday" |
    "sunday";

import { TrackingType } from "./exercise";

type RoutineExerciseBase = {
    id: string;
    name: string;
    muscleGroup: string | null;

    trackingType: TrackingType;

    sets: number;
};


export type RepsRoutineExercise =
    RoutineExerciseBase & {
        trackingType: "reps" | "reps_weight";
        reps: number;
    };


export type DurationRoutineExercise =
    RoutineExerciseBase & {
        trackingType: "duration" | "duration_weight";
        durationSeconds: number;
    };


export type RoutineExercise =
    | RepsRoutineExercise
    | DurationRoutineExercise;


export type DayRoutine = {
    configured: boolean;
    title?: string;

    exercises: RoutineExercise[];
    isRestDay?: boolean;
}

export type GetExerciseResponse = {
    id: string;
    name: string;
    description: string | null;
    eqiuipment: string | null;
    muscle_group: string | null;
    tracking_type: TrackingType;
}

export type RoutineExerciseResponse = {
    id: string;
    exercise_id: string;
    exercise_order: number;
    planned_sets: number;
    planned_reps: number | null;
    planned_duration_seconds: number | null;
    exercise: GetExerciseResponse;
}

export type DayRoutineResponse = {
    id: string;
    day_of_week: number;
    name: string | null;
    is_rest_day: boolean;
    exercises: RoutineExerciseResponse[];
}

export type GetRoutineResponse = {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    is_deleted: boolean;
    days: DayRoutineResponse[];
}