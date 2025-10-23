import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import ProgressTracker from '../utils/progressTracker';

const DeepDiveInterview = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      const progress = await ProgressTracker.getUserProgress();
      const weaknessQuestions = await ProgressTracker.getWeakQuestions();
      
      // progress가 null이거나 undefined인 경우 기본값 설정
      const safeProgress = progress || {
        totalAttempts: 0,
        totalCorrect: 0,
        totalIncorrect: 0
      };
      
      const safeWeaknessQuestions = weaknessQuestions || [];
      
      // 분석 데이터 생성
      const analysis = {
        totalAttempts: safeProgress.totalAttempts || 0,
        totalCorrect: safeProgress.totalCorrect || 0,
        totalIncorrect: safeProgress.totalIncorrect || 0,
        accuracy: safeProgress.totalAttempts > 0 ? 
          Math.round((safeProgress.totalCorrect / safeProgress.totalAttempts) * 100) : 0,
        weaknessCount: safeWeaknessQuestions.length,
        strongAreas: [],
        weakAreas: [],
        recommendations: []
      };

      // 강점/약점 분석
      if (analysis.accuracy >= 80) {
        analysis.strongAreas.push('Overall Performance');
      }
      if (analysis.accuracy < 60) {
        analysis.weakAreas.push('Needs Improvement');
      }
      if (analysis.weaknessCount > 10) {
        analysis.weakAreas.push('Many Incorrect Answers');
      }

      // 추천사항 생성
      if (analysis.weaknessCount > 0) {
        analysis.recommendations.push('Focus on previously missed questions');
      }
      if (analysis.accuracy < 70) {
        analysis.recommendations.push('Practice more frequently');
      }
      if (analysis.totalAttempts < 50) {
        analysis.recommendations.push('Take more practice tests');
      }

      setAnalysisData(analysis);
    } catch (error) {
      console.error('Error loading analysis data:', error);
      
      // 에러 발생 시 기본 데이터 설정
      const defaultAnalysis = {
        totalAttempts: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        accuracy: 0,
        weaknessCount: 0,
        strongAreas: [],
        weakAreas: ['No data available'],
        recommendations: ['Start with Practice Tests to build your progress data']
      };
      
      setAnalysisData(defaultAnalysis);
      // Alert.alert('Notice', 'No progress data found. Complete some practice tests first.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelection = (mode) => {
    setSelectedMode(mode);
    
    switch (mode) {
      case 'weakness_focus':
        startWeaknessFocusedInterview();
        break;
      case 'adaptive_difficulty':
        startAdaptiveDifficultyInterview();
        break;
      case 'comprehensive_review':
        startComprehensiveReview();
        break;
      default:
        break;
    }
  };

  const startWeaknessFocusedInterview = async () => {
    try {
      const weaknessQuestions = await ProgressTracker.getWeaknessQuestions();
      
      if (weaknessQuestions.length === 0) {
        Alert.alert(
          'Great Job! 🎉',
          'You don\'t have any weakness questions yet. Take some practice tests first!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      // WeaknessTest로 이동하되 Deep Dive 모드로 설정
      navigation.navigate('WeaknessTest', { 
        mode: 'deep_dive',
        title: 'Deep Dive: Weakness Focus'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start weakness-focused interview.');
    }
  };

  const startAdaptiveDifficultyInterview = () => {
    // 사용자의 정답률에 따라 난이도 조절된 문제 제공
    navigation.navigate('PracticeTest', { 
      mode: 'adaptive',
      title: 'Deep Dive: Adaptive Difficulty',
      userAccuracy: analysisData.accuracy
    });
  };

  const startComprehensiveReview = () => {
    // 전체적인 복습 모드
    navigation.navigate('PracticeTest', { 
      mode: 'comprehensive',
      title: 'Deep Dive: Comprehensive Review',
      questionCount: 20
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Analyzing your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Analytics</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Analysis Overview */}
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>📊 Your Learning Analysis</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analysisData.totalAttempts}</Text>
              <Text style={styles.statLabel}>Total Attempts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                {analysisData.accuracy}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#FF5722' }]}>
                {analysisData.weaknessCount}
              </Text>
              <Text style={styles.statLabel}>Weak Areas</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        {analysisData.recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>💡 AI Recommendations</Text>
            {analysisData.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="bulb" size={16} color="#FF9800" />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Interview Modes */}
        <View style={styles.modesSection}>
          <Text style={styles.sectionTitle}>🎯 Recommended Study Modes</Text>

          {/* Weakness Focus Mode */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              selectedMode === 'weakness_focus' && styles.selectedMode
            ]}
            onPress={() => handleModeSelection('weakness_focus')}
          >
            <View style={styles.modeHeader}>
              <View style={[styles.modeIcon, { backgroundColor: '#FF5722' + '20' }]}>
                <Ionicons name="target" size={24} color="#FF5722" />
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>Weakness Focus</Text>
                <Text style={styles.modeSubtitle}>
                  Focus on your {analysisData.weaknessCount} missed questions
                </Text>
              </View>
            </View>
            <Text style={styles.modeDescription}>
              Practice questions you've previously answered incorrectly with detailed explanations and follow-up questions.
            </Text>
            {analysisData.weaknessCount === 0 && (
              <Text style={styles.unavailableText}>
                Complete some practice tests first to unlock this mode
              </Text>
            )}
          </TouchableOpacity>

          {/* Adaptive Difficulty Mode */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              selectedMode === 'adaptive_difficulty' && styles.selectedMode
            ]}
            onPress={() => handleModeSelection('adaptive_difficulty')}
          >
            <View style={styles.modeHeader}>
              <View style={[styles.modeIcon, { backgroundColor: '#2196F3' + '20' }]}>
                <Ionicons name="trending-up" size={24} color="#2196F3" />
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>Adaptive Difficulty</Text>
                <Text style={styles.modeSubtitle}>
                  Tailored to your {analysisData.accuracy}% accuracy level
                </Text>
              </View>
            </View>
            <Text style={styles.modeDescription}>
              Questions adjust in difficulty based on your performance. Get challenged at the right level for optimal learning.
            </Text>
          </TouchableOpacity>

          {/* Comprehensive Review Mode */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              selectedMode === 'comprehensive_review' && styles.selectedMode
            ]}
            onPress={() => handleModeSelection('comprehensive_review')}
          >
            <View style={styles.modeHeader}>
              <View style={[styles.modeIcon, { backgroundColor: '#4CAF50' + '20' }]}>
                <Ionicons name="library" size={24} color="#4CAF50" />
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>Comprehensive Review</Text>
                <Text style={styles.modeSubtitle}>
                  Extended 20-question mixed review
                </Text>
              </View>
            </View>
            <Text style={styles.modeDescription}>
              A thorough review covering all topics with AI-powered follow-up questions to test your deep understanding.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💪 Study Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>Take your time to think through each answer</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>Read explanations carefully after each question</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>Focus on understanding concepts, not just memorizing</Text>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  analysisSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  recommendationsSection: {
    marginBottom: theme.spacing.xl,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  modesSection: {
    marginBottom: theme.spacing.xl,
  },
  modeCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  selectedMode: {
    borderColor: theme.colors.primary,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  modeSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  modeDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    lineHeight: 22,
  },
  unavailableText: {
    fontSize: theme.typography.sizes.sm,
    color: '#FF5722',
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  tipsSection: {
    marginBottom: theme.spacing.xxl,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
});

export default DeepDiveInterview;
