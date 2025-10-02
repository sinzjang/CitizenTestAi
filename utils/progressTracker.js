import AsyncStorage from '@react-native-async-storage/async-storage';
import QuestionLoader from '../utils/questionLoader';

const PROGRESS_KEY = 'userProgress';
const QUESTION_STATS_KEY = 'questionStats';

// 전체 진행 상황 데이터 구조
const defaultProgress = {
  totalQuestions: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  totalAttempts: 0,
  firstAttemptDate: null,
  lastAttemptDate: null,
  averageScore: 0,
  practiceTestsCompleted: 0,
  weaknessTestsCompleted: 0,
  streakDays: 0,
  bestScore: 0,
  worstScore: 100
};

// 개별 문제 통계 데이터 구조
const createQuestionStat = (questionId) => ({
  questionId: questionId,
  totalAttempts: 0,
  correctAttempts: 0,
  incorrectAttempts: 0,
  firstAttemptDate: null,
  lastAttemptDate: null,
  averageResponseTime: 0,
  fastestResponseTime: null,
  slowestResponseTime: null,
  currentStreak: 0, // 연속 정답 횟수
  longestStreak: 0, // 최장 연속 정답 횟수
  difficulty: 'medium', // easy, medium, hard (정답률에 따라 자동 계산)
  lastResult: null // 'correct' or 'incorrect' or 'timeout'
});

// 전체 진행 상황 가져오기
export const getUserProgress = async () => {
  try {
    const progressData = await AsyncStorage.getItem(PROGRESS_KEY);
    if (progressData) {
      return JSON.parse(progressData);
    }
    return defaultProgress;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return defaultProgress;
  }
};

// 전체 진행 상황 저장하기
export const saveUserProgress = async (progress) => {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
};

// 개별 문제 통계 가져오기
export const getQuestionStats = async () => {
  try {
    const statsData = await AsyncStorage.getItem(QUESTION_STATS_KEY);
    if (statsData) {
      return JSON.parse(statsData);
    }
    return {};
  } catch (error) {
    console.error('Error getting question stats:', error);
    return {};
  }
};

