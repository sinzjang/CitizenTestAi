// 프로모 코드 관리 시스템
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminManager } from './adminManager';

export class PromoCodeManager {
  // Admin 패스워드 (AdminManager와 동일)
  static ADMIN_PASSWORD = 'CITIZENAI2025!';
  
  // 유효한 프로모 코드 목록
  static VALID_CODES = {
    'PREMIUM100': { type: 'premium', duration: 100, description: 'Premium 100 days' },
    'WELCOME30': { type: 'premium', duration: 30, description: 'Welcome bonus' },
    'FRIEND50': { type: 'premium', duration: 50, description: 'Friend referral' },
  };

  // 프로모 코드 검증 및 적용
  static async redeemPromoCode(code, userEmail) {
    try {
      // 1. Admin 패스워드 확인 (최우선)
      if (code === this.ADMIN_PASSWORD) {
        const isAlreadyAdmin = await AdminManager.isAdmin();
        if (isAlreadyAdmin) {
          return { success: false, message: 'Admin mode already activated' };
        }
        
        await AsyncStorage.setItem('admin_mode', 'true');
        return {
          success: true,
          message: 'Admin access activated!',
          type: 'admin'
        };
      }

      // 2. 프로모 코드 유효성 확인
      const promoData = this.VALID_CODES[code.toUpperCase()];
      if (!promoData) {
        return { success: false, message: 'Invalid promo code' };
      }

      // 3. 이미 사용했는지 확인
      const usedCodes = await this.getUsedCodes(userEmail);
      if (usedCodes.includes(code.toUpperCase())) {
        return { success: false, message: 'Code already used' };
      }

      // 4. Premium 코드인 경우 프리미엄 권한 부여
      await AdminManager.grantPremiumAccess(userEmail, promoData.duration);
      await this.markCodeAsUsed(userEmail, code.toUpperCase());

      return { 
        success: true, 
        message: `Premium activated for ${promoData.duration} days!`,
        duration: promoData.duration,
        type: 'premium'
      };
    } catch (error) {
      console.error('Error redeeming code:', error);
      return { success: false, message: 'Error redeeming code' };
    }
  }

  // 사용한 코드 목록 가져오기
  static async getUsedCodes(userEmail) {
    try {
      const data = await AsyncStorage.getItem(`used_codes_${userEmail}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  // 코드 사용 기록
  static async markCodeAsUsed(userEmail, code) {
    try {
      const usedCodes = await this.getUsedCodes(userEmail);
      usedCodes.push(code);
      await AsyncStorage.setItem(`used_codes_${userEmail}`, JSON.stringify(usedCodes));
    } catch (error) {
      console.error('Error marking code as used:', error);
    }
  }

  // 사용자의 모든 사용한 코드 가져오기
  static async getUserRedeemedCodes(userEmail) {
    try {
      const usedCodes = await this.getUsedCodes(userEmail);
      return usedCodes.map(code => ({
        code,
        details: this.VALID_CODES[code] || { description: 'Unknown' }
      }));
    } catch (error) {
      return [];
    }
  }
}
