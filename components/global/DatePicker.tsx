import { useState, useMemo, FC } from "react";
import {View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Modal, ScrollView, Pressable, NativeSyntheticEvent, NativeScrollEvent} from "react-native";
import Fonts from "@/constants/Typography";
import { DateDropDownIcon } from "@/constants/IconProvider";

const screenWidth = Dimensions.get("window").width;

interface DatePickerProps {
    visible: boolean;
    onClose: () => void;
    onDateSelect: (date: Date) => void;
}

interface DateItem {
    key: string;
    date: Date;
    day: string;
    number: number;
}

const DatePicker: FC<DatePickerProps> = ({visible, onClose, onDateSelect}) => {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
    const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);
    const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);

    const dates: DateItem[] = useMemo(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(selectedYear, selectedMonth, i + 1);
            return {
                key: `${selectedYear}-${selectedMonth}-${i + 1}`,
                date,
                day: date.toLocaleDateString("en-US", { weekday: "short" }),
                number: i + 1,
            };
        });
    }, [selectedMonth, selectedYear]);

    const weeks: DateItem[][] = useMemo(() => {
        const chunked: DateItem[][] = [];
        for (let i = 0; i < dates.length; i += 5) {
            chunked.push(dates.slice(i, i + 5));
        }
        return chunked;
    }, [dates]);

    const handleDatePress = (date: Date) => {
        setSelectedDate(date);
        onDateSelect(date);
        // onClose();
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setCurrentWeekIndex(index);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                {/* Stop press events from bubbling to overlay */}
                <Pressable style={styles.container} onPress={event => event.stopPropagation()}>
                    <View style={styles.dropdownRow}>
                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowYearDropdown(!showYearDropdown)}>
                            <Text style={styles.dropdownText}>Year :</Text>
                            <Text style={styles.dropdownLabel}> {selectedYear}</Text>
                            <DateDropDownIcon />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowMonthDropdown(!showMonthDropdown)}>
                            <Text style={styles.dropdownText}>Month : </Text>
                            <Text style={styles.dropdownLabel}>{new Date(0, selectedMonth).toLocaleString("en-US", {month: "long"})}</Text>
                            <DateDropDownIcon />
                        </TouchableOpacity>
                    </View>

                    <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                    {showYearDropdown && (
                        <View style={styles.dropdownList}>
                            <ScrollView style={{ maxHeight: 200 }}>
                                {Array.from({ length: 30 }, (_, i) => {
                                    const year = today.getFullYear() - 25 + i;
                                    return (
                                        <TouchableOpacity key={year}  style={styles.dropdownItem} onPress={() => {
                                                setSelectedYear(year);
                                                setShowYearDropdown(false);
                                            }}>
                                            <Text style={styles.dropdownItemText}>{year}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    {showMonthDropdown && (
                        <View style={styles.dropdownList}>
                            <ScrollView style={{ maxHeight: 300 }}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <TouchableOpacity key={i} style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedMonth(i);
                                            setShowMonthDropdown(false);
                                        }}>
                                        <Text style={styles.dropdownItemText}>
                                            {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    </View>
                    <FlatList<DateItem[]>
                        data={weeks}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => `week-${index}`}
                        onMomentumScrollEnd={handleMomentumScrollEnd}
                        renderItem={({ item }) => (
                            <View style={[styles.weekContainer, { width: screenWidth }]}>
                                {item.map((d) => {
                                    const isSelected =
                                        d.date.toDateString() === selectedDate.toDateString();
                                    return (
                                        <TouchableOpacity key={d.key} style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                                            onPress={() => handleDatePress(d.date)}>
                                            <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>{d.number}</Text>
                                            <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>{d.day}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                        contentContainerStyle={{ marginTop: 20 }}
                    />

                    <View style={styles.dotsRow}>
                        {weeks.map((_, i) => <View key={i} style={[styles.dot, { opacity: i === currentWeekIndex ? 1 : 0.3 }]}/>)}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#742BDE",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingVertical: 20,
        paddingHorizontal: 16,
        minHeight: 220,
        marginHorizontal: 25,
    },
    dropdownRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    dropdownButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    dropdownText: {
        color: "#000000",
        fontFamily: Fonts.regular,
        fontSize: 11,
    },
    dropdownLabel: {
        color: "#742BDE",
        fontFamily: Fonts.semiBold,
        fontSize: 11,
        marginRight: 4,
    },
    dropdownList: {
        backgroundColor: "#fff",
        borderRadius: 4,
        maxHeight: 200,
        width: "44%",
        paddingHorizontal: 10
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    dropdownItemText: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: "#000",
        textAlign: "justify"
    },
    weekContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    dateItem: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        // marginHorizontal: 5,
        backgroundColor: "#8437F3",
        borderWidth: 1,
        borderColor: "#FFFFFF",
    },
    dateItemSelected: {
        backgroundColor: "#fff",
        borderColor: "#fff",
    },
    dateNumber: {
        fontFamily: Fonts.regular,
        fontSize: 18,
        color: "#fff",
    },
    dateNumberSelected: {
        color: "#742BDE",
    },
    dateDay: {
        fontFamily: Fonts.regular,
        color: "#fff",
    },
    dateDaySelected: {
        color: "#742BDE",
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 12,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3,
        backgroundColor: "#fff",
        marginHorizontal: 3,
    },
});

export default DatePicker;
