import { FC } from "react";
import { Modal, Pressable, StyleSheet, Text, View, FlatList, Dimensions } from "react-native";
import Fonts from "@/constants/Typography";
import { CloseIcon } from "@/constants/IconProvider";

interface Part {
  id: string;
  name: string;
  quantity: number;
}

interface PartsInfoModalProps {
  visible: boolean;
  onClose: () => void;
  parts: Part[];
}

const { height } = Dimensions.get("window");

const PartsInfoModal: FC<PartsInfoModalProps> = ({ visible, onClose, parts }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>

      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>Parts Info</Text>
            <Pressable onPress={onClose}>
              <CloseIcon />
            </Pressable>
          </View>


          <FlatList
            data={parts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ maxHeight: height * 0.35 }}
            renderItem={({ item }) => (
              <View style={styles.partRow}>
                <Text style={styles.partName}>{item.name}</Text>
                <Text style={styles.partQuantity}>{item.quantity}</Text>
              </View>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: "40%",
  },
  handle: {
    width: 60,
    height: 3,
    alignSelf: "center",
    backgroundColor: "#742BDE30",
    borderRadius: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#742BDE",
    marginBottom: 10,
  },
  partRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#E1E8EE",
  },
  partName: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#1C1C1C",
    marginRight: 10,
  },
  partQuantity: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#000",
  },
});

export default PartsInfoModal;
