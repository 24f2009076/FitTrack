// app/routine/[day].tsx
import Dropdown from "@/components/DropDown";
import { icons } from "@/constants/icons";
import { getExercises } from "@/services/exerciseService";
import { router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { DayKey, useRoutineStore } from "../../../store/routineStore";

const SafeAreaView = styled(RNSafeAreaView);

const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;
const MIN_SETS = 1;
const MIN_REPS = 1;
// const MUSCLE_GROUPS = ["All", "Chest", "Shoulders", "Biceps", "Triceps", "Legs", "Back"];





export default function DayInputForm() {




  const { day } = useLocalSearchParams<{ day: DayKey }>();
  const dayData = useRoutineStore((s) => s.days[day]);
  const updateDay = useRoutineStore((s) => s.updateDay);

  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  const [exercises, setExercises] = useState<ExerciseItem[]>([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, []);



  const feasibleExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(query.toLowerCase());


    const matchesMuscle =
      muscleGroup === null ||
      exercise.muscleGroup === muscleGroup;


    return matchesSearch && matchesMuscle;
  })

  const selectedExercises = dayData?.exercises ?? [];

  const [newExerciseName, setNewExerciseName] = useState<string>("");
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState<string | null>(null);
  const [newExerciseSets, setNewExerciseSets] = useState<number>(DEFAULT_SETS);
  const [newExerciseReps, setNewExerciseReps] = useState<number>(DEFAULT_REPS);

  const MUSCLE_GROUPS = [
    "All",
    ...new Set(exercises.map((exercise) => exercise.muscleGroup)),
  ];

  const handleGroupChange = (group: string) => {
    setMuscleGroup(group === "All" ? null : group);
  };

  const normalizeExercise = (
    exercise: ExerciseItem
  ): RoutineExercise => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets: DEFAULT_SETS,
    reps: DEFAULT_REPS,
  });

  const toggleExercise = (exercise: ExerciseItem) => {
    const exercises = selectedExercises.some(
      (selected) => selected.id === exercise.id
    )
      ? selectedExercises.filter(
        (selected) => selected.id !== exercise.id
      )
      : [...selectedExercises, normalizeExercise(exercise)];

    updateDay(day, { exercises });
  };
  const updateExerciseCounter = (id: string, field: "sets" | "reps", delta: number) => {
    const min = field === "sets" ? MIN_SETS : MIN_REPS;

    const exercises = selectedExercises.map((exercise) => {
      if (exercise.id !== id) return exercise;

      const nextValue = exercise[field] + delta;
      return {
        ...exercise,
        [field]: Math.max(
          field === "sets" ? MIN_SETS : MIN_REPS,
          nextValue
        ),
      };
    });

    updateDay(day, { exercises });
  };

  const addNewExercise = () => {
    const name = newExerciseName.trim();
    if (!name || !newExerciseMuscleGroup || selectedExercises.some((exercise) => exercise.name === name)) return;

    updateDay(day, {
      exercises: [...selectedExercises, { id: `custom-${Date.now()}`, name: name, muscleGroup: newExerciseMuscleGroup, sets: newExerciseSets, reps: newExerciseReps }],
    });
    setNewExerciseName("");
    setNewExerciseMuscleGroup(null);
    setNewExerciseSets(DEFAULT_SETS);
    setNewExerciseReps(DEFAULT_REPS);
  };

  const handleSave = () => {
    const normalizedExercises = selectedExercises.map(normalizeExercise);
    const muscleGroups = [...new Set(normalizedExercises.map((exercise) => exercise.muscleGroup).filter(Boolean))];
    const isRestDay = normalizedExercises.length === 0;

    updateDay(day, {
      exercises: normalizedExercises,
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

      <View className="flex-1 px-6 bg-background/10">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises..."
          placeholderTextColor=""
          className="w-full rounded-lg border border-primary px-0 pl-3 pr-3 py-3 text-lg font-sans-bold text-accent"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 grow-0"
          contentContainerClassName="flex-row items-center gap-2">
          {MUSCLE_GROUPS.map((group) => (
            <Pressable
              key={group}
              onPress={() => handleGroupChange(group)}
              className={`muscle-group-chip ${(muscleGroup ?? "All") === group ? "selected-muscle-group-chip" : ""}`}
            >
              <Text>{group}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <FlatList
          data={feasibleExercises}
          keyExtractor={(exercise) => exercise.id}
          className="mt-3 flex-1"
          renderItem={({ item: exercise }) => {
            const selectedExercise = selectedExercises.find(
              ({ id }) => id === exercise.id
            );
            const isSelected = Boolean(selectedExercise);

            return <View className="mb-2">
              <Pressable
                onPress={() => toggleExercise(exercise)}
                className={`rounded-lg py-5 px-3 flex-row flex-wrap justify-start items-center gap-4 border ${isSelected
                  ? "bg-accent/20 border-accent"
                  : "bg-muted border-transparent"
                  }`}
              >
                <Text className={`font-sans-bold text-xl ${isSelected ? "text-accent" : "text-primary"}`}>
                  {exercise.name}
                </Text>
                <Text className={`text-sm rounded-full font-sans-bold px-2 py-1 bg-background border ${isSelected ? " border border-accent text-accent " : "text-primary border-transparent"}`}>
                  {exercise.muscleGroup}
                </Text>
                <Image
                  source={isSelected ? icons.squarePlusSolid : icons.squarePlusRegular}
                  className="size-8 absolute right-3"
                />
              </Pressable>

              {isSelected && selectedExercise && (
                <View className="px-2 pb-3 bg-muted rounded-b-2xl shadow-sm">
                  <View className="flex-row items-center justify-between py-1">
                    <Text className="font-sans-semibold text-primary">Sets</Text>
                    <View className="flex-row items-center gap-1 w-30 justify-around">
                      <Pressable
                        onPress={() => updateExerciseCounter(exercise.id, "sets", -1)}
                        className="size-8 items-center justify-center"
                      >
                        <Text className="font-sans-bold text-accent text-lg">-</Text>
                      </Pressable>
                      <Text className="font-sans-bold text-accent text-lg px-3">{selectedExercise.sets}</Text>
                      <Pressable
                        onPress={() => updateExerciseCounter(exercise.id, "sets", 1)}
                        className="size-8 items-center justify-center"
                      >
                        <Text className="font-sans-bold text-accent text-lg">+</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between py-1">
                    <Text className="font-sans-semibold text-primary">Reps</Text>
                    <View className="flex-row items-center gap-1 w-30 justify-around">
                      <Pressable
                        onPress={() => updateExerciseCounter(exercise.name, "reps", -1)}
                        className="size-8 items-center justify-center"
                      >
                        <Text className="font-sans-bold text-accent text-lg">-</Text>
                      </Pressable>
                      <Text className="font-sans-bold text-accent text-lg px-3">{selectedExercise.reps}</Text>
                      <Pressable
                        onPress={() => updateExerciseCounter(exercise.name, "reps", 1)}
                        className="size-8 items-center justify-center"
                      >
                        <Text className="font-sans-bold text-accent text-lg">+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>)}


            </View>
          }}
          ListFooterComponent={
            <View className="bg-muted border border-dashed border-accent rounded-lg my-1 py-5 px-3 flex-col gap-4">
              <TextInput
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                placeholder="Add a new exercise..."
                placeholderTextColor="rgba(0, 0, 0, 0.6)"
                className="w-full rounded-lg border border-solid border-primary px-0 pl-3 pr-3 py-3 text-lg font-sans-bold text-accent"
              />

              <Dropdown
                options={MUSCLE_GROUPS.filter((group) => group !== "All")}
                value={newExerciseMuscleGroup}
                onSelect={setNewExerciseMuscleGroup}
                placeholder="Select muscle group"
              />

              <View className="flex-row items-center justify-between ">
                <Text className="font-sans-semibold text-primary">Sets</Text>
                <View className="flex-row items-center gap-1 w-30 justify-around">
                  <Pressable
                    onPress={() => setNewExerciseSets((prev) => Math.max(MIN_SETS, prev - 1))}
                    className="size-8 items-center justify-center"
                  >
                    <Text className="font-sans-bold text-accent text-lg">-</Text>
                  </Pressable>
                  <Text className="font-sans-bold text-accent text-lg px-3">{newExerciseSets}</Text>
                  <Pressable
                    onPress={() => setNewExerciseSets((prev) => prev + 1)}
                    className="size-8 items-center justify-center"
                  >
                    <Text className="font-sans-bold text-accent text-lg">+</Text>
                  </Pressable>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="font-sans-semibold text-primary">Reps</Text>
                <View className="flex-row items-center gap-1 w-30 justify-around">
                  <Pressable
                    onPress={() => setNewExerciseReps((prev) => Math.max(MIN_REPS, prev - 1))}
                    className="size-8 items-center justify-center"
                  >
                    <Text className="font-sans-bold text-accent text-lg">-</Text>
                  </Pressable>
                  <Text className="font-sans-bold text-accent text-lg px-3">{newExerciseReps}</Text>
                  <Pressable
                    onPress={() => setNewExerciseReps((prev) => prev + 1)}
                    className="size-8 items-center justify-center"
                  >
                    <Text className="font-sans-bold text-accent text-lg">+</Text>
                  </Pressable>
                </View>
              </View>

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