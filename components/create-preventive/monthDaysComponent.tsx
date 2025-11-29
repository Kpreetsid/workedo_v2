import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const MonthDays = ({
  selected = [],
  onToggle,
}: {
  selected?: number[];
  onToggle: (index: number) => void;
}) => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <View style={styles.monthDaysWrapper}>
      {days.map((num) => {
        const isActive = selected.includes(num);

        return (
          <TouchableOpacity
            key={num}
            style={[styles.numBox, isActive && styles.numBoxActive]}
            onPress={() => onToggle(num)}
          >
            {/* Checkbox */}
            <View style={styles.checkboxContainer}>
              {isActive ? (
                <View
                  style={[styles.checkboxOutline, styles.checkboxActive]}
                >
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              ) : (
                <View style={styles.checkboxOutline} />
              )}
            </View>

            {/* Day number */}
            <Text style={[styles.numText, isActive && styles.numTextActive]}>
              {num}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default MonthDays;

const styles = StyleSheet.create({
  monthDaysWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 15,
  },

  numBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 6,
    // borderWidth: 1,
    // borderColor: "#ddd",
    // minWidth: 70,
    justifyContent: "flex-start",
  },
  numBoxActive: {
    // backgroundColor: "#742BDE22",
    // borderColor: "#742BDE",
  },

  checkboxContainer: {
    marginRight: 8,
  },

  checkboxOutline: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#888",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#742BDE",
    borderColor: "#742BDE",
  },

  numText: {
    fontSize: 14,
    color: "#333",
  },
  numTextActive: {
    color: "#742BDE",
    fontWeight: "600",
  },
});