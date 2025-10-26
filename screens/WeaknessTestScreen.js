import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recordQuestionAttempt, recordTestCompletion } from '../utils/progressTracker';
import StudyTracker from '../utils/studyTracker';
import QuestionLoader from '../utils/questionLoader';
import { t } from '../utils/i18n';
// import AdBanner from '../components/AdBanner';

const WeaknessTestScreen = ({ navigation, route }) => {
  const { mode, title } = route.params || {};
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const timerAnimation = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const [noWeaknessQuestions, setNoWeaknessQuestions] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const TIME_PER_QUESTION = 10;

  useEffect(() => {
    loadWeaknessQuestions();
  }, []);

  useEffect(() => {
    const initializeQuestion = async () => {
      if (questions.length > 0 && !isTestComplete) {
        await generateQuizOptions();
        startTimer();
      }
    };
    
    initializeQuestion();
  }, [currentIndex, questions]);

  useEffect(() => {
    if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const loadWeaknessQuestions = async () => {
    try {
      const incorrectQuestionsData = await AsyncStorage.getItem('incorrectQuestions');
      
      if (!incorrectQuestionsData) {
        setNoWeaknessQuestions(true);
        setLoading(false);
        return;
      }
      
      const incorrectQuestions = JSON.parse(incorrectQuestionsData);
      
      if (incorrectQuestions.length === 0) {
        setNoWeaknessQuestions(true);
        setLoading(false);
        return;
      }
      
      // 최대 10개 문제 선택
      const selectedQuestions = incorrectQuestions.slice(0, 10);
      setQuestions(selectedQuestions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load weakness questions.');
      console.error('Error loading weakness questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearWeaknessQuestions = async () => {
    try {
      await AsyncStorage.removeItem('incorrectQuestions');
      Alert.alert('Success', 'Weakness questions cleared!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear weakness questions.');
    }
  };

  const startTimer = () => {
    // 이전 타이머가 있다면 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setTimeLeft(TIME_PER_QUESTION);
    setShowResult(false);
    setSelectedAnswer(null);
    setQuestionStartTime(Date.now()); // 질문 시작 시간 기록
    
    timerAnimation.setValue(1);
    Animated.timing(timerAnimation, {
      toValue: 0,
      duration: TIME_PER_QUESTION * 1000,
      useNativeDriver: false,
    }).start();

    // 새로운 타이머 시작
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (!showResult) {
      const currentQuestion = questions[currentIndex];
      const responseTime = questionStartTime ? Date.now() - questionStartTime : null;
      
      // 통계 기록
      recordQuestionAttempt(currentQuestion.id, false, responseTime, 'weakness');
      // Daily Progress: questions +1
      try { StudyTracker.recordActivity('questions', 1); } catch (e) {}
      
      // 다중 정답 처리
      let correctAnswerText;
      if (currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1) {
        correctAnswerText = currentQuestion.correctAnswers.map(a => a.text).join(', ');
      } else {
        correctAnswerText = currentQuestion.correctAnswers?.[0]?.text;
      }
      
      const result = {
        question: currentQuestion.question,
        userAnswer: null,
        correctAnswer: correctAnswerText,
        isCorrect: false,
        timeUp: true
      };
      
      setTestResults(prev => [...prev, result]);
      setShowResult(true);
      
      setTimeout(() => {
        moveToNext();
      }, 2000);
    }
  };

  const generateQuizOptions = async () => {
    if (questions.length === 0) return;
    
    const currentQuestion = questions[currentIndex];
    
    // 다중 정답이 있는 경우 결합하여 처리 (FlashcardMode와 동일한 로직)
    let correctAnswer;
    if (currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1) {
      // 모든 정답을 콤마로 결합
      correctAnswer = currentQuestion.correctAnswers.map(answer => answer.text).join(', ');
    } else {
      // 단일 정답인 경우
      correctAnswer = currentQuestion.correctAnswers?.[0]?.text;
    }
    
    // 전체 영어 질문 데이터 로드
    const allQuestionsData = await QuestionLoader.loadQuestionsForLanguage('en');
    
    // 현재 질문의 영어 데이터 찾기
    const englishQuestion = allQuestionsData.find(q => q.id === currentQuestion.id);
    
    // 현재 질문의 wrongAnswers 사용 (영어)
    let wrongAnswers = [];
    if (englishQuestion && englishQuestion.wrongAnswers && englishQuestion.wrongAnswers.length > 0) {
      wrongAnswers = englishQuestion.wrongAnswers
        .map(wa => wa.text)
        .filter(text => text && text.trim() !== '') // 빈 문자열 방지
        .filter(text => text !== correctAnswer) // 정답과 중복 방지
        .slice(0, 3); // 최대 3개
    }
    
    // wrongAnswers가 부족한 경우 다른 질문들의 정답으로 보완
    if (wrongAnswers.length < 3) {
      const otherCorrectAnswers = allQuestionsData
        .filter(q => q.id !== currentQuestion.id)
        .filter(q => q.correctAnswers && q.correctAnswers.length > 0 && q.correctAnswers[0].text)
        .map(q => {
          // 다른 질문들도 다중 정답인 경우 결합하여 처리
          if (q.correctAnswers.length > 1) {
            return q.correctAnswers.map(answer => answer.text).join(', ');
          } else {
            return q.correctAnswers[0].text;
          }
        })
        .filter(text => text && text.trim() !== '')
        .filter(text => text !== correctAnswer)
        .filter(text => !wrongAnswers.includes(text)) // 이미 있는 오답과 중복 방지
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - wrongAnswers.length);
      
      wrongAnswers = [...wrongAnswers, ...otherCorrectAnswers];
    }
    
    // 여전히 부족한 경우 기본 옵션 추가
    const fallbackOptions = [
      'Option A', 'Option B', 'Option C', 'Option D', 'Option E'
    ].filter(opt => opt !== correctAnswer && !wrongAnswers.includes(opt));
    
    while (wrongAnswers.length < 3 && fallbackOptions.length > 0) {
      const fallback = fallbackOptions.shift();
      wrongAnswers.push(fallback);
    }
    
    // 최대 3개로 제한
    wrongAnswers = wrongAnswers.slice(0, 3);
    
    // 정답과 오답을 섮어서 선택지 생성
    const finalOptions = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
    setQuizOptions(finalOptions);
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    
    // 답변 선택 시 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setSelectedAnswer(answer);
    const currentQuestion = questions[currentIndex];
    
    // 다중 정답 처리 (FlashcardMode와 동일한 로직)
    let isCorrect = false;
    let correctAnswerText;
    
    if (currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1) {
      // 다중 정답인 경우 결합된 정답과 비교
      correctAnswerText = currentQuestion.correctAnswers.map(a => a.text).join(', ');
      isCorrect = answer === correctAnswerText;
    } else {
      // 단일 정답인 경우
      correctAnswerText = currentQuestion.correctAnswers?.[0]?.text;
      isCorrect = answer === correctAnswerText;
    }
    
    const responseTime = questionStartTime ? Date.now() - questionStartTime : null;
    
    // 통계 기록
    recordQuestionAttempt(currentQuestion.id, isCorrect, responseTime, 'weakness');
    // Daily Progress: questions +1
    try { StudyTracker.recordActivity('questions', 1); } catch (e) {}
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    const result = {
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: correctAnswerText,
      isCorrect: isCorrect,
      timeUp: false
    };
    
    setTestResults(prev => [...prev, result]);
    setShowResult(true);
    
    setTimeout(() => {
      moveToNext();
    }, 1500);
  };

  const moveToNext = () => {
    // 현재 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (currentIndex + 1 >= questions.length) {
      // 테스트 완료 통계 기록
      const score = Math.round((correctAnswers / questions.length) * 100);
      recordTestCompletion('weakness', score, questions.length);
      
      setIsTestComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const resetTest = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setTestResults([]);
    setIsTestComplete(false);
    loadWeaknessQuestions();
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return '#4CAF50';
    if (timeLeft > 10) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading {title || 'Weakness Test'}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (noWeaknessQuestions) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title || t('menu.practiceTests.weaknessTest')}</Text>
        </View>
        
        <View style={styles.noQuestionsContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.noQuestionsTitle}>Great Job!</Text>
          <Text style={styles.noQuestionsText}>
            You don't have any weakness questions yet. Complete some practice tests first to identify areas for improvement.
          </Text>
          <TouchableOpacity 
            style={styles.practiceButton} 
            onPress={() => navigation.navigate('PracticeTest')}
          >
            <Text style={styles.practiceButtonText}>Take Practice Test</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isTestComplete) {
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 60;
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title ? title.replace(':', ' Results') : t('menu.practiceTests.weaknessTest') + ' Results'}</Text>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.resultContainer}>
            <View style={[styles.scoreContainer, { backgroundColor: passed ? '#4CAF50' : '#F44336' }]}>
              <Text style={styles.scoreText}>{score}%</Text>
              <Text style={styles.scoreLabel}>
                {correctAnswers}/{questions.length} Correct
              </Text>
              <Text style={styles.passFailText}>
                {passed ? 'IMPROVED!' : 'KEEP PRACTICING'}
              </Text>
            </View>
            
            <View style={styles.detailsContainer}>
              {testResults.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <View style={styles.resultContent}>
                    <Text style={styles.questionText} numberOfLines={2}>
                      {result.question}
                    </Text>
                    {result.timeUp ? (
                      <Text style={styles.timeUpText}>Time Up!</Text>
                    ) : (
                      <Text style={[
                        styles.answerText,
                        { color: result.isCorrect ? '#4CAF50' : '#F44336' }
                      ]}>
                        {result.isCorrect ? 'Correct' : 'Wrong'}
                      </Text>
                    )}
                  </View>
                  <Ionicons 
                    name={result.isCorrect ? 'checkmark-circle' : 'close-circle'} 
                    size={24} 
                    color={result.isCorrect ? '#4CAF50' : '#F44336'} 
                  />
                </View>
              ))}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={resetTest}>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearWeaknessQuestions}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.buttonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.homeButton} 
              onPress={() => navigation.navigate('InterviewPractice')}
            >
              <Ionicons name="home" size={20} color="white" />
              <Text style={styles.buttonText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || t('menu.practiceTests.weaknessTest')}</Text>
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

      <View style={styles.timerContainer}>
        <View style={styles.timerRow}>
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            {timeLeft}s
          </Text>
          <View style={styles.timerBarContainer}>
            <Animated.View 
              style={[
                styles.timerBar,
                {
                  width: timerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getTimerColor()
                }
              ]} 
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <View style={styles.questionHeader}>
            <Ionicons name="help-circle" size={20} color="#2E86AB" />
            <Text style={styles.questionLabel}>Question</Text>
          </View>
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.optionsHeader}>
            <Ionicons name="list" size={20} color="#2E86AB" />
            <Text style={styles.optionsLabel}>Choose the best answer</Text>
          </View>
          {quizOptions.map((option, index) => {
            let buttonStyle = styles.optionButton;
            let textStyle = styles.optionText;
            
            if (showResult && selectedAnswer) {
              if (option === currentQuestion.correctAnswers[0].text) {
                buttonStyle = [styles.optionButton, styles.correctOption];
                textStyle = [styles.optionText, styles.correctOptionText];
              } else if (option === selectedAnswer && option !== currentQuestion.correctAnswers[0].text) {
                buttonStyle = [styles.optionButton, styles.incorrectOption];
                textStyle = [styles.optionText, styles.incorrectOptionText];
              }
            } else if (selectedAnswer === option) {
              buttonStyle = [styles.optionButton, styles.selectedOption];
              textStyle = [styles.optionText, styles.selectedOptionText];
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleAnswerSelect(option)}
                disabled={showResult}
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      {/* <View style={styles.adContainer}>
        <AdBanner />
      </View> */}
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
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noQuestionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 15,
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  practiceButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  practiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
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
  timerContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
    minWidth: 30,
  },
  timerBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  adContainer: {
    backgroundColor: 'transparent',
  },
  questionContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E86AB',
    marginLeft: 8,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E86AB',
    marginLeft: 8,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#2E86AB',
    backgroundColor: '#f0f8ff',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8e9',
  },
  incorrectOption: {
    borderColor: '#F44336',
    backgroundColor: '#ffebee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#2E86AB',
    fontWeight: '600',
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: '#F44336',
    fontWeight: '600',
  },
  resultContainer: {
    padding: 20,
  },
  scoreContainer: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
  },
  passFailText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
    width: 40,
  },
  resultContent: {
    flex: 1,
    marginHorizontal: 15,
  },
  answerText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  timeUpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#F44336',
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
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WeaknessTestScreen;
