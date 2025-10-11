export interface HealthBreakupItem {
    name: string;   // e.g. "Critical", "Danger", "Alert", etc.
    value: number;  // percentage or count
}

export interface AssetHealthSummary {
    org_id: string;

    // individual health state counts
    Critical: number;
    Danger: number;
    Alert: number;
    Healthy: number;
    "Not Defined": number;

    // detailed breakdown
    health_breakup_percentage: HealthBreakupItem[];

    // overall stats
    total_live_sensors: number;
    openAlarms: number;
}
