import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { theme } from '../styles/theme';
import QuestionLoader from '../utils/questionLoader';
import { t } from '../utils/i18n';

const AudioMode = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(true); // 처음 시작할 때는 pause 상태
  const [currentPhase, setCurrentPhase] = useState('question'); // 'question', 'questionWait', 'answer', or 'waiting'
  const [timeLeft, setTimeLeft] = useState(5);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isAnswerComplete, setIsAnswerComplete] = useState(false);
  const [isQuestionComplete, setIsQuestionComplete] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1); // 1, 2, 3
  const [isRandomMode, setIsRandomMode] = useState(false); // false: 순차, true: 랜덤
  const [currentQuestionRepeat, setCurrentQuestionRepeat] = useState(0); // 현재 질문 반복 횟수
  const [currentAnswerRepeat, setCurrentAnswerRepeat] = useState(0); // 현재 답변 반복 횟수

  useEffect(() => {
    loadQuestions();
    return () => {
      // Cleanup: stop any ongoing speech
      Speech.stop();
    };
  }, []);

  // Random 모드 변경 시 문제 재로드
  useEffect(() => {
    if (questions.length > 0) {
      loadQuestions();
      // 현재 인덱스를 0으로 리셋하고 일시정지
      setCurrentIndex(0);
      setIsPlaying(false);
      setIsPaused(true);
      setCurrentPhase('question');
      setTimeLeft(5);
      setIsAnswerComplete(false);
      setIsQuestionComplete(false);
      setCurrentQuestionRepeat(0);
      setCurrentAnswerRepeat(0);
      Speech.stop();
    }
  }, [isRandomMode]);

  // 자동 재생 useEffect 제거 - 중복 재생 방지를 위해 수동 제어만 사용

  useEffect(() => {
    let timer;
    if (isPlaying && !isPaused && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      handlePhaseComplete();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying, isPaused]);

  const loadQuestions = async () => {
    try {
      // Driving 모드에서는 항상 영어 질문 사용
      const questionsData = await QuestionLoader.loadQuestionsForLanguage('en');
      // Random 모드에 따라 순서 결정
      const orderedQuestions = isRandomMode 
        ? [...questionsData].sort(() => 0.5 - Math.random()) // 랜덤 순서 (복사본 사용)
        : [...questionsData]; // 순차적 순서 (ID 순, 복사본 사용)
      
      setQuestions(orderedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions');
      setLoading(false);
    }
  };

  const startAudioLearning = () => {
    setIsPlaying(true);
    setCurrentPhase('question');
    setIsQuestionComplete(false);
    setIsAnswerComplete(false);
    setCurrentQuestionRepeat(0);
    setCurrentAnswerRepeat(0);
    
    // 질문 반복 읽기 시작 (현재 인덱스 명시적 전달)
    readQuestionRepeatedly(0, currentIndex);
  };

  const readQuestionRepeatedly = (repeatIndex = 0, questionIndex = currentIndex) => {
    const currentQuestion = questions[questionIndex];
    setCurrentQuestionRepeat(repeatIndex);
    
    speakText(currentQuestion.question, () => {
      const nextRepeat = repeatIndex + 1;
      
      if (nextRepeat < repeatCount) {
        // 아직 더 읽어야 함
        setTimeout(() => {
          readQuestionRepeatedly(nextRepeat, questionIndex);
        }, 500); // 반복 사이 0.5초 간격
      } else {
        // 질문 반복 완료, 5초 대기 시작
        setIsQuestionComplete(true);
        setCurrentPhase('questionWait');
        setTimeLeft(5);
      }
    });
  };

  const speakText = (text, onComplete) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8,
      onDone: () => {
        // Speech completed
        if (onComplete) onComplete();
      },
      onStopped: () => {
        // Speech was stopped
      },
      onError: (error) => {
        console.error('Speech error:', error);
      }
    });
  };

  const handlePhaseComplete = () => {
    if (currentPhase === 'questionWait') {
      // 질문 읽기 후 5초 대기 완료, 답변 읽기 시작
      setCurrentPhase('answer');
      setIsAnswerComplete(false);
      setCurrentAnswerRepeat(0);
      
      // 답변 반복 읽기 시작 (현재 인덱스 명시적 전달)
      readAnswerRepeatedly(0, currentIndex);
    } else if (currentPhase === 'waiting') {
      // 2초 대기 후 바로 다음 문제로 이동
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        // 다음 문제 자동 시작
        if (!isPaused) {
          setTimeout(() => {
            setCurrentPhase('question');
            setIsQuestionComplete(false);
            setIsAnswerComplete(false);
            setCurrentQuestionRepeat(0);
            setCurrentAnswerRepeat(0);
            readQuestionRepeatedly(0, nextIndex); // 다음 인덱스 명시적 전달
          }, 100); // 상태 업데이트 후 약간의 지연
        }
      } else {
        handleComplete();
      }
    }
  };

  const readAnswerRepeatedly = (repeatIndex = 0, questionIndex = currentIndex) => {
    const currentQuestion = questions[questionIndex];
    const answers = currentQuestion.correctAnswers || [];
    setCurrentAnswerRepeat(repeatIndex);
    
    if (answers.length > 0) {
      const allAnswers = answers.map(answer => answer.text).join('. ');
      speakText(allAnswers, () => {
        const nextRepeat = repeatIndex + 1;
        
        if (nextRepeat < repeatCount) {
          // 아직 더 읽어야 함
          setTimeout(() => {
            readAnswerRepeatedly(nextRepeat, questionIndex);
          }, 500); // 반복 사이 0.5초 간격
        } else {
          // 답변 반복 완료, 2초 대기 시작
          setIsAnswerComplete(true);
          setCurrentPhase('waiting');
          setTimeLeft(2);
        }
      });
    } else {
      speakText('No answer available', () => {
        const nextRepeat = repeatIndex + 1;
        
        if (nextRepeat < repeatCount) {
          setTimeout(() => {
            readAnswerRepeatedly(nextRepeat, questionIndex);
          }, 500);
        } else {
          setIsAnswerComplete(true);
          setCurrentPhase('waiting');
          setTimeLeft(2);
        }
      });
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    Speech.stop();
    Alert.alert(
      'Audio Learning Complete!',
      `You've completed all ${questions.length} questions in audio mode.`,
      [
        { text: 'Restart', onPress: () => restartAudio() },
        { text: 'Back to Menu', onPress: () => navigation.goBack() }
      ]
    );
  };

  const restartAudio = () => {
    setCurrentIndex(0);
    setCurrentPhase('question');
    setTimeLeft(5);
    setIsPlaying(false);
    setIsPaused(true); // restart도 pause 상태로 시작
    setIsAnswerComplete(false);
    setIsQuestionComplete(false);
    setCurrentQuestionRepeat(0); // 질문 반복 카운터 리셋
    setCurrentAnswerRepeat(0); // 답변 반복 카운터 리셋
    // restart 시에는 자동 재생하지 않음
  };

  const toggleRandomMode = () => {
    // 현재 재생 중이면 정지
    Speech.stop();
    
    // 랜덤/순차 모드 전환
    setIsRandomMode(!isRandomMode);
    
    // 진행 상태 완전 리셋 (처음 시작할 때와 동일)
    setCurrentIndex(0);
    setCurrentPhase('question');
    setTimeLeft(5);
    setIsPlaying(false);
    setIsPaused(true);
    setIsAnswerComplete(false);
    setIsQuestionComplete(false);
    setCurrentQuestionRepeat(0);
    setCurrentAnswerRepeat(0);
  };

  const togglePlayPause = () => {
    if (isPlaying && !isPaused) {
      // Pause
      setIsPaused(true);
      Speech.stop();
    } else {
      // Resume or start
      setIsPaused(false);
      if (!isPlaying) {
        // 처음 시작할 때만 startAudioLearning 호출
        startAudioLearning();
      } else {
        // Resume current phase - 일시정지된 상태에서 재개할 때만
        resumeCurrentPhase();
      }
    }
  };

  const resumeCurrentPhase = () => {
    // 질문 단계에서 아직 질문을 읽지 않았을 때만 읽기
    if (currentPhase === 'question' && !isQuestionComplete) {
      readQuestionRepeatedly(currentQuestionRepeat, currentIndex);
    } 
    // 답변 단계에서 아직 답변을 읽지 않았을 때만 읽기
    else if (currentPhase === 'answer' && !isAnswerComplete) {
      readAnswerRepeatedly(currentAnswerRepeat, currentIndex);
    }
    // questionWait나 waiting 단계에서는 아무것도 하지 않음 (타이머만 진행)
  };

  const skipToNext = () => {
    Speech.stop();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentPhase('question');
      setTimeLeft(5);
      setIsAnswerComplete(false);
      setIsQuestionComplete(false);
      setCurrentQuestionRepeat(0); // 질문 반복 카운터 리셋
      setCurrentAnswerRepeat(0); // 답변 반복 카운터 리셋
      if (!isPaused) {
        // 재생 중이었다면 다음 문제 자동 시작
        setIsPlaying(false); // 상태 리셋 후 다시 시작
      }
    } else {
      handleComplete();
    }
  };

  const skipToPrevious = () => {
    Speech.stop();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentPhase('question');
      setTimeLeft(5);
      setIsAnswerComplete(false);
      setIsQuestionComplete(false);
      setCurrentQuestionRepeat(0); // 질문 반복 카운터 리셋
      setCurrentAnswerRepeat(0); // 답변 반복 카운터 리셋
      if (!isPaused) {
        // 재생 중이었다면 이전 문제 자동 시작
        setIsPlaying(false); // 상태 리셋 후 다시 시작
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No questions available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  // 모든 correctAnswers를 표시
  const answers = currentQuestion.correctAnswers || [];
  const allAnswers = answers.length > 0 
    ? answers.map((answer, index) => `${index + 1}. ${answer.text}`).join('\n')
    : 'No answer available';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('menu.learn.audioLearning')}</Text>
        <TouchableOpacity onPress={() => setAutoPlay(!autoPlay)}>
          <Ionicons 
            name={autoPlay ? "repeat" : "repeat-outline"} 
            size={24} 
            color={autoPlay ? theme.colors.primary : theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {questions.length} {repeatCount > 1 && currentPhase === 'question' && `(Q: ${currentQuestionRepeat + 1}/${repeatCount})`} {repeatCount > 1 && currentPhase === 'answer' && `(A: ${currentAnswerRepeat + 1}/${repeatCount})`}
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

      {/* Current Phase Indicator */}
      <View style={styles.phaseContainer}>
        <View style={[styles.phaseIndicator, (currentPhase === 'question' || currentPhase === 'questionWait') && styles.activePhase]}>
          <Text style={[styles.phaseText, (currentPhase === 'question' || currentPhase === 'questionWait') && styles.activePhaseText]}>
            {currentPhase === 'question' ? 'Reading Q...' : 'Wait (5s)'}
          </Text>
        </View>
        <View style={[styles.phaseIndicator, (currentPhase === 'answer' || currentPhase === 'waiting') && styles.activePhase]}>
          <Text style={[styles.phaseText, (currentPhase === 'answer' || currentPhase === 'waiting') && styles.activePhaseText]}>
            {currentPhase === 'answer' ? 'Reading A...' : 'Wait (2s)'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Answers:</Text>
          <Text style={styles.answerText}>{allAnswers}</Text>
        </View>
      </ScrollView>

      {/* Settings Wrappers */}
      <View style={styles.settingsContainer}>
        {/* Repeat Wrapper */}
        <View style={styles.settingWrapper}>
          <Text style={styles.settingTitle}>Repeat</Text>
          <View style={styles.settingOptions}>
            {[1, 2, 3].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.repeatOption,
                  repeatCount === count && styles.activeOption
                ]}
                onPress={() => setRepeatCount(count)}
              >
                <Text style={[
                  styles.repeatText,
                  repeatCount === count && styles.activeOptionText
                ]}>
                  x{count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Random Wrapper */}
        <View style={styles.settingWrapper}>
          <Text style={styles.settingTitle}>Mode</Text>
          <TouchableOpacity
            style={[
              styles.randomOption,
              isRandomMode && styles.activeOption
            ]}
            onPress={toggleRandomMode}
          >
            <Ionicons
              name={isRandomMode ? "shuffle" : "list"}
              size={20}
              color={isRandomMode ? theme.colors.text.inverse : theme.colors.text.secondary}
            />
            <Text style={[
              styles.modeText,
              isRandomMode && styles.activeModeText
            ]}>
              {isRandomMode ? 'Random' : 'List'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={skipToPrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons 
            name="play-skip-back" 
            size={24} 
            color={currentIndex === 0 ? theme.colors.text.tertiary : theme.colors.primary} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Ionicons 
            name={isPlaying && !isPaused ? "pause" : "play"} 
            size={32} 
            color={theme.colors.text.inverse} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={skipToNext}
          disabled={currentIndex === questions.length - 1}
        >
          <Ionicons 
            name="play-skip-forward" 
            size={24} 
            color={currentIndex === questions.length - 1 ? theme.colors.text.tertiary : theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  progressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  phaseContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  phaseIndicator: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activePhase: {
    backgroundColor: theme.colors.primary,
  },
  phaseText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  activePhaseText: {
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  questionContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  questionLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
  },
  questionText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  answerContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.md,
  },
  answerLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
  },
  answerText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
    lineHeight: 24,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  controlButton: {
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
  },
  playButton: {
    backgroundColor: theme.colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    ...theme.shadows.md,
  },
  // Settings Wrappers Styles
  settingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  settingWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  repeatOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    minWidth: 32,
    alignItems: 'center',
  },
  repeatText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  randomOption: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 40,
    flexDirection: 'row',
  },
  activeOption: {
    backgroundColor: theme.colors.primary,
  },
  activeOptionText: {
    color: theme.colors.text.inverse,
  },
  modeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
  activeModeText: {
    color: theme.colors.text.inverse,
  },
});

export default AudioMode;
