import type { ImageSourcePropType } from "react-native";

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
        routineName: string;
        daysOfWeek: number;
        numberOfExercises: number;
        tags: string[];
    }

    interface RoutineLibrary {
        routines: ActiveRoutineProps[];
    }

    interface ExerciseResponse {
        id: string;
        name: string;
        primary_muscle: string;
        description: string | null;
        equipment: string | null;
    }

    interface ExerciseItem {
        id: string;
        name: string;
        muscleGroup: string;
        description: string | null;
        equipment: string | null;
    }

    interface RoutineExercise {
        id: string;
        name: string;
        muscleGroup: string;
        sets: number;
        reps: number;
    }

}

export { };

