import {
	Modal,
	View,
	Text,
	StyleSheet,
	Pressable,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { WebView } from "react-native-webview";
import moment from "moment";

import * as ScreenOrientation from 'expo-screen-orientation';

import { Asset } from "@/src/types/asset";
import { getAccelerationData, getDisplacementData, getEnvelopeData, getVelocityData } from "@/src/services/chart.service";
import { useAssetStore } from "@/src/store/useAssetStore";
import Header from "@/components/global/Header";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface ChartDetailModalProps {
	visible: boolean;
	onClose: () => void;
	selectedPoint: any;
	asset_data: Asset;
}

type AxisType = "Axial" | "Vertical" | "Horizontal";
type SignalType = "acceleration" | "velocity" | "displacement";


const timewaveformchart = "file:///android_asset/charts/time-waveform.html";
const envelopechart = "file:///android_asset/charts/envelope-waveform.html";
const spectrumwaveform = "file:///android_asset/charts/spectrum-waveform.html";
const spectrumenvelopechart = "file:///android_asset/charts/spectrum-envelope-waveform.html";

export default function ChartDetailModal({
	visible,
	onClose,
	selectedPoint,
	asset_data,
}: ChartDetailModalProps) {
	const [axis, setAxis] = useState<AxisType>("Horizontal");
	const [signalType, setSignalType] = useState<SignalType>("acceleration");

	const [activeTab, setActiveTab] = useState<"time" | "spectrum">("time");
	const [detailLoading, setDetailLoading] = useState(false);

	const accWebRef = useRef<WebView>(null);
	const envWebRef = useRef<WebView>(null);

	const { endpointSelected } = useAssetStore();

	// ---------------------------
	// BUILD PAYLOAD
	// ---------------------------
	const buildDetailPayload = (forEnvelope = false) => {
		if (!selectedPoint || !endpointSelected) return null;

		const isSpectrum = activeTab === "spectrum";

		const payload: any = {
			mac_id: endpointSelected.composite_id,
			timestamp: moment(
				selectedPoint.timestamp,
				"DD/MM/YYYY, HH:mm:ss"
			).unix(),
			axis,
			assetId: asset_data.id,
			domain: isSpectrum ? "frequency" : "time",
		};

		// ✅ ONLY signal spectrum needs trendFunc
		if (isSpectrum && !forEnvelope) {
			payload.trendFunc = "rms";
		}

		return payload;
	};

	// ---------------------------
	// FETCH TIME WAVEFORMS (SEQUENTIAL)
	// ---------------------------
	useEffect(() => {
		console.log('activeTab changed', activeTab)
		if (!visible || !selectedPoint) return;

		const payload = buildDetailPayload();
		// console.log('payload now = ', payload)
		if (!payload) return;


		let cancelled = false;
		setDetailLoading(true);

		fetchWaveFormsData(payload, cancelled);
		return () => {
			cancelled = true;
		};
	}, [visible, signalType, axis, activeTab, selectedPoint]);

	const fetchData = (payload: any) => {
		// console.log(signalType, payload.axis)
		switch (signalType) {
			case "velocity":
				return getVelocityData(payload);

			case "displacement":
				return getDisplacementData(payload);

			case "acceleration":
			default:
				return getAccelerationData(payload);
		}
	};

	const fetchWaveFormsData = async (payload: any, cancelled: boolean) => {
		try {
			const Res = await fetchData(payload);
			// console.log(Res)
			if (cancelled) return;

			const data = Res?.[axis];
			const fs = Res?.fs;

			// console.log(Array.isArray(data))

			if (!Array.isArray(data) || !fs) {
				console.warn("Invalid data time waveform ", Res);
				return;
			}

			setDetailLoading(false);

			setTimeout(() => {
				if (activeTab === "time") {

					accWebRef.current?.postMessage(
						JSON.stringify({
							type: activeTab,
							axis,
							data,
							fs,
							audio_base64: Res?.audio_base64,
							audio_mime: Res?.audio_mime,
							yLabel:
								(
									signalType === "acceleration"
										? "Amplitude (g)"
										: signalType === "velocity"
											? "Amplitude (mm/sec)"
											: "Amplitude (micron)"
								)
						})
					);
				} else {
					accWebRef.current?.postMessage(
						JSON.stringify({
							type: activeTab,
							axis: axis, // Vertical / Horizontal / Axial
							amplitude: data, // array of amplitudes
							xAxis: Res?.x_axis_spectrum_data, // frequency bins
							yLabel: (
								signalType === "acceleration"
									? "Amplitude (g)"
									: signalType === "velocity"
										? "Amplitude (mm/sec)"
										: "Amplitude (micron)"
							)
						})
					);

				}
			}, 300);
		} catch (er) {
			console.log(er)
		}

		try {
			const env = await getEnvelopeData(payload);
			// console.log(env)
			if (cancelled) return;

			const data = env?.[axis];
			const fs = env?.fs;

			if (!Array.isArray(data) || !fs) {
				console.warn("Invalid data envelope ", env);
				return;
			}

			setTimeout(() => {
				envWebRef.current?.postMessage(
					JSON.stringify({
						type: activeTab,
						axis,
						data,
						fs,
						yLabel: 'g'
					})
				);
			}, 300);
		} catch (er) {
			console.log(er)
		}
	}

	const toggleOrientation = async () => {
		console.log(await ScreenOrientation.getOrientationAsync())

		let current_orientation = await ScreenOrientation.getOrientationAsync();

		if (current_orientation === 1) {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.LANDSCAPE
			);
		} else {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.PORTRAIT
			);
		}
	}

	// ---------------------------
	// RENDER
	// ---------------------------
	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.backdrop}>
				<Header title={activeTab === "time" ? "Time Waveform" : "Spectrum"} modal={true} dismiss={onClose} showClose={true} showBack={false} showOrientation={true} toggleOrientation={toggleOrientation} />
				<ScrollView style={styles.container}>
					{/* Tabs */}


					<View style={styles.tabRow}>
						<Pressable
							onPress={() => setActiveTab("time")}
							style={[
								styles.tab,
								activeTab === "time" && styles.activeTab,
							]}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "time" && styles.activeTabText,
								]}
							>
								Time Waveform
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setActiveTab("spectrum")}
							style={[
								styles.tab,
								activeTab === "spectrum" && styles.activeTab,
							]}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "spectrum" && styles.activeTabText,
								]}
							>
								Spectrum
							</Text>
						</Pressable>
					</View>


					{/* SIGNAL TYPE ROW */}
					<View style={styles.selectorRow}>
						{(["acceleration", "velocity", "displacement"] as SignalType[]).map(
							(type) => (
								<Pressable
									key={type}
									onPress={() => setSignalType(type)}
									style={[
										styles.selectorBtn,
										signalType === type && styles.activeBtn,
									]}
								>
									<Text
										style={[
											styles.selectorText,
											signalType === type && styles.activeText,
										]}
									>
										{type}
									</Text>
								</Pressable>
							)
						)}
					</View>

					{/* AXIS ROW */}
					<View style={styles.selectorRow}>
						{(["Vertical", "Horizontal", "Axial"] as AxisType[]).map((a) => (
							<Pressable
								key={a}
								onPress={() => setAxis(a)}
								style={[
									styles.selectorBtn,
									axis === a && styles.activeBtn,
								]}
							>
								<Text
									style={[
										styles.selectorText,
										axis === a && styles.activeText,
									]}
								>
									{a}
								</Text>
							</Pressable>
						))}
					</View>


					{/* BODY */}
					<View style={styles.body}>

						{detailLoading && (
							<ActivityIndicator size="large" style={{ marginTop: 20 }} />
						)}

						{activeTab === "time" && !detailLoading && (
							<View>
								{/* ACCELERATION */}
								<View style={styles.chartBlock}>
									<Text style={styles.chartTitle}>
										{
											String(signalType).charAt(0).toUpperCase() + String(signalType).slice(1)
										}
										{" "}
										Time
										{" "}
										Waveform
									</Text>
									<View style={styles.chartBox}>
										<WebView
											ref={accWebRef}
											// source={require("../../../assets/charts/time-waveform.html")}
											source={{ uri: timewaveformchart }}
											javaScriptEnabled
											domStorageEnabled
											mediaPlaybackRequiresUserAction={false}
											allowsInlineMediaPlayback={true}
											originWhitelist={["*"]}
											allowUniversalAccessFromFileURLs
											allowFileAccess
											style={{ flex: 1 }}
										/>
									</View>
								</View>

								{/* ENVELOPE */}
								<View style={styles.chartBlock}>
									<Text style={styles.chartTitle}>
										{
											String(signalType).charAt(0).toUpperCase() + String(signalType).slice(1)
										}
										{" "}
										Timewave
										{" "}
										Envelope
									</Text>
									<View style={styles.chartBox}>
										<WebView
											ref={envWebRef}
											// source={require("../../../assets/charts/envelope-waveform.html")}
											source={{ uri: envelopechart }}
											javaScriptEnabled
											domStorageEnabled
											mediaPlaybackRequiresUserAction={false}
											allowsInlineMediaPlayback={true}
											originWhitelist={["*"]}
											allowUniversalAccessFromFileURLs
											allowFileAccess
											style={{ flex: 1 }}
										/>
									</View>
								</View>
							</View>
						)}

						{activeTab === "spectrum" && (
							<View style={styles.placeholder}>
								<View style={{ width: '100%' }}>
									{/* ACCELERATION */}
									<View style={styles.chartBlock}>
										<Text style={styles.chartTitle}>
											{
												String(signalType).charAt(0).toUpperCase() + String(signalType).slice(1)
											}
											{" "}
											Spectrum
										</Text>
										<View style={styles.chartBox}>
											<WebView
												ref={accWebRef}
												// source={require("../../../assets/charts/spectrum-waveform.html")}
												source={{ uri: spectrumwaveform }}
												javaScriptEnabled
												domStorageEnabled
												mediaPlaybackRequiresUserAction={false}
												allowsInlineMediaPlayback={true}
												originWhitelist={["*"]}
												allowUniversalAccessFromFileURLs
												allowFileAccess
												style={{ flex: 1 }}
											/>
										</View>
									</View>

									{/* ENVELOPE */}
									<View style={styles.chartBlock}>
										<Text style={styles.chartTitle}>
											{
												String(signalType).charAt(0).toUpperCase() + String(signalType).slice(1)
											}
											{" "}
											Spectrum Envelope
										</Text>
										<View style={styles.chartBox}>
											<WebView
												ref={envWebRef}
												// source={require("../../../assets/charts/spectrum-envelope-waveform.html")}
												source={{ uri: spectrumenvelopechart }}
												javaScriptEnabled
												domStorageEnabled
												mediaPlaybackRequiresUserAction={false}
												allowsInlineMediaPlayback={true}
												originWhitelist={["*"]}
												allowUniversalAccessFromFileURLs
												allowFileAccess
												style={{ flex: 1 }}
											/>
										</View>
									</View>
								</View>
							</View>
						)}
					</View>
				</ScrollView>
			</View>
		</Modal>
	);
}

