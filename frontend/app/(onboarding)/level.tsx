// app/(onboarding)/level.tsx

import { router } from "expo-router";
import {
    Image,
    Pressable,
    Text,
    View
} from "react-native";

import { icons } from "@/constants/icons";
import {
    FitnessLevel,
    useOnboarding,
} from "@/context/OnboardingContext";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const levels: {
    value: FitnessLevel;
    title: string;
    description: string;
}[] = [
        {
            value: "beginner",
            title: "Beginner",
            description:
                "I'm new to training or getting back into it.",
        },
        {
            value: "intermediate",
            title: "Intermediate",
            description:
                "I've been training consistently for a while.",
        },
        {
            value: "advanced",
            title: "Advanced",
            description:
                "I have significant training experience.",
        },
    ];


export default function LevelScreen() {
    const { data, updateData } = useOnboarding();


    function selectLevel(level: FitnessLevel) {
        updateData({
            level,
        });
    }


    function handleContinue() {
        if (!data.level) {
            return;
        }

        router.push("/(onboarding)/goal");
    }


    return (
        <SafeAreaView className="flex-1 bg-background">

            <View className="home-navbar px-5">
                <Pressable onPress={() => router.back()} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> Step 1 of 4 </Text>
                </View>
            </View>

            <View className="flex-1 px-5">
                <View className="flex-row items-center gap-2">

                    {[1, 2, 3, 4].map((step) => (
                        <View
                            key={step}
                            className={`h-1.5 flex-1 rounded-full ${step <= 1
                                ? "bg-accent"
                                : "bg-muted"
                                }`}
                        />
                    ))}

                </View>
                <Text className="mt-4 font-sans-bold text-3xl text-foreground">
                    What's your experience level?
                </Text>

                <Text className="mt-2 font-sans-regular text-base text-foreground/60">
                    We'll use this to personalize your FitTrack experience.
                </Text>


                <View className="mt-8 gap-4">

                    {levels.map((level) => {

                        const selected =
                            data.level === level.value;

                        return (
                            <Pressable
                                key={level.value}
                                onPress={() =>
                                    selectLevel(level.value)
                                }
                                className={`rounded-2xl border p-5 ${selected
                                    ? "border-primary bg-muted"
                                    : "border-foreground/10 bg-card"
                                    }`}
                            >
                                <Text className="font-sans-semibold text-lg text-foreground">
                                    {level.title}
                                </Text>

                                <Text className="mt-1 font-sans-regular text-sm text-foreground/60">
                                    {level.description}
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
    );
}