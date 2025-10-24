// 관리자 기능 - 친구들에게 프리미엄 권한 부여
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AdminManager {
  // 관리자 인증 (개발자만 사용)
  static async isAdmin() {
    try {
      const adminStatus = await AsyncStorage.getItem('admin_mode');
      return adminStatus === 'true';
    } catch (error) {
      return false;
    }
  }

  // 관리자 모드 활성화 (개발자 전용)
  static async enableAdminMode(password) {
    const ADMIN_PASSWORD = 'CITIZENAI2025!'; // 보안을 위해 복잡한 비밀번호 설정
    
    if (password === ADMIN_PASSWORD) {
      await AsyncStorage.setItem('admin_mode', 'true');
      return true;
    }
    return false;
  }

  // 특정 사용자에게 프리미엄 권한 부여
  static async grantPremiumAccess(userEmail, durationDays = 365) {
    try {
      const friendsList = await this.getFriendsList();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      
      friendsList[userEmail] = {
        granted: true,
        grantedDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        durationDays: durationDays
      };
      
      await AsyncStorage.setItem('premium_friends', JSON.stringify(friendsList));
      return true;
    } catch (error) {
      console.error('Error granting premium access:', error);
      return false;
    }
  }

  // 친구 목록 가져오기
  static async getFriendsList() {
    try {
      const friendsData = await AsyncStorage.getItem('premium_friends');
      return friendsData ? JSON.parse(friendsData) : {};
    } catch (error) {
      return {};
    }
  }

  // 특정 사용자의 프리미엄 상태 확인
  static async checkFriendPremiumStatus(userEmail) {
    try {
      const friendsList = await this.getFriendsList();
      const friendData = friendsList[userEmail];
      
      if (!friendData || !friendData.granted) {
        return false;
      }
      
      // 만료일 확인
      const now = new Date();
      const expiryDate = new Date(friendData.expiryDate);
      
      if (now > expiryDate) {
        // 만료된 경우 제거
        delete friendsList[userEmail];
        await AsyncStorage.setItem('premium_friends', JSON.stringify(friendsList));
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // 프리미엄 권한 취소
  static async revokePremiumAccess(userEmail) {
    try {
      const friendsList = await this.getFriendsList();
      delete friendsList[userEmail];
      await AsyncStorage.setItem('premium_friends', JSON.stringify(friendsList));
      return true;
    } catch (error) {
      return false;
    }
  }

  // 모든 친구들 목록 및 상태 보기
  static async getAllFriendsStatus() {
    const friendsList = await this.getFriendsList();
    const now = new Date();
    
    return Object.entries(friendsList).map(([email, data]) => ({
      email,
      isActive: new Date(data.expiryDate) > now,
      grantedDate: data.grantedDate,
      expiryDate: data.expiryDate,
      daysRemaining: Math.ceil((new Date(data.expiryDate) - now) / (1000 * 60 * 60 * 24))
    }));
  }
}
