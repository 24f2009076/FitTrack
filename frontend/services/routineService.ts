import type {
  RoutineCreateRequest,
} from "@/types/routineApi";

import type {
  CurrentRoutineDay,
} from "@/types/workout";

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



export const skipRestDay = async (
  routineId: string,
  accessToken: string
): Promise<CurrentRoutineDay> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/workout-sessions/routine/${routineId}/skip-rest-day`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : data.detail?.message ||
        "Failed to skip rest day"
    );
  }

  return data;
};






