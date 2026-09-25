import { icons } from "@/constants/icons";
import { Image, Text, View } from "react-native";




interface VolumeChangeProps {
    volumeChangePercent: number | null;
}



const VolumeChange =({ volumeChangePercent }: VolumeChangeProps) =>  {
    const isPositive = volumeChangePercent !== null && volumeChangePercent > 0;
    const isNegative = volumeChangePercent !== null && volumeChangePercent < 0;

    const formattedPercent = volumeChangePercent !== null ? Math.abs(volumeChangePercent).toFixed(0) : "0";

    return (
        <View className={`flex-row items-center gap-1 
        ${isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-primary'}
        ${isPositive ? 'bg-success/20' : isNegative ? 'bg-destructive/20' : 'bg-faded/20'}
        rounded-full px-2 py-1`}>
            {isPositive && <Image source={icons.progressSuccess} className="w-3 h-3" />}
            {isNegative && <Image source={icons.progressDestructive} className="w-3 h-3" />}
            <Text className="text-sm font-sans-bold">
                {formattedPercent}%
            </Text>
        </View>

        
    )
}

export default VolumeChange;