export function formatDate(day: string, date: string): string {
  const [dayNum, month] = date.split(",")[0].trim().split(" ");
  const shortMonth = month.slice(0, 3);
  return `${day}, ${dayNum} ${shortMonth}`;
}

export function formatTime(time: number): string {
    // Time is given in minutes, so we need to convert it to hours and minutes
    const hours = Math.floor(time / 60);
    const minutes = time % 60;

    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
}

export function formatWeeklyStats(weeklyStats: WeeklyStats) {
    const data = [];
    for (const day in weeklyStats) {
        const { visited, volume } = weeklyStats[day as keyof WeeklyStats];
        data.push({
            value: visited? volume : 50,
            label: day.charAt(0).toUpperCase() + day.slice(1, 1), // First letter of the day
            frontColor: visited ? "#ea7a53af" : "#E0E0E0", // Green if visited, grey if not
        });
    }
    return data;
}