import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { Link, Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { SignOutButton } from '@/components/SignOutButton';

export default function HomeIndex() {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(home)/(tabs)" />;
  }

  return (
    <View className="flex-1 items-center justify-center p-6">
      <SignedIn>
        <Text className="text-lg font-semibold mb-2">
          Hello {user?.emailAddresses?.[0]?.emailAddress}
        </Text>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <View className="items-center gap-3">
          <Text className="text-lg font-semibold">Welcome to Listmaker</Text>
          <Link href="/sign-in">
            <Text className="text-primary underline">Sign in</Text>
          </Link>
          <Link href="/sign-up">
            <Text className="text-primary underline">Sign up</Text>
          </Link>
        </View>
      </SignedOut>
    </View>
  );
}
