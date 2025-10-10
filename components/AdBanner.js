import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AD_UNIT_IDS, AD_REQUEST_OPTIONS, shouldShowAds } from '../constants/AdConfig';
import { SubscriptionManager } from '../utils/subscriptionManager';

const AdBanner = ({ size = 'banner', unitId }) => {
  const [adError, setAdError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const insets = useSafeAreaInsets();
  
  // 프리미엄 상태 확인
  useEffect(() => {
    const checkPremiumStatus = async () => {
      const premiumStatus = await SubscriptionManager.checkSubscriptionStatus();
      setIsPremium(premiumStatus);
    };
    checkPremiumStatus();
  }, []);
  
  // 광고 표시 여부 확인
  const enableAds = shouldShowAds();
  
  // 광고 단위 ID 설정
  const adUnitId = unitId || AD_UNIT_IDS.BANNER;
  
  // 디버깅 로그
  console.log('[AdBanner] enableAds:', enableAds);
  console.log('[AdBanner] adUnitId:', adUnitId);
  console.log('[AdBanner] __DEV__:', __DEV__);
  console.log('[AdBanner] ENABLE_ADS:', process.env.ENABLE_ADS);
  console.log('[AdBanner] insets.bottom:', insets.bottom);
  
  // 프리미엄 사용자이거나 광고가 비활성화된 경우 빈 컨테이너 반환
  if (isPremium || !enableAds) {
    console.log('[AdBanner] 광고 표시 안함 - isPremium:', isPremium, 'enableAds:', enableAds);
    return <View style={styles.container} />;
  }
  
  // 광고 크기 매핑
  const getAdSize = () => {
    switch (size) {
      case 'large':
        return BannerAdSize.LARGE_BANNER;
      case 'medium':
        return BannerAdSize.MEDIUM_RECTANGLE;
      case 'full':
        return BannerAdSize.FULL_BANNER;
      default:
        return BannerAdSize.BANNER;
    }
  };

  // 동적 스타일 생성 (안전 영역 고려)
  const dynamicContainerStyle = {
    ...styles.container,
    paddingBottom: Platform.select({
      ios: Math.max(insets.bottom, 8), // iOS는 최소 8, 또는 safe area bottom
      android: Math.max(insets.bottom + 8, 16), // 안드로이드는 safe area bottom + 8, 최소 16
    }),
  };

  const dynamicFallbackStyle = {
    ...styles.fallback,
    marginBottom: Platform.select({
      ios: Math.max(insets.bottom, 8),
      android: Math.max(insets.bottom + 8, 16),
    }),
  };

  if (adError) {
    return (
      <View style={dynamicFallbackStyle}>
        <Text style={styles.fallbackText}>{errorMessage || '광고를 불러올 수 없습니다'}</Text>
      </View>
    );
  }

  return (
    <View style={dynamicContainerStyle}>
      <BannerAd
        unitId={adUnitId}
        size={getAdSize()}
        requestOptions={AD_REQUEST_OPTIONS}
        onAdLoaded={() => {
          console.log('[AdBanner] 광고 로드 완료');
        }}
        onAdFailedToLoad={(error) => {
          console.error('[AdBanner] 광고 로드 실패:', error);
          
          // 네트워크 오류인 경우 재시도 로직 추가
          if (error.code === 'googleMobileAds/error-code-network-error') {
            console.log('[AdBanner] 네트워크 오류 감지 - 5초 후 재시도');
            setErrorMessage('네트워크 연결을 확인하세요');
            setTimeout(() => {
              setAdError(false); // 재시도를 위해 에러 상태 리셋
              setErrorMessage('');
            }, 5000);
          } else {
            setErrorMessage('광고를 불러올 수 없습니다');
            setAdError(true);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingTop: 4,
    // paddingBottom은 동적으로 설정됨
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  placeholderSubtext: {
    color: '#999',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  fallback: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AdBanner;
