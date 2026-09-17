import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { abandonWorkout, getWorkoutSession, startWorkout } from "@/services/workoutService";
import { DayRoutineResponse } from "@/types/routine";
import { WorkoutSession } from "@/types/workout";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

const ActiveRoutine = ({ routineId, routineName, daysOfWeek, numberOfExercises, tags, days }: ActiveRoutineProps) => {

    const calculateDuration = (dateString: string | undefined) => {
        if (!dateString) return "Unknown";

        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = diffInSeconds % 60;

        if (hours === 0 && minutes === 0) {
            return `${seconds} seconds ago`;
        }
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} days ago`;
        }

        return `${hours.toString().padStart(2, '0')} hours ${minutes.toString().padStart(2, '0')} mins ago`;
    }

    const dayMap: { [key: number]: string } = {
        0: "S",
        1: "M",
        2: "T",
        3: "W",
        4: "T",
        5: "F",
        6: "S"
    }

    const longDayMap: { [key: number]: string } = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
    }

    const today = new Date().getDay();

    const todayRoutineDay = days.find(
        (day) => day.day_of_week === today
    );

    const handleResumeWorkout = () => {
        if (!activeWorkoutSession) {
            console.error("No active workout session available.");
            return;
        }

        setShowModal(false);

        router.push({
            pathname: "/workout/session/[id]",
            params: {
                id: activeWorkoutSession.id
            }
        });
    };

    const handelStartNewWorkout = async () => {
        if (!session?.accessToken) {
            console.error("No access token available. User might not be authenticated.");
            return;
        }

        if (!todayRoutineDay) {
            console.error("No routine day found for today.");
            return;
        }

        if (!activeWorkoutSession) {
            console.error("No active workout session available.");
            return;
        }

        try {
            await abandonWorkout(
                activeWorkoutSession.id,
                session.accessToken
            );

            const newWorkout = await startWorkout(
                todayRoutineDay.id,
                session.accessToken
            );

            setShowModal(false);

            router.push({
                pathname: "/workout/session/[id]",
                params: {
                    id: newWorkout.id
                }
            })
        } catch (error) {
            console.error("Error starting new workout session:", error);
        }

        
    }


    const handleStartWorkout = async (
        todayRoutineDay: DayRoutineResponse | undefined,
        accessToken: string | undefined
    ) => {

        if (!accessToken) {
            console.error('No access token available. User might not be authenticated.');
            return;
        }

        if (!todayRoutineDay) {
            console.error('No routine day found for today.');
            return;
        }

        if (todayRoutineDay.is_rest_day) {
            console.log('Today is a rest day. No workout session will be started.');
            return;
        }

        try {
            const workoutSession = await startWorkout(todayRoutineDay.id, accessToken);

            if (workoutSession.conflict) {
                const conflictSessionId = workoutSession.existingSessionId;

                if (!conflictSessionId) {
                    throw new Error("An existing workout session was not returned.");
                }

                setActiveWorkoutSession(
                    await getWorkoutSession(
                        conflictSessionId,
                        accessToken
                    ));

                setShowModal(true);
                return;
            }

            router.push({
                pathname: "/workout/session/[id]",
                params: {
                    id: workoutSession.id
                },
            });
        } catch (error) {
            console.error('Error starting workout session:', error);
        }

    }


    const [showModal, setShowModal] = useState(false);

    const [activeWorkoutSession, setActiveWorkoutSession] = useState<WorkoutSession>();

    const { session } = useAuth();

    if (!session) {
        return null;
    }


    return (
        <View className="active-routine">

            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 items-center justify-center p-3">
                    <BlurView
                        intensity={100}
                        tint="dark"
                        className="absolute inset-0"
                    />

                    <View className="rounded-xl bg-muted p-7 flex-col items-center gap-4">

                        <View className="bg-accent p-3 rounded-full shadow-xl">
                            <Image className="size-6" source={icons.workout}></Image>
                        </View>

                        <View className="">
                            <View className="flex-col items-center gap-2">
                                <Text className="font-sans-extrabold text-xl">Workout Already in Progress</Text>
                                <Text className="font-sans-bold text-faded text-md text-center">
                                    You already have a workout in progress. Would you like to continue it or start a new one?
                                </Text>
                            </View>

                            <View className="flex-col gap-3 mt-5 bg-accent/20 p-3 rounded-lg">

                                <View className="flex-row justify-between border-b border-accent/30 pb-2">
                                    <View className="flex-row items-center ">
                                        <Text className="font-sans-bold">Started at</Text>
                                    </View>
                                    <View>
                                        <Text className="font-sans-bold text-accent text-sm">
                                            {todayRoutineDay
                                                ? calculateDuration(activeWorkoutSession?.started_at)
                                                : "Unknown"}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="font-sans-bold">Progress</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="font-sans-bold text-accent text-sm">
                                            {activeWorkoutSession
                                                ? `${activeWorkoutSession.exercises.filter(
                                                    (exercise) => exercise.status === "completed"
                                                ).length} of ${activeWorkoutSession.exercises.length} exercises completed`
                                                : "Loading..."}
                                        </Text>
                                    </View>
                                </View>

                            </View>

                            <View className="flex-row mt-5 gap-3">
                                <Pressable
                                    className="bg-accent p-3 rounded-lg w-1/2 flex items-center justify-center"
                                    onPress={() => handleResumeWorkout()}>
                                    <Text className="text-muted font-sans-extrabold text-xl">Resume</Text>
                                </Pressable>

                                <Pressable
                                    className="bg-primary p-3 rounded-lg w-1/2 flex items-center justify-center"
                                    onPress={() => handelStartNewWorkout()}>
                                    <Text className="text-muted font-sans-extrabold text-xl">Start New</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <View className="px-2 py-1 bg-muted/20 rounded-full self-start mb-2 flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-muted outline-3 outline-accent/50"></View>
                <Text className="text-muted font-sans-bold text-xs">ACTIVE</Text>
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

            <View className="start-workout">
                <Pressable
                    className="start-workout-button"
                    onPress={() => handleStartWorkout(todayRoutineDay, session.accessToken)}>
                    <Text className="text-accent font-sans-bold text-lg">Start Workout</Text>
                </Pressable>

                <Pressable className="edit-workout-button"
                    onPress={() =>
                        router.push({
                            pathname: "/workout/view-routine/[id]",
                            params: { id: routineId }
                        })
                    }>

                    <Image source={icons.edit} className="edit-workout-icon" />
                </Pressable>
            </View>
        </View>
    )
}

export default ActiveRoutine