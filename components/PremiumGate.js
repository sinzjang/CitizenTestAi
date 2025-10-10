import React from 'react';
import { Alert } from 'react-native';
import { SubscriptionManager } from '../utils/subscriptionManager';

const PREMIUM_MESSAGES = {
  title: '🌟 Premium Feature',
  message: 'This feature is available for Premium subscribers only. Upgrade now to unlock all features!',
  cancelButton: 'Maybe Later',
  upgradeButton: 'Upgrade Now'
};

export const PremiumGate = {
  // 프리미엄 기능 접근 체크
  async checkAccess(feature, onSuccess, navigation = null, onDenied = null) {
    const isPremium = await SubscriptionManager.checkSubscriptionStatus();
    
    if (isPremium) {
      // 프리미엄 사용자면 바로 실행
      onSuccess();
    } else {
      // 무료 사용자면 프리미엄 안내 표시
      this.showPremiumAlert(navigation, onDenied);
    }
  },

  // 프리미엄 안내 알림 표시
  showPremiumAlert(navigation, onDenied = null) {
    Alert.alert(
      PREMIUM_MESSAGES.title,
      PREMIUM_MESSAGES.message,
      [
        {
          text: PREMIUM_MESSAGES.cancelButton,
          style: 'cancel',
          onPress: onDenied
        },
        {
          text: PREMIUM_MESSAGES.upgradeButton,
          onPress: () => {
            if (navigation) {
              navigation.navigate('Subscription');
            } else {
              console.log('Navigation not available');
            }
          }
        }
      ]
    );
  },

  // 개발용: 구독 상태 확인
  async checkSubscriptionForTesting() {
    const isPremium = await SubscriptionManager.checkSubscriptionStatus();
    
    Alert.alert(
      'Subscription Status',
      `Premium status: ${isPremium ? 'ACTIVE' : 'INACTIVE'}`,
      [{ text: 'OK' }]
    );
    
    return isPremium;
  }
};
