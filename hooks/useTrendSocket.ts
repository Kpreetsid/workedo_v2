import { useEffect, useRef, useState } from "react";

interface TrendSocketParams {
	payload: any;
	enabled: boolean;
	onData: (data: any) => void;
	onStatus?: (status: string) => void;
}

const WS_URL = "wss://testprocessor.presageinsights.ai/ws/trend_data/";

export function useTrendSocket({
	payload,
	enabled,
	onData,
	onStatus,
}: TrendSocketParams) {
	const socketRef = useRef<WebSocket | null>(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		if (!enabled || !payload) return;

		// 🔥 Kill any existing socket first
		if (socketRef.current) {
			socketRef.current.close();
			socketRef.current = null;
		}

		const ws = new WebSocket(WS_URL);
		socketRef.current = ws;

		ws.onopen = () => {
			setConnected(true);
			onStatus?.("connected");

			// 🚀 Send first payload immediately
			ws.send(JSON.stringify(payload));
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				// console.log("WS message =", message);

				// ----------------------------
				// STATUS / CONTROL MESSAGES
				// ----------------------------
				if (typeof message === "string") {
					onStatus?.(message);
					return;
				}

				if (message?.status) {
					onStatus?.(message.status);
					return;
				}

				// ----------------------------
				// ACTUAL TREND DATA MESSAGE
				// ----------------------------
				if (message?.data && Array.isArray(message.data)) {
					onStatus?.("data");
					onData(message);
					return;
				}

				console.warn("Unknown WS message format:", message);
			} catch (err) {
				console.warn("Invalid WS message:", event.data);
			}
		};


		ws.onerror = (err) => {
			console.error("WebSocket error:", err);
		};

		ws.onclose = () => {
			setConnected(false);
			onStatus?.("disconnected");
		};

		return () => {
			ws.close();
		};
	}, [enabled, JSON.stringify(payload)]); // ⚠️ intentional

	return { connected };
}
