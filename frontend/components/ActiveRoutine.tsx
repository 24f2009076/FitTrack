import { icons } from "@/constants/icons";
import { Image, Pressable, Text, View } from "react-native";

const ActiveRoutine = ({ routineName, daysOfWeek, numberOfExercises, tags } : ActiveRoutineProps) => {
    return (
        <View className="active-routine">
            <Text className="active-routine-title">{routineName}</Text>

            <View className="active-routine-details mt-2">
                <View className="flex-row items-center">
                    <Image source={icons.date} className="active-routine-icon" />
                    <Text className="font-sans-bold text-muted text-md">{daysOfWeek} days/week</Text>
                </View>
                <View className="flex-row items-center">
                    <Image source={icons.exercisesMuted} className="active-routine-icon" />
                    <Text className="font-sans-bold text-muted text-md">{numberOfExercises} exercises</Text>
                </View>
            </View>

            <View className="flex-row flex-wrap gap-2 mt-5">
                {tags.map((tag, index) => (
                    <Text key={index} className="bg-muted text-accent text-sm font-sans-extrabold px-3 py-1 rounded-sm">
                        {tag}
                    </Text>
                ))}
            </View>

            <View className="start-workout">
                <Pressable className="start-workout-button">
                    <Text className="text-accent font-sans-bold text-lg">Start Workout</Text>
                </Pressable>

                <Pressable className="edit-workout-button">
                    <Image source={icons.edit} className="edit-workout-icon" />
                </Pressable>
            </View>
        </View>
    )
}

export default ActiveRoutine