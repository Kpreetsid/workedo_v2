import * as SecureStore from "expo-secure-store";
import { storage } from "./mmkv";

const AUTH_TOKEN_KEY = "workedo.auth.token";
const LEGACY_TOKEN_KEY = "token";

const secureStoreOptions: SecureStore.SecureStoreOptions = {
	keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export const getAuthToken = async (): Promise<string | null> => {
	const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY, secureStoreOptions);
	if (token) {
		return token;
	}

	const legacyToken = storage.getString(LEGACY_TOKEN_KEY);
	if (legacyToken) {
		await setAuthToken(legacyToken);
		return legacyToken;
	}

	return null;
};

export const setAuthToken = async (token?: string | null): Promise<void> => {
	if (!token) {
		await deleteAuthToken();
		return;
	}

	await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, secureStoreOptions);
	storage.delete(LEGACY_TOKEN_KEY);
};

export const deleteAuthToken = async (): Promise<void> => {
	await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY, secureStoreOptions);
	storage.delete(LEGACY_TOKEN_KEY);
};

export const migrateLegacyAuthToken = async (): Promise<void> => {
	await getAuthToken();
};
