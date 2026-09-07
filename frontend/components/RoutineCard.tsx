import { icons } from "@/constants/icons";
import { Image, Text, View } from "react-native";

const ActiveRoutine = ({ routineId, routineName, daysOfWeek, numberOfExercises, tags, days, isActive }: ViewRoutineProps) => {

    const dayMap: { [key: number]: string } = {
        0: "S",
        1: "M",
        2: "T",
        3: "W",
        4: "T",
        5: "F",
        6: "S"
    }





    return (
        <View className="active-routine pb-7">


            <View className="px-2 py-1 bg-muted/20 rounded-full self-start mb-2 flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-muted outline-3 outline-accent/50"></View>
                <Text className="text-muted font-sans-bold text-xs">{isActive ? "ACTIVE" : "INACTIVE"}</Text>
            </View>


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

            <View className="flex-row items-center mt-5 bg-primary/90 justify-evenly rounded-2xl px-2">
                {days.map((day, index) => (
                    <View key={index} className="flex-col items-center gap-1 p-2">
                        <Text className="font-sans-bold text-muted text-md">{dayMap[day.day_of_week]}</Text>
                        <View className={`h-5 w-5 rounded-full ${day.is_rest_day ? "bg-muted" : "bg-accent"}`}></View>
                    </View>
                ))}
            </View>
        </View>
    )
}

export default ActiveRoutine