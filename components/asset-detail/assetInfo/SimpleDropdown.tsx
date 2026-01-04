import { Pressable, Text, View, StyleSheet } from "react-native";

export function SegmentedCheckboxRow<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (val: T) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = opt.toLowerCase() === value.toLowerCase();

        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.item,
              active && styles.itemActive,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                active && styles.checkboxActive,
              ]}
            >
              {active && <View style={styles.checkboxInner} />}
            </View>

            <Text
              style={[
                styles.label,
                active && styles.labelActive,
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16,
    marginVertical: 10,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#bdbdbd",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActive: {
    borderColor: "#742BDE",
    backgroundColor: "#fff7f2",
  },

  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#742BDE",
  },

  label: {
    fontSize: 14,
    color: "#333",
  },

  labelActive: {
    fontWeight: "600",
  },
  itemActive: {
    backgroundColor: "#f3ecff", // ✅ light purple tint
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

});