import { useEffect, useState } from "react";
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
	const [ready, setReady] = useState(false);
	const { user, setUser, clearUser } = useAuthStore();

	useEffect(() => {
		let isMounted = true;

		const validateRoute = async () => {
			const token = await getAuthToken();
			const storedUser = parseStoredUser();
			const hasSession = !!token && !!storedUser;

			if (!isMounted) return;

			// Sync store with storage if needed
			if (hasSession && !user) {
				setUser(storedUser);
			} else if (!hasSession && user) {
				clearUser();
			}

			const [routeGroup] = segments;
			const isPublicRoute = PUBLIC_ROUTE_GROUPS.has(routeGroup || "");

			if (!hasSession && !isPublicRoute) {
				router.replace("/(auth)");
			} else if (hasSession && isPublicRoute) {
				router.replace("/overview");
			} else {
				// Only set ready if we are on the correct route
				setReady(true);
			}
		};

		validateRoute();

		return () => {
			isMounted = false;
		};
	}, [segments, user]);

	return ready;
};
