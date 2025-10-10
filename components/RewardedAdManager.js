import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

class RewardedAdManager {
  constructor() {
    this.rewardedAd = null;
    this.isLoaded = false;
    this.isLoading = false;
    
    // 리워드 광고 ID 설정
    this.adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-8924313553021933/1234567890'; // 실제 리워드 광고 ID 필요
    
    this.createRewardedAd();
  }

  createRewardedAd() {
    if (this.rewardedAd) {
      return;
    }

    this.rewardedAd = RewardedAd.createForAdRequest(this.adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[RewardedAd] 보상형 광고 로드 완료');
      this.isLoaded = true;
      this.isLoading = false;
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('[RewardedAd] 보상 획득:', reward);
      // 보상 처리 로직을 여기에 추가
      if (this.onRewardEarned) {
        this.onRewardEarned(reward);
      }
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
      console.error('[RewardedAd] 보상형 광고 오류:', error);
      this.isLoaded = false;
      this.isLoading = false;
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      console.log('[RewardedAd] 보상형 광고 닫힘');
      this.isLoaded = false;
      this.loadAd(); // 다음 광고 미리 로드
    });

    this.loadAd();
  }

  loadAd() {
    if (this.isLoading || this.isLoaded) {
      return;
    }

    this.isLoading = true;
    this.rewardedAd?.load();
  }

  showAd(onRewardEarned) {
    this.onRewardEarned = onRewardEarned;
    
    if (this.isLoaded && this.rewardedAd) {
      this.rewardedAd.show();
      return true;
    } else {
      console.log('[RewardedAd] 광고가 준비되지 않음');
      this.loadAd(); // 광고 로드 시도
      return false;
    }
  }

  isAdReady() {
    return this.isLoaded;
  }
}

// 싱글톤 인스턴스
export default new RewardedAdManager();
