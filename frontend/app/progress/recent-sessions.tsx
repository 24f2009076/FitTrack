import { icons } from '@/constants/icons';
import { useAuth } from '@/context/AuthContext';
import { getAllSessions } from '@/services/progressService';
import { WorkoutOverviewResponse } from '@/types/progress';
import { router } from 'expo-router';
import { styled } from 'nativewind';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

export const SafeAreaView = styled(RNSafeAreaView);



const WorkoutProgress = () => {
    const { session } = useAuth();

    const [workoutSessions, setWorkoutSessions] = useState<WorkoutOverviewResponse[]>([]);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!session) return;

            try {
                const response = await getAllSessions({
                    accessToken: session.accessToken,
                    range: "all"
                })
                setWorkoutSessions(response);
            } catch (error) {
                console.error("Error fetching workout sessions:", error);
            }
        }

        fetchSessions();
    }, [session]);

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="home-navbar px-5">
                <Pressable onPress={() => router.back()} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold uppercase"> Workouts </Text>
                </View>
            </View>

            <ScrollView
                className="exercises">
                <View className="exercise-progress-list">
                    {workoutSessions.map((workout, index) => (
                        <View key={index} className="exercise-progress-item">

                            <View className="exercise-progress-item-content">

                                <View className="exercise-progress-name">
                                    <Text className="font-sans-bold text-lg">
                                        {workout.name}
                                    </Text>
                                </View>

                                <View className="session-data">
                                    <Text className="font-sans-bold text-sm text-faded">
                                        {workout.set_count} Sets | {workout.volume_kg} kg
                                    </Text>
                                </View>

                            </View>


                        </View>
                    ))}
                </View>

            </ScrollView>






        </SafeAreaView>
    )
}

export default WorkoutProgress;