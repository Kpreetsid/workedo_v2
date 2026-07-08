import { JSX } from "react";
import { Assets, More, Overview, Scanner, WorkOrders } from "@/constants/IconProvider";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Fonts from "@/constants/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MoreTabIcons } from "@/constants/IconProvider";

// type CustomTabBarProps = {
//     state: { index: number; routes: { key: string; name: string }[]; };
//     navigation: { navigate: (name: string) => void; };
//     descriptors: Record<string, { options: { title?: string; } }>;
//     onMorePress: () => void;
// };

// export default function CustomTabBar({state, descriptors, navigation, onMorePress}: CustomTabBarProps) {
//     const icons: Record<string, (props: { color: string }) => JSX.Element> = {
//         overview: (props) => <Overview {...props} />,
//         // test: (props) => <Overview {...props} />,
//         workOrders: (props) => <WorkOrders {...props} />,
//         assets: (props) => <Assets {...props} />,
//         scanner: (props) => <Scanner {...props} />,
//         more: (props) => <More {...props} />,
//     };

//     return (
//         <View style={[styles.tabBar, {marginBottom: useSafeAreaInsets().bottom}]}>
//             {state.routes.map((route, index) => {
//                 const {options} = descriptors[route.key];
//                 const label = options.title || route.name;
//                 const isFocused = state.index === index;

//                 const color = isFocused ? "#742BDE" : "#8B8B94";

//                 const onPress = () => {
//                     if (route.name === "more") onMorePress();
//                     else navigation.navigate(route.name as never);
//                 };

//                 return (
//                     <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
//                         <View style={styles.iconContainer}>{icons[route.name]({color})}</View>
//                         <Text style={[styles.tabLabel, {color: isFocused ? "#742BDE" : "#8B8B94"}]} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
//                     </Pressable>
//                 );
//             })}
//         </View>
//     );
// }

type CustomTabBarProps = {
	state: { index: number; routes: { key: string; name: string }[] };
	navigation: { navigate: (name: string) => void };
	descriptors: Record<string, { options: { title?: string } }>;
	onMorePress: () => void;
	onTabPress: () => void; // ✅ new prop
	modalVisible?: boolean;
};

export default function CustomTabBar({ state, descriptors, navigation, onMorePress, onTabPress }: CustomTabBarProps) {
	const insets = useSafeAreaInsets();
	const RequestsIcon = MoreTabIcons.Requests;
	const icons: Record<string, (props: { color: string }) => JSX.Element> = {
		overview: (props) => <Overview {...props} />,
		workOrders: (props) => <WorkOrders {...props} />,
		assets: (props) => <Assets {...props} />,
		requests: (props) => <RequestsIcon {...props} />,
		scanner: (props) => <Scanner {...props} />,
		more: (props) => <More {...props} />,
	};
	const visibleRoutes = state.routes.filter((route) => route.name !== "scanner");

	return (
		<View style={[styles.tabBar, { marginBottom: insets.bottom }]}>
			{visibleRoutes.map((route) => {
				const index = state.routes.findIndex((item) => item.key === route.key);
				const { options } = descriptors[route.key];
				const label = options.title || route.name;
				const isFocused = state.index === index;
				const color = isFocused ? "#742BDE" : "#8B8B94";

				const onPress = () => {
					if (route.name === "more") onMorePress();
					else {
						onTabPress(); // ✅ closes modal when any other tab is pressed
						navigation.navigate(route.name as never);
					}
				};

				return (
					<Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
						<View style={styles.iconContainer}>{icons[route.name]({ color })}</View>
						<Text style={[styles.tabLabel, { color }]} numberOfLines={1} adjustsFontSizeToFit>
							{label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		flexDirection: "row",
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "#eee",
		backgroundColor: "#fff",
		alignItems: "center",
		paddingHorizontal: 5,
		height: 70
	},
	tabItem: {
		flex: 1,
		justifyContent: "space-between",
		alignItems: "center",
	},
	tabLabel: {
		fontFamily: Fonts.regular,
		fontSize: 11,
		marginTop: 4
	},
	iconContainer: {
		height: 23,
		width: 23,
		alignItems: "center",
		justifyContent: "center"

	}
})
