import { Pressable, Text, View } from "react-native";

interface RepsCounterProps {
    reps: number;
    onRepsChange: (value: number) => void;
    weight: number;
    onWeightChange: (value: number) => void;
    tracking_type: 'reps' | 'reps_weight';
    onCompleteSet: () => void;
    completingSet?: boolean;
}

const RepsCounter = ({ reps, onRepsChange, weight, onWeightChange, tracking_type, onCompleteSet, completingSet = false }: RepsCounterProps) => {

    if (tracking_type === 'reps' || tracking_type === 'reps_weight') {
        return (<>
            <View className="reps-counter">
                <Text className="reps-counter-label">REPS</Text>
                <View className="reps-counter-section">
                    <View className="reps-counter-button" onTouchStart={() => onRepsChange(reps - 1)}>
                        <Text className="reps-counter-button-text">-</Text>
                    </View>
                    <Text className="reps-counter-value">{reps}</Text>
                    <View className="reps-counter-button" onTouchStart={() => onRepsChange(reps + 1)}>
                        <Text className="reps-counter-button-text">+</Text>
                    </View>
                </View>
            </View>
            {(tracking_type === 'reps_weight') && (
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

            <View className="workout-session-complete-set">
                <Pressable className="workout-session-complete-set-button" onPress={onCompleteSet}>
                    <Text className="workout-session-complete-set-button-text">
                        COMPLETE SET
                    </Text>
                </Pressable>
            </View>
        </>

        )
    }
}

export default RepsCounter;