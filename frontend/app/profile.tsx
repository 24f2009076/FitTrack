import { router } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";


import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { getProfile } from "@/services/profileService";

const SafeAreaView = styled(RNSafeAreaView);






const Profile = () => {

    const { signOut, session } = useAuth();
    const accessToken = session?.accessToken;


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
    const [removeProfileImage, setRemoveProfileImage] = useState(false);

    const loadProfile = async () => {

        if (!accessToken) return;

        try {
            setLoading(true);
            setError("");

            const profile =
                await getProfile(accessToken);

            setUsername(
                profile.username ?? ""
            );

            setHeight(
                profile.height_cm?.toString() ?? ""
            );

            setWeight(
                profile.weight_kg?.toString() ?? ""
            );

            setLevel(
                profile.level ?? ""
            );

            setGoal(
                profile.goal ?? ""
            );

            setProfilePicUrl(
                profile.profile_pic_url
            );

            setNewProfileImage(null);
            setRemoveProfileImage(false);

        } catch (error) {

            if (error instanceof Error) {
                setError(error.message);
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (!accessToken) return;


        loadProfile();
    }, [accessToken]);



    return (
        <SafeAreaView
            className="flex-1 bg-background">

            <View className="home-navbar px-5">
                <Pressable onPress={() => router.back()} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> PROFILE </Text>
                </View>
            </View>

            <View className="profile-section">

                <View className="name-and-pic">
                    <Image source={
                        profilePicUrl
                            ? {
                                uri: profilePicUrl
                            }
                            : images.avatar
                    } className="profile-pic" />

                    <Text className="profile-name"> {username || "User"} </Text>

                    <Pressable
                        onPress={() => router.push("/edit-profile")}
                        className="edit-profile-button">
                        <Text className="edit-profile-button-text"> Edit Profile </Text>
                    </Pressable>
                </View>


                <View className="user-stats">


                    <View className="user-stat-row">
                        <View className="stat">
                            <Text className="stat-header"> Height </Text>
                            <View className="stat-value">
                                <Text className="stat-number"> {height || "-"} </Text>
                                <Text className="stat-unit"> cm </Text>
                            </View>
                        </View>
                        <View className="stat">
                            <Text className="stat-header"> Weight </Text>
                            <View className="stat-value">
                                <Text className="stat-number"> {weight || "-"} </Text>
                                <Text className="stat-unit"> kg </Text>
                            </View>
                        </View>
                    </View>


                    <View className="user-stat-row">
                        <View className="stat">
                            <Text className="stat-header"> Level </Text>
                            <View className="stat-value">
                                <Text className="stat-level"> {level || "Not set"} </Text>
                            </View>
                        </View>
                        <View className="stat">
                            <Text className="stat-header"> Goal </Text>
                            <View className="stat-value">
                                <Text className="stat-level"> {goal || "Not set"} </Text>
                            </View>
                        </View>
                    </View>

                </View>


                <View className="logout-section">
                    <Pressable
                        onPress={() => signOut()}
                        className="logout-button">
                        <Text className="logout-button-text"> Logout </Text>
                    </Pressable>
                </View>


            </View>

        </SafeAreaView>
    )

}




export default Profile;