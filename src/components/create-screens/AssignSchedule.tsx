import { Text, View, StyleSheet } from "react-native";
import RadioGroup, { RadioOption } from "@/src/components/create-screens/RadioGroup";
import Fonts from "@/constants/Typography";
import { usePreventiveStore } from "@/src/state/workOrders/usePreventiveStore";

const SCHEDULE_OPTIONS: RadioOption[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const ASSIGN_OPTIONS: RadioOption[] = [
  { label: "User", value: "user" },
];

export default function AssignSchedule() {
  const { setPreventiveValue } = usePreventiveStore();
  const assign_to = usePreventiveStore((s) => s.assign_to);
  const schedule = usePreventiveStore((s) => s.schedule);

  return (
    <View style={styles.scheduleAssign}>
      <View style={styles.container}>
        {/* Assign To */}
        <View>
          <View style={styles.row}>
            <Text style={styles.title}>Assign To</Text>
            <Text style={styles.asterisk}>*</Text>
          </View>
          <RadioGroup
            options={ASSIGN_OPTIONS}
            selectedValue={assign_to}
            onChange={(option) => setPreventiveValue("assign_to", option)}
          />
        </View>

        {/* Schedule */}
        <View>
          <View style={styles.row}>
            <Text style={styles.title}>Schedule</Text>
            <Text style={styles.asterisk}>*</Text>
          </View>
          <RadioGroup
            options={SCHEDULE_OPTIONS}
            selectedValue={schedule}
            onChange={(option) => setPreventiveValue("schedule", option)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scheduleAssign: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E1E8EE",
    marginHorizontal: 25,
    marginVertical: 7.5,
    borderRadius: 8,
    height: 70,
    justifyContent: "center",
    paddingTop: 12,
  },
  container: {
    flexDirection: "row",
    paddingHorizontal: 25,
    justifyContent: "space-around",
  },
  row: {
    flexDirection: "row",
  },
  title: {
    color: "#6B7888",
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    lineHeight: 20
  },
  asterisk: {
    color: "#D63928",
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: -2,
    marginLeft: 2,
  },
})
