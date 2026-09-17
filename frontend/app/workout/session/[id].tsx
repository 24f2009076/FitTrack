import DurationCounter from "@/components/DurationCounter";
import RepsCounter from "@/components/RepsCounter";
import RestTimer from "@/components/RestTimer";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { completeWorkoutSet, getWorkoutSession } from "@/services/workoutService";
import { WorkoutSession, WorkoutSessionExercise } from "@/types/workout";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const formatElapsedTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, "0"))
        .join(":");
};

const formatDuration = (seconds: number | undefined) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

const getTargetText = (
    exercise: WorkoutSessionExercise
) => {
    switch (exercise.tracking_type) {
        case "reps":
        case "reps_weight":
            return `${exercise.planned_sets} × ${exercise.planned_reps ?? "-"
                } reps`;

        case "duration":
        case "duration_weight":
            return `${exercise.planned_sets} × ${exercise.planned_duration_seconds
                ? formatDuration(
                    exercise.planned_duration_seconds
                )
                : "-"
                }`;

        default:
            return `${exercise.planned_sets} sets`;
    }
};

const getPreviousPerformanceText = (
    exercise: WorkoutSessionExercise
) => {
    const sets =
        exercise.previous_performance?.sets ?? [];

    if (sets.length === 0) {
        return "NONE";
    }

    const lastSet = sets[sets.length - 1];

    switch (exercise.tracking_type) {
        case "reps":
            return `${lastSet.reps ?? "-"} reps`;

        case "reps_weight":
            return `${lastSet.weight_kg ?? "-"} kg × ${lastSet.reps ?? "-"
                }`;

        case "duration":
            return lastSet.duration_seconds !== null
                ? formatDuration(
                    lastSet.duration_seconds
                )
                : "-";

        case "duration_weight":
            return `${lastSet.weight_kg ?? "-"
                } kg × ${lastSet.duration_seconds !== null
                    ? formatDuration(
                        lastSet.duration_seconds
                    )
                    : "-"
                }`;

        default:
            return "NONE";
    }
};


