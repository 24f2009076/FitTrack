import { router } from "expo-router";
import {
    Image,
    Pressable,
    Text,
    View
} from "react-native";

import { icons } from "@/constants/icons";
import {
    FitnessGoal,
    useOnboarding,
} from "@/context/OnboardingContext";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);


const goals: {
    value: FitnessGoal;
    label: string;
    description: string;
}[] = [
        {
            value: "build_muscle",
            label: "Build Muscle",
            description: "Increase muscle size and definition.",
        },

        {
            value: "gain_strength",
            label: "Gain Strength",
            description: "Focus on becoming stronger.",
        },

        {
            value: "lose_fat",
            label: "Lose Fat",
            description: "Reduce body fat while staying active.",
        },

        {
            value: "general_fitness",
            label: "General Fitness",
            description: "Stay healthy, active and consistent.",
        },
    ];

export default function GoalScreen() {
    const { data, updateData } = useOnboarding();

    function selectGoal(goal: FitnessGoal) {
        updateData({
            goal,
        });
    }

    function handleContinue() {
        if (!data.level) {
            return;
        }

        router.push("/(onboarding)/body");
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="home-navbar px-5">
                <Pressable onPress={() => router.back()} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> Step 2 of 4 </Text>
                </View>
            </View>


            <View className="flex-1 px-5">
                
                <View className="flex-row items-center gap-2">

                    {[1, 2, 3, 4].map((step) => (
                        <View
                            key={step}
                            className={`h-1.5 flex-1 rounded-full ${step <= 2
                                ? "bg-accent"
                                : "bg-muted"
                                }`}
                        />
                    ))}

                </View>

                <Text className="mt-4 font-sans-bold text-3xl text-foreground">
                    What's are we training for?
                </Text>

                <Text className="mt-2 font-sans-regular text-base text-foreground/60">
                    We'll use this to personalize your FitTrack experience.
                </Text>


                <View className="mt-8 gap-4">

                    {goals.map((goal) => {
                        const selected = data.goal === goal.value;

                        return (
                            <Pressable
                                key={goal.value}
                                onPress={() => selectGoal(goal.value)}
                                className={`rounded-2xl border p-5 ${selected
                                    ? "border-primary bg-muted"
                                    : "border-foreground/10 bg-card"
                                    }`}
                            >
                                <Text className="font-sans-semibold text-lg text-foreground">
                                    {goal.label}
                                </Text>

                                <Text className="mt-1 font-sans-regular text-sm text-foreground/60">
                                    {goal.description}
                                </Text>
                            </Pressable>
                        );
                    })}

                </View>


                <View className="mt-auto">

                    <Pressable
                        onPress={handleContinue}
                        disabled={!data.level}
                        className={`rounded-2xl p-4 ${data.level
                            ? "bg-primary"
                            : "bg-primary/30"
                            }`}
                    >
                        <Text className="text-center font-sans-semibold text-base text-background">
                            Continue
                        </Text>
                    </Pressable>

                </View>

            </View>
        </SafeAreaView>
    )
}