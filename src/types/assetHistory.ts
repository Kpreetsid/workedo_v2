// Health breakup item (unchanged)
export interface HealthBreakupItem {
    name: string;   // "Critical", "Danger", "Alert", etc.
    value: number;  // percentage or count
}

// Single asset health object (used everywhere internally)
export interface AssetHealthStats {
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

// API response shape (NEW)
export interface AssetHealthSummary {
    top_level_asset: AssetHealthStats;
    electric_asset: AssetHealthStats;
    non_electric_asset: AssetHealthStats;
}
