import {Pressable, StyleSheet, TextInput, View} from "react-native";
import Fonts from "@/constants/Typography";
import {CloseIcon, SearchIconLocationTab} from "@/constants/IconProvider";
import {FC} from "react";

type SearchBarProps = {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
};

const SearchBar: FC<SearchBarProps> = ({placeholder = "Search...", value, onChangeText}) => {
    return (
        <View style={styles.searchContainer}>
            <SearchIconLocationTab/>

            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#00000060"
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
            />

            {value.length > 0 && (
                <Pressable onPress={() => onChangeText("")} style={styles.clearButton}>
                    <CloseIcon/>
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 12,
        marginHorizontal: 20,
        marginBottom: 10,
        gap: 10,
    },
    input: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        flex: 1,
    },
    clearButton: {
        padding: 4,
    },
});

export default SearchBar;
