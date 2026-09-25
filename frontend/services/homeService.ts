import { HomeResponse } from "@/types/home";

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