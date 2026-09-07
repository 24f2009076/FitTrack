const API_URL = "http://192.168.29.169:8000";
import type { ExerciseCreate, ExerciseItem, ExerciseResponse } from "../types/exercise";

export const getExercises = async (accessToken : string): Promise<ExerciseItem[]> => {
  const response = await fetch(
    `${API_URL}/exercises`,
  {
    method: "GET",

    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.status}`);
  }

  const data: ExerciseResponse[] = await response.json();

  return data.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.primary_muscle,
    description: exercise.description,
    equipment: exercise.equipment,
    trackingType: exercise.tracking_type,
  }));
};

export const createExercise = async (payload: ExerciseCreate, accessToken: string): Promise<ExerciseItem> => {

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/exercises`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },

      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || `Failed to create exercise: ${response.status}`
    );
  }

  const exercise: ExerciseResponse = await response.json();

  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.primary_muscle,
    description: exercise.description,
    equipment: exercise.equipment,
    trackingType: exercise.tracking_type,
  }
};