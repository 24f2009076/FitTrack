const API_URL = "http://192.168.29.169:8000";

export interface ProfileUpdate {
    username?: string | null;
    profile_pic_url?: string | null;

    level?: "Beginner" | "Intermediate" | "Advanced" | null;

    goal?:
        | "Build Muscle"
        | "Lose Weight"
        | "Improve Strength"
        | "General Fitness"
        | null;

    height_cm?: number | null;
    weight_kg?: number | null;
}

export interface ProfileResponse {
    id: string;

    username: string | null;
    profile_pic_url: string | null;

    level: string | null;
    goal: string | null;

    height_cm: number | null;
    weight_kg: number | null;
}


export async function updateProfile(
    data: ProfileUpdate,
    accessToken: string
): Promise<ProfileResponse> {

    const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },

            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.detail || "Failed to update profile"
        );
    }

    return result;
}