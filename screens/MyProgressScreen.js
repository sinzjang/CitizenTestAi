import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProgressSummary, resetProgress } from '../utils/progressTracker';
import { t } from '../utils/i18n';

const MyProgressScreen = ({ navigation }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const data = await getProgressSummary();
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            loadProgressData();
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysStudying = () => {
    if (!progressData?.firstAttemptDate) return 0;
    const firstDate = new Date(progressData.firstAttemptDate);
    const today = new Date();
    const diffTime = Math.abs(today - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading Your Progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!progressData || progressData.totalAttempts === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('menu.myProgress.title')}</Text>
        </View>
        
        <View style={styles.noDataContainer}>
          <Ionicons name="analytics-outline" size={80} color="#ccc" />
          <Text style={styles.noDataTitle}>No Progress Yet</Text>
          <Text style={styles.noDataText}>
            Start taking practice tests to see your progress and statistics here.
          </Text>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => navigation.navigate('PracticeTest')}
          >
            <Text style={styles.startButtonText}>Start Practice Test</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('menu.myProgress.title')}</Text>
        <TouchableOpacity onPress={handleResetProgress} style={styles.resetButton}>
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Overall Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{progressData.averageScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{progressData.totalCorrect}</Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="close-circle" size={24} color="#F44336" />
              <Text style={styles.statValue}>{progressData.totalIncorrect}</Text>
              <Text style={styles.statLabel}>Incorrect Answers</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="help-circle" size={24} color="#2E86AB" />
              <Text style={styles.statValue}>{progressData.totalAttempts}</Text>
              <Text style={styles.statLabel}>Total Attempts</Text>
            </View>
          </View>
        </View>

        {/* Test Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Statistics</Text>
          
          <View style={styles.testStats}>
            <View style={styles.testStatItem}>
              <View style={styles.testStatIcon}>
                <Ionicons name="clipboard" size={20} color="#2E86AB" />
              </View>
              <View style={styles.testStatContent}>
                <Text style={styles.testStatValue}>{progressData.practiceTestsCompleted}</Text>
                <Text style={styles.testStatLabel}>Practice Tests Completed</Text>
              </View>
            </View>
            
            <View style={styles.testStatItem}>
              <View style={styles.testStatIcon}>
                <Ionicons name="fitness" size={20} color="#FF9800" />
              </View>
              <View style={styles.testStatContent}>
                <Text style={styles.testStatValue}>{progressData.weaknessTestsCompleted}</Text>
                <Text style={styles.testStatLabel}>Weakness Tests Completed</Text>
              </View>
            </View>
            
            <View style={styles.testStatItem}>
              <View style={styles.testStatIcon}>
                <Ionicons name="star" size={20} color="#4CAF50" />
              </View>
              <View style={styles.testStatContent}>
                <Text style={styles.testStatValue}>{progressData.bestScore}%</Text>
                <Text style={styles.testStatLabel}>Best Score</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Question Mastery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Question Mastery</Text>
          
          <View style={styles.masteryContainer}>
            <View style={styles.masteryHeader}>
              <Text style={styles.masteryTitle}>
                {progressData.masteredQuestions} / {progressData.totalUniqueQuestions} Questions Mastered
              </Text>
              <Text style={styles.masteryPercentage}>
                {progressData.completionRate}%
              </Text>
            </View>
            
            <View style={styles.masteryBar}>
              <View 
                style={[
                  styles.masteryFill, 
                  { width: `${progressData.completionRate}%` }
                ]} 
              />
            </View>
            
            <View style={styles.difficultyStats}>
              <View style={styles.difficultyItem}>
                <View style={[styles.difficultyDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.difficultyText}>Easy: {progressData.easyQuestions}</Text>
              </View>
              <View style={styles.difficultyItem}>
                <View style={[styles.difficultyDot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.difficultyText}>Medium: {progressData.mediumQuestions}</Text>
              </View>
              <View style={styles.difficultyItem}>
                <View style={[styles.difficultyDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.difficultyText}>Hard: {progressData.hardQuestions}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Study Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Timeline</Text>
          
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <Ionicons name="calendar" size={20} color="#2E86AB" />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>First Study Date</Text>
                <Text style={styles.timelineValue}>{formatDate(progressData.firstAttemptDate)}</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <Ionicons name="time" size={20} color="#2E86AB" />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Last Study Date</Text>
                <Text style={styles.timelineValue}>{formatDate(progressData.lastAttemptDate)}</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <Ionicons name="trending-up" size={20} color="#2E86AB" />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Days Studying</Text>
                <Text style={styles.timelineValue}>{getDaysStudying()} days</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E86AB',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  resetButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 15,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  testStats: {
    gap: 15,
  },
  testStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  testStatContent: {
    flex: 1,
  },
  testStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  testStatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  masteryContainer: {
    gap: 15,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masteryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  masteryPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  masteryBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  masteryFill: {
    height: '100%',
    backgroundColor: '#2E86AB',
    borderRadius: 4,
  },
  difficultyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  difficultyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  difficultyText: {
    fontSize: 12,
    color: '#666',
  },
  timelineContainer: {
    gap: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineContent: {
    marginLeft: 15,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#666',
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
});

export default MyProgressScreen;
