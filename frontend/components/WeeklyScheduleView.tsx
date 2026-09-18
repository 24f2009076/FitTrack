import { icons } from "@/constants/icons";
import { DayRoutineResponse } from "@/types/routine";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

export const WeeklyScheduleView = ({
    days,
}: {
    days: DayRoutineResponse[];
}) => {
    const dayMap: { [key: number]: string } = {
        0: "S",
        1: "M",
        2: "T",
        3: "W",
        4: "T",
        5: "F",
        6: "S",
    };

    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    const toggleView = (dayId: string) => {
        setSelectedDays((prev) =>
            prev.includes(dayId)
                ? prev.filter((id) => id !== dayId)
                : [...prev, dayId]
        );
    };

    return (
        <View className="weekly-schedule-view">
            {days.map((day) => {
                const isExpanded = selectedDays.includes(day.id);

                return (
                    <View
                        key={day.id}
                        className={`weekly-schedule-day flex-wrap ${day.is_rest_day ? "rest-day" : "workout-day"
                            }`}
                    >
                        <View className="week-day">
                            <Text className="font-sans-bold text-primary">
                                {dayMap[day.day_of_week]}
                            </Text>
                        </View>

                        {!day.is_rest_day && (
    <>
        <View className="flex-1">

            <View className="weekly-schedule-day-details">
                <Text className="weekly-schedule-day-name">
                    {day.name}
                </Text>

                <Text className="font-sans-medium pr-3 text-sm text-faded">
                    {day.exercises.length} exercise
                    {day.exercises.length !== 1 ? "s" : ""}
                </Text>

                <Pressable
                    onPress={() => toggleView(day.id)}
                >
                    <Image
                        source={icons.downArrowPrimary}
                        className="size-6"
                    />
                </Pressable>
            </View>

            {isExpanded && (
                <View className="mt-3 w-full gap-2">
                    {day.exercises.map((routineExercise) => (
                        <View
                            key={routineExercise.id}
                            className="bg-muted rounded-xl px-4 py-3"
                        >
                            <Text className="font-sans-bold text-primary text-base">
                                {routineExercise.exercise.name}
                            </Text>

                            {routineExercise.planned_reps !== null && (
                                <Text className="font-sans-medium text-faded text-sm mt-1">
                                    {routineExercise.planned_sets} sets ×{" "}
                                    {routineExercise.planned_reps} reps
                                </Text>
                            )}

                            {routineExercise.planned_duration_seconds !== null && (
                                <Text className="font-sans-medium text-faded text-sm mt-1">
                                    {routineExercise.planned_sets} sets ×{" "}
                                    {routineExercise.planned_duration_seconds}s
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

        </View>
    </>
)}

                        {day.is_rest_day && (
                            <View className="weekly-schedule-day-details">
                                <Text className="weekly-schedule-day-name">
                                    Rest Day
                                </Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
};