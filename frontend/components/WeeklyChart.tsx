import { formatWeeklyStats } from "@/lib/utils";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const WeeklyChart = ({ weeklyStats }: { weeklyStats: WeeklyStats }) => {
    const data = formatWeeklyStats(weeklyStats);
    return <View className="flex-row justify-center w-100">
        <BarChart
            data={data}
            height={120}
            barWidth={35}
            spacing={5}

            /* Bars */
            roundedTop={true}


            /* Background / axes */
            hideRules
            hideYAxisText
            xAxisThickness={1}
            yAxisThickness={0}
            barMarginBottom={10}
            barBorderRadius={5}

            /* Labels */
            xAxisLabelTextStyle={{
                color: "#081126",
                fontSize: 12,
            }}


            /* Animation */
            isAnimated
            animationDuration={500}

        />
    </View>
}

export default WeeklyChart;