// 개별 문제 통계 저장하기
export const saveQuestionStats = async (stats) => {
  try {
    await AsyncStorage.setItem(QUESTION_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving question stats:', error);
  }
};

// 특정 문제의 통계 가져오기
export const getQuestionStat = async (questionId) => {
  const allStats = await getQuestionStats();
  return allStats[questionId] || createQuestionStat(questionId);
};

// 문제 답변 결과 기록하기
export const recordQuestionAttempt = async (questionId, isCorrect, responseTime = null, testType = 'practice') => {
  try {
    const currentDate = new Date().toISOString();
    
    // 전체 진행 상황 업데이트
    const progress = await getUserProgress();
    
    // 첫 시도인 경우 날짜 기록
    if (!progress.firstAttemptDate) {
      progress.firstAttemptDate = currentDate;
    }
    progress.lastAttemptDate = currentDate;
    
    progress.totalAttempts += 1;
    if (isCorrect) {
      progress.totalCorrect += 1;
    } else {
      progress.totalIncorrect += 1;
    }
    
    // 평균 점수 계산
    progress.averageScore = Math.round((progress.totalCorrect / progress.totalAttempts) * 100);
    
    await saveUserProgress(progress);
    
    // 개별 문제 통계 업데이트
    const allStats = await getQuestionStats();
    const questionStat = allStats[questionId] || createQuestionStat(questionId);
    
    // 첫 시도인 경우 날짜 기록
    if (!questionStat.firstAttemptDate) {
      questionStat.firstAttemptDate = currentDate;
    }
    questionStat.lastAttemptDate = currentDate;
    
    questionStat.totalAttempts += 1;
    if (isCorrect) {
      questionStat.correctAttempts += 1;
      questionStat.currentStreak += 1;
      questionStat.longestStreak = Math.max(questionStat.longestStreak, questionStat.currentStreak);
      questionStat.lastResult = 'correct';
    } else {
      questionStat.incorrectAttempts += 1;
      questionStat.currentStreak = 0;
      questionStat.lastResult = 'incorrect';
    }
    
    // 응답 시간 기록
    if (responseTime !== null) {
      if (questionStat.fastestResponseTime === null || responseTime < questionStat.fastestResponseTime) {
        questionStat.fastestResponseTime = responseTime;
      }
      if (questionStat.slowestResponseTime === null || responseTime > questionStat.slowestResponseTime) {
        questionStat.slowestResponseTime = responseTime;
      }
      
      // 평균 응답 시간 계산
      const totalTime = (questionStat.averageResponseTime * (questionStat.totalAttempts - 1)) + responseTime;
      questionStat.averageResponseTime = Math.round(totalTime / questionStat.totalAttempts);
    }
    
    // 난이도 계산 (정답률 기준)
    const accuracy = questionStat.correctAttempts / questionStat.totalAttempts;
    if (accuracy >= 0.8) {
      questionStat.difficulty = 'easy';
    } else if (accuracy >= 0.5) {
      questionStat.difficulty = 'medium';
    } else {
      questionStat.difficulty = 'hard';
    }
    
    allStats[questionId] = questionStat;
    await saveQuestionStats(allStats);
    
  } catch (error) {
    console.error('Error recording question attempt:', error);
  }
};

// 테스트 완료 기록하기
export const recordTestCompletion = async (testType, score, totalQuestions) => {
  try {
    const progress = await getUserProgress();
    
    if (testType === 'practice') {
      progress.practiceTestsCompleted += 1;
    } else if (testType === 'weakness') {
      progress.weaknessTestsCompleted += 1;
    }
    
    // 최고/최저 점수 업데이트
    progress.bestScore = Math.max(progress.bestScore, score);
    progress.worstScore = Math.min(progress.worstScore, score);
    
    await saveUserProgress(progress);
  } catch (error) {
    console.error('Error recording test completion:', error);
  }
};

// 진행 상황 초기화
export const resetProgress = async () => {
  try {
    await AsyncStorage.removeItem(PROGRESS_KEY);
    await AsyncStorage.removeItem(QUESTION_STATS_KEY);
  } catch (error) {
    console.error('Error resetting progress:', error);
  }
};

// 통계 요약 가져오기
export const getProgressSummary = async () => {
  try {
    const progress = await getUserProgress();
    const questionStats = await getQuestionStats();
    
    const totalQuestions = Object.keys(questionStats).length;
    const easyQuestions = Object.values(questionStats).filter(q => q.difficulty === 'easy').length;
    const mediumQuestions = Object.values(questionStats).filter(q => q.difficulty === 'medium').length;
    const hardQuestions = Object.values(questionStats).filter(q => q.difficulty === 'hard').length;
    
    const masteredQuestions = Object.values(questionStats).filter(q => 
      q.correctAttempts >= 3 && (q.correctAttempts / q.totalAttempts) >= 0.8
    ).length;
    
    return {
      ...progress,
      totalUniqueQuestions: totalQuestions,
      masteredQuestions,
      easyQuestions,
      mediumQuestions,
      hardQuestions,
      completionRate: totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting progress summary:', error);
    return null;
  }
};

// 약한 문제들 가져오기 (정답률이 낮은 문제들)
export const getWeakQuestions = async (limit = 10) => {
  try {
    const questionStats = await getQuestionStats();
    const questionsData = await QuestionLoader.loadQuestions();
    
    const weakQuestions = Object.values(questionStats)
      .filter(stat => stat.totalAttempts >= 2) // 최소 2번 이상 시도한 문제만
      .sort((a, b) => {
        const accuracyA = a.correctAttempts / a.totalAttempts;
        const accuracyB = b.correctAttempts / b.totalAttempts;
        return accuracyA - accuracyB; // 정답률이 낮은 순으로 정렬
      })
      .slice(0, limit)
      .map(stat => {
        const question = questionsData.find(q => q.id === stat.questionId);
        return {
          ...question,
          stats: stat
        };
      })
      .filter(q => q.id); // 유효한 문제만 필터링
    
    return weakQuestions;
  } catch (error) {
    console.error('Error getting weak questions:', error);
    return [];
  }
};

export default {
  getUserProgress,
  saveUserProgress,
  getQuestionStats,
  saveQuestionStats,
  getQuestionStat,
  recordQuestionAttempt,
  recordTestCompletion,
  resetProgress,
  getProgressSummary,
  getWeakQuestions
};
