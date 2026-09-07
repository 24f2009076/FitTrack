export type TrackingType = 
    | 'reps'
    | 'reps_weight'
    | 'duration'
    | 'duration_weight';


export interface ExerciseResponse {
  id: string;
  name: string;

  primary_muscle: string | null;
  tracking_type: TrackingType;

  description: string | null;
  equipment: string | null;
}


export interface ExerciseItem {
  id: string;
  name: string;

  muscleGroup: string | null;
  trackingType: TrackingType;

  description: string | null;
  equipment: string | null;
}

export interface ExerciseCreate {
  name: string;
  description?: string | null;
  primary_muscle?: string | null;
  equipment?: string | null;
  tracking_type: TrackingType;
}