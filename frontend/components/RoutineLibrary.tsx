import { GetRoutineResponse } from "@/types/routine";
import { View } from "react-native";
import { WorkoutRoutine } from "./WorkoutRoutine";

export const RoutineLibrary = ({ routines }: { routines: GetRoutineResponse[] }) => {
    return (
        <View className="routine-library">
            {routines.map((routine, index) => (
                <WorkoutRoutine key={index} routine={routine}></WorkoutRoutine>
            ))}
        </View>
    )
}