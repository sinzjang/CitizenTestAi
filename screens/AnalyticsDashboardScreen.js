import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudyTracker from '../utils/studyTracker';
import { theme } from '../styles/theme';

const defaultStats = { completed: false, activities: { questions: 0, flashcards: 0, aiTutorMinutes: 0, mockInterviews: 0 } };

const AnalyticsDashboardScreen = ({ navigation }) => {
  const [todayStats, setTodayStats] = useState(defaultStats);

  const loadTodayStats = async () => {
    try {
      const calendarData = await AsyncStorage.getItem('@study_calendar');
      const calendar = calendarData ? JSON.parse(calendarData) : {};
      const todayKey = StudyTracker.getTodayKey();
      const today = calendar[todayKey] || defaultStats;
      setTodayStats(today);
    } catch (e) {
      setTodayStats(defaultStats);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTodayStats();
    });
    loadTodayStats();
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <Text style={styles.analyticsTitle}>Today's Progress</Text>
            <View style={styles.analyticsStatus}>
              <Ionicons name="flame" size={18} color={todayStats?.completed ? '#ff6b35' : '#ccc'} />
              <Text style={[styles.analyticsStatusText, { color: todayStats?.completed ? '#ff6b35' : '#999' }]}>
                {todayStats?.completed ? 'Goal Reached' : 'Keep Going'}
              </Text>
            </View>
          </View>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <Ionicons name="book" size={18} color={theme.colors.primary} />
              <Text style={styles.analyticsLabel}>Questions</Text>
            </View>
            <Text style={styles.analyticsValue}>{todayStats?.activities?.questions || 0} / 10</Text>
          </View>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <Ionicons name="albums" size={18} color="#28a745" />
              <Text style={styles.analyticsLabel}>Flashcards</Text>
            </View>
            <Text style={styles.analyticsValue}>{todayStats?.activities?.flashcards || 0} / 20</Text>
          </View>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <Ionicons name="chatbubbles" size={18} color="#ff9800" />
              <Text style={styles.analyticsLabel}>AI Tutor</Text>
            </View>
            <Text style={styles.analyticsValue}>{todayStats?.activities?.aiTutorMinutes || 0} / 5 min</Text>
          </View>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <Ionicons name="mic" size={18} color="#e91e63" />
              <Text style={styles.analyticsLabel}>Mock Interviews</Text>
            </View>
            <Text style={styles.analyticsValue}>{todayStats?.activities?.mockInterviews || 0} / 1</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  content: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  analyticsTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  analyticsStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  analyticsStatusText: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold },
  analyticsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f3f5' },
  analyticsItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analyticsLabel: { fontSize: theme.typography.sizes.md, color: theme.colors.text.primary },
  analyticsValue: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.secondary },
});

export default AnalyticsDashboardScreen;
