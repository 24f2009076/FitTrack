import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface RestTimerProps {
    restDurationSeconds: number;
    onFinish?: () => void;
    onSkip?: () => void;
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

const RestTimer = ({ restDurationSeconds, onFinish, onSkip }: RestTimerProps) => {

    const [remainingSeconds, setRemainingSeconds] = useState(restDurationSeconds);

    useEffect(() => {
        setRemainingSeconds(restDurationSeconds);
    }, [restDurationSeconds]);


    useEffect(() => {

        if (remainingSeconds <= 0) {
            onFinish?.();
            return;
        }

        const timeout = setTimeout(() => {
            setRemainingSeconds((prev) =>
                Math.max(0, prev - 1)
            );
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [remainingSeconds, onFinish]);

    return (
        <View className="rest-timer">
            <Text className="rest-timer-title">
                REST
            </Text>
            <Text
                className="rest-timer-subtitle"
                numberOfLines={2}
            >
                Take a short break before the next exercise.
            </Text>

            <View className="rest-timer-content">
                <Text className="rest-timer-time">
                    {formatDuration(remainingSeconds)}
                </Text>

                <View className="rest-timer-controls">

                    <View className="rest-timer-add-remove">
                        <Pressable
                            className="rest-timer-button"
                            onPress={() =>
                                setRemainingSeconds((prev) =>
                                    Math.max(0, prev - 15)
                                )
                            }
                        >
                            <Text className="rest-timer-button-text">-15 sec</Text>
                        </Pressable>

                        <Pressable
                            className="rest-timer-button"
                            onPress={() =>
                                setRemainingSeconds((prev) =>
                                    prev + 15
                                )
                            }
                        >
                            <Text className="rest-timer-button-text">+15 sec</Text>
                        </Pressable>
                    </View>

                    <View className="rest-timer-skip">
                        <Pressable
                            className="rest-timer-button"
                            onPress={() => {
                                setRemainingSeconds(0);
                                onSkip?.();
                            }}
                        >
                            <Text className="rest-timer-button-text">Skip</Text>
                        </Pressable>
                    </View>
                </View>
            </View>


        </View>
    )

}

export default RestTimer;