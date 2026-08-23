// app/routine/[day].tsx
import Dropdown from "@/components/DropDown";
import { searchExercises } from "@/constants/data";
import { icons } from "@/constants/icons";
import { router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { DayKey, useRoutineStore } from "../../../store/routineStore";

const SafeAreaView = styled(RNSafeAreaView);



export default function DayInputForm() {
  const { day } = useLocalSearchParams<{ day: DayKey }>();
  const dayData = useRoutineStore((s) => s.days[day]);
  const updateDay = useRoutineStore((s) => s.updateDay);

  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const feasibleExercises = searchExercises(query, muscleGroup ?? "All");
  const selectedExercises = dayData?.exercises ?? [];

  const [newExerciseName, setNewExerciseName] = useState<string>("");
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState<string | null>(null);


  const handleGroupChange = (group: string) => {
    setMuscleGroup(group === "All" ? null : group);
  };

  const toggleExercise = (exercise: Exercise) => {
    const exercises = selectedExercises.some(({ name }) => name === exercise.name)
      ? selectedExercises.filter(({ name }) => name !== exercise.name)
      : [...selectedExercises, exercise];

    updateDay(day, { exercises });
  };

  const addNewExercise = () => {
    const name = newExerciseName.trim();
    if (!name || !newExerciseMuscleGroup || selectedExercises.some((exercise) => exercise.name === name)) return;

    updateDay(day, {
      exercises: [...selectedExercises, { name: name, muscleGroup: newExerciseMuscleGroup }],
    });
    feasibleExercises.push({ name: name, muscleGroup: newExerciseMuscleGroup });
    setNewExerciseName("");
    setNewExerciseMuscleGroup(null);
  };

  const handleSave = () => {
    const muscleGroups = [...new Set(selectedExercises.map((exercise) => exercise.muscleGroup).filter(Boolean))];
    const isRestDay = selectedExercises.length === 0;

    updateDay(day, {
      configured: true,
      isRestDay,
      title: isRestDay ? undefined : muscleGroups.join(" + "),
    });
    router.back();
  };

  return (

    <SafeAreaView className="flex-1 bg-background">

      <View className="home-navbar px-5">
        <Pressable onPress={() => router.back()} className="size-6 items-center absolute">
          <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
        </Pressable>
        <View className="tab-header">
          <Text className="text-2xl font-sans-bold uppercase"> {day} </Text>
        </View>
      </View>

      <View className="flex-1 px-6">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises..."
          placeholderTextColor=""
          className="w-full rounded-lg border border-primary px-0 pl-3 pr-3 py-3 text-lg font-sans-bold text-accent"
        />

        <View className="flex-row flex-wrap items-start gap-2 mt-3 bg-background/10">
          {["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs"].map((group) => (
            <Pressable
              key={group}
              onPress={() => handleGroupChange(group)}
              className={`muscle-group-chip ${(muscleGroup ?? "All") === group ? "selected-muscle-group-chip" : ""}`}
            >
              <Text>{group}</Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={feasibleExercises}
          keyExtractor={(exercise) => exercise.name}
          className="mt-3 flex-1"
          renderItem={({ item: exercise }) => (
            <Pressable
              onPress={() => toggleExercise(exercise)}
              className={`rounded-lg my-1 py-5 px-3 flex-row justify-start items-center gap-4 border ${selectedExercises.some(({ name }) => name === exercise.name)
                ? "bg-accent/20 border-accent"
                : "bg-muted border-transparent"
                }`}
            >
              <Text className={`font-sans-bold text-xl ${selectedExercises.some(({ name }) => name === exercise.name) ? "text-accent" : "text-primary"}`}>
                {exercise.name}
              </Text>
              <Text className={`text-sm rounded-full font-sans-bold px-2 py-1 bg-background border ${selectedExercises.some(({ name }) => name === exercise.name) ? " border border-accent text-accent " : "text-primary border-transparent"}`}>
                {exercise.muscleGroup}
              </Text>
              <Image
                source={selectedExercises.some(({ name }) => name === exercise.name) ? icons.squarePlusSolid : icons.squarePlusRegular}
                className="size-8 absolute right-3"
              />
            </Pressable>
          )}
          ListFooterComponent={
            <View className="bg-muted border border-dashed border-accent rounded-lg my-1 py-5 px-3 flex-col  gap-4">
              <TextInput
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                placeholder="Add a new exercise..."
                placeholderTextColor="rgba(0, 0, 0, 0.6)"
                className="w-full rounded-lg border border-solid border-primary px-0 pl-3 pr-3 py-3 text-lg font-sans-bold text-accent"
              />

              <Dropdown
                options={["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps"]}
                value={newExerciseMuscleGroup}
                onSelect={setNewExerciseMuscleGroup}
                placeholder="Select muscle group"
              />

              <Pressable 
                onPress={addNewExercise}
                className="flex-row items-center justify-center gap-2 bg-accent/20 border border-solid border-accent rounded-lg py-3">
                <Image source={icons.plusAccent} className="size-6 items-center" />
                <Text className="font-sans-bold text-accent text-lg">Add</Text>
              </Pressable>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />


        <Pressable
          onPress={handleSave}
          className="bg-indigo-400 rounded-xl py-4 items-center mt-4">
          <Text className="font-sans-semibold text-white text-xl">{selectedExercises.length ? ` Save ${selectedExercises.length} exercises` : "Rest Day"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>

  );
}