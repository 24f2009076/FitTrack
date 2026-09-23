import { icons } from "@/constants/icons";
import { useAuth } from '@/context/AuthContext';
import { getAllExercises } from '@/services/progressService';
import { ExerciseOverviewResponse } from '@/types/progress';
import { router } from 'expo-router';
import { styled } from 'nativewind';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

export const SafeAreaView = styled(RNSafeAreaView);

const shortenName = (name: string) => {
    if (name.length > 20) {
        return name.substring(0, 20) + "...";
    }
    return name;
}


const ExerciseProgress = () => {
    const { session } = useAuth();

    const [exercises, setExercises] = useState<ExerciseOverviewResponse[]>([]);



    useEffect(() => {

        if (!session) return;

        const fetchExercises = async () => {
            try {
                const response = await getAllExercises({
                    accessToken: session.accessToken,
                    range: "all"
                })

                setExercises(response);
                // console.log("Fetched exercises:", exercises);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            }
        }

        fetchExercises();

    }, [session]);


    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="home-navbar px-5">
                <Pressable onPress={() => router.back()} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold uppercase"> Exercises </Text>
                </View>
            </View>

            <ScrollView className="exercises">
                <View className="exercise-progress-list">
                    {exercises.map((exercise, index) => (
                        <View key={index} className="exercise-progress-item">

                            <View className="exercise-progress-item-content">

                                <View className="exercise-progress-name">
                                    <Text className="font-sans-bold text-lg">
                                        {shortenName(exercise.exercise_name)}
                                    </Text>
                                </View>

                                <View className="exercise-progress-data">
                                    <Text className="font-sans-bold text-sm text-faded">
                                        {exercise.start_value} -&gt; {exercise.current_value}
                                    </Text>
                                </View>

                            </View>

                            <View className="exercise-progress-item-change">

                                {exercise.change_percent && exercise.change_percent > 0 ? (
                                    <View className="increase-change">
                                        <Image source={icons.progressSuccess} className="size-4" />
                                        <Text className="font-sans text-sm text-success">
                                            {exercise.change_percent.toFixed(1)} %
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="decrease-change">
                                        <Image source={icons.progressDestructive} className="size-4" />
                                        <Text className="font-sans text-sm text-destructive">
                                            {exercise.change_percent?.toFixed(1)} %
                                        </Text>
                                    </View>
                                )}
                            </View>


                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ExerciseProgress;