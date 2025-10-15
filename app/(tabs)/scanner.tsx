import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import ActionButton from "@/components/create-screens/ActionButton";
import Fonts from "@/constants/Typography";
import Header from "@/components/global/Header";

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scannedData, setScannedData] = useState<string | null>(null);

    if (!permission) {
        return (
            <View style={styles.center}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.resultText}>We need your permission to use the camera</Text>
                <ActionButton onPress={requestPermission} label="Grant Permission" buttonStyle={{ width: "90%" }} />
            </View>
        );
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            setScannedData(data);
        }
    };

    return (
        <>
            <Header title="Scanner" />
            <View style={styles.container}>
                <View style={styles.scannerBox}>
                    {!scanned ? (
                        permission?.granted && (
                            <CameraView
                                style={StyleSheet.absoluteFillObject}
                                facing="back"
                                onBarcodeScanned={handleBarCodeScanned}
                                barcodeScannerSettings={{
                                    barcodeTypes: [
                                        "qr",
                                        "aztec",
                                        "pdf417",
                                        "codabar",
                                        "code128",
                                        "ean13",
                                        "datamatrix",
                                        "ean8",
                                    ],
                                }}
                            />
                        )
                    ) : (
                        <View style={styles.center}>
                            <Text style={styles.resultText}>QR Code Scanned!</Text>
                        </View>
                    )}
                </View>


                {scannedData && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultLabel}>Scanned QR Code:</Text>
                        <Text style={styles.resultValue}>{scannedData}</Text>
                    </View>
                )}

                <ActionButton label={scanned ? "Scan Again" : "Scan"} buttonStyle={styles.actionButton} onPress={() => {
                    setScanned(false);
                    setScannedData(null);
                }} />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scannerBox: {
        flex: 1,
        margin: 20,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#742BDE40",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    resultBox: {
        marginHorizontal: 20,
        marginBottom: 80,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#F5F5F5",
    },
    resultLabel: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#333",
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: "#201F23",
    },
    resultText: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: "#201F23",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    actionButton: {
        position: "absolute",
        bottom: -30,
        alignSelf: "center",
        width: "90%",
    },
});
