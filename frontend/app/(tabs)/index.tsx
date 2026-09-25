import Badge from "@/components/Badge";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import "@/global.css";
import { formatDate, formatTime } from "@/lib/utils";
import { getHomeData } from "@/services/homeService";
import { HomeResponse } from "@/types/home";
import { router, useFocusEffect } from "expo-router";
import { styled } from "nativewind";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";


const SafeAreaView = styled(RNSafeAreaView);



export default function App() {

  const { signOut, session } = useAuth();

  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const accessToken = session?.accessToken;




  const date = {
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }

  useFocusEffect(
    useCallback(() => {

      if (!accessToken) {
        signOut();
        return;
      }

      const fetchHome = async () => {
        try {

          setLoading(true);

          const data = await getHomeData(
            accessToken
          );

          setHomeData(data);

        } catch (error) {

          console.error(
            "Error fetching home data:",
            error
          );

        } finally {

          setLoading(false);

        }
      };

      fetchHome();

    }, [accessToken])
  );

  const profile = homeData?.profile;
  const workout = homeData?.workout;
  const totalSets =
    workout?.exercises.reduce(
      (total, exercise) =>
        total + exercise.planned_sets,
      0
    ) ?? 0;



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
          <Badge
            text={`${homeData?.streak ?? 0} day streak`}
            icon={icons.streakBadge}
          />
        </View>

        {/* *** HOME WORKOUT CARD *** */}
        <View className="home-card">
          <Text className="workout-card-title">TODAY'S WORKOUT</Text>
          <Text className="workout-card-name">
            {workout?.groups?.length
              ? workout.groups.join(" + ")
              : workout?.is_rest_day
                ? "Rest Day"
                : "No Workout"}
          </Text>

          <View className="flex-row justify-start">
            <View className="workout-detail">
              <Image source={icons.exercises} className="workout-detail-icon" />
              <Text className="workout-detail-text">{workout?.exercises.length ?? 0} exercises</Text>
            </View>
            <View className="workout-detail">
              <Image source={icons.reps} className="workout-detail-icon" />
              <Text className="workout-detail-text">{totalSets} sets</Text>
            </View>
            <View className="workout-detail">
              <Image source={icons.duration} className="workout-detail-icon" />
              <Text className="workout-detail-text">{formatTime(workout?.duration ?? 0)}</Text>
            </View>
          </View>

          {workout && !workout.is_rest_day && workout.routine_day_id && (
            <View>
              <Pressable 
                onPress={() => router.push('/(tabs)/workout')}
                className="workout-start-button">
                <Text className="text-2xl font-sans-bold text-white">
                  Start
                </Text>
              </Pressable>
            </View>
          )}

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
          <View className="progress-chart">
            <BarChart
              data={(homeData?.weekly_volume ?? [])?.map((item, index) => {
                return {
                  frontColor: item.volume_kg > 0 ? "#ea7a53af" : "#cccccc",
                  value: item.volume_kg > 0 ? item.volume_kg : 100,
                  label: `W ${index + 1}`
                }
              })}
              barWidth={37}
              spacing={20}
              noOfSections={3}
              roundedTop={true}
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              disableScroll

            />
          </View>
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