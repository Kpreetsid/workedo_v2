declare module "react-native-calendar-picker" {
  import { Component } from "react";
  import { ViewStyle, TextStyle } from "react-native";
  import { Moment } from "moment";

  interface CalendarPickerProps {
    startFromMonday?: boolean;
    allowRangeSelection?: boolean;

    minDate?: Date | Moment;
    maxDate?: Date | Moment;

    selectedStartDate?: Date | Moment;
    selectedEndDate?: Date | Moment;

    todayBackgroundColor?: string;
    selectedDayColor?: string;
    selectedDayTextColor?: string;

    onDateChange?: (
      date: Moment,
      type: "START_DATE" | "END_DATE"
    ) => void;

    textStyle?: TextStyle;
    selectedDayStyle?: ViewStyle;
    width?: number;
  }

  export default class CalendarPicker extends Component<CalendarPickerProps> {}
}
