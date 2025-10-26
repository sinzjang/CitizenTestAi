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
      
      // 로그 레벨 설정으로 에러 방지
      Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);
      
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

  // 구독 상태 확인 (RevenueCat + 친구 권한 + Admin 모드 + 개발 모드 포함)
  static async checkSubscriptionStatus() {
    try {
      // 0. 개발 모드에서는 자동으로 Premium 활성화
      if (__DEV__) {
        console.log('[SubscriptionManager] 개발 모드 - 프리미엄 자동 활성화');
        return true;
      }
      
      // 1. Admin 모드 확인
      const isAdmin = await AdminManager.isAdmin();
      if (isAdmin) {
        console.log('[SubscriptionManager] Admin 모드 활성화됨');
        return true;
      }
      
      // 2. RevenueCat 구독 상태 확인
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const isPremiumSubscriber = customerInfo.entitlements.active['Premium'] !== undefined;
        
        if (isPremiumSubscriber) {
          console.log('[SubscriptionManager] RevenueCat 구독 활성화됨');
          return true;
        }
      } catch (rcError) {
        console.log('[SubscriptionManager] RevenueCat check skipped:', rcError.message);
      }
      
      // 3. 친구 권한 확인 (이메일 기반)
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
      // 개발 모드에서는 오류 시에도 Premium 활성화
      if (__DEV__) {
        console.log('[SubscriptionManager] 개발 모드 - 오류 발생해도 프리미엄 활성화');
        return true;
      }
      return false; // 프로덕션에서는 오류 시 프리미엄 비활성화
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

  // 구독 상세 정보 가져오기 (Status: Free/Premium/Admin)
  static async getSubscriptionDetails() {
    try {
      // Admin 만료일 계산 (2999-12-31)
      const adminExpiryDate = new Date('2999-12-31');
      const now = new Date();
      const adminDaysRemaining = Math.ceil((adminExpiryDate - now) / (1000 * 60 * 60 * 24));

      // 1. 개발 모드 확인 (최우선)
      if (__DEV__) {
        return {
          status: 'Admin',
          statusColor: '#FF9800',
          isPremium: true,
          expiryDate: '2999-12-31',
          daysRemaining: adminDaysRemaining,
          source: 'dev_mode'
        };
      }

      // 2. Admin 모드 확인
      const isAdmin = await AdminManager.isAdmin();
      if (isAdmin) {
        return {
          status: 'Admin',
          statusColor: '#FF9800',
          isPremium: true,
          expiryDate: '2999-12-31',
          daysRemaining: adminDaysRemaining,
          source: 'admin'
        };
      }

      // 3. RevenueCat 구독 확인
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const premiumEntitlement = customerInfo.entitlements.active['Premium'];
        
        if (premiumEntitlement) {
          const expiryDate = new Date(premiumEntitlement.expirationDate);
          const now = new Date();
          const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          
          return {
            status: 'Premium',
            statusColor: '#4CAF50',
            isPremium: true,
            expiryDate: expiryDate.toLocaleDateString(),
            daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
            source: 'revenuecat'
          };
        }
      } catch (rcError) {
        console.log('[SubscriptionManager] RevenueCat check skipped:', rcError.message);
      }

      // 4. 친구 권한 (프로모 코드) 확인
      const userEmail = await this.getUserEmail();
      if (userEmail) {
        const friendsList = await AdminManager.getFriendsList();
        const friendData = friendsList[userEmail];
        
        if (friendData && friendData.granted) {
          const expiryDate = new Date(friendData.expiryDate);
          const now = new Date();
          
          if (now <= expiryDate) {
            const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            return {
              status: 'Premium',
              statusColor: '#4CAF50',
              isPremium: true,
              expiryDate: expiryDate.toLocaleDateString(),
              daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
              source: 'promo_code'
            };
          }
        }
      }

      // 5. Free 사용자
      return {
        status: 'Free',
        statusColor: '#9E9E9E',
        isPremium: false,
        expiryDate: null,
        daysRemaining: null,
        source: 'free'
      };
    } catch (error) {
      console.error('[SubscriptionManager] Error getting subscription details:', error);
      return {
        status: 'Free',
        statusColor: '#9E9E9E',
        isPremium: false,
        expiryDate: null,
        daysRemaining: null,
        source: 'error'
      };
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
