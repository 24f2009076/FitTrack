import { icons } from "./icons";

export const tabs: AppTab[] = [
    { name: "index", title: "Home", icon: icons.home },
    { name: "workout", title: "Workout", icon: icons.workout },
    { name: "progress", title: "Progress", icon: icons.progress },
    { name: "coach", title: "Coach", icon: icons.coach },
    { name: "profile", title: "Profile", icon: icons.profile },
];

export const USER = {
    name: "Leo",
    level: "Beginner",
    streak: 3,
    workout: {
        groups: ["Chest", "Back", "Legs"],
        exercises: ["Push-ups", "Pull-ups", "Lateral Pull-downs", "Squats", "Lunges", "Leg Press", "Flying Chest Press"],
        duration: 90,
    },
    weekly_stats : {
        monday: {
            visited: false,
            volume: 0,
        },
        tuesday: {
            visited: true,
            volume: 180,
        },
        wednesday: {
            visited: true,
            volume: 150,
        },
        thursday: {
            visited: true,
            volume: 160,
        },
        friday: {
            visited: true,
            volume: 210,
        },
        saturday: {
            visited: true,
            volume: 120,
        },
        sunday: {
            visited: true,
            volume: 150,
        },
    }
};



export const date = {
    day: "Monday",
    date: "March 16, 2026",
}

export const routineLibrary: RoutineLibrary = {
    routines: [
        {
            routineName: "Intermediate Routine",
            daysOfWeek: 4,
            numberOfExercises: 28,
            tags: ["Hypertrophy", "Intermediate"]
        },
        {
            routineName: "Advanced Routine",
            daysOfWeek: 6,
            numberOfExercises: 35,
            tags: ["Hypertrophy", "Advanced"]
        }
    ]
}