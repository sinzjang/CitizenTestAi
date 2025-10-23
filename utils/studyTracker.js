import AsyncStorage from '@react-native-async-storage/async-storage';

class StudyTracker {
  // 오늘 날짜 키 생성
  static getTodayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 오늘의 학습 데이터 가져오기
  static async getTodayData() {
    try {
      const calendarData = await AsyncStorage.getItem('@study_calendar');
      const calendar = calendarData ? JSON.parse(calendarData) : {};
      const todayKey = this.getTodayKey();
      
      return calendar[todayKey] || {
        completed: false,
        activities: {
          questions: 0,
          flashcards: 0,
          aiTutorMinutes: 0,
          mockInterviews: 0,
        },
      };
    } catch (error) {
      console.error('오늘 데이터 로드 오류:', error);
      return null;
    }
  }

  // 학습 활동 기록
  static async recordActivity(activityType, count = 1) {
    try {
      const calendarData = await AsyncStorage.getItem('@study_calendar');
      const calendar = calendarData ? JSON.parse(calendarData) : {};
      const todayKey = this.getTodayKey();
      
      // 오늘 데이터 초기화
      if (!calendar[todayKey]) {
        calendar[todayKey] = {
          completed: false,
          activities: {
            questions: 0,
            flashcards: 0,
            aiTutorMinutes: 0,
            mockInterviews: 0,
          },
        };
      }

      // 활동 카운트 증가
      calendar[todayKey].activities[activityType] += count;

      // 스탬프 조건 확인
      const activities = calendar[todayKey].activities;
      const stampEarned = 
        activities.questions >= 10 ||
        activities.flashcards >= 20 ||
        activities.aiTutorMinutes >= 5 ||
        activities.mockInterviews >= 1;

      calendar[todayKey].completed = stampEarned;

      // 저장
      await AsyncStorage.setItem('@study_calendar', JSON.stringify(calendar));

      // 스탬프를 새로 획득했으면 스트릭 업데이트
      if (stampEarned) {
        await this.updateStreaks();
      }

      return {
        success: true,
        stampEarned,
        todayData: calendar[todayKey],
      };
    } catch (error) {
      console.error('활동 기록 오류:', error);
      return { success: false, error };
    }
  }

  // 스트릭 업데이트
  static async updateStreaks() {
    try {
      const calendarData = await AsyncStorage.getItem('@study_calendar');
      const calendar = calendarData ? JSON.parse(calendarData) : {};
      
      // 날짜순으로 정렬
      const dates = Object.keys(calendar).sort();
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 오늘부터 역순으로 스트릭 계산
      for (let i = 0; i <= 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        
        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        if (calendar[dateKey]?.completed) {
          if (i === 0 || currentStreak > 0 || i === 1) {
            currentStreak++;
          }
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else if (i > 0) {
          // 오늘이 아니고 완료하지 않았으면 스트릭 중단
          if (currentStreak === 0) {
            break;
          }
          tempStreak = 0;
        }
      }

      const streakData = {
        current: currentStreak,
        longest: longestStreak,
        lastActiveDate: this.getTodayKey(),
      };

      await AsyncStorage.setItem('@study_streaks', JSON.stringify(streakData));
      
      return streakData;
    } catch (error) {
      console.error('스트릭 업데이트 오류:', error);
      return null;
    }
  }

  // 스탬프 획득 조건 확인
  static async checkStampConditions() {
    const todayData = await this.getTodayData();
    if (!todayData) return false;

    const { activities } = todayData;
    return {
      completed: todayData.completed,
      conditions: {
        questions: {
          current: activities.questions,
          required: 10,
          met: activities.questions >= 10,
        },
        flashcards: {
          current: activities.flashcards,
          required: 20,
          met: activities.flashcards >= 20,
        },
        aiTutor: {
          current: activities.aiTutorMinutes,
          required: 5,
          met: activities.aiTutorMinutes >= 5,
        },
        mockInterview: {
          current: activities.mockInterviews,
          required: 1,
          met: activities.mockInterviews >= 1,
        },
      },
    };
  }

  // 통계 가져오기
  static async getStatistics() {
    try {
      const calendarData = await AsyncStorage.getItem('@study_calendar');
      const calendar = calendarData ? JSON.parse(calendarData) : {};
      const streakData = await AsyncStorage.getItem('@study_streaks');
      const streaks = streakData ? JSON.parse(streakData) : { current: 0, longest: 0 };

      // 이번 달 통계
      const today = new Date();
      const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const thisMonthDays = Object.keys(calendar).filter(
        (key) => key.startsWith(thisMonth) && calendar[key].completed
      ).length;

      // 이번 주 통계
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      let thisWeekDays = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(startOfWeek);
        checkDate.setDate(startOfWeek.getDate() + i);
        const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (calendar[dateKey]?.completed) {
          thisWeekDays++;
        }
      }

      return {
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        thisMonth: thisMonthDays,
        thisWeek: thisWeekDays,
        totalDays: Object.keys(calendar).filter((key) => calendar[key].completed).length,
      };
    } catch (error) {
      console.error('통계 가져오기 오류:', error);
      return null;
    }
  }
}

export default StudyTracker;
