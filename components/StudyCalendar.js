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
      
      if (data) {
        const parsed = JSON.parse(data);
        setStudyData(parsed);
      } else {
        setStudyData({});
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

  // 날짜 클릭 핸들러 - 완료 상태 토글
  const handleDatePress = async (day) => {
    if (!day) return;
    
    const dateKey = getDateKey(day);
    const newStudyData = { ...studyData };
    
    // 현재 완료 상태 확인
    const isCompleted = newStudyData[dateKey]?.completed || false;
    
    // 토글: 완료 <-> 미완료
    if (isCompleted) {
      // 완료 상태 제거
      delete newStudyData[dateKey];
    } else {
      // 완료 상태로 설정
      newStudyData[dateKey] = {
        completed: true,
        date: dateKey
      };
    }
    
    // 상태 업데이트
    setStudyData(newStudyData);
    
    // AsyncStorage에 저장
    try {
      await AsyncStorage.setItem('@study_calendar', JSON.stringify(newStudyData));
    } catch (error) {
      console.error('캘린더 데이터 저장 오류:', error);
    }
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
    // 완료 상태 확인 (모든 날짜에 표시 가능)
    const hasStamp = studyData[dateKey]?.completed || false;
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
        disabled={false}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e9ecef',
    borderBottomColor: '#e9ecef',
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
});

export default StudyCalendar;
