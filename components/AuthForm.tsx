import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';

export const AuthForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        setLoading(true);
        try {
            await auth().createUserWithEmailAndPassword(email, password);
            // Firebase automatically handles the logged-in state.
            // Your app's auth state listener will handle navigation.
        } catch (error) {
            // @ts-ignore
            Alert.alert("Signup Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        try {
            await auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
            // @ts-ignore
            Alert.alert("Login Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 20 }}
                secureTextEntry
            />
            <Button
                title={loading ? "Loading..." : "Sign In"}
                onPress={handleSignIn}
                disabled={loading}
            />
            <View style={{ marginTop: 10 }}>
                <Button
                    title="Create Account"
                    onPress={handleSignUp}
                    disabled={loading}
                    color="gray"
                />
            </View>
        </View>
    );
};