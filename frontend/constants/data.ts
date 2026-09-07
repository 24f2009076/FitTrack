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

const DEFAULT_REPS = 10;
const DEFAULT_SETS = 3;

export const exerciseLibrary: Exercise[] = [
    {
        'name': "Push-ups",
        'muscleGroup': "Chest",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Pull-ups",
        'muscleGroup': "Back",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Lateral Pull-downs",
        'muscleGroup': "Back",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Squats",
        'muscleGroup': "Legs",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Lunges",
        'muscleGroup': "Legs",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Dipping",
        'muscleGroup': "Triceps",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Hammer Curls",
        'muscleGroup': "Biceps",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Seated Row",
        'muscleGroup': "Back",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Leg Press",
        'muscleGroup': "Legs",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Flying Chest Press",
        'muscleGroup': "Chest",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    },
    {
        'name': "Shoulder Press",
        'muscleGroup': "Shoulders",
        'sets': DEFAULT_SETS,
        'reps': DEFAULT_REPS
    }
]

export const searchExercises = (
    searchQuery: string = "",
    muscleGroup: string = "All",
): Exercise[] => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedGroup = muscleGroup.trim().toLowerCase();

    return exerciseLibrary.filter((exercise) => {
        const matchesQuery = exercise.name.toLowerCase().includes(normalizedQuery);
        const matchesGroup =
            normalizedGroup === "" ||
            normalizedGroup === "all" ||
            exercise.muscleGroup?.trim().toLowerCase() === normalizedGroup;

        return matchesQuery && matchesGroup;
    });
};