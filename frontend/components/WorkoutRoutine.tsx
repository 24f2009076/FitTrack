import { icons } from "@/constants/icons";
import { Image, Pressable, Text, View } from "react-native";



export const WorkoutRoutine = ({ routine } : { routine: ActiveRoutineProps }) => {
    return (
        <View className="routine-card">
            <View className="routine-card-header">
                <Text className="routine-card-title">{routine.routineName}</Text>
            </View>
            <View className="active-routine-details mt-5">
                <View className="flex-row items-center gap-1">
                    <Image source={icons.dateAccent} className="routine-card-icon" />
                    <Text className="font-sans text-primary text-sm">{routine.daysOfWeek} days/week</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Image source={icons.exercises} className="routine-card-icon" />
                    <Text className="font-sans text-primary text-sm">{ routine.numberOfExercises } exercises</Text>
                </View>

                <Pressable className="routine-card-button">
                    <Image source={icons.activate} className="size-5" />
                </Pressable>
            </View>
            
        </View>
    )
}