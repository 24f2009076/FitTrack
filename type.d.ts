import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface BadgeProps {
        text: string;
        icon: ImageSourcePropType;
    }

    interface WeeklyStats {
        monday : {
            visited: boolean;
            volume: number;
        }
        tuesday : {
            visited: boolean;
            volume: number;
        }
        wednesday : {
            visited: boolean;
            volume: number;
        }
        thursday : {
            visited: boolean;
            volume: number;
        }
        friday : {
            visited: boolean;
            volume: number;
        }
        saturday : {
            visited: boolean;
            volume: number;
        }
        sunday : {
            visited: boolean;
            volume: number;
        }
    }

    interface Subscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        renewalDate?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }
}

export { };

