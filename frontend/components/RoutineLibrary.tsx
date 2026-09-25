import { GetRoutineResponse } from "@/types/routine";
import { View } from "react-native";
import { WorkoutRoutine } from "./WorkoutRoutine";

export const RoutineLibrary = ({
    routines,
    onActivated,
}: {
    routines: GetRoutineResponse[];
    onActivated?: () => void | Promise<void>;
}) => {
    return (
        <View className="routine-library">
            {routines.map((routine, index) => (
                <WorkoutRoutine
                    key={index}
                    routine={routine}
                    onActivated={onActivated}
                />
            ))}
        </View>
    )
}