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
import { SegmentedCheckboxRow } from "./SimpleDropdown";
import Fonts from "@/constants/Typography";

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
	console.log('selectedPoint on modal = ', selectedPoint)
	const [orientation, setOrientation] = useState("portrait");

	// ---------------------------
	// signal value, and axis
	// ---------------------------
	const selectedAxis = useAssetStore((s) => s.selectedAxis);
	console.log('selected axis changed in modal = ', selectedAxis)
	const selectedValueType = useAssetStore((s) => s.selectedValueType);

	const [axis, setAxis] = useState<any[]>([]);
	const [signalType, setSignalType] = useState<SignalType>("acceleration");

	const [activeTab, setActiveTab] = useState<"time" | "spectrum">("time");
	const [detailLoading, setDetailLoading] = useState(false);

	const accWebRef = useRef<WebView>(null);
	const envWebRef = useRef<WebView>(null);

	const { endpointSelected } = useAssetStore();

	useEffect(() => {
		setAxis(selectedAxis)
	}, [selectedAxis])

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
			payload.trendFunc = selectedValueType.toLowerCase();
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
		console.log('payload now = ', payload)
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

	const normalizeAxesData = (axesData: any[]) => {
		return axesData
			.map((obj) => {
				const keys = Object.keys(obj).filter(k =>
					axis.map(a => a.toLowerCase()).includes(k.toLowerCase())
				);

				const values = keys.map(k => obj[k]);

				// console.log(keys)
				// console.log(values)

				// const [[axis1, raw]] = Object.entries(obj);

				return {
					axis: keys[0],
					values: values[0],
					fs: obj.fs
				};
			});
	};

	const fetchWaveFormsData = async (payload: any, cancelled: boolean) => {
		try {
			const Res = await fetchData(payload);
			console.log('all data = ', Res?.data[0])
			if (cancelled) return;

			const axesData = Res?.data[0].axes_data ?? [];

			const normalizedAxes = normalizeAxesData(axesData || []);
			console.log('normalizedAxes = ', normalizedAxes)

			const AXIS_COLORS: Record<string, string> = {
				axial: "#ff0000",
				horizontal: "#01d711",
				vertical: "#1237ff",
			};

			let datasets: any = normalizedAxes.map(a => ({
				axis: a.axis,
				data: a.values,
				fs: a.fs,
				color: AXIS_COLORS[a.axis.toLowerCase()],
			}));

			if (activeTab === 'spectrum') {
				datasets['x_axis_spectrum_data'] = Res?.data[0].x_axis_spectrum_data;
			}

			console.log('data set = ', datasets)

			if (!Array.isArray(normalizedAxes[0]?.values)) {
				console.warn("Invalid data time waveform ", Res);
				return;
			}

			setDetailLoading(false);

			setTimeout(() => {
				if (activeTab === "time") {
					accWebRef.current?.postMessage(
						JSON.stringify({
							type: activeTab,
							datasets,
							yLabel:
								signalType === "acceleration"
									? "Amplitude (g)"
									: signalType === "velocity"
										? "Amplitude (mm/sec)"
										: "Amplitude (micron)",
							audio_base64: Res?.audio_base64,
							audio_mime: Res?.audio_mime,
						})
					);

				} else {
					accWebRef.current?.postMessage(
						JSON.stringify({
							type: "spectrum",
							datasets, // same datasets
							xAxis: Res?.data[0].x_axis_spectrum_data,
							yLabel: signalType === "acceleration"
								? "Amplitude (g)"
								: signalType === "velocity"
									? "Amplitude (mm/sec)"
									: "Amplitude (micron)",
						})
					);

				}
			}, 300);
		} catch (er) {
			console.log(er)
			setDetailLoading(false)
			accWebRef.current?.postMessage(
				JSON.stringify({
					type: "error",
					message: "No data found for any of the requested axes/timestamps.",
				})
			);
		}

		try {
			const env = await getEnvelopeData(payload);
			console.log(env)
			if (cancelled) return;

			const axesData = env?.data[0].axes_data ?? [];

			const normalizedAxes = normalizeAxesData(axesData || []);
			console.log('normalizedAxes = ', normalizedAxes)

			const AXIS_COLORS: Record<string, string> = {
				axial: "#ff0000",
				horizontal: "#01d711",
				vertical: "#1237ff",
			};

			let datasets: any = normalizedAxes.map(a => ({
				axis: a.axis,
				data: a.values,
				fs: a.fs,
				color: AXIS_COLORS[a.axis.toLowerCase()],
			}));

			if (activeTab === 'spectrum') {
				datasets['x_axis_spectrum_data'] = env?.data[0].x_axis_spectrum_data;
			}

			console.log('data set = ', datasets)

			if (!Array.isArray(normalizedAxes[0]?.values)) {
				console.warn("Invalid data envelope ", env);
				return;
			}

			setTimeout(() => {
				envWebRef.current?.postMessage(
					JSON.stringify({
						type: activeTab,
						data: datasets,   // array of axes datasets
						xAxis:
							activeTab === "spectrum"
								? env?.data[0].x_axis_spectrum_data
								: undefined,
						yLabel: "g"
					})
				);
			}, 300);
		} catch (er) {
			console.log(er)
			setDetailLoading(false)
			envWebRef.current?.postMessage(
				JSON.stringify({
					type: "error",
					message: "No data found for any of the requested axes/timestamps.",
				})
			);
		}
	}

	const toggleOrientation = async () => {
		console.log(await ScreenOrientation.getOrientationAsync())

		let current_orientation = await ScreenOrientation.getOrientationAsync();

		if (current_orientation === 1) {
			setOrientation("landscape");
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.LANDSCAPE
			);
		} else {
			setOrientation("portrait");
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
				<Header
					title={activeTab === "time" ? "Time Waveform" : "Spectrum"}
					modal={true}
					dismiss={onClose}
					showClose={true}
					showBack={false}
					showOrientation={true}
					toggleOrientation={toggleOrientation}
					styling={{
						paddingVertical: orientation === "landscape" ? 4 : 15
					}}
				/>
				<ScrollView style={styles.container}>
					{/* Tabs */}

					<View style={[styles.tabRow, orientation === "landscape" && { padding: 2 }]}>
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


					<View style={{
						width: '90%',
						justifyContent: 'center',
						alignItems: 'center',
						flexDirection: orientation === "landscape" ? "row" : "column",
						gap: 10,
					}}>

						<SegmentedCheckboxRow
							mode="multiple"
							value={axis}
							options={["Axial", "Horizontal", "Vertical"]}
							onChange={(val) => setAxis(val as AxisType[])}
						/>

						{
							orientation === "landscape" && <View style={{ width: 2, height: 20, backgroundColor: "#d3d3d3" }} />
						}

						<SegmentedCheckboxRow
							mode="single"
							value={signalType}
							options={["acceleration", "velocity", "displacement"]}
							onChange={(val) =>
								setSignalType(val as SignalType)
							}
						/>

					</View>

					<Text style={{ paddingHorizontal: 25, fontSize: 14, fontFamily: Fonts.bold, color: "#1a237e", textAlign: "left", marginTop: 0 }}>
						Timestamp: {selectedPoint?.timestamp || ''}
					</Text>

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
										{/* {
											String(signalType).charAt(0).toUpperCase() + String(signalType).slice(1)
										} */}
										Acceleration
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
											{/* {
												String(signalType).charAt(0).toUpperCase() + String(signalType).slice(1)
											} */}
											Acceleration
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
			</View >
		</Modal >
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