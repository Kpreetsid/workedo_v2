import { useEffect, useMemo, useRef, useState } from "react";

interface TrendSocketParams {
	payload: any;
	enabled: boolean;
	onData: (data: any) => void;
	onStatus?: (status: string) => void;
}

const WS_URL = "wss://processor.presageinsights.ai/ws/trend_data/";

export function useTrendSocket({
	payload,
	enabled,
	onData,
	onStatus,
}: TrendSocketParams) {
	const socketRef = useRef<WebSocket | null>(null);
	const onDataRef = useRef(onData);
	const onStatusRef = useRef(onStatus);
	const [connected, setConnected] = useState(false);

	const payloadKey = useMemo(() => {
		if (!enabled || !payload) return "";
		try {
			return JSON.stringify(payload);
		} catch {
			return "";
		}
	}, [enabled, payload]);

	useEffect(() => {
		onDataRef.current = onData;
		onStatusRef.current = onStatus;
	}, [onData, onStatus]);

	useEffect(() => {
		if (!enabled || !payload || !payloadKey) {
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
			setConnected(false);
			return;
		}

		let active = true;

		if (socketRef.current) {
			socketRef.current.close();
			socketRef.current = null;
		}

		const ws = new WebSocket(WS_URL);
		socketRef.current = ws;

		ws.onopen = () => {
			if (!active || socketRef.current !== ws) return;

			setConnected(true);
			onStatusRef.current?.("connected");

			if (ws.readyState === WebSocket.OPEN) {
				ws.send(payloadKey);
			}
		};

		ws.onmessage = (event) => {
			if (!active || socketRef.current !== ws) return;

			try {
				const message = JSON.parse(event.data);

				if (typeof message === "string") {
					onStatusRef.current?.(message);
					return;
				}

				if (message?.status) {
					onStatusRef.current?.(message.status);
					return;
				}

				if (message?.data && Array.isArray(message.data)) {
					onStatusRef.current?.("data");
					onDataRef.current(message);
					return;
				}

				console.warn("Unknown WS message format:", message);
			} catch {
				console.warn("Invalid WS message");
			}
		};

		ws.onerror = (err) => {
			if (!active || socketRef.current !== ws) return;
			console.error("WebSocket error:", err);
		};

		ws.onclose = () => {
			if (!active || socketRef.current !== ws) return;

			setConnected(false);
			onStatusRef.current?.("disconnected");
		};

		return () => {
			active = false;

			if (socketRef.current === ws) {
				socketRef.current = null;
			}

			ws.onopen = null;
			ws.onmessage = null;
			ws.onerror = null;
			ws.onclose = null;

			if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
				ws.close();
			}
		};
	}, [enabled, payload, payloadKey]);

	return { connected };
}
