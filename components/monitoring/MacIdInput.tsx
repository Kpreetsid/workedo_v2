import Fonts from "@/constants/Typography";
import { recognizeMacIdFromImage } from "@/src/services/mac-ocr.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import { launchCamera } from "react-native-image-picker";

interface MacIdInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}

export default function MacIdInput({ label, placeholder, value, onChangeText }: MacIdInputProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (isScanning) return;

    launchCamera(
      {
        mediaType: "photo",
        cameraType: "back",
        quality: 1,
        saveToPhotos: false,
        includeBase64: false,
      },
      async (response) => {
        if (response.didCancel) return;

        if (response.errorCode) {
          Alert.alert("Camera error", response.errorMessage || "Unable to capture the sticker image.");
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          Alert.alert("Scan failed", "No image was captured. Please try again.");
          return;
        }

        setIsScanning(true);
        try {
          const result = await recognizeMacIdFromImage(asset.uri);
          if (!result.macId) {
            Alert.alert(
              "MAC not detected",
              result.rawText
                ? `Could not extract a valid MAC ID. Detected text: ${result.rawText}`
                : "Could not detect readable text on the sticker. Try taking a closer, clearer photo."
            );
            return;
          }

          onChangeText(result.macId);
          ToastAndroid.show("MAC ID detected. Please verify it matches the sensor sticker.", ToastAndroid.LONG);
        } catch (error: any) {
          Alert.alert("Scan failed", error?.message || "Unable to recognize the MAC ID from this image.");
        } finally {
          setIsScanning(false);
        }
      }
    );
  };

  return (
    <View style={styles.fieldBlock}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Pressable style={styles.scanButton} onPress={handleScan} disabled={isScanning}>
          {isScanning ? (
            <ActivityIndicator size="small" color="#742BDE" />
          ) : (
            <>
              <MaterialCommunityIcons name="camera-outline" size={16} color="#742BDE" />
              <Text style={styles.scanButtonText}>Scan sticker</Text>
            </>
          )}
        </Pressable>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(nextValue) => onChangeText(nextValue.toUpperCase())}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        autoCapitalize="characters"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldBlock: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  fieldLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#201F23",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D9C4FD",
    backgroundColor: "#F8F2FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 112,
    justifyContent: "center",
  },
  scanButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: "#742BDE",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE4EC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#111827",
  },
});
