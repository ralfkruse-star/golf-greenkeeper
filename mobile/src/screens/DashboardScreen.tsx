import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/reports/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Lade Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.header}>Dashboard</Text>
        <Text style={styles.subheader}>Golfplatz Siek</Text>

        {/* KPI Cards */}
        <View style={styles.grid}>
          <View style={[styles.card, styles.cardRed]}>
            <Text style={styles.cardValue}>{stats?.tasks?.pending || 0}</Text>
            <Text style={styles.cardLabel}>Offene Tasks</Text>
          </View>

          <View style={[styles.card, styles.cardGreen]}>
            <Text style={styles.cardValue}>{stats?.equipment?.active || 0}</Text>
            <Text style={styles.cardLabel}>Equipment aktiv</Text>
          </View>

          <View style={[styles.card, styles.cardYellow]}>
            <Text style={styles.cardValue}>{stats?.materials?.lowStock || 0}</Text>
            <Text style={styles.cardLabel}>Materialien niedrig</Text>
          </View>

          <View style={[styles.card, styles.cardBlue]}>
            <Text style={styles.cardValue}>
              {stats?.weather?.temperature || '--'}°C
            </Text>
            <Text style={styles.cardLabel}>Temperatur</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Schnellaktionen</Text>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>✓</Text>
            <Text style={styles.actionText}>Neue Task</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🚜</Text>
            <Text style={styles.actionText}>Equipment verwalten</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Materialien prüfen</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>QR-Code scannen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  card: {
    width: '50%',
    padding: 8,
  },
  cardRed: {
    backgroundColor: '#FEE2E2',
  },
  cardGreen: {
    backgroundColor: '#D1FAE5',
  },
  cardYellow: {
    backgroundColor: '#FEF3C7',
  },
  cardBlue: {
    backgroundColor: '#DBEAFE',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#6B7280',
  },
});
