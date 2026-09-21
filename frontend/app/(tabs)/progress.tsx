import ProgressDropdown from "@/components/ProgressDropDown";
import VolumeChange from "@/components/VolumeChange";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { getProgressOverview } from "@/services/progressService";
import { ProgressOverviewResponse, ProgressRange } from "@/types/progress";
import { styled } from "nativewind";
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const mapProgressRange = (range: string | null): ProgressRange => {
    return range === "7 days" ? "7d" :
        range === "30 days" ? "30d" :
            range === "3 months" ? "3m" :
                range === "6 months" ? "6m" :
                    range === "1 year" ? "1y" :
                        range === "All time" ? "all" :
                            "30d";
}

const formatDayMonth = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
    });
}

export const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h`;
    }

    return `${minutes}m`;
};

const Progress = () => {

    const { session } = useAuth();

    const [progressRange, setProgressRange] = useState<ProgressRange>("30d");
    const [progressOverview, setProgressOverview] = useState<ProgressOverviewResponse>();

    const peakWeek = progressOverview?.weekly_volume?.reduce((max, item) =>
        item.volume_kg > max.volume_kg ? item : max
    );

    const currentWeek = progressOverview?.weekly_volume.at(-1)?.volume_kg || 0;
    const previousWeek = progressOverview?.weekly_volume.at(-2)?.volume_kg || 0;

    const changePercentage =
        previousWeek === 0
            ? 0
            : ((currentWeek - previousWeek) / previousWeek) * 100;

    useEffect(() => {
        if (!session) return;

        const fetchProgressOverview = async () => {
            try {
                const data = await getProgressOverview({
                    accessToken: session.accessToken,
                    range: progressRange
                })
                setProgressOverview(data);
                // console.log("Progress Overview Data:", data);
            } catch (error) {
                console.error("Error fetching progress overview:", error);
            }
        }

        fetchProgressOverview();
    }, [session?.accessToken, progressRange])



    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="home-navbar px-5">
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> Progress </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-20"
            >

                <View className="page-header">
                    <Text className="head">My Progress</Text>
                    <Text className="subhead">Track your strength volume and personal milestone</Text>
                </View>

                <View className="mt-4">
                    <ProgressDropdown
                        options={["7 days", "30 days", "3 months", "6 months", "1 year", "All time"]}
                        value={progressRange}
                        onSelect={(val) =>
                            setProgressRange(mapProgressRange(val) as ProgressRange)
                        }
                    />
                </View>

                <View className="progress-summary">

                    <View className="flex-row gap-2">

                        <View className="progress-card">
                            <View className="progress-card-header">
                                <Text className="progress-card-title">Completed</Text>
                                <Image source={icons.calendarRegularAccent} className="progress-card-icon" />
                            </View>
                            <View className="progress-card-body">
                                <Text className="progress-card-value"> {progressOverview?.summary.workouts_completed || 0} </Text>
                            </View>
                        </View>

                        <View className="progress-card">
                            <View className="progress-card-header">
                                <Text className="progress-card-title">Total Volume</Text>
                                <VolumeChange
                                    volumeChangePercent={progressOverview?.summary.volume_change_percent || 0}
                                />

                            </View>
                            <View className="progress-card-body">
                                <Text className="progress-card-value"> {progressOverview?.summary.total_volume_kg || 0} </Text>
                            </View>
                        </View>

                    </View>

                    <View className="flex-row gap-2">

                        <View className="progress-card">
                            <View className="progress-card-header">
                                <Text className="progress-card-title"> Milestones </Text>
                                <Image source={icons.trophy} className="progress-card-icon" />

                            </View>
                            <View className="progress-card-body">
                                <Text className="progress-card-value"> 3 </Text>
                            </View>
                        </View>

                        <View className="progress-card">
                            <View className="progress-card-header">
                                <Text className="progress-card-title">Training Time</Text>
                                <Image source={icons.clock} className="progress-card-icon" />

                            </View>
                            <View className="progress-card-body">
                                <Text className="progress-card-value"> {formatDuration(progressOverview?.summary.training_time_seconds || 0)} </Text>
                            </View>
                        </View>

                    </View>





                </View>


                <View className="progress-section">

                    <View className="progress-section-header">
                        <View className="w-30 flex-col gap-2">
                            <Text
                                numberOfLines={2}
                                className="font-sans text-4xl">Weekly Volume</Text>
                            <Text className="font-sans text-sm text-faded">Your weekly volume trend</Text>
                        </View>

                        <View className="progress-change ">
                            <Image source={icons.progressSuccess} className="progress-card-icon" />
                            <Text
                                className="font-sans text-sm text-success w-20"
                                numberOfLines={2}>
                                {changePercentage.toFixed(1)} % vs Last Week
                            </Text>
                        </View>
                    </View>


                    <View className="peak-volume">
                        <View className="peak-volume-data">
                            <View className="accent-circle"></View>
                            <Text className="peak-volume-text">{peakWeek
                                ? `${peakWeek.volume_kg} kg`
                                : "No data"}</Text>
                        </View>

                        <View className="peak-volume-label">
                            <Text className="peak-volume-label-text">Peak Volume</Text>
                        </View>

                    </View>



                    <View className="progress-chart">
                        <BarChart
                            data={(progressOverview?.weekly_volume.slice(-4))?.map((item, index) => {
                                return {
                                    frontColor: item.volume_kg > 0 ? "#ea7a53af" : "#cccccc",
                                    value: item.volume_kg > 0 ? item.volume_kg : 100,
                                    label: `W ${index + 1}`
                                }
                            })}
                            barWidth={37}
                            spacing={20}
                            noOfSections={3}
                            roundedTop={true}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideRules
                            disableScroll

                        />
                    </View>

                </View>


                <View className="exercise-progress">
                    <View className="progress-section-header">
                        <Text className="font-sans-bold text-2xl">
                            Exercise Progress
                        </Text>
                        <Pressable
                            className="flex-row gap-2 items-center px-2 py-1 bg-faded/10 rounded-xl">
                            <Text className="font-sans text-sm text-accent">
                                View All
                            </Text>
                            <Image source={icons.go} className="size-4" />
                        </Pressable>
                    </View>

                    <View className="exercise-progress-list">
                        {progressOverview?.exercise_progress.slice(0, 3).map((exercise, index) => (
                            <View key={index} className="exercise-progress-item">

                                <View className="exercise-progress-item-content">

                                    <View className="exercise-progress-name">
                                        <Text className="font-sans-bold text-lg">
                                            {exercise.exercise_name}
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
                </View>

                <View className="exercise-progress">
                    <View className="progress-section-header">
                        <Text className="font-sans-bold text-2xl">
                            Recent Workouts
                        </Text>
                        <Pressable
                            className="flex-row gap-2 items-center px-2 py-1 bg-faded/10 rounded-xl">
                            <Text className="font-sans text-sm text-accent">
                                View All
                            </Text>
                            <Image source={icons.go} className="size-4" />
                        </Pressable>
                    </View>

                    <View className="exercise-progress-list">
                        {progressOverview?.recent_workouts.slice(0, 3).map((workout, index) => (
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
                </View>


            </ScrollView>

        </SafeAreaView>
    )
}

export default Progress;