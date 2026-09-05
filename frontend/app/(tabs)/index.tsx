import Badge from "@/components/Badge";
import WeeklyChart from "@/components/WeeklyChart";
import { date, USER } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import "@/global.css";
import { formatDate, formatTime } from "@/lib/utils";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
 
const SafeAreaView = styled(RNSafeAreaView);

interface Profile {
  id: string;
  username: string;
  level: string;
  height: number | null;
  weight: number | null;
  goal: string | null;
  profile_pic_url: string | null;
}

export default function App() {

  const { signOut, session } = useAuth();
  const [profile, setProfile] = useState<null | Profile>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/auth/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch profile: " + response.status);
        }

        const data = await response.json();
        setProfile(data);
      } catch(error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [session]);

  return (
    <SafeAreaView className="flex-1 bg-background">
    
      <View className="home-navbar px-5 flex">
        <View className="home-user">


          <Image source={
            profile?.profile_pic_url
              ? {
                uri: profile.profile_pic_url
              } 
              : images.avatar
          } className="home-avatar" />


          <Text className="home-user-name flex-1"> {profile?.username} </Text>
          <Pressable onPress={signOut}>
            <Image source={icons.logout} className="size-6" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
      className="flex-1 px-5" 
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-20">
      <View className="home-date-text">
        <Text className="text-date">
          {formatDate(date.day, date.date)}
        </Text>
      </View>

      <View className="home-title">
        <Text className="text-title"> 
          Good Evening, {profile?.username ?? "User"}  
        </Text>
      </View>

      <View className="flex-row items-center space-x-2 mb-7">
        <Badge text={profile?.level ?? "Beginner"} icon={icons.levelBadge} />
        <Badge text={`${USER.streak} day streak`} icon={icons.streakBadge} />
      </View>

      {/* *** HOME WORKOUT CARD *** */}
      <View className="home-card">
        <Text className="workout-card-title">TODAY'S WORKOUT</Text>
        <Text className="workout-card-name">{USER.workout.groups.join(' + ')}</Text>

        <View className="flex-row justify-start">
          <View className="workout-detail">
            <Image source={icons.exercises} className="workout-detail-icon" />
            <Text className="workout-detail-text">{USER.workout.exercises.length} exercises</Text>
          </View>
          <View className="workout-detail">
            <Image source={icons.reps} className="workout-detail-icon" />
            <Text className="workout-detail-text">{USER.workout.exercises.length * 3} sets</Text>
          </View>
          <View className="workout-detail">
            <Image source={icons.duration} className="workout-detail-icon" />
            <Text className="workout-detail-text">{formatTime(USER.workout.duration)}</Text>
          </View>
        </View>

        <View>
          <Pressable className="workout-start-button">
            <Text className="text-2xl font-sans-bold text-white">Start</Text>
          </Pressable>
        </View>

      </View>


      {/* *** RECENT PERSONAL BEST CARD *** */}
      <View className="home-card flex-row items-center justify-between">
        <View className="pr-icon">
          <Image source={icons.trophy} className="size-10" />
        </View>
        <View className="pr-text">
          <Text className="text-xl font-sans-bold text-primary" numberOfLines={1}>
            Recent Personal Best
          </Text>
          <Text className="text-lg font-sans-regular text-primary/80">Bench Press - 100kg</Text>
          <Text className="text-md font-sans-regular text-primary/80"> x8 </Text>
        </View>
      </View>


      {/* *** WEEKLY CHART *** */}
      <View className="home-card">
        <Text className="weekly-chart-title">Weekly Progress</Text>
        <WeeklyChart weeklyStats={USER.weekly_stats} />
      </View>


      {/* *** COACH INSIGHT *** */}
      <View className="home-card-insight">
        <Text className="text-xl font-sans-extrabold text-white px-2">Coach Insight</Text>
        <Text className="text-2xl font-sans-bold text-white/80 mt-2 px-2">
          "Great job on your workouts this week! Keep up the momentum and aim for a new personal best next week."
        </Text>
      </View>


    </ScrollView>
    </SafeAreaView>
  );
}