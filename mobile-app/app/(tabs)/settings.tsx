import React, { useState } from 'react';
import { View, TextInput, Pressable , Alert, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const ESP32_IP = 'http://192.168.31.121';

export default function Settings() {
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');

    const updateWiFi = () => {
        fetch(`${ESP32_IP}/update_wifi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ssid, password }),
        })
            .then(res => res.text())
            .then(message => Alert.alert('Response', message))
            .catch(err => Alert.alert('Error', err.message));
    };

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                Reset The Network :
            </Text>
            <TextInput
                placeholder="New WiFi SSID"
                value={ssid}
                onChangeText={setSsid}
                style={styles.input}
            />
            <TextInput
                placeholder="New WiFi Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <View style={[
                styles.buttonContainer,
                { borderWidth: 1, borderColor: '#000', borderRadius: 15 },
            ]}>
                <Pressable style={[
                    styles.button, ]}
                    onPress={updateWiFi}>
                    <FontAwesome name="wifi" size={18} color="#25292e" style={styles.buttonIcon} />
                    <Text style={[styles.buttonLabel, { color: '#25292e' }]}>"Update WiFi"</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        paddingHorizontal: 20 },
    input: {
        borderWidth: 1,
        borderColor: '#888',
        padding: 10,
        marginVertical: 10,
        borderRadius: 8,
    },
    buttonContainer: {
        width: 200,
        height: 40,
        marginTop: 10,
        marginHorizontal: 20,
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonIcon:{
        paddingRight:8 ,
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 16,
    },
});


