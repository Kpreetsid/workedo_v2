import { View, Pressable, Text, StyleSheet, Dimensions } from "react-native";
import Fonts from "@/constants/Typography";
import SignalFilter from "./SignalFilter";

const { width } = Dimensions.get("window");

type AssetFiltersProps = {
  selectedAxis: string[];
  toggleAxis: (axis: string) => void;
  selectedSignal: string;
  selectedValueType: string;
  setSelectedSignal: (v: string) => void;
  setSelectedValueType: (v: string) => void;
};

export default function AssetFilters({
  selectedAxis,
  toggleAxis,
  selectedSignal,
  selectedValueType,
  setSelectedSignal,
  setSelectedValueType
}: AssetFiltersProps) {

  const AXES = ["Horizontal", "Vertical", "Axial"];

  return (
    <View style={{ marginTop: 20 }}>
      {/* Axis Tabs */}
      <View style={styles.modeTabs}>
        {AXES.map(axis => {
          const active = selectedAxis.includes(axis);
          return (
            <Pressable
              key={axis}
              style={[styles.modeTab, active && styles.modeTabActive]}
              onPress={() => toggleAxis(axis)}
            >
              <Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>
                {axis}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Signal + ValueType Dropdowns */}
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <SignalFilter
          selectedSignal={selectedSignal}
          selectedValueType={selectedValueType}
          onSignalChange={setSelectedSignal}
          onValueTypeChange={setSelectedValueType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modeTabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 10
  },
  modeTab: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 0.3,
    borderColor: "#00000020",
    width: (width / 3) - 30,
  },
  modeTabActive: {
    backgroundColor: "#742BDE",
  },
  modeTabText: {
    color: "#00000080",
    fontSize: 10,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
  modeTabTextActive: {
    color: "#fff",
    fontFamily: Fonts.semiBold,
  },
});