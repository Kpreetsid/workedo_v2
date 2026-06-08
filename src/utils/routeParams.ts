export const getRouteParamString = (value: unknown): string | undefined => {
	const candidate = Array.isArray(value) ? value[0] : value;
	return typeof candidate === "string" && candidate.trim() ? candidate : undefined;
};

export const parseJsonRouteParam = <T = any>(value: unknown, fallback: T | null = null): T | null => {
	const raw = getRouteParamString(value);
	if (!raw) {
		return fallback;
	}

	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
};
