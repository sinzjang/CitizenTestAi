import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import QuestionLoader from '../utils/questionLoader';
import LocationManager from '../utils/locationManager';
import { getCurrentLanguage, t, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';

const FlashcardSubjectiveMode = ({ navigation, route }) => {
  const [questions, setQuestions] = useState([]);
  const [englishQuestions, setEnglishQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewedQuestions, setViewedQuestions] = useState(new Set());
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [userLocation, setUserLocation] = useState(null);
  const [mode, setMode] = useState('sequential'); // 'sequential' or 'random'
  const [originalQuestions, setOriginalQuestions] = useState([]); // 원본 순서 저장
  const [englishOnlyMode, setEnglishOnlyMode] = useState(false); // 영문 전용 모드

  useEffect(() => {
    loadUserLocation();
    setCurrentLanguage(getCurrentLanguage());
    
    // 언어 변경 리스너 등록
    const handleLanguageChange = (newLanguage) => {
      console.log('FlashcardSubjectiveMode - 언어 변경 감지:', newLanguage);
      setCurrentLanguage(newLanguage);
      // 언어가 변경되면 질문을 다시 로드
      loadQuestionsForLanguage(newLanguage);
    };
    
    addLanguageChangeListener(handleLanguageChange);
    
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  // Route 파라미터에서 mode 설정 및 질문 로드
  useEffect(() => {
    const routeMode = route?.params?.mode || 'sequential';
    setMode(routeMode);
    console.log('FlashcardSubjectiveMode - 모드 설정:', routeMode);
    // 모드 설정 후 질문 로드
    loadQuestions(routeMode);
  }, [route?.params?.mode]);

  useEffect(() => {
    updateProgress();
  }, [viewedQuestions, questions.length]);

  // 모드가 변경될 때 질문 순서 재처리
  useEffect(() => {
    if (originalQuestions.length > 0) {
      console.log('FlashcardSubjectiveMode - 모드 변경:', mode);
      const processedQuestions = mode === 'random' ? shuffleQuestions(originalQuestions) : originalQuestions;
      console.log('FlashcardSubjectiveMode - 첫 3개 질문 ID:', processedQuestions.slice(0, 3).map(q => q.id));
      setQuestions(processedQuestions);
      setCurrentIndex(0); // 첫 번째 질문으로 리셋
      setShowAnswer(false);
    }
  }, [mode]);

  const loadUserLocation = async () => {
    try {
      const location = await LocationManager.getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  };

  // 질문 순서 처리 함수
  const shuffleQuestions = (questionsArray) => {
    console.log('shuffleQuestions - 원본 첫 3개 ID:', questionsArray.slice(0, 3).map(q => q.id));
    const shuffled = [...questionsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    console.log('shuffleQuestions - 섞인 후 첫 3개 ID:', shuffled.slice(0, 3).map(q => q.id));
    return shuffled;
  };

  const loadQuestions = async (selectedMode = 'sequential') => {
    try {
      setLoading(true);
      console.log('FlashcardSubjectiveMode - 질문 로드 시작, 모드:', selectedMode);
      
      const questionsData = await QuestionLoader.loadQuestions();
      console.log('FlashcardSubjectiveMode - 로드된 질문 수:', questionsData?.length);
      
      if (!questionsData || questionsData.length === 0) {
        Alert.alert('Error', 'No questions available');
        return;
      }

      // 원본 질문 저장
      setOriginalQuestions(questionsData);
      
      // 모드에 따라 질문 순서 처리
      const processedQuestions = selectedMode === 'random' ? shuffleQuestions(questionsData) : questionsData;
      console.log('FlashcardSubjectiveMode - 처리된 질문 첫 3개 ID:', processedQuestions.slice(0, 3).map(q => q.id));
      
      setQuestions(processedQuestions);

      // Load English questions for bilingual display (if current language is not English)
      const currentLang = getCurrentLanguage();
      if (currentLang !== 'en') {
        const englishQuestionsData = await QuestionLoader.loadQuestionsForLanguage('en');
        setEnglishQuestions(englishQuestionsData || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load questions');
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForLanguage = async (languageCode) => {
    try {
      setLoading(true);
      
      const questionsData = await QuestionLoader.loadQuestionsForLanguage(languageCode);
      setQuestions(questionsData || []);
      
      // Load English questions for bilingual display (if current language is not English)
      if (languageCode !== 'en') {
        const englishQuestionsData = await QuestionLoader.loadQuestionsForLanguage('en');
        setEnglishQuestions(englishQuestionsData || []);
      } else {
        setEnglishQuestions([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load questions for language: ' + languageCode);
      console.error('Error loading questions for language:', languageCode, error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = () => {
    if (questions.length > 0) {
      const progressPercentage = (viewedQuestions.size / questions.length) * 100;
      setProgress(progressPercentage);
    }
  };

  // Find corresponding English question by ID
  const findEnglishQuestion = (questionId) => {
    return englishQuestions.find(q => q.id === questionId);
  };

  // 언어 표시 모드 토글 함수
  const toggleLanguageMode = () => {
    setEnglishOnlyMode(!englishOnlyMode);
    // useEffect에서 englishOnlyMode 변경을 감지하여 자동으로 화면 업데이트됨
  };

  const getBilingualText = (originalText, englishText) => {
    // 영문 전용 모드인 경우 영어 텍스트만 반환
    if (englishOnlyMode && englishText) {
      return englishText;
    }
    
    if (currentLanguage === 'en' || !englishText || originalText === englishText) {
      return originalText;
    }
    return `${originalText} (${englishText})`;
  };

  // 동적 답변 생성 함수
  const generateDynamicAnswer = (question, answer, isCorrect = true) => {
    if (!userLocation) {
      return answer;
    }

    const state = userLocation.state;

    // 상원의원 관련 질문 (ID: 20)
    if (question.id === 20 && isCorrect) {
      const senators = userLocation.senators;
      if (senators && Array.isArray(senators) && senators.length > 0) {
        return {
          ...answer,
          text: senators.join(', ')
        };
      }
    }

    // 주도 관련 질문 (ID: 62) - 128문제 기준
    if (question.id === 62 && isCorrect) {
      const capital = LocationManager.getStateCapital(state);
      if (capital && capital !== 'Answers will vary') {
        return {
          ...answer,
          text: capital
        };
      }
    }

    // 하원의원 관련 질문 (ID: 23)
    if (question.id === 23 && isCorrect) {
      const representative = userLocation.representative;
      if (representative && representative.name) {
        return {
          ...answer,
          text: representative.name_ko || representative.name
        };
      }
    }

    return answer;
  };

  const getCurrentAnswer = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;

    const englishQuestion = findEnglishQuestion(currentQuestion.id);
    
    // 다중 정답이 있는 경우 개별 리스트로 표시
    if (currentQuestion.correctAnswers.length > 1) {
      const answers = currentQuestion.correctAnswers.map(answer => {
        const dynamicAnswer = generateDynamicAnswer(currentQuestion, answer);
        return {
          text: dynamicAnswer.text,
          rationale: dynamicAnswer.rationale
        };
      });
      
      const englishAnswers = englishQuestion ? 
        englishQuestion.correctAnswers.map(answer => {
          const dynamicAnswer = generateDynamicAnswer(englishQuestion, answer);
          return {
            text: dynamicAnswer.text,
            rationale: dynamicAnswer.rationale
          };
        }) : [];

      return {
        answers: answers,
        englishAnswers: englishAnswers,
        isCombined: true,
        isMultiple: true
      };
    } else {
      // 단일 정답인 경우
      const correctAnswer = currentQuestion.correctAnswers[0];
      const englishCorrectAnswer = englishQuestion ? englishQuestion.correctAnswers[0] : null;
      
      // 동적 답변 생성 적용
      const dynamicCorrectAnswer = generateDynamicAnswer(currentQuestion, correctAnswer);
      const englishDynamicAnswer = englishQuestion && englishCorrectAnswer ? 
        generateDynamicAnswer(englishQuestion, englishCorrectAnswer) : null;
      
      return {
        text: dynamicCorrectAnswer.text,
        rationale: dynamicCorrectAnswer.rationale,
        englishText: englishDynamicAnswer?.text,
        englishRationale: englishDynamicAnswer?.rationale,
        isCombined: false,
        isMultiple: false
      };
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    const currentQuestionId = questions[currentIndex]?.id;
    if (currentQuestionId) {
      setViewedQuestions(prev => new Set([...prev, currentQuestionId]));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  // 스와이프 제스처 핸들러
  const onSwipeGesture = (event) => {
    const { translationX, translationY, state } = event.nativeEvent;
    
    if (state === State.END) {
      const swipeThreshold = 100; // 스와이프 감지 최소 거리
      
      // 수평 이동이 수직 이동보다 클 때만 스와이프로 인식
      if (Math.abs(translationX) > swipeThreshold && Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > swipeThreshold) {
          // 오른쪽으로 스와이프 - 이전 카드
          handlePrevious();
        } else if (translationX < -swipeThreshold) {
          // 왼쪽으로 스와이프 - 다음 카드
          handleNext();
        }
      }
    }
  };

  const resetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset your learning progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setViewedQuestions(new Set());
            setCurrentIndex(0);
            setShowAnswer(false);
          }
        }
      ]
    );
  };

  const handleFinish = () => {
    Alert.alert(
      t('flashcard.complete'),
      t('flashcard.completeMessage', { 
        viewed: viewedQuestions.size,
        total: questions.length 
      }),
      [
        { text: t('common.restart'), onPress: () => {
          setCurrentIndex(0);
          setShowAnswer(false);
          setViewedQuestions(new Set());
          // 랜덤 모드인 경우 다시 섞기
          if (mode === 'random') {
            const reshuffled = shuffleQuestions(originalQuestions);
            setQuestions(reshuffled);
          }
        }}
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <Text style={styles.noQuestionsText}>{t('flashcard.noQuestions')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const englishQuestion = englishQuestions.find(q => q.id === currentQuestion.id);
  const currentAnswer = getCurrentAnswer();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('menu.practiceTests.flashcardMode')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.modeIndicator}>
            <Ionicons name={mode === 'random' ? 'shuffle-outline' : 'list-outline'} size={20} color="#FF9800" />
          </View>
          <TouchableOpacity 
            style={styles.languageIndicator}
            onPress={toggleLanguageMode}
          >
            <Ionicons 
              name="language" 
              size={20} 
              color={englishOnlyMode ? "#FF9800" : "#2E86AB"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetProgress}
          >
            <Ionicons name="refresh" size={24} color="#2E86AB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress)}% Complete ({viewedQuestions.size}/{questions.length})
        </Text>
      </View>

      {/* Card Counter with Navigation */}
      <View style={styles.counterContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentIndex === 0 ? "#ccc" : "#2E86AB"} 
          />
        </TouchableOpacity>
        
        <View style={styles.counterTextContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.navButton, currentIndex === questions.length - 1 && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={currentIndex === questions.length - 1 ? "#ccc" : "#2E86AB"} 
          />
        </TouchableOpacity>
      </View>

      {/* Question Card */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PanGestureHandler onGestureEvent={onSwipeGesture} onHandlerStateChange={onSwipeGesture}>
          <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>{t('questions.question')}</Text>
            <Text style={styles.questionText}>
              {getBilingualText(currentQuestion.question, findEnglishQuestion(currentQuestion.id)?.question)}
            </Text>
          </View>
        </PanGestureHandler>

        {/* Answer Section */}
        <View style={styles.answerSection}>
          {!showAnswer ? (
            <TouchableOpacity 
              style={styles.showAnswerButton}
              onPress={handleShowAnswer}
            >
              <Ionicons name="eye-outline" size={24} color="#fff" />
              <Text style={styles.showAnswerText}>{t('flashcard.showAnswer')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.answerCard}>
              <Text style={styles.answerTitle}>{t('questions.correctAnswers')}</Text>
              
              {currentAnswer.isMultiple ? (
                // 다중 정답을 리스트로 표시
                <View style={styles.answersListContainer}>
                  {currentAnswer.answers.map((answer, index) => (
                    <View key={index} style={styles.answerListItem}>
                      <Text style={styles.answerBullet}>• </Text>
                      <View style={styles.answerItemContent}>
                        <Text style={styles.answerText}>
                          {getBilingualText(
                            answer.text, 
                            currentAnswer.englishAnswers[index]?.text
                          )}
                        </Text>
                        {answer.rationale && (
                          <Text style={styles.answerRationale}>
                            {getBilingualText(
                              answer.rationale, 
                              currentAnswer.englishAnswers[index]?.rationale
                            )}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                // 단일 정답 표시
                <>
                  <Text style={styles.answerText}>
                    {getBilingualText(currentAnswer.text, currentAnswer.englishText)}
                  </Text>
                  
                  {currentAnswer.rationale && (
                    <View style={styles.explanationSection}>
                      <Text style={styles.explanationTitle}>{t('questions.explanation')}</Text>
                      <Text style={styles.explanationText}>
                        {getBilingualText(currentAnswer.rationale, currentAnswer.englishRationale)}
                      </Text>
                    </View>
                  )}
                </>
              )}
              
              {/* Finish button for last question */}
              {currentIndex === questions.length - 1 && (
                <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                  <Text style={styles.finishButtonText}>{t('common.finish')}</Text>
                  <Ionicons name="checkmark" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noQuestionsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3e0',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  resetButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E86AB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  counterTextContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },

  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E86AB',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
  },
  answerSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  showAnswerButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  showAnswerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  answerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 12,
  },
  answerText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    fontWeight: '500',
  },
  answersListContainer: {
    marginTop: 8,
  },
  answerListItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  answerBullet: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 2,
    marginRight: 8,
  },
  answerItemContent: {
    flex: 1,
  },
  answerRationale: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  explanationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },

  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2E86AB',
    marginTop: 16,
  },
  finishButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default FlashcardSubjectiveMode;
