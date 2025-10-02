// 구독 관리 시스템 (RevenueCat 사용 예시)
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVENUECAT_API_KEY = 'your_revenuecat_api_key_here';

export class SubscriptionManager {
  static async initialize() {
    try {
      // RevenueCat 초기화
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO);
      
      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      } else if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      }
      
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('RevenueCat initialization failed:', error);
    }
  }

  // 구독 상품 목록 가져오기
  static async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  // 구독 구매
  static async purchaseSubscription(packageIdentifier) {
    try {
      const purchaseResult = await Purchases.purchasePackage(packageIdentifier);
      
      if (purchaseResult.customerInfo.entitlements.active['premium']) {
        // 구독 성공
        await this.updatePremiumStatus(true);
        return { success: true, customerInfo: purchaseResult.customerInfo };
      }
      
      return { success: false, error: 'Purchase failed' };
    } catch (error) {
      console.error('Purchase error:', error);
      return { success: false, error: error.message };
    }
  }

  // 구독 복원
  static async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      await this.updatePremiumStatus(isPremium);
      return { success: true, isPremium };
    } catch (error) {
      console.error('Restore error:', error);
      return { success: false, error: error.message };
    }
  }

  // 구독 상태 확인
  static async checkSubscriptionStatus() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      await this.updatePremiumStatus(isPremium);
      return isPremium;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  // 로컬 프리미엄 상태 업데이트
  static async updatePremiumStatus(isPremium) {
    try {
      await AsyncStorage.setItem('user_premium_status', isPremium.toString());
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  }

  // 구독 취소 (사용자를 설정으로 안내)
  static openSubscriptionManagement() {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  }
}

// 구독 상품 정의
export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: 'premium_monthly',
  YEARLY: 'premium_yearly',
};

// 구독 혜택 정의
export const PREMIUM_BENEFITS = [
  '🎯 모든 학습 모드 무제한 이용',
  '🚗 운전 중 오디오 학습',
  '🤖 AI 모의 면접 무제한',
  '📊 상세한 진행 상황 분석',
  '🎨 카테고리별 맞춤 학습',
  '💪 약점 집중 연습',
  '🔄 무제한 반복 학습',
  '📱 광고 없는 깔끔한 경험'
];
