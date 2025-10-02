import React, { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';
import AdFrequencyManager from '../utils/AdFrequencyManager';
import { AD_UNIT_IDS, shouldShowAds } from '../constants/AdConfig';

// 전면 광고 인스턴스 생성
const createInterstitialAd = () => {
  const enableAds = shouldShowAds();
  
  if (!enableAds) {
    return null;
  }

  const adUnitId = __DEV__ 
    ? TestIds.INTERSTITIAL 
    : AD_UNIT_IDS.INTERSTITIAL;

  return InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
};

export const useInterstitialAd = () => {
  const [interstitial, setInterstitial] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ad = createInterstitialAd();
    if (!ad) return;

    setInterstitial(ad);

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdInterstitial] 전면 광고 로드 완료');
      setIsLoaded(true);
      setIsLoading(false);
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[AdInterstitial] 전면 광고 로드 실패:', error);
      setIsLoading(false);
      
      // 네트워크 오류인 경우 재시도 로직 추가
      if (error.code === 'googleMobileAds/error-code-network-error') {
        console.log('[AdInterstitial] 네트워크 오류 감지 - 10초 후 재시도');
        setTimeout(() => {
          loadAd();
        }, 10000);
      }
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdInterstitial] 전면 광고 닫힘');
      setIsLoaded(false);
      // 광고가 닫힌 후 새로운 광고 로드
      loadAd();
    });

    const loadAd = () => {
      if (!isLoading && !isLoaded) {
        console.log('[AdInterstitial] 전면 광고 로드 시작');
        setIsLoading(true);
        ad.load();
      }
    };

    // 초기 광고 로드
    loadAd();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeClosed();
    };
  }, []);

  const showAd = async (adType = 'interstitial') => {
    try {
      // 빈도 제한 확인
      const canShow = await AdFrequencyManager.canShowAd(adType);
      if (!canShow) {
        console.log('[AdInterstitial] 빈도 제한으로 광고 표시 안함');
        return false;
      }

      if (interstitial && isLoaded) {
        console.log('[AdInterstitial] 전면 광고 표시');
        interstitial.show();
        
        // 광고 표시 기록
        await AdFrequencyManager.recordAdShown(adType);
        return true;
      } else {
        console.log('[AdInterstitial] 전면 광고가 준비되지 않음');
        return false;
      }
    } catch (error) {
      console.error('[AdInterstitial] 광고 표시 오류:', error);
      return false;
    }
  };

  return {
    showAd,
    isLoaded,
    isLoading
  };
};

export default useInterstitialAd;
