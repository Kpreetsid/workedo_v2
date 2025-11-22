import { useCallback } from "react";
import { storage } from "@/src/storage/mmkv";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { useAssetStore } from "@/src/store/useAssetStore";
import { useGatewayStore } from "@/src/store/useGatewayStore";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { useUserFormStore } from "@/src/store/useUserFormStore";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { useCreateLocationStore } from "@/src/store/useCreateLocationStore";
import { useCreateAssetStore } from "@/src/store/useCreateAsset";

export function useGlobal() {
	const router = useRouter();
	const { setUser } = useAuthStore();

	const logout = () => {
		console.log("Logout");
		storage.delete('token');
		storage.delete('user');
		router.replace("/");

		useOverviewStore.getState().clearOverview();
		useAssetStore.getState().clearAssetState();
		useGatewayStore.getState().resetGatewayForm();
		useLocationStore.getState().clearPartLocation();
		usePartFormStore.getState().resetPartForm();
		usePreventiveStore.getState().resetForm();
		useUserFormStore.getState().resetForm();
		useWorkOrderStore.getState().resetForm();
		useWorkRequestStore.getState().resetWorkRequestForm();
		useCreateAssetStore.getState().resetForm();
		useCreateLocationStore.getState().resetForm();
		setUser(null);
	}

	return {
		logout
	};
}
