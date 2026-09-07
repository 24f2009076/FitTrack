import { router } from "expo-router";
import { styled } from "nativewind";
import {
    Pressable,
    Text,
    View,
} from "react-native";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
 
const SafeAreaView = styled(RNSafeAreaView);


export default function WelcomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 justify-between p-6">

                <View className="flex-1 justify-center">
                    <Text className="text-5xl font-bold text-foreground">
                        FitTrack
                    </Text>

                    <Text className="mt-4 text-lg text-foreground/70">
                        Train. Track. Level Up.
                    </Text>
                </View>


                <View className="gap-4">

                    <Pressable
                        className="rounded-2xl bg-primary p-4"
                        onPress={() =>
                            router.push("/(auth)/sign-in")
                        }
                    >
                        <Text className="text-center text-lg font-semibold text-background">
                            Sign In
                        </Text>
                    </Pressable>


                    <Pressable
                        className="rounded-2xl border border-primary p-4"
                        onPress={() =>
                            router.push("/(auth)/sign-up")
                        }
                    >
                        <Text className="text-center text-lg font-semibold text-primary">
                            Create Account
                        </Text>
                    </Pressable>

                </View>

            </View>
        </SafeAreaView>
    );
}