import type { ImageSourcePropType } from "react-native";
import { TrackingType } from "./types/routine";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface BadgeProps {
        text: string;
        icon: ImageSourcePropType;
    }

    interface WeeklyStats {
        monday: {
            visited: boolean;
            volume: number;
        }
        tuesday: {
            visited: boolean;
            volume: number;
        }
        wednesday: {
            visited: boolean;
            volume: number;
        }
        thursday: {
            visited: boolean;
            volume: number;
        }
        friday: {
            visited: boolean;
            volume: number;
        }
        saturday: {
            visited: boolean;
            volume: number;
        }
        sunday: {
            visited: boolean;
            volume: number;
        }
    }

    interface ActiveRoutineProps {
        routineId: string;
        routineName: string;
        daysOfWeek: number;
        numberOfExercises: number;
        tags: string[];
        days: DayRoutineResponse[];
    }

    interface ViewRoutineProps {
        routineId: string;
        routineName: string;
        daysOfWeek: number;
        numberOfExercises: number;
        tags: string[];
        days: DayRoutineResponse[];
        isActive: boolean;
    }

    interface RoutineLibrary {
        routines: ActiveRoutineProps[];
    }

    // interface ExerciseResponse {
    //     id: string;
    //     name: string;
    //     primary_muscle: string | null;
    //     tracking_type: TrackingType;
    //     description: string | null;
    //     equipment: string | null;
    // }

    // interface ExerciseItem {
    //     id: string;
    //     name: string;
    //     muscleGroup: string | null;
    //     description: string | null;
    //     equipment: string | null;
    //     trackingType: TrackingType;
    // }

    interface RoutineExercise {
        id: string;
        name: string;
        muscleGroup: string | null;
        trackingType: TrackingType;
        sets: number;
        reps?: number;
        durationSeconds?: number;
    }

}

export { };

