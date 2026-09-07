import type {
    RoutineCreateRequest,
} from "@/types/routineApi";

const API_URL = "http://192.168.29.169:8000";


export const createRoutine = async (
  payload: RoutineCreateRequest,
  accessToken: string
) => {

  const response = await fetch(
    `${API_URL}/api/routines`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
      `Failed to create routine: ${response.status}`
    );
  }

  return response.json();
};