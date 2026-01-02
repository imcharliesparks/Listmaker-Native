import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Pages } from '@/constants/Shared';
import { useAuth } from '@/context/AuthContext';

type HeaderProps = {
  currentPage: Pages;
};

export default function Header({ currentPage }: HeaderProps) {
  const { backendUser, user, isAuthenticated, signOut, backendError } = useAuth();
  const displayName =
    backendUser?.display_name ||
    user?.fullName ||
    user?.username ||
    backendUser?.email ||
    user?.primaryEmailAddress?.emailAddress ||
    'Welcome';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const email = backendUser?.email || user?.primaryEmailAddress?.emailAddress || '';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Pressable style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>LM</Text>
          </View>
          <Text style={styles.title}>Curate</Text>
        </View>

        {currentPage === Pages.Boards && <Text style={styles.subtitle}>Your Boards</Text>}
      </View>

      <View style={styles.headerRight}>
        <Pressable style={styles.iconButton}>
          <Ionicons name="search" size={24} color={Colors.text} />
        </Pressable>
        {isAuthenticated && (
          <View style={styles.userChip}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              {!!email && (
                <Text style={styles.userEmail} numberOfLines={1}>
                  {email}
                </Text>
              )}
              {!!backendError && (
                <Text style={styles.errorText} numberOfLines={1}>
                  Sync issue — pull to refresh
                </Text>
              )}
            </View>
            <Pressable style={styles.iconButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={22} color={Colors.text} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '700',
    color: Colors.text,
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
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: Colors.gray200,
    borderRadius: 16,
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  userDetails: {
    maxWidth: 170,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
  },
});
