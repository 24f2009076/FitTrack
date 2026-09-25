// context/OnboardingContext.tsx

import {
    createContext,
    ReactNode,
    useContext,
    useState,
} from "react";

export type FitnessLevel =
    | "beginner"
    | "intermediate"
    | "advanced";

export type FitnessGoal =
    | "build_muscle"
    | "gain_strength"
    | "lose_fat"
    | "general_fitness";


interface OnboardingData {
    level: FitnessLevel | null;
    goal: FitnessGoal | null;
    height: string;
    weight: string;
    username: string;
    profileImage: string | null;
}


interface OnboardingContextType {
    data: OnboardingData;

    updateData: (
        values: Partial<OnboardingData>
    ) => void;

    resetOnboarding: () => void;
}


const defaultData: OnboardingData = {
    level: null,
    goal: null,
    height: "",
    weight: "",
    username: "",
    profileImage: null,
};


const OnboardingContext =
    createContext<OnboardingContextType | undefined>(
        undefined
    );


export function OnboardingProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [data, setData] =
        useState<OnboardingData>(defaultData);


    function updateData(
        values: Partial<OnboardingData>
    ) {
        setData((previous) => ({
            ...previous,
            ...values,
        }));
    }


    function resetOnboarding() {
        setData(defaultData);
    }


    return (
        <OnboardingContext.Provider
            value={{
                data,
                updateData,
                resetOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}


export function useOnboarding() {
    const context = useContext(OnboardingContext);

    if (!context) {
        throw new Error(
            "useOnboarding must be used inside OnboardingProvider"
        );
    }

    return context;
}