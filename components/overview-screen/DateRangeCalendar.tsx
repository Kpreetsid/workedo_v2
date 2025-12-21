import { Calendar } from "react-native-calendars";
import React, { useState } from "react";
import { View, ToastAndroid } from "react-native";
import { useDateRangeStore } from "@/src/store/useDateRangeStore";
import Header from "../global/Header";
import ActionButton from "../auth-screens/ActionButton";

export default function DateRangeCalendar({ onClose }: any) {
  const { setRange } = useDateRangeStore();

  // UI STATE (YYYY-MM-DD ONLY)
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // -----------------------------
  // Day selection logic
  // -----------------------------
  const onDayPress = (day: any) => {
    const selected = day.dateString; // YYYY-MM-DD

    // start fresh
    if (!startDate || endDate) {
      setStartDate(selected);
      setEndDate(null);
      return;
    }

    // prevent backward range
    if (selected < startDate) {
      setStartDate(selected);
      setEndDate(null);
      return;
    }

    setEndDate(selected);
  };

  // -----------------------------
  // Calendar markings
  // -----------------------------
  const getMarkedDates = () => {
    if (!startDate) return {};

    const marked: any = {};

    marked[startDate] = {
      startingDay: true,
      color: "#34B8C0",
      textColor: "white",
    };

    if (endDate) {
      marked[endDate] = {
        endingDay: true,
        color: "#34B8C0",
        textColor: "white",
      };

      // fill range
      let current = new Date(startDate);
      const end = new Date(endDate);

      current.setDate(current.getDate() + 1);

      while (current < end) {
        const date = current.toISOString().split("T")[0];
        marked[date] = {
          color: "#BEECEF",
          textColor: "#000",
        };
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const onDone = () => {
    if (!startDate) {
      ToastAndroid.show("Please select Start Date", ToastAndroid.SHORT);
      return;
    }

    if (!endDate) {
      ToastAndroid.show("Please select End Date", ToastAndroid.SHORT);
      return;
    }

    // Convert to ISO Date objects for store / API
    const startISO = new Date(`${startDate}T00:00:00.000Z`);
    const endISO = new Date(`${endDate}T23:59:59.999Z`);

    console.log('start = ', startDate, startISO)
    console.log('end = ', endDate, endISO)

    setRange(startDate, endDate);
    onClose();
  };

  return (
    <>
      <Header
        title="Select Dates"
        showBack={false}
        showClose
        modal
        dismiss={onClose}
      />

      <View style={{ padding: 16 }}>
        <Calendar
          markingType="period"
          markedDates={getMarkedDates()}
          onDayPress={onDayPress}
        />

        <View style={{ marginTop: 32 }} />

        <ActionButton
          label="Submit"
          onPress={onDone}
          style={{ width: "90%", alignSelf: "center" }}
        />
      </View>
    </>
  );
}
