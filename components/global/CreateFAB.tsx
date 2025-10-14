import {GestureResponderEvent, Pressable, StyleSheet, Text, ViewStyle} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import Fonts from "@/constants/Typography";
import {FC, ReactNode} from "react";
import {AddNewGatewayIcon} from "@/constants/IconProvider";

interface FABProps {
    label?: string;
    icon?: ReactNode;
    onPress: (event: GestureResponderEvent) => void;
    backgroundColor?: string;
    style?: ViewStyle;
}

const CreateFAB: FC<FABProps> = ({label, icon = <AddNewGatewayIcon/>, onPress, backgroundColor = "#742BDE", style}) => {
    const insets = useSafeAreaInsets();

    return (
        <Pressable onPress={onPress} style={[styles.fab, label === "Create Work Order" ? {width: 200} : null, {bottom: insets.bottom + 20, backgroundColor}, style,]}>
            {icon}
            {label && <Text style={styles.label}>{label}</Text>}
        </Pressable>
    );
};

export default CreateFAB;

const styles = StyleSheet.create({
    fab: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        position: "absolute",
        alignSelf: "flex-end",
        width: 160,
        height: 40,
        gap: 8,
        right: 20,
        shadowColor: "#742BDE",
        shadowOpacity: 0.3,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 4,
    },
    label: {
        color: "#fff",
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        lineHeight: 16,
    },
});