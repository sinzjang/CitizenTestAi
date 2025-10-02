import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_KEY = 'user_premium_status';

export const PremiumManager = {
  // 프리미엄 상태 확인 (개발용: 항상 true 반환)
  async isPremium() {
    try {
      // 개발/테스트 모드: 항상 프리미엄 활성화
      return true;
      
      // 실제 프리미엄 체크 로직 (주석 처리)
      // const premiumStatus = await AsyncStorage.getItem(PREMIUM_KEY);
      // return premiumStatus === 'true';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return true; // 에러 시에도 프리미엄 활성화
    }
  },

  // 프리미엄 상태 설정
  async setPremium(isPremium) {
    try {
      await AsyncStorage.setItem(PREMIUM_KEY, isPremium.toString());
      return true;
    } catch (error) {
      console.error('Error setting premium status:', error);
      return false;
    }
  },

  // 프리미엄 상태 초기화 (개발/테스트용)
  async clearPremium() {
    try {
      await AsyncStorage.removeItem(PREMIUM_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing premium status:', error);
      return false;
    }
  }
};

// 프리미엄 기능 정의
export const PREMIUM_FEATURES = {
  // Learn 섹션
  CATEGORY_VIEW: 'category_view',
  WEAKNESS_TEST: 'weakness_test',
  DRIVING_AUDIO_LEARNING: 'driving_audio_learning',
  
  // Practice Tests 섹션
  PRACTICE_TEST: 'practice_test',
  // FLASHCARD_MODE는 Free
  
  // AI Mock Interview 섹션 (모두 Premium)
  AI_MOCK_INTERVIEW: 'ai_mock_interview',
  
  // My Progress 섹션
  AI_TUTOR_ADVICE: 'ai_tutor_advice'
  // PROGRESS_DASHBOARD는 Free
};

// 기능별 프리미엄 여부 체크
export const isPremiumFeature = (feature) => {
  return Object.values(PREMIUM_FEATURES).includes(feature);
};

// 프리미엄 필요 메시지
export const PREMIUM_MESSAGES = {
  title: 'Premium Feature',
  message: 'This feature is available for Premium subscribers only. Upgrade to access all features!',
  upgradeButton: 'Upgrade to Premium',
  cancelButton: 'Maybe Later'
};
