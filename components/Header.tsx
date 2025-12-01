import {Pressable, StyleSheet, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/constants/Colors";
import React from "react";
import {Pages} from "@/constants/Shared";

type HeaderProps = {
    currentPage: Pages
}

export default function Header({ currentPage }: HeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Pressable style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color={Colors.text}/>
                </Pressable>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>🎯</Text>
                    </View>
                    <Text style={styles.title}>Curate</Text>
                </View>

                {
                    currentPage === Pages.Boards &&
                    <Text style={styles.subtitle}>Your Boards</Text>
                }
            </View>

            <View style={styles.headerRight}>
                <Pressable style={styles.iconButton}>
                    <Ionicons name="search" size={24} color={Colors.text}/>
                </Pressable>
                <Pressable style={styles.iconButton}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.surface,
    },
    headerLeft: {
        flex: 1,
    },
    menuButton: {
        marginBottom: 8,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    logoText: {
        fontSize: 18,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
    },
    listContent: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
        gap: 16,
    },
});