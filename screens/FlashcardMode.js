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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useInterstitialAd } from '../components/AdInterstitial';
import QuestionLoader from '../utils/questionLoader';
import LocationManager from '../utils/locationManager';
import { getCurrentLanguage, t, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';
import StudyTracker from '../utils/studyTracker';
const FlashcardMode = ({ navigation, route }) => {
  const [questions, setQuestions] = useState([]);
  const [englishQuestions, setEnglishQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(new Set());
  const [incorrectAnswers, setIncorrectAnswers] = useState(new Set());
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [userLocation, setUserLocation] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [mode, setMode] = useState('sequential'); // 'sequential' or 'random'
  const [originalQuestions, setOriginalQuestions] = useState([]); // 원본 순서 저장
  const [englishOnlyMode, setEnglishOnlyMode] = useState(false); // 영문 전용 모드
  const optionsScrollRef = useRef(null); // 답변 옵션 스크롤 ref
  const [resumeChecked, setResumeChecked] = useState(false); // 재개 팝업 중복 방지
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  // Interstitial 광고 훅
  const { showAd } = useInterstitialAd();

  const getStorageKey = (lang, currentMode) => `@flashcard_lastIndex_${lang}_${currentMode}`;

  useEffect(() => {
    loadUserLocation();
    setCurrentLanguage(getCurrentLanguage());
    
    // 언어 변경 리스너 등록
    const handleLanguageChange = (newLanguage) => {
      console.log('FlashcardMode - 언어 변경 감지:', newLanguage);
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
    console.log('FlashcardMode - 모드 설정:', routeMode);
    // 모드 설정 후 질문 로드
    loadQuestions(routeMode);
  }, [route?.params?.mode]);

  useEffect(() => {
    updateProgress();
  }, [correctAnswers, incorrectAnswers, questions.length]);

  // 현재 인덱스 저장 (언어/모드 별)
  // 주의: 초기 로드 시점에 0으로 덮어쓰지 않도록 resume 체크 완료 이후에만 저장
  useEffect(() => {
    const saveIndex = async () => {
      try {
        if (!resumeChecked) {
          // 재개 여부 결정 이전엔 저장하지 않음 (초기 0으로 과저장 방지)
          return;
        }
        if (questions.length === 0) return;
        const lang = getCurrentLanguage();
        const key = getStorageKey(lang, mode);
        await AsyncStorage.setItem(key, String(currentIndex));
        console.log('FlashcardMode - saved index:', { key, currentIndex });
      } catch (e) {
        console.warn('Failed to save flashcard index:', e);
      }
    };
    saveIndex();
  }, [currentIndex, mode, resumeChecked]);

  // 모드가 변경될 때 질문 순서 재처리
  useEffect(() => {
    if (originalQuestions.length > 0) {
      console.log('FlashcardMode - 모드 변경:', mode);
      const processedQuestions = mode === 'random' ? shuffleQuestions(originalQuestions) : originalQuestions;
      console.log('FlashcardMode - 첫 3개 질문 ID:', processedQuestions.slice(0, 3).map(q => q.id));
      setQuestions(processedQuestions);
      setCurrentIndex(0); // 첫 번째 질문으로 리셋
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [mode]);

  useEffect(() => {
    if (questions.length > 0) {
      // 영어가 아닌 언어의 경우 englishQuestions도 로드될 때까지 기다림
      const currentLang = getCurrentLanguage();
      if (currentLang !== 'en' && englishQuestions.length === 0) {
        return; // 영어 질문이 아직 로드되지 않았으면 대기
      }
      generateQuizOptions();
    }
  }, [currentIndex, questions, englishQuestions, currentLanguage, englishOnlyMode]);

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
    console.log('shuffleQuestions - 섬인 후 첫 3개 ID:', shuffled.slice(0, 3).map(q => q.id));
    return shuffled;
  };

  // 재개 팝업 로직 (함수 선언문: 호이스팅됨)
  function maybePromptResume(lang, currentMode, total) {
    return (async () => {
      try {
        if (resumeChecked) return;
        const key = getStorageKey(lang, currentMode);
        const saved = await AsyncStorage.getItem(key);
        const savedIndex = saved !== null ? parseInt(saved, 10) : NaN;
        if (!isNaN(savedIndex) && savedIndex > 0 && savedIndex < total) {
          setResumeChecked(true);
          const humanIndex = savedIndex + 1; // 사용자 표시용(1부터)
          Alert.alert(
            t('flashcard.resume.title'),
            t('flashcard.resume.messageWithNumber', { number: humanIndex }),
            [
              {
                text: t('flashcard.resume.noRestart'),
                style: 'cancel',
                onPress: async () => {
                  setCurrentIndex(0);
                  try { await AsyncStorage.setItem(key, '0'); } catch (e) {}
                }
              },
              {
                text: t('flashcard.resume.yesContinue'),
                onPress: () => setCurrentIndex(savedIndex)
              }
            ]
          );
        } else {
          setResumeChecked(true);
        }
      } catch (e) {
        setResumeChecked(true);
        console.warn('Failed to check resume index:', e);
      }
    })();
  }

  const loadQuestions = async (currentMode = mode) => {
    try {
      const questionsData = await QuestionLoader.loadQuestions();
      const originalData = questionsData || [];
      
      // 원본 순서 저장
      setOriginalQuestions(originalData);
      
      // 모드에 따라 순서 처리
      console.log('loadQuestions - 현재 모드:', currentMode);
      const processedQuestions = currentMode === 'random' ? shuffleQuestions(originalData) : originalData;
      console.log('loadQuestions - 첫 3개 질문 ID:', processedQuestions.slice(0, 3).map(q => q.id));
      setQuestions(processedQuestions);
      
      // Load English questions for bilingual display (if current language is not English)
      const currentLang = getCurrentLanguage();
      if (currentLang !== 'en') {
        const englishQuestionsData = await QuestionLoader.loadQuestionsForLanguage('en');
        setEnglishQuestions(englishQuestionsData || []);
      }
      // 저장된 인덱스 재개 팝업 표시 (처음 1회) - 인라인 처리
      try {
        // 랜덤 모드에서는 재개 팝업을 사용하지 않음
        if (currentMode === 'random') {
          setResumeChecked(true);
        } else if (!resumeChecked) {
          const key = getStorageKey(currentLang, currentMode);
          const saved = await AsyncStorage.getItem(key);
          const savedIndex = saved !== null ? parseInt(saved, 10) : NaN;
          if (!isNaN(savedIndex) && savedIndex > 0 && savedIndex < processedQuestions.length) {
            setResumeChecked(true);
            const humanIndex = savedIndex + 1;
            Alert.alert(
              t('flashcard.resume.title'),
              t('flashcard.resume.messageWithNumber', { number: humanIndex }),
              [
                {
                  text: t('flashcard.resume.noRestart'),
                  style: 'cancel',
                  onPress: async () => {
                    setCurrentIndex(0);
                    try { await AsyncStorage.setItem(key, '0'); } catch (e) {}
                  }
                },
                { text: t('flashcard.resume.yesContinue'), onPress: () => setCurrentIndex(savedIndex) }
              ]
            );
          } else {
            setResumeChecked(true);
          }
        }
      } catch (e) {
        setResumeChecked(true);
        console.warn('Inline resume check failed:', e);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load question data.');
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForLanguage = async (languageCode) => {
    try {
      setLoading(true);
      console.log('Loading questions for language:', languageCode);
      
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
      const answeredQuestions = correctAnswers.size + incorrectAnswers.size;
      setProgress((answeredQuestions / questions.length) * 100);
    }
  };

  // Find corresponding English question by ID
  const findEnglishQuestion = (questionId) => {
    return englishQuestions.find(q => q.id === questionId);
  };

  // 언어 표시 모드 토글 함수
  const toggleLanguageMode = () => {
    setEnglishOnlyMode(!englishOnlyMode);
    // useEffect에서 englishOnlyMode 변경을 감지하여 자동으로 generateQuizOptions 호출됨
  };

  // Get bilingual text (original language + English in parentheses)
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
        // LocationManager와 동일한 형태로 처리
        const senatorText = senators.length >= 2 
          ? `${senators[0]} or ${senators[1]}` 
          : senators[0];
        return {
          ...answer,
          text: senatorText
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

  const generateQuizOptions = () => {
    if (questions.length === 0) return;
    
    const currentQuestion = questions[currentIndex];
    const englishQuestion = findEnglishQuestion(currentQuestion.id);
    
    let bilingualCorrectAnswer;
    
    // 다중 정답이 있는 경우 결합 옵션 생성
    if (currentQuestion.correctAnswers.length > 1) {
      // 모든 정답을 콤마로 결합
      const combinedCorrectText = currentQuestion.correctAnswers.map(answer => answer.text).join(', ');
      const englishCombinedText = englishQuestion?.correctAnswers?.map(answer => answer.text).join(', ') || combinedCorrectText;
      
      // 결합된 설명 생성
      const combinedRationale = currentQuestion.correctAnswers.map(answer => answer.rationale).join(' ');
      const englishCombinedRationale = englishQuestion?.correctAnswers?.map(answer => answer.rationale).join(' ') || combinedRationale;
      
      bilingualCorrectAnswer = {
        text: getBilingualText(combinedCorrectText, englishCombinedText),
        rationale: getBilingualText(combinedRationale, englishCombinedRationale),
        isCombined: true // 결합된 정답임을 표시
      };
    } else {
      // 단일 정답인 경우 기존 로직 사용
      const selectedCorrectAnswer = currentQuestion.correctAnswers[0];
      const englishCorrectAnswer = englishQuestion?.correctAnswers?.[0];
      
      const dynamicCorrectAnswer = generateDynamicAnswer(currentQuestion, selectedCorrectAnswer, true);
      const englishDynamicAnswer = englishCorrectAnswer ? generateDynamicAnswer(englishQuestion, englishCorrectAnswer, true) : null;
      
      bilingualCorrectAnswer = {
        ...dynamicCorrectAnswer,
        text: getBilingualText(dynamicCorrectAnswer.text, englishDynamicAnswer?.text)
      };
    }
    
    // Get 3 wrong answers with bilingual support
    const wrongAnswers = currentQuestion.wrongAnswers.slice(0, 3).map((wrongAnswer, index) => {
      const englishWrongAnswer = englishQuestion?.wrongAnswers?.[index];
      return {
        ...wrongAnswer,
        text: getBilingualText(wrongAnswer.text, englishWrongAnswer?.text)
      };
    });
    
    // Combine correct and wrong answers
    const allOptions = [bilingualCorrectAnswer, ...wrongAnswers];
    
    // Shuffle the options
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    setQuizOptions(shuffledOptions);
  };

  const handleAnswerSelect = async (selectedOption) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(selectedOption);
    setShowResult(true);
    
    const currentQuestion = questions[currentIndex];
    let isCorrect = false;
    
    // 결합된 정답인 경우
    if (selectedOption.isCombined) {
      isCorrect = true; // 결합된 정답은 항상 올바른 정답
    } else {
      // 개별 정답 확인
      isCorrect = currentQuestion.correctAnswers.some(correctAnswer => 
        selectedOption.text === correctAnswer.text ||
        selectedOption.text.includes(correctAnswer.text) ||
        correctAnswer.text.includes(selectedOption.text)
      );
    }
    
    if (isCorrect) {
      const newCorrectAnswers = new Set(correctAnswers);
      newCorrectAnswers.add(currentQuestion.id);
      setCorrectAnswers(newCorrectAnswers);
    } else {
      const newIncorrectAnswers = new Set(incorrectAnswers);
      newIncorrectAnswers.add(currentQuestion.id);
      setIncorrectAnswers(newIncorrectAnswers);
    }
    // Daily Progress: flashcards +1
    try { StudyTracker.recordActivity('flashcards', 1); } catch (e) {}
    
    // 답변 카운터 증가 및 광고 표시 로직
    const newAnsweredCount = questionsAnswered + 1;
    setQuestionsAnswered(newAnsweredCount);
    
    // 10문제마다 광고 표시
    if (newAnsweredCount % 10 === 0) {
      console.log(`[FlashcardMode] ${newAnsweredCount}문제 완료 - 광고 표시 시도`);
      setTimeout(async () => {
        await showAd('quiz_completed');
      }, 1500); // 결과 확인 후 광고 표시
    }
  };

  const nextCard = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      // 답변 옵션 스크롤을 맨 위로 이동
      setTimeout(() => {
        optionsScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowResult(false);
      // 답변 옵션 스크롤을 맨 위로 이동
      setTimeout(() => {
        optionsScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
    }
  };

  // 스와이프 제스처 핸들러
  const onSwipeGesture = (event) => {
    const { translationX, translationY, state } = event.nativeEvent;
    
    if (state === State.END) {
      const swipeThreshold = 100; // 스와이프 감지 최소 거리
      const verticalThreshold = 50; // 수직 이동 허용 범위
      
      // 수평 이동이 수직 이동보다 클 때만 스와이프로 인식
      if (Math.abs(translationX) > swipeThreshold && Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > swipeThreshold) {
          // 오른쪽으로 스와이프 - 이전 카드
          prevCard();
        } else if (translationX < -swipeThreshold) {
          // 왼쪽으로 스와이프 - 다음 카드
          nextCard();
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
            setCorrectAnswers(new Set());
            setIncorrectAnswers(new Set());
            setCurrentIndex(0);
            setSelectedAnswer(null);
            setShowResult(false);
            // 답변 옵션 스크롤을 맨 위로 이동
            setTimeout(() => {
              optionsScrollRef.current?.scrollTo({ y: 0, animated: false });
            }, 50);
          }
        }
      ]
    );
  };



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Preparing flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No flashcards available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = correctAnswers.has(currentQuestion.id);
  const isIncorrect = incorrectAnswers.has(currentQuestion.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          {Math.round(progress)}% Complete ({correctAnswers.size + incorrectAnswers.size}/{questions.length})
        </Text>
      </View>

      {/* Card Counter with Navigation */}
      <View style={styles.counterContainer}>
        <TouchableOpacity 
          style={[styles.navButton, styles.prevButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={prevCard}
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
          {isCorrect && (
            <View style={styles.correctBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.correctText}>Correct</Text>
            </View>
          )}
          {isIncorrect && (
            <View style={styles.incorrectBadge}>
              <Ionicons name="close-circle" size={16} color="#dc3545" />
              <Text style={styles.incorrectText}>Incorrect</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton, currentIndex === questions.length - 1 && styles.navButtonDisabled]}
          onPress={nextCard}
          disabled={currentIndex === questions.length - 1}
        >
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={currentIndex === questions.length - 1 ? "#ccc" : "#2E86AB"} 
          />
        </TouchableOpacity>
      </View>

      {/* Quiz */}
      <View style={styles.quizContainer}>
        {/* Question */}
        <PanGestureHandler onGestureEvent={onSwipeGesture} onHandlerStateChange={onSwipeGesture}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionTitle}>{t('questions.question')}</Text>
            {mode === 'random' && (
              <Text style={styles.questionId}>({currentQuestion.id})</Text>
            )}
            <Text style={styles.questionText}>
              {getBilingualText(currentQuestion.question, findEnglishQuestion(currentQuestion.id)?.question)}
            </Text>
          </View>
        </PanGestureHandler>

        {/* Answer Options */}
        <ScrollView 
          ref={optionsScrollRef}
          style={styles.optionsScrollContainer}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {quizOptions.map((option, index) => {
            const isSelected = selectedAnswer === option;
            
            // 정답 여부 확인
            let isCorrect = false;
            if (option.isCombined) {
              isCorrect = true; // 결합된 정답은 항상 올바른 정답
            } else {
              isCorrect = currentQuestion.correctAnswers.some(correctAnswer => 
                option.text === correctAnswer.text ||
                option.text.includes(correctAnswer.text) ||
                correctAnswer.text.includes(option.text)
              );
            }
            
            const showCorrectAnswer = showResult && isCorrect;
            const showWrongAnswer = showResult && isSelected && !isCorrect;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  showCorrectAnswer && styles.correctOption,
                  showWrongAnswer && styles.wrongOption,
                  isSelected && !showResult && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(option)}
                disabled={showResult}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
                  <Text style={[
                    styles.optionText,
                    showCorrectAnswer && styles.correctOptionText,
                    showWrongAnswer && styles.wrongOptionText
                  ]}>
                    {option.text}
                  </Text>
                  {showResult && isCorrect && (
                    <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={20} color="#dc3545" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Result Explanation */}
        {showResult && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>{t('questions.explanation')}</Text>
            <Text style={styles.explanationText}>
              {selectedAnswer && getBilingualText(
                selectedAnswer.rationale, 
                findEnglishQuestion(currentQuestion.id)?.correctAnswers?.[0]?.rationale
              )}
            </Text>
          </View>
        )}
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#e9ecef',
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
    textAlign: 'center',
    marginTop: 8,
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
  prevButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  nextButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  correctBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  correctText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  incorrectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  incorrectText: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '600',
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
  questionId: {
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
  questionTextEn: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  optionsScrollContainer: {
    flex: 1,
    maxHeight: 300,
    marginBottom: 20,
  },
  optionsContainer: {
    paddingBottom: 10,
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
  explanationContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#f8f9fa',
    opacity: 0.5,
  },
});

export default FlashcardMode;
