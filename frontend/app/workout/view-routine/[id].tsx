import RoutineCard from "@/components/RoutineCard";
import { WeeklyScheduleView } from "@/components/WeeklyScheduleView";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { useRoutineStore } from "@/store/routineStore";
import { GetRoutineResponse } from "@/types/routine";
import { router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const goBack = () => {
    useRoutineStore.getState().clearRoutine();
    router.back();
}


const ViewRoutine = () => {

    const { session, signOut } = useAuth();
    const [routine, setRoutine] = useState<GetRoutineResponse | null>(null);
    const { id } = useLocalSearchParams<{ id: string }>();

    const daysOfWeek = routine?.days.reduce((count, day) => {
        if (day.is_rest_day) return count;
        return count + 1;
    }, 0) ?? 0;

    const uniqueExerciseCount = new Set(
        routine?.days
            .filter((day) => !day.is_rest_day)
            .flatMap((day) => day.exercises.map((exercise) => exercise.exercise_id)) ?? []
    ).size;

    const tags = routine?.description?.split(",").map((tag) => tag.trim()) ?? [];

    useEffect(() => {
        if (!session) signOut();

        const fetchRoutine = async () => {
            try {
                const response = await fetch(
                    `${process.env.EXPO_PUBLIC_API_URL}/api/routines/${id}`,

                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${session?.accessToken}`,
                            "Content-Type": "application/json",
                        }
                    }
                )

                if (!response.ok) {
                    throw new Error("Failed to fetch routine: " + response.status);
                }

                const data: GetRoutineResponse = await response.json();
                setRoutine(data);
            } catch (error) {
                console.error("Error fetching routine:", error);
            }
        }

        fetchRoutine();
    }, [id, session]);

    return (
        <SafeAreaView className="flex-1 bg-background">

            <View className="home-navbar px-5">
                <Pressable onPress={goBack} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold capitalize"> {routine?.name || "Routine"} </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-20"
            >
                <RoutineCard
                    routineId={routine?.id || ""}
                    routineName={routine?.name || ""}
                    daysOfWeek={daysOfWeek || 0}
                    numberOfExercises={uniqueExerciseCount}
                    tags={tags}
                    days={routine?.days || []}
                    isActive={routine?.is_active || false}
                />
                {!routine?.is_active &&
                    (<View className="flex-row gap-3 mb-5">
                        <Pressable className="flex-1 flex-row justify-center items-center p-3 rounded-full border-4 border-accent/80 bg-accent/10">
                            <Text className="font-sans-extrabold text-xl text-accent">ACTIVATE</Text>
                        </Pressable>
                    </View>)
                }
                <View className="flex-row gap-3">
                    <Pressable className="view-routine-buttons bg-accent/80">
                        <Image source={icons.edit} className="size-6 items-center" />
                        <Text className="view-routine-button-text">Edit</Text>
                    </Pressable>
                    <Pressable className="view-routine-buttons bg-red-800">
                        <Image source={icons.trashMuted} className="size-6 items-center" />
                        <Text className="view-routine-button-text">Delete</Text>
                    </Pressable>
                </View>

                <View className="section-header">
                    <Text className="section-title">Weekly Schedule</Text>
                </View>

                <WeeklyScheduleView days={routine?.days || []} />

            </ScrollView>

        </SafeAreaView>
    )
}

export default ViewRoutine;