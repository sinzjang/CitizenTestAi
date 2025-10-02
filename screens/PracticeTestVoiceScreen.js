import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../styles/theme';
import { saveIncorrectQuestion } from '../utils/progressTracker';
import QuestionLoader from '../utils/questionLoader';
import { t } from '../utils/i18n';
import { recordQuestionAttempt, recordTestCompletion } from '../utils/progressTracker';
import * as Speech from 'expo-speech';

const PracticeTestVoiceScreen = ({ navigation, route }) => {
  const { mode, title, userAccuracy, questionCount } = route.params || {};
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
  const [questionStartTime, setQuestionStartTime] = useState(null);
  
  // 음성 기능 관련 상태
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);
  const [showQuestionText, setShowQuestionText] = useState(false);

  const TOTAL_QUESTIONS = questionCount || 10;
  const TIME_PER_QUESTION = 10;

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !isTestComplete) {
      generateQuizOptions();
      startQuestionWithVoice();
    }
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
      Speech.stop();
    };
  }, []);

  const loadQuestions = async () => {
    try {
      const questionsData = await QuestionLoader.loadQuestionsForLanguage('en');
      let selectedQuestions = [];
      
      if (mode === 'adaptive') {
        selectedQuestions = getAdaptiveQuestions(questionsData, userAccuracy);
      } else if (mode === 'comprehensive') {
        selectedQuestions = getComprehensiveQuestions(questionsData);
      } else {
        const shuffled = questionsData.sort(() => 0.5 - Math.random());
        selectedQuestions = shuffled.slice(0, TOTAL_QUESTIONS);
      }
      
      setQuestions(selectedQuestions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load question data.');
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getAdaptiveQuestions = (questionsData, accuracy) => {
    let targetQuestions = [];
    
    if (accuracy < 60) {
      targetQuestions = questionsData.filter(q => q.id <= 30);
    } else if (accuracy < 80) {
      targetQuestions = questionsData.filter(q => q.id > 20 && q.id <= 70);
    } else {
      targetQuestions = questionsData.filter(q => q.id > 50);
    }
    
    const shuffled = targetQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, TOTAL_QUESTIONS);
  };
  
  const getComprehensiveQuestions = (questionsData) => {
    const categories = {
      history: questionsData.filter(q => q.id <= 25),
      civics: questionsData.filter(q => q.id > 25 && q.id <= 50),
      geography: questionsData.filter(q => q.id > 50 && q.id <= 75),
      symbols: questionsData.filter(q => q.id > 75)
    };
    
    let selectedQuestions = [];
    const questionsPerCategory = Math.floor(TOTAL_QUESTIONS / 4);
    
    Object.values(categories).forEach(categoryQuestions => {
      const shuffled = categoryQuestions.sort(() => 0.5 - Math.random());
      selectedQuestions.push(...shuffled.slice(0, questionsPerCategory));
    });
    
    const remaining = TOTAL_QUESTIONS - selectedQuestions.length;
    if (remaining > 0) {
      const allRemaining = questionsData.filter(q => 
        !selectedQuestions.some(sq => sq.id === q.id)
      );
      const shuffledRemaining = allRemaining.sort(() => 0.5 - Math.random());
      selectedQuestions.push(...shuffledRemaining.slice(0, remaining));
    }
    
    return selectedQuestions.sort(() => 0.5 - Math.random());
  };

  const startQuestionWithVoice = () => {
    // 상태 초기화
    setSelectedAnswer(null);
    setShowResult(false);
    setShowQuestionText(false); // 문제 텍스트 숨기기
    setIsReadingQuestion(true);
    setQuestionStartTime(Date.now());
    
    // 이전 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const currentQuestion = questions[currentIndex];
    
    Speech.speak(currentQuestion.question, {
      language: 'en-US',
      rate: 0.8,
      onDone: () => {
        setIsReadingQuestion(false);
        startTimer(); // 음성 읽기 완료 후 타이머 시작
      },
      onError: (error) => {
        console.error('Speech error:', error);
        setIsReadingQuestion(false);
        startTimer();
      }
    });
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
    
    // 타이머 애니메이션 시작
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
      // 시간 초과 시 오답 처리
      const currentQuestion = questions[currentIndex];
      const responseTime = questionStartTime ? Date.now() - questionStartTime : null;
      
      // 다중 정답 처리
      let correctAnswerText;
      if (currentQuestion.correctAnswers.length > 1) {
        correctAnswerText = currentQuestion.correctAnswers.map(a => a.text).join(', ');
      } else {
        correctAnswerText = currentQuestion.correctAnswers[0].text;
      }
      
      // 통계 기록
      recordQuestionAttempt(currentQuestion.id, false, responseTime, 'practice');
      
      const result = {
        question: currentQuestion.question,
        userAnswer: null,
        correctAnswer: correctAnswerText,
        isCorrect: false,
        timeUp: true
      };
      
      setTestResults(prev => [...prev, result]);
      
      // 시간 초과 시 즉시 다음 문제로 이동
      moveToNext();
    }
  };

  const generateQuizOptions = () => {
    if (questions.length === 0) return;
    
    const currentQuestion = questions[currentIndex];
    
    let correctAnswer;
    if (currentQuestion.correctAnswers.length > 1) {
      correctAnswer = currentQuestion.correctAnswers.map(answer => answer.text).join(', ');
    } else {
      correctAnswer = currentQuestion.correctAnswers[0].text;
    }
    
    let wrongAnswers = [];
    if (currentQuestion.wrongAnswers && currentQuestion.wrongAnswers.length > 0) {
      wrongAnswers = currentQuestion.wrongAnswers
        .map(wa => wa.text)
        .filter(text => text && text.trim() !== '')
        .filter(text => text !== correctAnswer)
        .slice(0, 3);
    }
    
    if (wrongAnswers.length < 3) {
      const otherCorrectAnswers = questions
        .filter((_, index) => index !== currentIndex)
        .filter(q => q.correctAnswers && q.correctAnswers.length > 0 && q.correctAnswers[0].text)
        .map(q => {
          if (q.correctAnswers.length > 1) {
            return q.correctAnswers.map(answer => answer.text).join(', ');
          } else {
            return q.correctAnswers[0].text;
          }
        })
        .filter(text => text && text.trim() !== '')
        .filter(text => text !== correctAnswer)
        .filter(text => !wrongAnswers.includes(text))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - wrongAnswers.length);
      
      wrongAnswers = [...wrongAnswers, ...otherCorrectAnswers];
    }
    
    const fallbackOptions = [
      'Option A', 'Option B', 'Option C', 'Option D', 'Option E'
    ].filter(opt => opt !== correctAnswer && !wrongAnswers.includes(opt));
    
    while (wrongAnswers.length < 3 && fallbackOptions.length > 0) {
      const fallback = fallbackOptions.shift();
      wrongAnswers.push(fallback);
    }
    
    wrongAnswers = wrongAnswers.slice(0, 3);
    
    const options = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
    setQuizOptions(options);
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    
    // 답변 선택 시 타이머와 애니메이션 즉시 정지
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 애니메이션도 중지
    timerAnimation.stopAnimation();
    
    setSelectedAnswer(answer);
    const currentQuestion = questions[currentIndex];
    
    // 다중 정답 처리 (FlashcardMode와 동일한 로직)
    let isCorrect = false;
    let correctAnswerText;
    
    if (currentQuestion.correctAnswers.length > 1) {
      // 다중 정답인 경우 결합된 정답과 비교
      correctAnswerText = currentQuestion.correctAnswers.map(a => a.text).join(', ');
      isCorrect = answer === correctAnswerText;
    } else {
      // 단일 정답인 경우
      correctAnswerText = currentQuestion.correctAnswers[0].text;
      isCorrect = answer === correctAnswerText;
    }
    
    const responseTime = questionStartTime ? Date.now() - questionStartTime : null;
    
    // 통계 기록
    recordQuestionAttempt(currentQuestion.id, isCorrect, responseTime, 'practice');
    
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
    
    // 답변 선택 후 1.5초 동안 정오 확인 시간 제공
    setTimeout(() => {
      moveToNext();
    }, 1500);
  };


  const saveIncorrectQuestions = async () => {
    try {
      const incorrectQuestions = testResults
        .filter(result => !result.isCorrect)
        .map(result => {
          // 원본 질문 데이터 찾기
          const originalQuestion = questions.find(q => q.question === result.question);
          return originalQuestion;
        })
        .filter(q => q !== undefined);

      if (incorrectQuestions.length > 0) {
        // 기존 틀린 문제들 가져오기
        const existingIncorrect = await AsyncStorage.getItem('incorrectQuestions');
        let allIncorrectQuestions = [];
        
        if (existingIncorrect) {
          allIncorrectQuestions = JSON.parse(existingIncorrect);
        }
        
        // 새로운 틀린 문제들 추가 (중복 제거)
        incorrectQuestions.forEach(newQuestion => {
          const exists = allIncorrectQuestions.some(existing => existing.id === newQuestion.id);
          if (!exists) {
            allIncorrectQuestions.push(newQuestion);
          }
        });
        
        await AsyncStorage.setItem('incorrectQuestions', JSON.stringify(allIncorrectQuestions));
      }
    } catch (error) {
      console.error('Error saving incorrect questions:', error);
    }
  };

  const moveToNext = () => {
    // 현재 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
      // 테스트 완료 - 틀린 문제들 저장
      saveIncorrectQuestions();
      
      // 테스트 완료 통계 기록
      const score = Math.round((correctAnswers / TOTAL_QUESTIONS) * 100);
      recordTestCompletion('practice', score, TOTAL_QUESTIONS);
      
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
    loadQuestions();
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
          <Text style={styles.loadingText}>Loading {title || 'Practice Test (Voice)'}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isTestComplete) {
    const score = Math.round((correctAnswers / TOTAL_QUESTIONS) * 100);
    const passed = score >= 60;
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Results</Text>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.resultContainer}>
            <View style={[styles.scoreContainer, { backgroundColor: passed ? '#4CAF50' : '#F44336' }]}>
              <Text style={styles.scoreText}>{score}%</Text>
              <Text style={styles.scoreLabel}>
                {correctAnswers}/{TOTAL_QUESTIONS} Correct
              </Text>
              <Text style={styles.passFailText}>
                {passed ? 'PASSED' : 'FAILED'}
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
                    <Text style={[
                      styles.answerText,
                      { color: result.isCorrect ? '#4CAF50' : '#F44336' }
                    ]}>
                      {result.isCorrect ? 'Correct' : 'Wrong'}
                    </Text>
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
                style={styles.homeButton} 
                onPress={() => navigation.navigate('InterviewPractice')}
              >
                <Ionicons name="home" size={20} color="white" />
                <Text style={styles.buttonText}>Back to Menu</Text>
              </TouchableOpacity>
            </View>
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
        <Text style={styles.headerTitle}>{title || 'Practice Test (Voice)'}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {TOTAL_QUESTIONS}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Fixed Voice Status and Timer Display */}
      <View style={styles.statusTimerContainer}>
        {isReadingQuestion ? (
          <View style={styles.statusItem}>
            <Ionicons name="volume-high" size={24} color="#2E86AB" />
            <Text style={styles.statusText}>Reading question...</Text>
          </View>
        ) : (
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
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <TouchableOpacity 
            style={styles.questionTouchArea}
            onPress={() => setShowQuestionText(!showQuestionText)}
          >
            <View style={styles.questionHeader}>
              <Ionicons name="help-circle" size={20} color="#2E86AB" />
              <Text style={styles.questionLabel}>
                {showQuestionText ? 'Hide Question' : 'Touch to Show Question'}
              </Text>
              <Ionicons 
                name={showQuestionText ? "eye-off" : "eye"} 
                size={20} 
                color="#2E86AB" 
                style={styles.eyeIcon}
              />
            </View>
            {showQuestionText && (
              <Text style={styles.questionText}>{currentQuestion?.question}</Text>
            )}
          </TouchableOpacity>
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
              // 다중 정답 처리
              const correctAnswerText = currentQuestion.correctAnswers.length > 1 
                ? currentQuestion.correctAnswers.map(a => a.text).join(', ')
                : currentQuestion.correctAnswers[0].text;
                
              if (option === correctAnswerText) {
                buttonStyle = [styles.optionButton, styles.correctOption];
                textStyle = [styles.optionText, styles.correctOptionText];
              } else if (option === selectedAnswer && option !== correctAnswerText) {
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
                disabled={showResult || isReadingQuestion}
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
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
  statusTimerContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
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
  quizContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginTop: 12,
    marginBottom: 4,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  optionsScrollContainer: {
    flex: 1,
    maxHeight: 300,
    marginBottom: 20,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#2E86AB',
    backgroundColor: '#f0f8ff',
  },
  correctOption: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  wrongOption: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E86AB',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  correctOptionText: {
    color: '#28a745',
    fontWeight: '600',
  },
  wrongOptionText: {
    color: '#dc3545',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    marginTop: 10,
    fontWeight: '600',
  },
  passFailText: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  detailsContainer: {
    marginBottom: 30,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginRight: 15,
    minWidth: 30,
  },
  resultContent: {
    flex: 1,
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
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E86AB',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 0.45,
    justifyContent: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 0.45,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 15,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readingText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default PracticeTestVoiceScreen;
