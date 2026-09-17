import { icons } from "@/constants/icons";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

interface DurationCounterProps {
    durationSeconds: number;
    onDurationChange: (value: number) => void;
    weight: number;
    onWeightChange: (value: number) => void;
    tracking_type: 'duration' | 'duration_weight';
    onCompleteSet: () => void;
    completingSet?: boolean;
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

const DurationCounter = ({ durationSeconds, onDurationChange, weight, onWeightChange, tracking_type, onCompleteSet, completingSet = false }: DurationCounterProps) => {

    const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
    const [isRunning, setIsRunning] = useState(false);

    const progressPercentage = durationSeconds > 0
        ? ((durationSeconds - remainingSeconds) / durationSeconds) * 100
        : 0;

    useEffect(() => {
        if (!isRunning) {
            setRemainingSeconds(durationSeconds);
        }
    }, [durationSeconds, isRunning]);

    useEffect(() => {
        if (!isRunning) return;

        if (remainingSeconds <= 0) {
            setIsRunning(false);
            return;
        }

        const interval = setInterval(() => {
            setRemainingSeconds((previous) =>
                Math.max(0, previous - 1)
            );
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [isRunning, remainingSeconds]);




    if (tracking_type === 'duration' || tracking_type === 'duration_weight') {
        return (<>


            <View className="relative overflow-hidden rounded-xl">
                <View
                    className="absolute left-0 top-0 bottom-0 bg-accent/50"
                    style={{
                        width: `${progressPercentage}%`,
                    }}
                />


                <View className="reps-counter z-10">
                    <Text className="reps-counter-label">DURATION</Text>
                    <View className="reps-counter-section">
                        <View className="reps-counter-button"
                            style={{
                                opacity: isRunning ? 0 : 1,
                            }}
                            onTouchStart={
                                () => onDurationChange(
                                    Math.max(15, durationSeconds - 15)
                                )}>
                            <Text className="reps-counter-button-text">-</Text>
                        </View>

                        <Text className="reps-counter-value z-10">
                            {formatDuration(remainingSeconds)}
                        </Text>

                        <View className="reps-counter-button" style={{
                            opacity: isRunning ? 0 : 1,
                        }} onTouchStart={
                            () => onDurationChange(
                                Math.max(15, durationSeconds + 15)
                            )}>
                            <Text className="reps-counter-button-text">+</Text>
                        </View>
                    </View>

                    <View className="start-timer-btns">
                        <Pressable
                            className={`start-timer-btn ${isRunning ? "disabled" : ""}`}
                            onPress={() => setIsRunning(true)}
                            disabled={isRunning}
                        >
                            <Image className="size-6" source={icons.playMuted} />
                        </Pressable>

                        <Pressable className={`start-timer-btn ${!isRunning ? "disabled" : ""}`}
                            onPress={() => setIsRunning(false)}
                            disabled={!isRunning}
                        >
                            <Image className="size-6" source={icons.stopMuted} />
                        </Pressable>
                    </View>
                </View>

                {(tracking_type === 'duration_weight') && (
                    <View className="reps-counter">
                        <Text className="reps-counter-label">WEIGHT</Text>
                        <View className="reps-counter-section">
                            <View className="reps-counter-button" onTouchStart={() => onWeightChange(weight - 0.5)}>
                                <Text className="reps-counter-button-text">-</Text>
                            </View>
                            <View className="flex-col justify-center items-center">
                                <Text className="reps-counter-value flex-col">
                                    {weight}
                                </Text>
                                <Text className="font-sans-bold text-muted-foreground">kg</Text>
                            </View>

                            <View className="reps-counter-button" onTouchStart={() => onWeightChange(weight + 0.5)}>
                                <Text className="reps-counter-button-text">+</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>



            <View className="workout-session-complete-set">
                <Pressable className="workout-session-complete-set-button"
                    onPress={() => {
                        setIsRunning(false);
                        onCompleteSet();
                    }}>
                    <Text className="workout-session-complete-set-button-text"
                    >
                        COMPLETE SET
                    </Text>
                </Pressable>
            </View>
        </>

        )
    }
}

export default DurationCounter;