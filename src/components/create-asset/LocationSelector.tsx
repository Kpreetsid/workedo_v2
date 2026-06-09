import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useOverviewStore } from '@/src/state/app/useOverviewStore';
import Fonts from '@/constants/Typography';
import { ArrowRight, SearchIcon, TickMark } from '@/constants/IconProvider';
import { useCreateAssetStore } from '@/src/state/assets/useCreateAsset';

const LocationSelector = () => {
  const parentLocations = useOverviewStore((state) => state.parentLocations);
  const location = useCreateAssetStore((state) => state.location);
  const setLocation = useCreateAssetStore((state) => state.setLocation);
  const setLocationObject = useCreateAssetStore((state) => state.setLocationObject);
  const setAssignedUsers = useCreateAssetStore((state) => state.setAssignedUsers);

  const selectedId = typeof location === "string" ? location : null;

  const toggleSelection = (id: string) => {
    setAssignedUsers([])
    setLocation(id);
    setLocationObject(parentLocations.find((option) => option.id === id));
  };

  return (
    <View style={styles.optionsContainer}>
      <Text style={styles.searchLabel}>Search Location</Text>
      <View style={styles.searchContainer}>
        <SearchIcon />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#71717A"
          style={styles.input}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true} nestedScrollEnabled>
        {parentLocations.map((option) => {
          const isChecked = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={() => toggleSelection(option.id)}
            >
              <View style={[styles.checkbox, { backgroundColor: isChecked ? "#742BDE" : undefined }]}>
                <TickMark />
              </View>
              <Text style={styles.optionText}>{option.location_name}</Text>
              <ArrowRight color="#333333CC" />
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    </View>
  )
}

export default LocationSelector

const styles = StyleSheet.create({
  optionsContainer: {
    marginHorizontal: 25,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
    paddingHorizontal: 10,
  },
  scrollView: {
    marginTop: 5,
    maxHeight: 225
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 3,
  },
  checkbox: {
    height: 15,
    width: 15,
    borderRadius: 2,
    borderWidth: 0.8,
    borderColor: "#D4D4D8",
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 10,
    color: "#333333",
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  searchLabel: {
    fontSize: 10,
    color: "#71717A",
    fontFamily: Fonts.regular,
  },
  searchContainer: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#D4D4D8",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 28, // slightly increased height
  },
  input: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#000",
    flex: 1,
    paddingVertical: 0, // ensures text is vertically centered
  },
})