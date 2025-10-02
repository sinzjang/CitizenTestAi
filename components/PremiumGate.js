import React from 'react';
import { Alert } from 'react-native';
import { PremiumManager, PREMIUM_MESSAGES } from '../utils/premiumManager';

export const PremiumGate = {
  // 프리미엄 기능 접근 체크
  async checkAccess(feature, onSuccess, onDenied = null) {
    const isPremium = await PremiumManager.isPremium();
    
    if (isPremium) {
      // 프리미엄 사용자면 바로 실행
      onSuccess();
    } else {
      // 무료 사용자면 프리미엄 안내 표시
      this.showPremiumAlert(onDenied);
    }
  },

  // 프리미엄 안내 알림 표시
  showPremiumAlert(onDenied = null) {
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
            // TODO: 프리미엄 구독 화면으로 이동
            console.log('Navigate to premium subscription');
          }
        }
      ]
    );
  },

  // 개발용: 프리미엄 상태 토글
  async togglePremiumForTesting() {
    const currentStatus = await PremiumManager.isPremium();
    await PremiumManager.setPremium(!currentStatus);
    const newStatus = await PremiumManager.isPremium();
    
    Alert.alert(
      'Premium Status Changed',
      `Premium status is now: ${newStatus ? 'ACTIVE' : 'INACTIVE'}`,
      [{ text: 'OK' }]
    );
    
    return newStatus;
  }
};
