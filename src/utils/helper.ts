
// 2) formatter for the API shape you showed
export const formatGraphData = (arr: any[]) => {
    return arr.map((item) => ({
        axis: item.axis,

        // 🔴 KEEP THE UNIT
        unit: item.unit ?? "",

        points: item.data.map(([ts, amp, flag]: [number, number, boolean]) => {
            const date = new Date(ts * 1000);
            const timestamp = date.toLocaleString("en-GB");

            return {
                value: amp,
                flag: flag,
                label: date.toLocaleTimeString("en-GB", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
                fullDate: timestamp,
                timestamp,
                rawTimestamp: ts,
            };
        }),
    }));
};
