import "@/src/utils/productionConsole";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const authReady = useAuthGuard();
	const [loaded, error] = useFonts({
		'Sora-Bold': require('../assets/fonts/Sora-Bold.ttf'),
		'Sora-ExtraBold': require('../assets/fonts/Sora-ExtraBold.ttf'),
		'Sora-ExtraLight': require('../assets/fonts/Sora-ExtraLight.ttf'),
		'Sora-Light': require('../assets/fonts/Sora-Light.ttf'),
		'Sora-Medium': require('../assets/fonts/Sora-Medium.ttf'),
		'Sora-Regular': require('../assets/fonts/Sora-Regular.ttf'),
		'Sora-SemiBold': require('../assets/fonts/Sora-SemiBold.ttf'),
		'Sora-Thin': require('../assets/fonts/Sora-Thin.ttf'),
	})

	useEffect(() => {
		if ((loaded || error) && authReady) SplashScreen.hideAsync();
	}, [loaded, error, authReady]);

	if ((!loaded && !error) || !authReady) return null;

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider>
				{/* <Stack screenOptions={{ headerShown: false }} /> */}
				<Stack initialRouteName="(auth)/index" screenOptions={{
					headerShown: false,
					navigationBarColor: "#742BDE", animation: "flip", animationTypeForReplace: "push"
				}} />
			</KeyboardProvider>
		</GestureHandlerRootView>
	)
}
