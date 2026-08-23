// components/Dropdown.tsx
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

type DropdownProps = {
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
};

export default function Dropdown({
  options,
  value,
  onSelect,
  placeholder = "Select an option",
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setOpen(true)}
        className="border border-solid rounded-xl px-4 py-3 flex-row justify-between items-center bg-muted"
      >
        <Text className={`text-lg font-sans-bold text-muted-foreground ${value ? "text-primary" : ""}`}>
          {value ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#9CA3AF" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/60 justify-center px-6"
          onPress={() => setOpen(false)}
        >
          <View className="bg-muted rounded-2xl max-h-100 overflow-hidden shadow-lg">
            <FlatList
                showsVerticalScrollIndicator={false}
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className={`px-4 py-3 flex-row justify-center items-center ${item === value ? "bg-accent/20" : ""}`}
                >
                  <Text className={`text-primary text-lg font-sans-bold`}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}