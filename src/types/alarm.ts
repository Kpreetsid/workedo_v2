export interface AlarmItem {
  addressed: boolean;
  asset_id: string;
  asset_name?: string;
  axis: string;
  composite: string;
  id: number;
  observed_value: number;
  priority: string;
  sensor_location: string;
  signal_type: string;
  threshold_value: number;
  timestamp: string;
  trend_type: string;
  timestamp_for_trend: number;
}