// ---------------------------
// STYLES
// ---------------------------
const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-end",
	},
	container: {
		height: "100%",
		backgroundColor: "#fff",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
	},
	tabRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
		padding: 16,
	},
	tab: {
		flex: 1,
		paddingVertical: 10,
		alignItems: "center",
	},
	activeTab: {
		borderBottomWidth: 3,
		borderBottomColor: "#e58b4e",
	},
	tabText: {
		fontSize: 13,
		color: "#666",
		fontWeight: "500",
	},
	activeTabText: {
		color: "#000",
		fontWeight: "700",
	},
	body: {
		flex: 1,
		marginTop: 10,
		padding: 16,
	},
	chartBlock: {
		marginBottom: 24,
	},
	chartTitle: {
		fontSize: 12,
		fontWeight: "700",
		marginBottom: 6,
	},
	chartBox: {
		height: 220,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: "#fff",
	},
	placeholder: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	closeBtn: {
		alignSelf: "center",
		paddingVertical: 12,
	},

	selectorRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
		paddingHorizontal: 16,
	},
	selectorBtn: {
		flex: 1,
		paddingVertical: 8,
		marginHorizontal: 4,
		borderRadius: 6,
		backgroundColor: "#f2f2f2",
		alignItems: "center",
	},
	activeBtn: {
		backgroundColor: "#742BDE",
	},
	selectorText: {
		fontSize: 12,
		color: "#666",
		fontWeight: "500",
		textTransform: "capitalize",
	},
	activeText: {
		color: "#fff",
		fontWeight: "700",
	},
	graphContainer: {
		flex: 1,
		marginTop: 10,
	},
});