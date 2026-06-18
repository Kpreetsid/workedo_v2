import Fonts from "@/constants/Typography";
import { StyleSheet, Text, View } from "react-native";

export default function BluetoothMonitorPlaceholder() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>BLE monitor coming next</Text>
        <Text style={styles.body}>
          BLE monitor will be enabled once the AWS IoT / broker details and topic format are provided.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E9DDFC",
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: "#1F2937",
    marginBottom: 8,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },
});
