import ActiveRoutine from "@/components/ActiveRoutine";
import { RoutineLibrary } from "@/components/RoutineLibrary";
import { routineLibrary } from "@/constants/data";
import { router } from "expo-router";
import { styled } from "nativewind";
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
 
const SafeAreaView = styled(RNSafeAreaView);


const WorkOut = () => {
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
                    routineName="Beginner Routine" 
                    daysOfWeek={5}
                    numberOfExercises={28}
                    tags={["Hypertrophy", "Beginner"]}
                />

                <View className="section-header">
                    <Text className="section-title">LIBRARY</Text>
                </View>
                <RoutineLibrary 
                    routines={routineLibrary.routines}
                />
                <Pressable className="add-routine-button" onPress={() => router.push("/workout/create-routine")}>
                    <Text className="text-accent font-sans-bold text-lg">+ Add Routine</Text>
                </Pressable>
            </ScrollView>

        </SafeAreaView>
    )
}

export default WorkOut;