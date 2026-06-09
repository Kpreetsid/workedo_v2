import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import ActionButton from "@/src/components/create-screens/ActionButton";
import Fonts from "@/constants/Typography";
import Header from "@/src/components/global/Header";
import { useRouter } from "expo-router";

type ScannerTarget =
	| { pathname: "/assetDetail"; params: { id: string; composite_id?: string } }
	| { pathname: "/locationDetail"; params: { id: string } }
	| { pathname: "/workOrderDetail"; params: { data: string } };

const INTERNAL_ROUTES = new Set(["/assetdetail", "/locationdetail", "/workorderdetail"]);

const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

const isPlainObject = (value: unknown): value is Record<string, any> =>
	Boolean(value && typeof value === "object" && !Array.isArray(value));

const firstString = (...values: unknown[]) => {
	for (const value of values) {
		if (typeof value === "string" && value.trim()) {
			return value.trim();
		}
		if (typeof value === "number" && Number.isFinite(value)) {
			return String(value);
		}
	}

	return "";
};

const normalizeRoute = (value?: string | null) => {
	if (!value) return null;

	const cleaned = value.trim();
	const normalized = cleaned.toLowerCase().replace(/[^a-z0-9]+/g, "");

	if (INTERNAL_ROUTES.has(`/${normalized}`)) {
		if (normalized === "assetdetail") return "/assetDetail";
		if (normalized === "locationdetail") return "/locationDetail";
		if (normalized === "workorderdetail") return "/workOrderDetail";
	}

	if (normalized === "asset" || normalized === "assets") return "/assetDetail";
	if (normalized === "location" || normalized === "locations") return "/locationDetail";
	if (normalized === "workorder" || normalized === "workorders") return "/workOrderDetail";

	return null;
};

const toParamsObject = (searchParams: URLSearchParams) => {
	const params: Record<string, string> = {};
	for (const [key, value] of searchParams.entries()) {
		params[key] = value;
	}
	return params;
};

const routeHintToPath = (value?: string) => {
	if (!value) return null;

	const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
	if (normalized === "asset" || normalized === "assetdetail" || normalized === "assets") {
		return "/assetDetail";
	}
	if (normalized === "location" || normalized === "locationdetail" || normalized === "locations") {
		return "/locationDetail";
	}
	if (normalized === "workorder" || normalized === "workorderdetail" || normalized === "workorders") {
		return "/workOrderDetail";
	}

	return null;
};

const looksLikeLocationPayload = (payload: Record<string, any>) =>
	Boolean(payload.location_name || payload.location_type || payload.top_level_location_id);

const looksLikeAssetPayload = (payload: Record<string, any>) =>
	Boolean(payload.asset_name || payload.asset_type || payload.asset_id || payload.composite_id);

const looksLikeWorkOrderPayload = (payload: Record<string, any>) =>
	Boolean(payload.order_no || payload.tasks || payload.sop_form_id || payload.work_order_id || payload.workOrderId);

