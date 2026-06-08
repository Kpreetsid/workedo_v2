import { useEffect, useMemo, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { storage } from "@/src/storage/mmkv";
import { getAuthToken } from "@/src/storage/secureAuth";
import { useAuthStore } from "@/src/store/useAuthStore";

const PUBLIC_ROUTE_GROUPS = new Set(["(auth)"]);

const parseStoredUser = () => {
	const user = storage.getString("user");
	if (!user) {
		return null;
	}

	try {
		return JSON.parse(user);
	} catch {
		storage.delete("user");
		return null;
	}
};

export const useAuthGuard = () => {
	const router = useRouter();
	const segments = useSegments();
	const routeKey = useMemo(() => segments.join("/"), [segments]);
	const [ready, setReady] = useState(false);
	const { user, setUser, clearUser } = useAuthStore();

	useEffect(() => {
		let active = true;

		const validateRoute = async () => {
			setReady(false);

			const [routeGroup] = segments;
			const isPublicRoute = !routeGroup || PUBLIC_ROUTE_GROUPS.has(routeGroup);
			const token = await getAuthToken();
			const storedUser = parseStoredUser();
			const hasSession = !!token && !!storedUser;

			if (!active) {
				return;
			}

			if (hasSession && !user) {
				setUser(storedUser);
			}

			if (!hasSession && user) {
				clearUser();
			}

			if (!hasSession && !isPublicRoute) {
				router.replace("/");
			}

			if (hasSession && isPublicRoute) {
				router.replace("/overview");
			}

			if (active) {
				setReady(true);
			}
		};

		validateRoute();

		return () => {
			active = false;
		};
	}, [routeKey, user, setUser, clearUser, router]);

	return ready;
};
