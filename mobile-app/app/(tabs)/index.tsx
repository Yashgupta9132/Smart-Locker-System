import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  Pressable,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import LoginModal from '../LoginModal'; // Adjust the path as per your project structure

const ESP32_IP = 'http://192.168.31.121';

export default function Index() {
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  const [lockerStatus, setLockerStatus] = useState('');
  const [contentStatus, setContentStatus] = useState('');
  const [isLocked, setIsLocked] = useState(true); // true means closed initially
  const [statusVisible, setStatusVisible] = useState(false);
  const resetTimerId = useRef<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');

  // Clear timer for resetting display status
  const clearExistingTimer = () => {
    if (resetTimerId.current !== null) {
      clearTimeout(resetTimerId.current);
      resetTimerId.current = null;
    }
  };

  // Schedule status display reset
  const scheduleStatusReset = () => {
    clearExistingTimer();
    resetTimerId.current = setTimeout(() => {
      setStatusVisible(false);
      setLockerStatus('');
      setContentStatus('');
      resetTimerId.current = null;
    }, 5000);
  };

  // Fetch locker status from ESP32
  const fetchStatus = () => {
    setLoading(true);
    fetch(`${ESP32_IP}/status`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch status ');
        return res.text();
      })
      .then(text => {
        setIsOnline(true); // Locker is reachable

        const lockerMatch = text.match(/<p><b>Locker:<\/b>\s*(.*?)<\/p>/i);
        const contentMatch = text.match(/<p><b>Content:<\/b>\s*(.*?)<\/p>/i);

        const locker = lockerMatch ? lockerMatch[1] : 'Unknown';
        setLockerStatus(locker);
        setContentStatus(contentMatch ? contentMatch[1] : 'Unknown');
        setIsLocked(locker.toLowerCase() === 'closed');
        setStatusVisible(true);

        scheduleStatusReset();
      })
      .catch(() => {
        // Connectivity error means offline
        setIsOnline(false);
        Alert.alert('Error', 'Locker appears offline. Check network connection.');
      })
      .finally(() => setLoading(false));
  };

  // Initial status fetch on mount & after login
  useEffect(() => {
    if (userAuthenticated) {
      fetchStatus();
    }
  }, [userAuthenticated]);

  const showSuccessModal = (message: string) => {
    setSuccessModalMessage(message);
    setSuccessModalVisible(true);
  };

  // Controls are disabled when not authenticated or loading
  const canControl = userAuthenticated && !loading;

  const handleOpen = () => {
    if (!canControl) return;
    setLoading(true);
    fetch(`${ESP32_IP}/open`)
      .then(() => {
        setIsLocked(false);
        fetchStatus();
        showSuccessModal('Locker opened successfully!');
      })
      .catch(err => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  };

  const handleClose = () => {
    if (!canControl) return;
    setLoading(true);
    fetch(`${ESP32_IP}/close`)
      .then(() => {
        setIsLocked(true);
        fetchStatus();
        showSuccessModal('Locker closed successfully!');
      })
      .catch(err => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  };

  const handleStatus = () => {
    if (!canControl) return;
    fetchStatus();
  };

  return (
    <View style={styles.viewContainer}>
      {/* Login Modal */}
      <LoginModal
        visible={!userAuthenticated}
        onLoginSuccess={() => setUserAuthenticated(true)}
      />

      {/* Show spinner over UI when loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}

      {/* Show online/offline status */}
      {isOnline === true && (
        <View style={[styles.statusBanner, { backgroundColor: '#28a745' }]}>
          <Text style={styles.statusBannerText}>Locker Online</Text>
        </View>
      )}
      {isOnline === false && (
        <View style={[styles.statusBanner, { backgroundColor: '#dc3545' }]}>
          <Text style={styles.statusBannerText}>Locker Offline</Text>
        </View>
      )}

      {/* Locker control buttons */}
      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 2, borderColor: '#fff', borderRadius: 15 },
        ]}
      >
        <Pressable
          style={[styles.button, { backgroundColor: '#fff' }]}
          onPress={handleOpen}
          disabled={!canControl}
        >
          <FontAwesome
            name="unlock"
            size={18}
            color="#25292e"
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonLabel, { color: '#25292e' }]}>
            Open Locker
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 2, borderColor: '#fff', borderRadius: 15 },
        ]}
      >
        <Pressable
          style={[styles.button, { backgroundColor: '#fff' }]}
          onPress={handleClose}
          disabled={!canControl}
        >
          <FontAwesome
            name="lock"
            size={18}
            color="#25292e"
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonLabel, { color: '#25292e' }]}>
            Close Locker
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 2, borderColor: '#fff', borderRadius: 15 },
        ]}
      >
        <Pressable
          style={[styles.button, { backgroundColor: '#fff' }]}
          onPress={handleStatus}
          disabled={!canControl}
        >
          <FontAwesome
            name="cloud"
            size={18}
            color="#25292e"
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonLabel, { color: '#25292e' }]}>
            Check Status
          </Text>
        </Pressable>
      </View>

      {/* Status display */}
      {statusVisible && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Locker Status</Text>
          <Text>Locker: {lockerStatus}</Text>
          <Text>Content: {contentStatus}</Text>
        </View>
      )}

      {/* Success modal */}
      <Modal
        transparent
        visible={successModalVisible}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{successModalMessage}</Text>
            <Pressable
              onPress={() => setSuccessModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBanner: {
    width: '100%',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'absolute',
    top: 20,
  },
  statusBannerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: 220,
    height: 50,
    marginHorizontal: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 3,
    marginVertical: 6,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    paddingRight: 8,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
  statusContainer: {
    marginTop: 20,
    padding: 15,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    width: '60%',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#000',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
