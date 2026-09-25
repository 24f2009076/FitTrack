import { ExerciseOverviewResponse, ProgressOverviewRequest, ProgressOverviewResponse, WorkoutOverviewResponse } from "@/types/progress";



export const getProgressOverview = async (
    payload: ProgressOverviewRequest
) : Promise<ProgressOverviewResponse> => {

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/progress/overview?range=${payload.range}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${payload.accessToken}`
            }
        }
    )

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.detail || `Failed to fetch progress overview: ${response.status}`
        );
    }

    const data: ProgressOverviewResponse = await response.json();

    return data;
}


export const getAllExercises = async (
    payload: ProgressOverviewRequest
) : Promise<ExerciseOverviewResponse[]> => {

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/progress/exercises?range=${payload.range}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${payload.accessToken}`
            }
        }
    )

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.detail || `Failed to fetch all exercises: ${response.status}`
        );
    }

    const data: ExerciseOverviewResponse[] = await response.json();
    
    return data;
}

export const getAllSessions = async (
    payload: ProgressOverviewRequest
) : Promise<WorkoutOverviewResponse[]> => {
    
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/progress/workouts?range=${payload.range}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${payload.accessToken}`
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.detail || `Failed to fetch all sessions: ${response.status}`
        );
    }

    const data: WorkoutOverviewResponse[] = await response.json();

    return data;
}


