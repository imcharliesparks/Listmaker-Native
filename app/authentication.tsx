import {View, Text, StyleSheet} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import {Colors} from "@/constants/Colors";
import Header from "@/components/Header";
import {Pages} from "@/constants/Shared";
import {AuthForm} from "@/components/AuthForm";

export default function AuthenticationPage(){
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header currentPage={Pages.Authentication}/>
            {/* TODO: Add auth UI */}
            <AuthForm />
        </SafeAreaView>
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