import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { skipRestDay } from "@/services/routineService";
import { abandonWorkout, getCurrentRoutineDay, getWorkoutSession, startWorkout } from "@/services/workoutService";
import { CurrentRoutineDay, WorkoutSession } from "@/types/workout";
import { BlurView } from "expo-blur";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, Modal, Pressable, Text, View } from "react-native";

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

    const orderedDays = [...days].sort(
        (a, b) =>
            ((a.day_of_week + 6) % 7) -
            ((b.day_of_week + 6) % 7)
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

    const startAndOpenWorkout = async (accessToken: string) => {
        const result = await startWorkout(routineId, accessToken);

        if (result.conflict) {
            if (!result.existingSessionId) {
                throw new Error("An existing workout session was not returned.");
            }

            const existingSession = await getWorkoutSession(
                result.existingSessionId,
                accessToken
            );

            setActiveWorkoutSession(existingSession);
            setShowModal(true);
            return;
        }

        if (!result.id) {
            throw new Error("The server did not return a workout session.");
        }

        setShowModal(false);

        router.push({
            pathname: "/workout/session/[id]",
            params: { id: result.id },
        });
    };

    const handleStartWorkout = async () => {
        if (!session?.accessToken || isStarting) return;

        setIsStarting(true);

        try {
            await startAndOpenWorkout(session.accessToken);
        } catch (error) {
            Alert.alert(
                "Unable to start workout",
                error instanceof Error ? error.message : "Please try again."
            );
        } finally {
            setIsStarting(false);
        }
    };

    const handelStartNewWorkout = async () => {
        if (
            !session?.accessToken ||
            !activeWorkoutSession ||
            isStarting
        ) {
            return;
        }

        setIsStarting(true);

        try {
            await abandonWorkout(
                activeWorkoutSession.id,
                session.accessToken
            );

            // The previous session has now been abandoned.
            setActiveWorkoutSession(undefined);
            setShowModal(false);

            await startAndOpenWorkout(session.accessToken);
        } catch (error) {
            Alert.alert(
                "Unable to start new workout",
                error instanceof Error ? error.message : "Please try again."
            );
        } finally {
            setIsStarting(false);
        }
    };

    const handleSkipRestDay = async () => {
        if (
            !session?.accessToken ||
            !currentDay?.is_rest_day ||
            isSkippingRestDay
        ) {
            return;
        }

        setIsSkippingRestDay(true);

        try {
            const nextDay = await skipRestDay(
                routineId,
                session.accessToken
            );

            setCurrentDay(nextDay);
        } catch (error) {
            Alert.alert(
                "Unable to skip rest day",
                error instanceof Error
                    ? error.message
                    : "Please try again."
            );
        } finally {
            setIsSkippingRestDay(false);
        }
    };

    const [currentDay, setCurrentDay] = useState<CurrentRoutineDay>();
    const [isLoadingCurrentDay, setIsLoadingCurrentDay] = useState(true);
    const [currentDayError, setCurrentDayError] = useState<string>();
    const [isSkippingRestDay, setIsSkippingRestDay] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [activeWorkoutSession, setActiveWorkoutSession] = useState<WorkoutSession>();

    const { session } = useAuth();

    if (!session) {
        return null;
    }

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const loadCurrentDay = async () => {
                if (!session?.accessToken) {
                    return;
                }

                setIsLoadingCurrentDay(true);
                setCurrentDayError(undefined);

                try {
                    const result = await getCurrentRoutineDay(
                        routineId,
                        session.accessToken
                    );

                    if (isMounted) {
                        setCurrentDay(result);
                    }
                } catch (error) {
                    if (isMounted) {
                        setCurrentDayError(
                            error instanceof Error
                                ? error.message
                                : "Unable to load current workout"
                        );
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingCurrentDay(false);
                    }
                }
            };

            loadCurrentDay();

            return () => {
                isMounted = false;
            };
        }, [routineId, session?.accessToken])
    );


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
                                            {calculateDuration(activeWorkoutSession?.started_at)}
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
                                    onPress={() => handleResumeWorkout()}
                                    disabled={isStarting}>
                                    <Text className="text-muted font-sans-extrabold text-xl">Resume</Text>
                                </Pressable>

                                <Pressable
                                    className="bg-primary p-3 rounded-lg w-1/2 flex items-center justify-center"
                                    onPress={() => handelStartNewWorkout()}
                                    disabled={isStarting}>
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
                    <Text className="font-sans-bold text-muted text-md">{daysOfWeek} workout days</Text>
                </View>
                <View className="flex-row items-center">
                    <Image source={icons.exercisesMuted} className="active-routine-icon" />
                    <Text className="font-sans-bold text-muted text-md">{numberOfExercises} exercises</Text>
                </View>
            </View>

            <View className={`flex-row items-center mt-5 bg-primary/90 justify-evenly rounded-2xl px-2`}>
                {orderedDays.map((day) => (
                    <View key={day.id} className="flex-col items-center gap-1 p-2">
                        <Text className="font-sans-bold text-muted text-md">
                            {`${((day.day_of_week + 6) % 7) + 1}`}
                        </Text>
                        <View
                            className={`h-5 w-5 rounded-full 
                                ${day.is_rest_day ? "bg-muted" : "bg-accent"}
                                ${day.id === currentDay?.routine_day_id ? "border-5 border-green-700" : ""}`}
                        />
                    </View>
                ))}
            </View>

            <View className="flex-col flex-wrap gap-2 mt-5 border-faded bg-primary/90 p-3 rounded-lg">
                <Text className="font-sans-bold text-muted text-lg">Today's Workout</Text>
                {(currentDay?.is_rest_day) && (
                    <Text className="font-sans-bold text-accent text-xl">
                        Rest Day
                    </Text>
                )}
                {(!currentDay?.is_rest_day) && (
                    <Text className="font-sans-bold text-accent text-xl">
                        {currentDay?.name}
                    </Text>
                )}
            </View>

            <View className="start-workout">
                <Pressable
                    className="start-workout-button"
                    onPress={currentDay?.is_rest_day
                        ? handleSkipRestDay
                        : handleStartWorkout}
                    disabled={isStarting}
                >

                    {(currentDay?.is_rest_day) && (
                        <Text className="text-accent font-sans-bold text-lg">
                            Skip Rest Day
                        </Text>
                    )}
                    {(!currentDay?.is_rest_day) && (
                        <Text className="text-accent font-sans-bold text-lg">
                            Start Workout
                        </Text>
                    )}
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