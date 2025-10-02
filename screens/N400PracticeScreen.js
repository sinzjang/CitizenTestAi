import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { t, getCurrentLanguage } from '../utils/i18n';
import explanations from '../data/n400_explanations.json';

const N400PracticeScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ready'); // ready, question, answer, complete
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const questionsData = require('../data/n400_questions.json');
      setQuestions(questionsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load N-400 questions.');
      console.error('Error loading N-400 questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text, onDone) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8,
      onDone: onDone,
      onError: (error) => {
        console.error('Speech error:', error);
        if (onDone) onDone();
      }
    });
  };

  const startInterview = () => {
    setIsPlaying(true);
    setCurrentPhase('question');
    const currentQuestion = questions[currentIndex];
    speakText(currentQuestion.question_en, () => {
      setCurrentPhase('ready');
      setIsPlaying(false);
      // 질문 재생 후 바로 ready 상태로 복귀
    });
  };


  const repeatQuestion = () => {
    if (currentPhase === 'answer') {
      Speech.stop();
      setCurrentPhase('question');
      const currentQuestion = questions[currentIndex];
      speakText(currentQuestion.question_en, () => {
        setCurrentPhase('answer');
      });
    }
  };

  const handleNextQuestion = () => {
    Speech.stop();
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentPhase('ready');
    } else {
      setIsComplete(true);
      setCurrentPhase('complete');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      Speech.stop();
      setCurrentIndex(currentIndex - 1);
      setCurrentPhase('ready');
    }
  };

  const resetInterview = () => {
    Speech.stop();
    setCurrentIndex(0);
    setIsPlaying(false);
    setCurrentPhase('ready');
    setIsComplete(false);
  };

  const handlePlayQuestion = () => {
    startInterview();
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'ready':
        return 'Ready to start';
      case 'question':
        return 'Listening to question...';
      case 'answer':
        return 'Your turn to answer';
      case 'complete':
        return 'Interview completed!';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading N-400 Practice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>N-400 Practice Complete</Text>
        </View>
        
        <View style={styles.completeContainer}>
          <View style={styles.completeCard}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.completeTitle}>Great Job!</Text>
            <Text style={styles.completeText}>
              You have completed all {questions.length} N-400 interview questions.
            </Text>
            <Text style={styles.completeSubtext}>
              This practice helps you prepare for the actual citizenship interview.
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={resetInterview}>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.buttonText}>Practice Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.homeButton} 
                onPress={() => navigation.navigate('InterviewPractice')}
              >
                <Ionicons name="home" size={20} color="white" />
                <Text style={styles.buttonText}>Back to Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentLang = getCurrentLanguage();

  const getExplanationForQuestion = () => {
    try {
      if (!currentQuestion) return null;
      const key = currentQuestion.q_id || `idx_${currentIndex}`;
      const entry = explanations[key];
      if (!entry) return null;
      const content = entry[currentLang] || entry['en'];
      return content || null;
    } catch (e) {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>N-400 Practice</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Ionicons 
              name={isPlaying ? "volume-high" : "volume-mute"} 
              size={20} 
              color={isPlaying ? "#007AFF" : "#999"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* 인터뷰 영역 */}
      <View style={styles.interviewContainer}>
        {/* 질문 카드 */}
        <View 
          style={styles.questionCard}
        >
          <View style={styles.questionCardHeader}>
            <Text style={styles.questionCardTitle}>
              N-400 Question
            </Text>
            <Ionicons 
              name="eye" 
              size={20} 
              color="#666" 
            />
          </View>
          <ScrollView
            style={styles.questionScroll}
            contentContainerStyle={styles.questionScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.questionText}>
              {`${currentQuestion.question_en}${getCurrentLanguage() !== 'en' && currentQuestion.question_ko ? ` (${currentQuestion.question_ko})` : ''}`}
            </Text>
          </ScrollView>
          {/* Explanation inside the same card (항상 표시) */}
          {(() => {
            const exp = getExplanationForQuestion();
            if (!exp) return null;
            return (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationInlineTitle}>{exp.title || (currentLang === 'ko' ? '설명' : 'Explanation')}</Text>
                {!!exp.intent && <Text style={styles.explanationText}>{exp.intent}</Text>}
                {!!exp.answer_guidance && (
                  <>
                    <View style={styles.explanationDivider} />
                    <Text style={styles.explanationSubTitle}>{currentLang === 'ko' ? '답변 가이드' : 'Answer Guidance'}</Text>
                    <Text style={styles.explanationText}>{exp.answer_guidance}</Text>
                  </>
                )}
              </View>
            );
          })()}
        </View>

        {/* 내비게이션 버튼들 */}
        <View style={styles.navOuter}>
        <View style={styles.navigationContainer}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === 0 && styles.navButtonDisabled
            ]}
            onPress={handlePreviousQuestion}
            disabled={currentIndex === 0 || currentPhase === 'question'}
          >
            <View style={styles.navIconWrapper}>
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color={currentIndex === 0 || currentPhase === 'question' ? "#CCC" : "#007AFF"} 
              />
            </View>
          </TouchableOpacity>

          {/* 플레이 버튼 */}
          <TouchableOpacity
            style={[
              styles.speakButton,
              currentPhase === 'ready' && styles.speakButtonActive,
            ]}
            onPress={handlePlayQuestion}
            disabled={currentPhase !== 'ready'}
          >
            <Ionicons 
              name="play-circle" 
              size={80} 
              color={currentPhase === 'ready' ? "#007AFF" : "#CCC"} 
            />
          </TouchableOpacity>

          {/* 앞으로가기 버튼 */}
          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === questions.length - 1 && styles.navButtonDisabled
            ]}
            onPress={handleNextQuestion}
            disabled={currentIndex === questions.length - 1 || currentPhase === 'question'}
          >
            <View style={styles.navIconWrapper}>
              <Ionicons 
                name="chevron-forward" 
                size={28} 
                color={currentIndex === questions.length - 1 || currentPhase === 'question' ? "#CCC" : "#007AFF"} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E86AB',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E86AB',
    borderRadius: 3,
  },
  interviewContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 40,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    textAlign: 'center',
    overflow: 'visible',
  },
  questionScroll: {
    height: 100,
  },
  questionScrollContent: {
    paddingHorizontal: 0,
  },
  questionHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  questionHintContainer: {
    height: 24,
    justifyContent: 'center',
  },
  transcriptContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transcriptContent: {
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    textAlign: 'center',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listeningText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 6,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    opacity: 0.8,
  },
  
  navButtonDisabled: {
    opacity: 0.3,
  },
  speakButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundColor: 'transparent',
    marginHorizontal: 24,
  },
  speakButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  speakButtonText: {
    fontSize: 18,
    color: '#CCC',
    marginTop: 15,
    fontWeight: '600',
  },
  speakButtonTextActive: {
    color: '#007AFF',
  },
  controlsContainer: {
    paddingTop: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  repeatButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingTop: 10,
    width: '100%',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: 'transparent',
  },
  navIconWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  navOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.45,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  disabledText: {
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#2E86AB',
    marginTop: 20,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  completeText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
  },
  completeSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    justifyContent: 'center',
  },
  homeButton: {
    backgroundColor: '#666',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  explanationContainer: {
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  explanationInlineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  explanationCard: {
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6ECF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  explanationSubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  explanationDivider: {
    height: 1,
    backgroundColor: '#E6ECF2',
    marginVertical: 12,
  },
});

export default N400PracticeScreen;
