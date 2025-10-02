import { TestIds } from 'react-native-google-mobile-ads';

// AdMob 광고 단위 ID 설정
export const AD_UNIT_IDS = {
  BANNER: __DEV__ 
    ? TestIds.BANNER 
    : 'ca-app-pub-8924313553021933/9070454972',
  
  INTERSTITIAL: __DEV__ 
    ? TestIds.INTERSTITIAL 
    : 'ca-app-pub-8924313553021933/4148752049',
};

// 광고 요청 옵션
export const AD_REQUEST_OPTIONS = {
  requestNonPersonalizedAdsOnly: true,
};

// 광고 표시 조건
export const shouldShowAds = () => {
  const Constants = require('expo-constants').default;
  return Constants.expoConfig?.extra?.enableAds || 
         process.env.ENABLE_ADS === 'true' || 
         __DEV__;
};
