import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { t, getCurrentLanguage, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';

const { width } = Dimensions.get('window');
const CELL_SIZE = width / 7; // 7 days per week, 전체 너비 사용

const StudyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studyData, setStudyData] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateData, setSelectedDateData] = useState(null);
  const [studyStartDate, setStudyStartDate] = useState(null);
  const [interviewDate, setInterviewDate] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    loadStudyData();
    loadImportantDates();
  }, []);

  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setCurrentLanguage(newLanguage);
    };
    
    addLanguageChangeListener(handleLanguageChange);
    
    return () => {
      removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  const loadStudyData = async () => {
    try {
      const data = await AsyncStorage.getItem('@study_calendar');
      const streakData = await AsyncStorage.getItem('@study_streaks');
      
      if (data) {
        const parsed = JSON.parse(data);
        // 오늘 날짜 데이터는 무조건 제거하여 더미 히스토리 표시를 방지
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        if (parsed[todayKey]) {
          delete parsed[todayKey];
        }
        // 모든 날짜에 대해 더미 패턴(예: 25/8/1 조합)을 일괄 제거
        const keys = Object.keys(parsed);
        let removed = false;
        for (const k of keys) {
          const e = parsed[k];
          const a = e?.activities || {};
          const isDummy = (
            (a.aiTutorMinutes === 8 && a.mockInterviews === 1 && (a.flashcards === 25 || a.questions === 25 || a.questions === 15)) ||
            (e?.completed === true && a.questions === 25 && a.aiTutorMinutes === 8 && a.mockInterviews === 1)
          );
          if (isDummy) { delete parsed[k]; removed = true; }
        }
        if (removed || parsed[todayKey] === undefined) {
          await AsyncStorage.setItem('@study_calendar', JSON.stringify(parsed));
        }
        setStudyData(parsed);
      } else {
        // 더미 생성 없이 빈 데이터로 시작
        setStudyData({});
      }
      
      if (streakData) {
        const streaks = JSON.parse(streakData);
        setCurrentStreak(streaks.current || 0);
        setLongestStreak(streaks.longest || 0);
      }
    } catch (error) {
      console.error('달력 데이터 로드 오류:', error);
    }
  };

  const loadImportantDates = async () => {
    try {
      const startDate = await AsyncStorage.getItem('@study_start_date');
      const interviewDateStr = await AsyncStorage.getItem('@interview_date');
      
      if (startDate) {
        setStudyStartDate(startDate);
      }
      if (interviewDateStr) {
        setInterviewDate(interviewDateStr);
      }
    } catch (error) {
      console.error('중요 날짜 로드 오류:', error);
    }
  };

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 현재 달의 날짜 배열 생성
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // 이전 달의 빈 칸
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // 현재 달의 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // 날짜 키 생성 (YYYY-MM-DD)
  const getDateKey = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // 오늘 날짜인지 확인
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // 미래 날짜인지 확인
  const isFuture = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate > today;
  };

  // 날짜 클릭 핸들러
  const handleDatePress = (day) => {
    const dateKey = getDateKey(day);
    const data = studyData[dateKey];
    const today = isToday(day);
    // 오늘 날짜는 어떤 더미/실데이터라도 상세 표시를 억제
    setSelectedDate(day);
    setSelectedDateData(today ? null : (data || null));
  };

  // 특정 날짜가 시작 날짜인지 확인
  const isStartDate = (day) => {
    if (!studyStartDate) return false;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const checkDate = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
    return studyStartDate === checkDate;
  };

  // 특정 날짜가 인터뷰 날짜인지 확인
  const isInterviewDate = (day) => {
    if (!interviewDate) return false;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const checkDate = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
    return interviewDate === checkDate;
  };

  // 날짜 셀 렌더링
  const renderDay = (day, index) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const dateKey = getDateKey(day);
    const today = isToday(day);
    // 오늘 날짜에는 스탬프를 표시하지 않음
    const hasStamp = !today && (studyData[dateKey]?.completed || false);
    const future = isFuture(day);
    const isSelected = selectedDate === day;
    const isStart = isStartDate(day);
    const isInterview = isInterviewDate(day);

    return (
      <TouchableOpacity
        key={dateKey}
        style={[
          styles.dayCell,
          today && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => handleDatePress(day)}
        disabled={future}
      >
        <View style={styles.dayCellContent}>
          {/* 상단 배지 */}
          <View style={styles.badgeContainer}>
            {isStart && (
              <View style={styles.startBadge}>
                <Text style={styles.badgeText}>START</Text>
              </View>
            )}
            {isInterview && (
              <View style={styles.interviewBadge}>
                <Text style={styles.badgeText}>INTERVIEW</Text>
              </View>
            )}
          </View>

          <Text style={[
            styles.dayNumber, 
            today && styles.todayNumber,
            isSelected && styles.selectedNumber
          ]}>
            {day}
          </Text>
          <View style={styles.stampContainer}>
            {hasStamp && !future && (
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            )}
            {future && (
              <Text style={styles.futureIcon}>📅</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      {/* 달력 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#2E86AB" />
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekDaysContainer}>
        {[
          t('studyCalendar.weekDays.sun'),
          t('studyCalendar.weekDays.mon'),
          t('studyCalendar.weekDays.tue'),
          t('studyCalendar.weekDays.wed'),
          t('studyCalendar.weekDays.thu'),
          t('studyCalendar.weekDays.fri'),
          t('studyCalendar.weekDays.sat')
        ].map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.daysContainer}>
        {days.map((day, index) => renderDay(day, index))}
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 안내 메시지 */}
      <View style={styles.infoMessage}>
        <Ionicons name="information-circle-outline" size={16} color="#666" />
        <Text style={styles.infoText}>
          {t('studyCalendar.infoMessage')}
        </Text>
      </View>

      {/* Daily Progress Section */}
      {selectedDate && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {currentDate.toLocaleString('en-US', { month: 'short' })} {selectedDate}, {currentDate.getFullYear()}
            </Text>
            <Text style={styles.progressSubtitle}>{t('studyCalendar.dailyProgress')}</Text>
          </View>

          {selectedDateData ? (
            <View style={styles.progressList}>
              <View style={styles.progressItem}>
                <View style={styles.progressIconContainer}>
                  <Ionicons name="book" size={20} color="#2E86AB" />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressLabel}>{t('studyCalendar.learn')}</Text>
                  <Text style={styles.progressValue}>
                    {selectedDateData.activities.questions > 0 ? t('studyCalendar.completed') : t('studyCalendar.notStarted')}
                  </Text>
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressIconContainer}>
                  <Ionicons name="albums" size={20} color="#28a745" />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressLabel}>{t('studyCalendar.reviewFlashcard')}</Text>
                  <Text style={styles.progressValue}>
                    {selectedDateData.activities.flashcards} {t('studyCalendar.questions')}
                  </Text>
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressIconContainer}>
                  <Ionicons name="chatbubbles" size={20} color="#ff9800" />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressLabel}>{t('studyCalendar.aiTutor')}</Text>
                  <Text style={styles.progressValue}>
                    {selectedDateData.activities.aiTutorMinutes} {t('studyCalendar.minutes')}
                  </Text>
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressIconContainer}>
                  <Ionicons name="mic" size={20} color="#e91e63" />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressLabel}>{t('studyCalendar.mockInterview')}</Text>
                  <Text style={styles.progressValue}>
                    {selectedDateData.activities.mockInterviews} {selectedDateData.activities.mockInterviews !== 1 ? t('studyCalendar.interviews') : t('studyCalendar.interview')}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{t('studyCalendar.noActivity')}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e9ecef',
    borderBottomColor: '#e9ecef',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  streakBox: {
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: '#2E86AB',
  },
  streakLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 0,
    backgroundColor: '#f8f9fa',
  },
  weekDayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  weekDayText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE * 1.3, // 높이 30% 증가
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  selectedNumber: {
    color: '#ff9800',
    fontWeight: theme.typography.weights.bold,
  },
  dayCellContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  badgeContainer: {
    height: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  interviewBadge: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dayNumber: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium,
  },
  todayNumber: {
    fontWeight: theme.typography.weights.bold,
    color: '#2E86AB',
  },
  stampContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    fontSize: 22,
  },
  futureIcon: {
    fontSize: 16,
    opacity: 0.3,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  legendText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginTop: theme.spacing.sm,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: 4,
  },
  infoText: {
    fontSize: theme.typography.sizes.xs,
    color: '#666',
    fontStyle: 'italic',
  },
  // Progress Section Styles
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: '#fafafa',
  },
  progressHeader: {
    marginBottom: theme.spacing.md,
  },
  progressTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  progressList: {
    gap: theme.spacing.sm,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  noDataContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default StudyCalendar;
