import { icons } from "@/constants/icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { DayKey, useRoutineStore } from "../store/routineStore";


const DaysOfWeek: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const WeeklyRoutineInput = ({ }) => {
  const { days } = useRoutineStore();

  return (
    <View className="gap-3">
      {DaysOfWeek.map((day) => {
        const data = days[day];
        return (
          <Pressable
            key={day}
            onPress={() =>
              router.push({
                pathname: "/workout/routine/[day]",
                params: { day },
              })
            }
            className={`bg-muted border border-accent rounded-2xl px-4 py-4 shadow-md flex-row items-center 
              ${data.configured ? "border-l-10 border-accent" : ""}`}
          >
            <View className="flex-col justify-between flex-1">
              <Text className="text-accent text-lg font-sans-bold uppercase">
                {day}
              </Text>
              <Text className="text-primary text-sm font-sans-semibold mt-1">
                {data.isRestDay
                  ? "Rest Day"
                  : data.configured
                    ? `${data.title} · ${data.exercises.length} exercises`
                    : "Not Configured"}
              </Text>
            </View>


            <Image source={data.configured ? icons.editAccent : icons.go} className="size-5 " />

          </Pressable>
        );
      })}
    </View>
  );
}