const API_URL = "http://192.168.29.169:8000";

export const getExercises = async (): Promise<ExerciseItem[]> => {
  const response = await fetch(`${API_URL}/exercises`);

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
  }));
};