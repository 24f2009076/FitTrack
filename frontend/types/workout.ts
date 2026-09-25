export interface WorkoutSet {
    id?: string;
    set_number: number;
    reps?: number | null;
    weight_kg?: number | null;
    duration_seconds?: number | null;
}

export interface WorkoutSessionExercise {
    id: string;
    exercise_id: string | null;

    name: string;
    tracking_type:
    "reps" | "duration" | "weight" | "reps_weight" | "duration_weight";


    exercise_order: number;

    planned_sets: number | null;
    planned_reps: number | null;
    planned_duration_seconds: number | null;

    status: "current" | "upcoming" | "completed";

    sets: WorkoutSet[];
    previous_performance: PreviousPerformance | null;
}

export interface WorkoutSession {
    id: string;
    routine_day_id: string;

    status: string;

    started_at: string;
    completed_at: string | null;

    exercises: WorkoutSessionExercise[];
}

export interface PreviousWorkoutSet {
    set_number: number;
    reps: number | null;
    weight_kg: number | null;
    duration_seconds: number | null;
}

export interface PreviousPerformance {
    session_id: string;
    completed_at: string;
    sets: PreviousWorkoutSet[];
}

export interface CompleteSetPayload {
    set_number: number;
    reps?: number | null;
    weight_kg?: number | null;
    duration_seconds?: number | null;
}

export interface CompleteSetResponse {
    message: string;

    set: {
        id: string;
        set_number: number;
        reps: number | null;
        weight_kg: number | null;
        duration_seconds: number | null;
    };

    exercise_completed: boolean;
    workout_completed: boolean;

    next_exercise_id?: string | null;
}


export interface CurrentRoutineDay {
    routine_id: string;
    routine_day_id: string;
    day_number: number;
    name: string | null;
    is_rest_day: boolean;
    exercise_count: number;
    in_progress_session_id: string | null;
}

