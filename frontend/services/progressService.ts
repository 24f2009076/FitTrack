import { ProgressOverviewRequest, ProgressOverviewResponse } from "@/types/progress";



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