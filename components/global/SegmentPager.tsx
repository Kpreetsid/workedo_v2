import {cloneElement, ReactElement, ReactNode, useRef, useState} from "react";
import {Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle} from "react-native";
import PagerView, {PagerViewOnPageSelectedEvent} from "react-native-pager-view";
import Fonts from "@/constants/Typography";

interface TabConfig {
    label: string;
    icon?: ReactNode;
    component: ReactNode;
}

interface SegmentedPagerProps {
    tabs: TabConfig[];
    initialPage?: number;
    containerStyle?: StyleProp<ViewStyle>;
    tabStyle?: StyleProp<ViewStyle>;
    activeTabStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    activeTextStyle?: StyleProp<TextStyle>;
}

export default function SegmentedPager({tabs, initialPage = 0, containerStyle, tabStyle, activeTabStyle, textStyle, activeTextStyle}: SegmentedPagerProps) {
    const pagerRef = useRef<PagerView>(null);
    const [activeTab, setActiveTab] = useState(initialPage);

    const handleTabPress = (index: number) => {
        setActiveTab(index);
        pagerRef.current?.setPage(index);
    };

    const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
        setActiveTab(e.nativeEvent.position);
    };

    return (
        <>
            {/* Tabs */}
            <View style={[styles.tabRow, containerStyle]}>
                {tabs.map((tab, index) => {
                    const isActive = index === activeTab;
                    return (
                        <Pressable key={index} style={[styles.tab, tabStyle, isActive && [styles.activeTab, activeTabStyle]]} onPress={() => handleTabPress(index)}>
                            {cloneElement(tab.icon as ReactElement<any>, {color: isActive ? "#FFFFFF" : "#000000"})}

                            <Text style={[styles.tabText, textStyle, isActive && [styles.activeTabText, activeTextStyle]]}> {tab.label} </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Pager */}
            <PagerView style={styles.pager} initialPage={initialPage} ref={pagerRef} onPageSelected={onPageSelected}>
                {tabs.map((tab, index) => (
                    <View key={index.toString()} style={styles.page}>
                        {tab.component}
                    </View>
                ))}
            </PagerView>
        </>
    );
}

const styles = StyleSheet.create({
    tabRow: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 100,
        overflow: "hidden",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
        height: 40,
        borderWidth: 0.1,
        borderColor: "#00000066",
        marginVertical: 10,
    },
    tab: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        height: 32,
        borderRadius: 100,
        flexDirection: "row",
        gap: 7,
    },
    activeTab: {
        backgroundColor: "#742BDE",
        borderColor: "#5552FE",
        borderWidth: 0.4,
    },
    tabText: {
        fontSize: 12,
        fontFamily: Fonts.light,
        color: "#000000",
        lineHeight: 18,
    },
    activeTabText: {
        color: "#fff",
        fontFamily: Fonts.light,
    },
    pager: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
});