export default function WorkoutSessionPage() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [workout, setWorkout] =
        useState<WorkoutSession | null>(null);

    const [loading, setLoading] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const [reps, setReps] = useState(0);
    const [weight, setWeight] = useState(10);
    const [duration, setDuration] = useState(0);
    const [completingSet, setCompletingSet] = useState(false);
    const [isResting, setIsResting] = useState(false);

    const { session, signOut } = useAuth();

    const accessToken = session?.accessToken;

    const currentExercise = workout?.exercises.find(
        (exercise) => exercise.status === "current"
    );

    const setNumbers = currentExercise
        ? Array.from(
            { length: currentExercise.planned_sets ?? 0 },
            (_, index) => index + 1
        )
        : [];

    const handleCompleteSet = async () => {
        if (!currentExercise || !accessToken || !workout) return;

        setCompletingSet(true);
        setIsResting(true);

        try {
            const trackingType = currentExercise.tracking_type;

            const result = await completeWorkoutSet(
                workout.id,
                currentExercise.id,
                {
                    set_number: currentSetNumber,

                    reps:
                        trackingType === "reps" ||
                            trackingType === "reps_weight"
                            ? reps
                            : null,

                    weight_kg:
                        trackingType === "reps_weight" ||
                            trackingType === "duration_weight"
                            ? weight
                            : null,

                    duration_seconds:
                        trackingType === "duration" ||
                            trackingType === "duration_weight"
                            ? duration
                            : null,
                },
                accessToken

            );
            console.log("Set completed successfully:", result);

            const updatedWorkout = await getWorkoutSession(
                workout.id,
                accessToken
            );

            setWorkout(updatedWorkout);



        } catch (error) {
            console.error("Failed to complete set:", error);
        } finally {
            setCompletingSet(false);
        }
    }

    const currentSetNumber = currentExercise
        ? currentExercise.sets.length + 1
        : 1;

    useEffect(() => {
        if (!currentExercise) return;

        const previousSet =
            currentExercise.previous_performance?.sets.find(
                (set) =>
                    set.set_number === currentSetNumber
            );

        setReps(
            previousSet?.reps ??
            currentExercise.planned_reps ??
            0
        );

        setWeight(
            previousSet?.weight_kg ?? 10
        );

        setDuration(
            previousSet?.duration_seconds ??
            currentExercise.planned_duration_seconds ??
            0
        );

    }, [
        currentExercise?.id,
        currentSetNumber,
    ]);


    useFocusEffect(

        useCallback(() => {

            if (!workout?.started_at) return;

            const startedAt = new Date(workout.started_at).getTime();

            if (Number.isNaN(startedAt)) return;

            const updateElapsedTime = () => {
                const endTime = workout.completed_at
                    ? new Date(workout.completed_at).getTime()
                    : Date.now();

                setElapsedSeconds(
                    Math.max(
                        0,
                        Math.floor((endTime - startedAt) / 1000)
                    )
                )
            }

            updateElapsedTime();

            if (workout.completed_at) return;

            const interval = setInterval(updateElapsedTime, 1000);

            return () => {
                clearInterval(interval);
            }
        }, [workout?.started_at, workout?.completed_at])
    )

    useEffect(() => {
        if (!id || !accessToken) {
            signOut();
            return;
        }

        const loadWorkout = async () => {
            try {
                const data = await getWorkoutSession(
                    id,
                    accessToken
                );

                setWorkout(data);
            } catch (error) {
                console.error(
                    "Failed to load workout:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };
        loadWorkout();
    }, [id, accessToken, signOut]);



    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
            </View>
        );
    }

    if (!workout) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Workout not found.</Text>
            </View>
        );
    }

    if (workout.status === "completed" || !currentExercise) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center px-5">
                    <Text className="text-3xl font-sans-extrabold">
                        Workout Complete 🎉
                    </Text>

                    <Text className="mt-2 text-muted-foreground font-sans-medium">
                        Great work. Your session has been saved.
                    </Text>

                    <Text className="mt-4 text-xl font-sans-bold">
                        {formatElapsedTime(elapsedSeconds)}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const previousSets = currentExercise?.previous_performance?.sets ?? [];

    const upcomingExercises = workout.exercises.filter(
        (exercise) => exercise.status === "upcoming"
    );

    const completedExercises = workout.exercises.filter(
        (exercise) => exercise.status === "completed"
    );

    const progressPercentage = workout.exercises.length
        ? (completedExercises.length / workout.exercises.length) * 100
        : 0;

    return (
        <SafeAreaView className="flex-1 bg-background">

            <View className="home-navbar px-5">
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> {formatElapsedTime(elapsedSeconds)} </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-20">

                <View className="w-full bg-muted rounded-xl p-1 mb-5 flex-row justify-start">
                    <View className="bg-accent p-1 rounded-xl shadow-md"
                        style={{
                            width: `${progressPercentage}%`
                        }}>

                    </View>
                </View>

                <View className="workout-session-card">

                    <Text className="text-md text-accent font-sans-bold">CURRENT EXERCISE</Text>
                    <Text className="text-xl font-sans-extrabold">{currentExercise?.name}</Text>
                    <Text className="text-md font-sans-bold text-muted-foreground">Chest | Barbell</Text>

                    <View className="workout-card-section">

                        <View className="workout-card-target-detail bg-faded/20">
                            <Text className="workout-card-detail-head">
                                LAST SESSION
                            </Text>
                            <Text className="workout-card-detail-value">
                                {getPreviousPerformanceText(currentExercise!)}
                            </Text>
                        </View>

                        <View className="workout-card-target-detail bg-accent/20">
                            <Text className="workout-card-detail-head text-accent">
                                TARGET
                            </Text>
                            <Text className="workout-card-detail-value">
                                {getTargetText(currentExercise!)}
                            </Text>
                        </View>

                    </View>

                    {(!isResting) && (<View className="workout-section-card">
                        <Text className="font-sans-bold"> Set {currentSetNumber} of {currentExercise?.planned_sets}</Text>

                        {(currentExercise?.tracking_type === "reps" ||
                            currentExercise?.tracking_type === "reps_weight") && (
                                <RepsCounter
                                    reps={reps}
                                    onRepsChange={setReps}
                                    weight={weight}
                                    onWeightChange={setWeight}
                                    tracking_type={currentExercise.tracking_type}
                                    onCompleteSet={handleCompleteSet}
                                />
                            )}
                        {(currentExercise?.tracking_type === "duration" ||
                            currentExercise?.tracking_type === "duration_weight") && (
                                <DurationCounter
                                    durationSeconds={duration}
                                    onDurationChange={setDuration}
                                    weight={weight}
                                    onWeightChange={setWeight}
                                    tracking_type={currentExercise.tracking_type}
                                    onCompleteSet={handleCompleteSet}
                                />
                            )}
                    </View>)}

                    {(isResting) && (
                        <View className="workout-section-card">
                            <RestTimer
                                restDurationSeconds={90}
                                onFinish={() => setIsResting(false)}
                                onSkip={() => setIsResting(false)}
                            />
                        </View>
                    )}

                    <View className="workout-section-card-sets">
                        <Text className="sets-header">
                            COMPLETED SETS
                        </Text>

                        <View className="sets-list">
                            {setNumbers.map((setNumber) => {
                                const completedSet = currentExercise.sets.find(
                                    (set) => set.set_number === setNumber
                                );

                                const isCurrent =
                                    setNumber === currentSetNumber;

                                const isUpcoming =
                                    setNumber > currentSetNumber;

                                const isCompleted =
                                    setNumber < currentSetNumber;

                                return (
                                    <View
                                        key={setNumber}
                                        className={`set-item ${isCurrent ? "current-set" : ""} ${isUpcoming ? "upcoming-set" : ""}`}
                                    >
                                        {(isCompleted) && (
                                            <Image source={icons.completedAccent} className="size-7" />
                                        )}
                                        {(isCurrent) && (
                                            <Image source={icons.currentAccent} className="size-7" />
                                        )}
                                        {(isUpcoming) && (
                                            <Image source={icons.circleFaded} className="size-7" />
                                        )}

                                        <Text className="set-item-number">
                                            Set {setNumber}
                                        </Text>

                                        {(isCompleted && completedSet) && (
                                            <Text className="set-item-value">
                                                {currentExercise.tracking_type ===
                                                    "reps_weight" &&
                                                    `${completedSet.reps} × ${completedSet.weight_kg} kg`}

                                                {currentExercise.tracking_type ===
                                                    "reps" &&
                                                    `${completedSet.reps} reps`}

                                                {currentExercise.tracking_type ===
                                                    "duration" &&
                                                    completedSet.duration_seconds !== null &&
                                                    formatDuration(
                                                        completedSet.duration_seconds
                                                    )}

                                                {currentExercise.tracking_type ===
                                                    "duration_weight" &&
                                                    `${formatDuration(
                                                        completedSet.duration_seconds ?? 0
                                                    )} x ${completedSet.weight_kg} kg`}
                                            </Text>
                                        )}
                                    </View>
                                )
                            })}
                        </View>
                    </View>

                </View>

                <View className="up-next-section">
                    <Text className="up-next-header">
                        UP NEXT
                    </Text>

                    <View className="up-next-list">
                        {upcomingExercises.length === 0 && (
                            <Text className="text-muted-foreground font-sans-medium">
                                No more exercises. Finish your workout!
                            </Text>
                        )}
                        {upcomingExercises.map((exercise) => (
                            <View key={exercise.id} className="up-next-item">
                                <Text className="up-next-item-name">
                                    {exercise.name}
                                </Text>
                                <Text className="up-next-item-target">
                                    {(exercise.tracking_type === "reps" || exercise.tracking_type === "reps_weight") &&
                                        `${exercise.planned_sets} × ${exercise.planned_reps ?? "-"
                                        } reps`}

                                    {(exercise.tracking_type === "duration" || exercise.tracking_type === "duration_weight") &&
                                        `${exercise.planned_sets} × ${exercise.planned_duration_seconds
                                            ? formatDuration(exercise.planned_duration_seconds)
                                            : "00:00"
                                        }`}
                                </Text>
                            </View>
                        ))}
                    </View>

                </View>

                <View className="up-next-section">
                    <Text className="up-next-header">
                        COMPLETED EXERCISES
                    </Text>

                    <View className="up-next-list">
                        {completedExercises.length === 0 && (
                            <Text className="text-muted-foreground font-sans-medium">
                                No exercises completed yet.
                            </Text>
                        )}

                        {completedExercises.map((exercise) => (
                            <View key={exercise.id} className="completed-exercise-item">
                                <Image source={icons.completedAccent} className="size-7" />
                                <Text
                                    className="completed-exercise-item-name"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {exercise.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>

    )
}

