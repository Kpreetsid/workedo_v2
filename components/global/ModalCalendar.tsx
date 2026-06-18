import { Modal, Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import Header from "./Header";
import moment from "moment";
import ActionButton from "../auth-screens/ActionButton";

interface ModalCalendarProps {
	showCalendar: boolean;
	setShowCalendar: (value: boolean) => void;
	onSelectDate: (date: string) => void;
	activeDateField: "start_date" | "end_date" | "work_date";
	startDate?: string | null;
	currentDate?: string | null;
}

const ModalCalendar = ({
	showCalendar,
	setShowCalendar,
	onSelectDate,
	activeDateField,
	startDate,
	currentDate,
}: ModalCalendarProps) => {
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	const normalizedCurrentDate =
		currentDate && moment(currentDate, "YYYY-MM-DD", true).isValid()
			? moment(currentDate, "YYYY-MM-DD").format("YYYY-MM-DD")
			: null;
	const fallbackCurrentDate = moment().format("YYYY-MM-DD");

	useEffect(() => {
		if (!showCalendar) return;

		setSelectedDate(normalizedCurrentDate);
	}, [showCalendar, normalizedCurrentDate, activeDateField]);

	const onDayPress = (day: any) => {
		setSelectedDate(day.dateString);
	};

	const onDone = () => {
		const dateToUse = selectedDate || normalizedCurrentDate;
		if (!dateToUse) return;

		onSelectDate(dateToUse);
		setShowCalendar(false);
	};

	// 🔑 THIS IS THE ONLY DATE LOGIC YOU NEED
	const minDate =
		activeDateField === "start_date"
			? moment().format("YYYY-MM-DD")
			: activeDateField === "end_date"
				? startDate ?? moment().format("YYYY-MM-DD")
				: undefined;

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
						current={selectedDate || normalizedCurrentDate || fallbackCurrentDate}
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
