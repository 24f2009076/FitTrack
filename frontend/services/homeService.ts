import { HomeProfile, HomeResponse } from "@/types/home";

export const getHomeData = async (
    accessToken: string
): Promise<HomeResponse> => {

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/home/`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to fetch home data"
        );
    }

    return data;
};




export const getProfileData = async (
    accessToken: string
): Promise<HomeProfile> => {

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/home/profile/`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.detail || "Failed to fetch profile data"
        );
    }
    const data = await response.json();

    return data;
}