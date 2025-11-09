import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface LoginModalProps {
  visible: boolean;
  onLoginSuccess: () => void;
}

export default function LoginModal({ visible, onLoginSuccess }: LoginModalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // Only used during registration

  const handleLogin = () => {
    // Demo validation
    if (username === 'admin' && password === '1234') {
      setUsername('');
      setPassword('');
      onLoginSuccess();
    } else {
      alert('Invalid login credentials');
    }
  };

  const handleRegister = () => {
    // Basic validation, replace with real API
    if (!username || !email || !password) {
      alert('Please fill all registration fields');
      return;
    }
    const saveUserCredentials = async (username: string, password: string) => {
  try {
    await SecureStore.setItemAsync('username', username);
    await SecureStore.setItemAsync('password', password);
  } catch (e) {
    console.error('Failed to save credentials', e);
  }
};

    alert(`Registered (${username})! You can now login.`);
    setUsername('');
    setEmail('');
    setPassword('');
    setIsRegisterMode(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => {}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackground}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>{isRegisterMode ? 'Register' : 'Login'}</Text>
            {isRegisterMode ? (
              <>
                <TextInput
                  placeholder="Username"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                />
                <TextInput
                  placeholder="Email"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable style={styles.actionButton} onPress={handleRegister}>
                  <Text style={styles.actionButtonText}>Register</Text>
                </Pressable>
                <TouchableOpacity onPress={() => setIsRegisterMode(false)} style={styles.switchMode}>
                  <Text style={styles.switchModeText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  placeholder="Username"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                />
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable style={styles.actionButton} onPress={handleLogin}>
                  <Text style={styles.actionButtonText}>Login</Text>
                </Pressable>
                <TouchableOpacity onPress={() => setIsRegisterMode(true)} style={styles.switchMode}>
                  <Text style={styles.switchModeText}>Don't have an account? Register</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  actionButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  actionButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchMode: {
    marginTop: 20,
  },
  switchModeText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
