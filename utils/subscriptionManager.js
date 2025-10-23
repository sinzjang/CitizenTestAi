// 구독 관리 시스템 (RevenueCat 사용 예시)
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';
import { AdminManager } from './adminManager';

const REVENUECAT_API_KEY = 'goog_hfSoeGcsESxDKUXMDmWUEOFwUKc'; // RevenueCat Google Play Store API Key

export class SubscriptionManager {
  static async initialize() {
    try {
      // RevenueCat 초기화 - 안전한 방법
      const configuration = {
        apiKey: REVENUECAT_API_KEY,
      };
      
      await Purchases.configure(configuration);
      
      console.log('[SubscriptionManager] RevenueCat initialized successfully');
    } catch (error) {
      console.error('[SubscriptionManager] RevenueCat initialization failed:', error);
      // 초기화 실패해도 앱이 크래시되지 않도록 처리
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
      
      if (purchaseResult.customerInfo.entitlements.active['Premium']) { // RevenueCat Entitlement ID와 일치
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
      const isPremium = customerInfo.entitlements.active['Premium'] !== undefined; // RevenueCat Entitlement ID와 일치
      
      await this.updatePremiumStatus(isPremium);
      return { success: true, isPremium };
    } catch (error) {
      console.error('Restore error:', error);
      return { success: false, error: error.message };
    }
  }

  // 구독 상태 확인 (RevenueCat + 친구 권한 포함)
  static async checkSubscriptionStatus() {
    try {
      // 1. RevenueCat 구독 상태 확인
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremiumSubscriber = customerInfo.entitlements.active['Premium'] !== undefined;
      
      if (isPremiumSubscriber) {
        console.log('[SubscriptionManager] RevenueCat 구독 활성화됨');
        return true;
      }
      
      // 2. 친구 권한 확인 (이메일 기반)
      const userEmail = await this.getUserEmail();
      if (userEmail) {
        const isFriendPremium = await AdminManager.checkFriendPremiumStatus(userEmail);
        if (isFriendPremium) {
          console.log('[SubscriptionManager] 친구 권한으로 프리미엄 활성화됨');
          return true;
        }
      }
      
      console.log('[SubscriptionManager] 프리미엄 비활성화됨');
      return false;
    } catch (error) {
      console.error('[SubscriptionManager] 구독 상태 확인 실패:', error);
      return false; // 오류 시 프리미엄 비활성화
    }
  }

  // 사용자 이메일 가져오기 (설정에서 입력받거나 기기 정보 사용)
  static async getUserEmail() {
    try {
      const savedEmail = await AsyncStorage.getItem('user_email');
      return savedEmail;
    } catch (error) {
      return null;
    }
  }

  // 사용자 이메일 설정
  static async setUserEmail(email) {
    try {
      await AsyncStorage.setItem('user_email', email);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 로컬 프리미엄 상태 업데이스트
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

// 구독 상품 정의 (RevenueCat Package ID와 일치)
export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: '$rc_monthly', // RevenueCat Package ID
  QUARTERLY: '$rc_three_month', // RevenueCat Package ID
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
