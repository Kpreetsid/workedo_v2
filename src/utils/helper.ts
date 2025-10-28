
// 2) formatter for the API shape you showed
export const formatGraphData = (arr: any[]) => {
    return arr.map((item) => ({
        axis: item.axis, // Horizontal / Vertical / Axial
        points: item.data.map(([ts, amp]: [number, number]) => ({
            value: amp,
            label: new Date(ts).toLocaleTimeString("en-GB", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
        })),
    }));
};