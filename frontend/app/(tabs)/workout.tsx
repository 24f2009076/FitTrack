import ActiveRoutine from "@/components/ActiveRoutine";
import { RoutineLibrary } from "@/components/RoutineLibrary";
import { useAuth } from "@/context/AuthContext";
import { GetRoutineResponse } from "@/types/routine";
import { router } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);


const WorkOut = () => {

    const { session } = useAuth();

    const [routines, setRoutines] = useState<GetRoutineResponse[]>([]);
    const [activeRoutine, setActiveRoutine] = useState<GetRoutineResponse | null>(null);

    const daysOfWeek = activeRoutine?.days.reduce((count, day) => {
        if (day.is_rest_day) return count;
        return count + 1;
    }, 0) ?? 0;

    const uniqueExerciseCount = new Set(
        activeRoutine?.days
            .filter((day) => !day.is_rest_day)
            .flatMap((day) => day.exercises.map((exercise) => exercise.exercise_id)) ?? []
    ).size;

    const tags = activeRoutine?.description?.split(",").map((tag) => tag.trim()) ?? [];


    useEffect(() => {
        if (!session) return;

        const fetchRoutines = async () => {
            try {
                const response = await fetch(
                    `${process.env.EXPO_PUBLIC_API_URL}/api/routines`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${session?.accessToken}`,
                            "Content-Type": "application/json",
                        }
                    }
                )

                if (!response.ok) {
                    throw new Error("Failed to fetch routines: " + response.status);
                }

                const data: GetRoutineResponse[] = await response.json();
                setActiveRoutine(data.find((routine) => routine.is_active) ?? null);
                setRoutines(data.filter((routine) => !routine.is_active));

            } catch (error) {
                console.error("Error fetching routines:", error);
            }
        };

        fetchRoutines();
    }, [session]);

    return (
        <SafeAreaView className="flex-1 bg-background">

            <View className="home-navbar px-5">
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> Workout </Text>
                </View>
            </View>


            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-20"
            >

                <View className="page-header">
                    <Text className="head">My Routines</Text>
                    <Text className="subhead">View and manage your workout routines</Text>
                </View>


                <View className="section-header">
                    <Text className="section-title">ACTIVE ROUTINE</Text>
                </View>
                <ActiveRoutine
                    routineId={activeRoutine?.id || ""}
                    routineName={activeRoutine?.name || "Beginner Routine"}
                    daysOfWeek={daysOfWeek}
                    numberOfExercises={uniqueExerciseCount}
                    tags={tags}
                    days={activeRoutine?.days || []}
                />

                <View className="section-header">
                    <Text className="section-title">LIBRARY</Text>
                </View>
                <RoutineLibrary
                    routines={routines}
                />
                <Pressable className="add-routine-button" onPress={() => router.push("/workout/create-routine")}>
                    <Text className="text-accent font-sans-bold text-lg">+ Add Routine</Text>
                </Pressable>
            </ScrollView>

        </SafeAreaView>
    )
}

export default WorkOut;