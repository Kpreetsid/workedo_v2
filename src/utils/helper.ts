
// 2) formatter for the API shape you showed
export const formatGraphData = (arr: any[]) => {
    return arr.map((item) => ({
        axis: item.axis,
        points: item.data.map(([ts, amp]: [number, number]) => {
            const date = new Date(ts * 1000);

            return {
                value: amp,
                label: date.toLocaleTimeString("en-GB", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
                fullDate: date.toLocaleString("en-GB"), // add this if you want full date
            };
        }),
    }));
};