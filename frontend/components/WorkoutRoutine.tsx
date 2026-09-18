import { GetRoutineResponse } from "@/types/routine";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

const dayMap: { [key: number]: string } = {
    0: "S",
    1: "M",
    2: "T",
    3: "W",
    4: "T",
    5: "F",
    6: "S"
}

export const WorkoutRoutine = ({ routine }: { routine: GetRoutineResponse }) => {

    const daysOfWeek = routine.days.reduce((acc, day) => {
        if (day.is_rest_day) return acc;
        return acc + 1;
    }, 0);

    const uniqueExerciseCount = new Set(
        routine.days
            .filter((day) => !day.is_rest_day)
            .flatMap((day) => day.exercises.map((exercise) => exercise.exercise_id))
    ).size;

    const tags = routine.description?.split(",").map((tag) => tag.trim());

    return (
        <Pressable
            onPress={() => {
                router.push({
                    pathname: "/workout/view-routine/[id]",
                    params: { id: routine.id },
                })
            }}
            className="routine-card">
            <View className="routine-card-header">
                <Text className="routine-card-title">{routine.name}</Text>
                <View className="routine-card-metrics">
                    <View className="routine-card-metric">
                        <Text className="routine-card-metric-value">{daysOfWeek}</Text>
                        <Text className="routine-card-metric-label">days / week</Text>
                    </View>
                    <View className="routine-card-metric-divider" />
                    <View className="routine-card-metric">
                        <Text className="routine-card-metric-value">{uniqueExerciseCount}</Text>
                        <Text className="routine-card-metric-label">exercises</Text>
                    </View>
                </View>
            </View>
            <View className="routine-card-footer gap-5">
                <View className="flex-2 flex-row justify-around items-center">
                    {routine.days.map((day, index) => (
                        <View key={index} className={`items-center justify-center rounded-full p-2 border border-accent ${day.is_rest_day ? 'bg-muted/20' : 'bg-accent/50'}`}>
                        </View>
                    ))}
                </View>
                <Pressable className="routine-card-button flex-1">
                    <Text className="text-sm font-sans-bold text-accent">Activate</Text>
                </Pressable>
            </View>

        </Pressable>
    )
}