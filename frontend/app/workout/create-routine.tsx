import { WeeklyRoutineInput } from "@/components/WeeklyRoutineInput";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { buildRoutineCreateRequest } from "@/lib/routineMapper";
import { createRoutine } from "@/services/routineService";
import { router } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useRoutineStore } from "../../store/routineStore";

const SafeAreaView = styled(RNSafeAreaView);

const goBack = () => {
    useRoutineStore.getState().clearRoutine();
    router.back();
}


const AddRoutine = () => {

    const { session } = useAuth();

    const [routineTitle, setRoutineTitle] = useState("");
    const [routineDescription, setRoutineDescription] = useState("");

    const routine = useRoutineStore((state) => state.days);

    const handleSaveRoutine = async () => {

        if (!routineTitle.trim()) {
            console.error("Routine name is required");
            return;
        }

        const payload = buildRoutineCreateRequest(
            routineTitle,
            routineDescription,
            routine
        );

        console.log(
            "Routine payload:",
            JSON.stringify(payload, null, 2)
        );

        try {
            const createdRoutine = await createRoutine(
                payload,
                session?.accessToken || ""
            );

            console.log(
                "Routine created:",
                createdRoutine
            );

            useRoutineStore.getState().clearRoutine();

            router.push("/workout");

        } catch (error) {
            console.error(
                "Failed to create routine:",
                error
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">

            <View className="home-navbar px-5">
                <Pressable onPress={goBack} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> Add Routine </Text>
                </View>
            </View>


            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-20"
            >

                <View className="home-card">

                    <View className="form-field">
                        <Text className="text-md font-sans-bold text-foreground"> ROUTINE NAME</Text>
                        <TextInput
                            value={routineTitle}
                            onChangeText={setRoutineTitle}
                            placeholder="e.g. Beginner Routine"
                            className="w-full rounded-lg border border-accent px-0 pl-3 pr-3 py-3 text-lg font-sans-bold text-accent"
                        />
                    </View>

                    <View className="form-field">
                        <Text className="text-md font-sans-bold text-foreground"> DESCRIPTION</Text>
                        <TextInput
                            value={routineDescription}
                            onChangeText={setRoutineDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholder="Goals, focus areas or notes..."
                            className="w-full min-h-30 rounded-lg border border-accent px-0 pl-3 pr-3 py-3 text-lg font-sans-bold text-accent"
                        />
                    </View>

                </View>

                <View className="section-header">
                    <Text className="section-title">Weekly Schedule</Text>
                </View>

                <WeeklyRoutineInput />


                <Pressable className="add-routine-button" onPress={handleSaveRoutine}>
                    <Text className="text-accent font-sans-bold text-lg">+ Save Routine</Text>
                </Pressable>



            </ScrollView>


        </SafeAreaView>
    )
}

export default AddRoutine;