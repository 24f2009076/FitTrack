export type ProgressRange = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

export interface ProgressOverviewResponse {
    range: ProgressRange;

    summary: {
        workouts_completed: number;
        total_volume_kg: number;
        volume_change_percent: number | null;
        training_time_seconds: number;
    };

    weekly_volume: {
        week_start: string;
        volume_kg: number;
    }[];

    exercise_progress: {
        exercise_id: string;
        exercise_name: string;
        tracking_type: string;
        start_value: number;
        current_value: number;
        change: number;
        change_percent: number | null;
        unit: string;
        history: {
            date: string;
            value: number;
        }[];
    }[];

    recent_workouts: {
        session_id: string;
        name: string;
        completed_at: string;
        duration_seconds: number;
        set_count: number;
        volume_kg: number;
    }[];
}

export interface ProgressOverviewRequest {
    accessToken: string;
    range: ProgressRange;
}