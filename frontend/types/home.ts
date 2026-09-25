export interface HomeExercise {
    id: string;
    name: string;
    muscle_group: string | null;
    planned_sets: number;
    planned_reps: number | null;
    planned_duration_seconds: number | null;
}

export interface HomeWorkout {
    routine_id: string | null;
    routine_day_id: string | null;
    name: string | null;
    is_rest_day: boolean;
    groups: string[];
    exercises: HomeExercise[];
    duration: number;
}

export interface WeeklyVolumePoint {
    week_start: string;
    volume_kg: number;
}

export interface HomeProfile {
    id: string;
    username: string;
    level: string;
    height: number | null;
    weight: number | null;
    goal: string | null;
    profile_pic_url: string | null;
}

export interface HomeResponse {
    profile: HomeProfile;
    streak: number;
    workout: HomeWorkout;
    weekly_volume: WeeklyVolumePoint[];
}