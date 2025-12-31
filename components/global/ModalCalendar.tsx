import { Modal, Pressable, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Calendar } from "react-native-calendars";
import Header from "./Header";
import moment from "moment";
import ActionButton from "../auth-screens/ActionButton";

interface ModalCalendarProps {
	showCalendar: boolean;
	setShowCalendar: (value: boolean) => void;
	onSelectDate: (date: string) => void;
	activeDateField: "start_date" | "end_date";
	startDate?: string | null;
}

const ModalCalendar = ({
	showCalendar,
	setShowCalendar,
	onSelectDate,
	activeDateField,
	startDate
}: ModalCalendarProps) => {
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	const onDayPress = (day: any) => {
		setSelectedDate(day.dateString);
	};

	const onDone = () => {
		if (!selectedDate) return;

		onSelectDate(selectedDate);
		setShowCalendar(false);
	};

	// 🔑 THIS IS THE ONLY DATE LOGIC YOU NEED
	const minDate =
		activeDateField === "start_date"
			? moment().format("YYYY-MM-DD")        // disable past only
			: startDate ?? moment().format("YYYY-MM-DD"); // disable before start date

	return (
		<Modal visible={showCalendar} transparent animationType="slide">
			<Pressable
				style={styles.overlay}
				onPress={() => setShowCalendar(false)}
			/>

			<View style={styles.sheet}>
				<Header
					title="Select Date"
					showBack={false}
					showClose
					modal
					dismiss={() => setShowCalendar(false)}
				/>

				<View style={{ padding: 16 }}>
					<Calendar
						onDayPress={onDayPress}
						minDate={minDate}
						markedDates={
							selectedDate
								? {
									[selectedDate]: {
										selected: true,
										selectedColor: "#24b7d8",
									},
								}
								: {}
						}
					/>

					<View style={{ marginTop: 32 }} />

					<ActionButton
						label="Submit"
						onPress={onDone}
						style={{ width: "90%", alignSelf: "center" }}
					/>
				</View>
			</View>
		</Modal>
	);
};

export default ModalCalendar;

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	sheet: {
		height: "70%",
		backgroundColor: "#fff",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
	},
});
