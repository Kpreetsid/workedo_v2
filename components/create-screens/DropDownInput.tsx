import {useState, useRef} from "react";
import {Text, View, StyleSheet, Pressable, ScrollView, Modal, LayoutRectangle} from "react-native";
import {DateDropDownIcon} from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";

interface DropDownInputProps {
    label: string;
    required?: boolean;
    value?: string;
    options: string[];
    onSelect: (value: string) => void;
    containerStyle?: object;
    fieldStyle?: object;
}

export default function DropDownInput({label, required = true, value, options, onSelect, containerStyle, fieldStyle}: DropDownInputProps) {
    const [visible, setVisible] = useState(false);
    const [fieldLayout, setFieldLayout] = useState<LayoutRectangle | null>(null);
    const fieldRef = useRef<View>(null);

    const toggleDropdown = () => {
        if (fieldRef.current) {
            fieldRef.current.measure((_, __, width, height, pageX, pageY) => {
                setFieldLayout({x: pageX, y: pageY, width, height});
                setVisible((prev) => !prev);
            });
        }
    };

    return (
        <>
            <View style={[styles.container, containerStyle]}>

                <View style={styles.labelContainer}>
                    <Text style={styles.labelText}>{label}</Text>
                    {required && <Text style={styles.asterisk}>*</Text>}
                </View>

                <Pressable style={[styles.field, fieldStyle]} onPress={toggleDropdown} ref={fieldRef}>
                    <Text style={styles.inputText}>{value || "Select"}</Text>
                    <DateDropDownIcon/>
                </Pressable>
            </View>

            {visible && fieldLayout && (
                <Modal transparent animationType="fade">
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)}/>

                    <View style={[styles.dropdownContainer, {top: fieldLayout.y + 12, left: fieldLayout.x, width: fieldLayout.width}]}>
                        <ScrollView nestedScrollEnabled style={{maxHeight: 200}}>
                            {options.map((option) => (
                                <Pressable key={option} style={styles.dropdownItem} onPress={() => {
                                    onSelect(option);
                                    setVisible(false);
                                }}>
                                    <Text style={styles.dropdownItemText}>{option}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 25,
        paddingVertical: 7.5,
    },
    labelContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    labelText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        lineHeight: 20,
        color: "#1C1C1C",
    },
    asterisk: {
        color: "#D63928",
        fontSize: 14,
        fontFamily: Fonts.regular,
        marginTop: -3,
        marginLeft: 2,
    },
    field: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#E1E8EE",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    inputText: {
        paddingVertical: 10,
        fontSize: 12,
        color: "#1C1C1C",
        fontFamily: Fonts.light,
    },
    dropdownContainer: {
        position: "absolute",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E1E8EE",
        borderRadius: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 4,
        zIndex: 1000,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dropdownItemText: {
        fontSize: 12,
        color: "#1C1C1C",
        fontFamily: Fonts.regular,
    },
});