const resolveScannerTarget = (rawValue: string): ScannerTarget | null => {
	const trimmed = rawValue.trim();
	if (!trimmed) return null;

	let payload: Record<string, any> | null = null;

	const parsedJson = safeJsonParse(trimmed);
	if (parsedJson && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
		payload = parsedJson as Record<string, any>;
	}

	if (!payload && trimmed.includes("=") && !trimmed.includes("://")) {
		const queryParams = new URLSearchParams(trimmed.startsWith("?") ? trimmed : `?${trimmed}`);
		if ([...queryParams.keys()].length > 0) {
			payload = toParamsObject(queryParams);
		}
	}

	if (!payload && (trimmed.includes("://") || trimmed.startsWith("/") || trimmed.includes("?"))) {
		try {
			const url = new URL(trimmed, "https://scanner.local");
			const pathSegments = url.pathname.split("/").filter(Boolean);
			const queryParams = toParamsObject(url.searchParams);
			const routeIndex = pathSegments.findIndex((segment) => routeHintToPath(segment));
			const routeHint = routeIndex >= 0 ? routeHintToPath(pathSegments[routeIndex]) : null;
			const pathIdCandidates = routeIndex >= 0
				? [pathSegments[routeIndex + 1], pathSegments[routeIndex + 2], pathSegments[pathSegments.length - 1]]
				: [pathSegments[pathSegments.length - 1]];
			const pathId = firstString(
				...pathIdCandidates.filter((segment) => {
					if (typeof segment !== "string") return false;
					const normalizedSegment = segment.trim().toLowerCase();
					return !["detail", "details", "edit", "view", "new"].includes(normalizedSegment);
				})
			);
			const queryHasId = firstString(
				queryParams.id,
				queryParams.asset_id,
				queryParams.location_id,
				queryParams.work_order_id
			);
			payload = {
				...queryParams,
				...(routeHint ? { route: routeHint } : {}),
				...(!queryHasId && pathId ? { id: pathId } : {}),
				pathname: url.pathname,
			};
		} catch {
			// Not a URL, fall through to raw string handling.
		}
	}

	if (!payload) {
		const prefixMatch = trimmed.match(/^(asset|location|work[_-]?order|workorder)\s*[:/]\s*(.+)$/i);
		if (prefixMatch) {
			const kind = prefixMatch[1]!.toLowerCase().replace(/[_-]/g, "");
			const value = prefixMatch[2]!.trim();
			if (kind === "asset") {
				return { pathname: "/assetDetail", params: { id: value } };
			}
			if (kind === "location") {
				return { pathname: "/locationDetail", params: { id: value } };
			}
			if (kind === "workorder") {
				return { pathname: "/workOrderDetail", params: { data: JSON.stringify({ id: value }) } };
			}
		}

		return { pathname: "/assetDetail", params: { id: trimmed } };
	}

	const explicitRoute = normalizeRoute(
		firstString(
			payload.route,
			payload.pathname,
			payload.screen,
			payload.target,
		)
	);

	const explicitType = firstString(payload.type, payload.entity).toLowerCase().replace(/[^a-z0-9]+/g, "");

	const assetId = firstString(
		payload.id,
		payload.asset_id,
		payload.assetId,
		payload.assetID,
		payload.asset?.id
	);
	const locationId = firstString(
		payload.id,
		payload.location_id,
		payload.locationId,
		payload.locationID,
		payload.location?.id
	);
	const workOrderId = firstString(
		payload.id,
		payload.work_order_id,
		payload.workOrderId,
		payload.workOrderID
	);
	const compositeId = firstString(
		payload.composite_id,
		payload.compositeId,
		payload.compositeID
	);

	if (explicitRoute === "/workOrderDetail" || explicitType === "workorder" || looksLikeWorkOrderPayload(payload)) {
		const nestedWorkOrderPayload =
			(isPlainObject(payload.work_order_data) && payload.work_order_data) ||
			(isPlainObject(payload.workOrderData) && payload.workOrderData) ||
			(isPlainObject(payload.workOrder) && payload.workOrder) ||
			(typeof payload.data === "string" ? safeJsonParse(payload.data) || { id: payload.data } : null) ||
			payload;

		const workOrderPayload = isPlainObject(nestedWorkOrderPayload)
			? nestedWorkOrderPayload
			: payload;

		const id = firstString(workOrderPayload?.id, workOrderId);
		if (!id) return null;

		return {
			pathname: "/workOrderDetail",
			params: { data: JSON.stringify({ ...workOrderPayload, id }) },
		};
	}

	if (explicitRoute === "/locationDetail" || explicitType === "location" || looksLikeLocationPayload(payload)) {
		const id = locationId;
		if (!id) return null;

		return {
			pathname: "/locationDetail",
			params: { id },
		};
	}

	if (
		explicitRoute === "/assetDetail" ||
		explicitType === "asset" ||
		looksLikeAssetPayload(payload) ||
		assetId
	) {
		if (!assetId) return null;

		return {
			pathname: "/assetDetail",
			params: compositeId ? { id: assetId, composite_id: compositeId } : { id: assetId },
		};
	}

	return null;
};

export default function ScannerScreen() {
	const router = useRouter();
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = useState(false);
	const [scannedData, setScannedData] = useState<string | null>(null);
	const [scanMessage, setScanMessage] = useState<string | null>(null);
	const scanLockedRef = useRef(false);

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
		if (scanLockedRef.current) {
			return;
		}

		scanLockedRef.current = true;
		setScanned(true);
		setScannedData(data);
		setScanMessage(null);

		const target = resolveScannerTarget(data);
		if (target) {
			router.push(target as never);
			return;
		}

		setScanMessage("Unsupported QR code. Please scan a valid asset, location, or work order code.");
	};

	const handleScanAgain = () => {
		scanLockedRef.current = false;
		setScanned(false);
		setScannedData(null);
		setScanMessage(null);
	};

	return (
		<>
			<Header title="Scanner" />
			<View style={styles.container}>
				<View style={styles.scannerBox}>
					{!scanned ? (
						permission?.granted && (
							<CameraView
								style={StyleSheet.absoluteFill}
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


				{(scannedData || scanMessage) && (
					<View style={styles.resultBox}>
						{scannedData && <Text style={styles.resultLabel}>Scanned QR Code:</Text>}
						{scannedData && <Text style={styles.resultValue}>{scannedData}</Text>}
						{scanMessage && <Text style={styles.resultValue}>{scanMessage}</Text>}
					</View>
				)}

				<ActionButton label={scanned ? "Scan Again" : "Scan"} buttonStyle={styles.actionButton} onPress={() => {
					handleScanAgain();
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
		marginTop: 2,
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
