import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import Fonts from '@/constants/Typography'
import { endpoints } from '@/src/api/endpoints'

const AssetUserInfo = ({ users = [], onPress }: { users: any[], onPress: () => void }) => {

    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Text style={styles.label}>Assign to User</Text>

            <View style={styles.rightSection}>
                <View style={styles.avatars}>
                    <FlatList
                        contentContainerStyle={{ flex: 1, justifyContent: "flex-end" }}
                        data={users}
                        renderItem={({ item, index }) => {

                            const profileImg = item?.user_profile_img;
                            const first = item?.firstName?.[0] || "";
                            const last = item?.lastName?.[0] || "";
                            const initials = (first + last).toUpperCase();

                            return (
                                <View style={styles.avatarContainer}>
                                    {profileImg ? (
                                        <Image
                                            key={index}
                                            source={{ uri: `${endpoints.baseURL}user_profile_img/${profileImg}` }}
                                            style={[styles.avatar, { marginLeft: index === 0 ? 0 : -12 }]}
                                        />
                                    ) : (
                                        <View style={[styles.avatarFallback, { marginLeft: index === 0 ? 0 : -15 }]}>
                                            <Text style={styles.avatarInitials}>{initials}</Text>
                                        </View>
                                    )}


                                </View>
                            );
                        }}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>

                <Ionicons name="chevron-forward" size={16} color="#333" />
            </View>
        </Pressable>
    )
}

export default AssetUserInfo

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 20,
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    avatarContainer: {
        marginRight: 8,
    },
    label: {
        width: '35%',
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#222",
    },
    rightSection: {
        width: '65%',
        flexDirection: "row",
        alignItems: "center",
    },
    avatars: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#fff",
    },
    chevron: {
        width: 16,
        height: 16,
        tintColor: "#999",
    },
    avatarFallback: {
        width: 25,
        height: 25,
        borderRadius: 25 / 2,
        backgroundColor: "#9999FF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    avatarInitials: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 12,
    },
});