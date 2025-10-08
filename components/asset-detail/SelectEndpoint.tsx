import {Pressable, StyleSheet, View, Text, Modal, FlatList, LayoutRectangle} from "react-native";
import Fonts from "@/constants/Typography";
import {ArrowRight} from "@/constants/IconProvider";
import {useState, useRef} from "react";
import {Ionicons} from "@expo/vector-icons";

const endpoints = [
    {id: "1", name: "Endpoint A"},
    {id: "2", name: "Endpoint B"},
    {id: "3", name: "Endpoint C"},
    {id: "4", name: "Endpoint D"},
    {id: "5", name: "Endpoint E"},
    {id: "6", name: "Endpoint F"},
    {id: "7", name: "Endpoint G"},
    {id: "8", name: "Endpoint H"},
    {id: "9", name: "Endpoint I"},
    {id: "10", name: "Endpoint J"},
    {id: "11", name: "Endpoint K"},
    {id: "12", name: "Endpoint L"},
    {id: "13", name: "Endpoint M"},
    {id: "14", name: "Endpoint N"},
    {id: "15", name: "Endpoint O"},
    {id: "16", name: "Endpoint P"},
    {id: "17", name: "Endpoint Q"},
    {id: "18", name: "Endpoint R"},
    {id: "19", name: "Endpoint S"},
    {id: "20", name: "Endpoint T"},
];

export default function SelectEndpoint() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
    const [buttonLayout, setButtonLayout] = useState<LayoutRectangle | null>(null);
    const buttonRef = useRef<View>(null);

    const handleSelect = (id: string) => {
        setSelectedEndpoint(id);
        setModalVisible(false);
    };

    const openModal = () => {
        buttonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
            setButtonLayout({x: pageX, y: pageY, width, height});
            setModalVisible(true);
        });
    };

    return (
        <View style={styles.selectCard}>
            <View>
                <Text style={styles.assetName}>Sunil-Test-DE</Text>
                <Text style={styles.assetDesc}>Test Asset</Text>
            </View>

            <Pressable ref={buttonRef} style={styles.selectBtn} onPress={openModal}>
                <Text style={styles.selectText}>Select</Text>
                <ArrowRight/>
            </Pressable>

            {/* Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setModalVisible(false)} />

                {buttonLayout && (
                    <View style={[styles.modalContainer, {top: buttonLayout.y + buttonLayout.height + 6, left: buttonLayout.x - 100, right: 20}]}>
                        <Text style={styles.modalTitle}>Select Endpoint</Text>

                        <FlatList
                            data={endpoints}
                            keyExtractor={(item) => item.id}
                            style={{maxHeight: 250}}
                            renderItem={({item}) => {
                                const isSelected = item.id === selectedEndpoint;
                                return (
                                    <Pressable style={[styles.endpointItem, isSelected && styles.selectedItem]} onPress={() => handleSelect(item.id)}>
                                        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                                            {isSelected && <Ionicons name="checkmark" size={14} color="#fff"/>}
                                        </View>
                                        <Text style={[styles.endpointText, isSelected && {color: "#742BDE"}]}>{item.name}</Text>
                                    </Pressable>
                                )}}/>
                    </View>
                )}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    selectCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 30,
        marginHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 2,
    },
    assetName: {
        fontSize: 10,
        color: "#201f23",
        fontFamily: Fonts.semiBold,
    },
    assetDesc: {
        fontSize: 10,
        color: "#201f23",
        fontFamily: Fonts.regular,
    },
    selectBtn: {
        backgroundColor: "#742BDE",
        borderRadius: 6,
        paddingHorizontal: 15,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
    selectText: {
        color: "#fff",
        fontSize: 10,
        fontFamily: Fonts.regular,
        lineHeight: 18,
    },
    overlay: {
        flex: 1,
        backgroundColor: "transparent",
    },
    modalContainer: {
        position: "absolute",
        backgroundColor: "#fff",
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 8,
        elevation: 6,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalTitle: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#fff",
        marginBottom: 5,
        backgroundColor: "#742BDE",
        padding: 8,
        paddingLeft: 15,
    },
    endpointItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        gap: 10,
    },
    selectedItem: {
        backgroundColor: "#742BDE06",
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: "#742BDE",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    checkedBox: {
        backgroundColor: "#742BDE",
    },
    endpointText: {
        fontSize: 11,
        color: "#000",
        fontFamily: Fonts.light,
    },
});
