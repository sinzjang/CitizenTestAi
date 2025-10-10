import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

class InterstitialAdManager {
  constructor() {
    this.interstitial = null;
    this.isLoaded = false;
    this.isLoading = false;
    
    // 전면 광고 ID 설정 (AdConfig에서 가져옴)
    this.adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-8924313553021933/4148752049';
    
    this.createInterstitialAd();
  }

  createInterstitialAd() {
    if (this.interstitial) {
      return;
    }

    this.interstitial = InterstitialAd.createForAdRequest(this.adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[InterstitialAd] 전면 광고 로드 완료');
      this.isLoaded = true;
      this.isLoading = false;
    });

    this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[InterstitialAd] 전면 광고 로드 실패:', error);
      this.isLoaded = false;
      this.isLoading = false;
    });

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[InterstitialAd] 전면 광고 닫힘');
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
    this.interstitial?.load();
  }

  showAd() {
    if (this.isLoaded && this.interstitial) {
      this.interstitial.show();
      return true;
    } else {
      console.log('[InterstitialAd] 광고가 준비되지 않음');
      this.loadAd(); // 광고 로드 시도
      return false;
    }
  }

  isAdReady() {
    return this.isLoaded;
  }
}

// 싱글톤 인스턴스
export default new InterstitialAdManager();
