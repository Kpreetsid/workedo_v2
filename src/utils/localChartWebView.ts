export const LOCAL_CHART_ORIGIN_WHITELIST = ["file://"];

export const LOCAL_CHART_WEBVIEW_PROPS = {
	originWhitelist: LOCAL_CHART_ORIGIN_WHITELIST,
	allowFileAccess: true,
	allowFileAccessFromFileURLs: false,
	allowUniversalAccessFromFileURLs: false,
	webviewDebuggingEnabled: __DEV__,
};
