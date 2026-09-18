import { CompleteSetPayload, CompleteSetResponse, CurrentRoutineDay, WorkoutSession } from "@/types/workout";


export const startWorkout = async (
    routineId: string,
    accessToken: string
) => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/workout-sessions/start`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                routine_id: routineId,
            }),
        }
    );

    const data = await response.json();

    // console.log("START WORKOUT STATUS:", response.status);
    // console.log("START WORKOUT RESPONSE:", data);

    if (
        response.status === 409 &&
        data.detail?.session_id
    ) {
        return {
            conflict: true,
            existingSessionId: data.detail.session_id,
        };
    }

    if (!response.ok) {
        throw new Error(
            typeof data.detail === "string"
                ? data.detail
                : data.detail?.message ||
                data.message ||
                `Failed to start workout session (${response.status})`
        );
    }

    return {
        ...data,
        conflict: false
    }
};

export const abandonWorkout = async (
    sessionId: string,
    accessToken: string
) => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/workout-sessions/${sessionId}/abandon`,
        {
            "method": "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    )

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            typeof data.detail === "string"
                ? data.detail
                : data.detail?.message ||
                data.message ||
                `Failed to abandon workout session (${response.status})`
        );
    }

    return data;
}

export const completeWorkoutSet = async (
    sessionId: string,
    sessionExerciseId: string,
    payload: CompleteSetPayload,
    accessToken: string
): Promise<CompleteSetResponse> => {

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/sets`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to complete workout set"
        )
    }

    return data;
}


export const getWorkoutSession = async (
    sessionId: string,
    accessToken: string
): Promise<WorkoutSession> => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/workout-sessions/${sessionId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            typeof data.detail === "string"
                ? data.detail
                : "Failed to fetch workout session"
        );
    }

    return data;
};


export const getCurrentRoutineDay = async (
    routineId: string,
    accessToken: string
): Promise<CurrentRoutineDay> => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/workout-sessions/routine/${routineId}/current-day`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            typeof data.detail === "string"
                ? data.detail
                : data.detail?.message ||
                "Failed to load current workout"
        );
    }

    return data;
};