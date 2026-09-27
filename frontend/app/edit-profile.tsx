import {
    ImageManipulator,
    SaveFormat
} from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";



import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import {
    getProfile,
    updateProfile,
    uploadProfileImage
} from "@/services/profileService";

const SafeAreaView = styled(RNSafeAreaView);




const EditProfile = () => {

    const { signOut, session } = useAuth();
    const accessToken = session?.accessToken;



    const [username, setUsername] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [level, setLevel] = useState("");
    const [goal, setGoal] = useState("");

    const [editing, setEditing] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [profilePicUrl, setProfilePicUrl] =
        useState<string | null>(null);

    const [newProfileImage, setNewProfileImage] =
        useState<string | null>(null);

    const [removeProfileImage, setRemoveProfileImage] =
        useState(false);

    async function pickImage() {

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

        if (result.canceled) return;

        const selectedImage =
            result.assets[0];

        const context =
            ImageManipulator.manipulate(
                selectedImage.uri
            );

        const renderedImage =
            await context.renderAsync();

        const jpegImage =
            await renderedImage.saveAsync({
                format: SaveFormat.JPEG,
                compress: 0.8,
            });

        setNewProfileImage(
            jpegImage.uri
        );

        setRemoveProfileImage(false);
    }

    function removeImage() {

        setNewProfileImage(null);
        setProfilePicUrl(null);
        setRemoveProfileImage(true);
    }

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

    async function handleSave() {

        if (!session?.accessToken) return;

        if (!username.trim()) {
            setError("Username cannot be empty.");
            return;
        }

        try {

            setSaving(true);
            setError("");

            let updatedProfilePicUrl =
                profilePicUrl;

            if (newProfileImage) {

                const uploadResult =
                    await uploadProfileImage(
                        newProfileImage,
                        session.userId
                    );

                updatedProfilePicUrl =
                    uploadResult.publicUrl;
            }

            if (removeProfileImage) {
                updatedProfilePicUrl = null;
            }

            const updatedProfile =
                await updateProfile(
                    {
                        username:
                            username.trim(),

                        height_cm:
                            height
                                ? Number(height)
                                : null,

                        weight_kg:
                            weight
                                ? Number(weight)
                                : null,

                        profile_pic_url:
                            updatedProfilePicUrl,
                    },
                    session.accessToken
                );

            setUsername(
                updatedProfile.username ?? ""
            );

            setHeight(
                updatedProfile.height_cm?.toString() ?? ""
            );

            setWeight(
                updatedProfile.weight_kg?.toString() ?? ""
            );

            setProfilePicUrl(
                updatedProfile.profile_pic_url
            );

            setNewProfileImage(null);
            setRemoveProfileImage(false);

            setEditing(false);

        } catch (error) {

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to update profile."
                );
            }

        } finally {
            setSaving(false);
        }
    }


    useEffect(() => {
        if (!accessToken) signOut();

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
                    <Text className="text-2xl font-sans-bold"> EDIT PROFILE </Text>
                </View>
            </View>

            <View className="profile-section">

                <View className="name-and-pic">
                    <Pressable
                        onPress={pickImage}
                    >
                        <Image source={
                            newProfileImage
                                ? { uri: newProfileImage }
                                : profilePicUrl
                                    ? { uri: profilePicUrl }
                                    : images.avatar
                        } className="profile-pic" />
                        <View className="edit-icon-container">
                            <Image source={icons.edit} className="edit-icon" />
                        </View>
                    </Pressable>
                    <View className="remove-image-button">
                        <Pressable
                            onPress={removeImage}
                        >
                            <Text
                                className="remove-image-button-text">Remove Image</Text>
                        </Pressable>
                    </View>


                    <View className="flex justify-center items-center rounded-xl border w-full">
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            className="profile-name-input"
                            placeholder="Username"
                        />
                    </View>

                </View>


                <View className="user-stats">


                    <View className="user-stat-row">
                        <View className="input-stat">
                            <Text className="stat-header"> Height </Text>
                            <View className="flex-row justify-between align-baseline flex-1 border rounded-xl px-3">
                                <TextInput
                                    value={height}
                                    onChangeText={setHeight}
                                    className="stat-value-input"
                                    placeholder="Height (cm)"
                                />
                                <Text className="stat-value"> cm </Text>
                            </View>
                        </View>
                    </View>
                    <View className="user-stat-row">
                        <View className="input-stat">
                            <Text className="stat-header"> Weight </Text>
                            <View className="flex-row justify-between align-baseline flex-1 border rounded-xl px-3">
                                <TextInput
                                    value={weight}
                                    onChangeText={setWeight}
                                    className="stat-value-input"
                                    placeholder="Weight (kg)"
                                />
                                <Text className="stat-value"> kg </Text>
                            </View>
                        </View>
                    </View>
                </View>


                <View className="logout-section">
                    <Pressable
                        onPress={handleSave}
                        className="save-button">
                        <Text className="save-button-text"> Save </Text>
                    </Pressable>
                    <Pressable
                        onPress={async () => {
                            await loadProfile();
                            setEditing(false);
                            setError("");
                            router.back();
                        }}
                        className="cancel-button">
                        <Text className="cancel-button-text"> Cancel </Text>
                    </Pressable>
                </View>


            </View>

        </SafeAreaView>
    )

}




export default EditProfile;