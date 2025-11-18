import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      const token = await AsyncStorage.getItem('access_token');

      // Fetch details based on type
      let endpoint = '';
      if (parsed.type === 'EQUIPMENT') {
        endpoint = `/equipment/${parsed.id}`;
      } else if (parsed.type === 'ZONE') {
        endpoint = `/zones/${parsed.id}`;
      } else if (parsed.type === 'MATERIAL') {
        endpoint = `/materials/${parsed.id}`;
      }

      if (endpoint) {
        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setScanResult({
            type: parsed.type,
            data: response.data.data,
          });
        }
      } else {
        setScanResult({
          type: 'UNKNOWN',
          data: { rawData: data },
        });
      }
    } catch (error) {
      Alert.alert('Fehler', 'QR-Code konnte nicht gelesen werden');
      setScanned(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanResult(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Kamera-Berechtigung wird angefordert...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Kamera-Zugriff verweigert
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (scanResult) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.resultTitle}>QR-Code gescannt!</Text>
          <Text style={styles.resultType}>Typ: {scanResult.type}</Text>

          {scanResult.data.name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{scanResult.data.name}</Text>
            </View>
          )}

          {scanResult.type === 'EQUIPMENT' && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Typ:</Text>
                <Text style={styles.detailValue}>{scanResult.data.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{scanResult.data.status}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Betriebsstunden:</Text>
                <Text style={styles.detailValue}>
                  {scanResult.data.operatingHours}h
                </Text>
              </View>
            </>
          )}

          {scanResult.type === 'MATERIAL' && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bestand:</Text>
                <Text style={styles.detailValue}>
                  {scanResult.data.currentStock} {scanResult.data.unit}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Typ:</Text>
                <Text style={styles.detailValue}>{scanResult.data.type}</Text>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
            <Text style={styles.buttonText}>Erneut scannen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.scanText}>
          Richten Sie die Kamera auf einen QR-Code
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanText: {
    marginTop: 24,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    alignItems: 'center',
    width: '90%',
  },
  successIcon: {
    fontSize: 64,
    color: '#10B981',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  resultType: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
});
