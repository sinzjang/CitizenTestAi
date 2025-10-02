# AdMob 설정 체크리스트 - 다음 프로젝트용

## 📋 환경 설정 테이블

| 항목 | 값 | 비고 |
|------|-----|------|
| **Expo SDK** | `~53.0.0` | 필수 버전 |
| **React Native** | `0.79.5` | Expo SDK 53에 포함 |
| **AdMob 라이브러리** | `react-native-google-mobile-ads@14.2.4` | Config Plugin 지원 |
| **Node.js** | `18.x` 이상 | 권장 |
| **EAS CLI** | 최신 버전 | `npm install -g @expo/eas-cli` |

## 🔧 단계별 설정 체크리스트

### 1단계: 프로젝트 초기 설정
| 순서 | 작업 | 명령어/설정 | 완료 |
|------|------|-------------|------|
| 1.1 | Expo 프로젝트 생성 | `npx create-expo-app MyApp` | ☐ |
| 1.2 | 프로젝트 디렉토리 이동 | `cd MyApp` | ☐ |
| 1.3 | EAS 초기화 | `eas init` | ☐ |
| 1.4 | Git 초기화 | `git init && git add . && git commit -m "Initial commit"` | ☐ |

### 2단계: AdMob 라이브러리 설치
| 순서 | 작업 | 명령어/설정 | 완료 |
|------|------|-------------|------|
| 2.1 | AdMob 라이브러리 설치 | `npm install react-native-google-mobile-ads@14.2.4` | ☐ |
| 2.2 | 의존성 확인 | `npm list react-native-google-mobile-ads` | ☐ |

### 3단계: AdMob 계정 설정
| 순서 | 작업 | 설정값 | 완료 |
|------|------|--------|------|
| 3.1 | AdMob 계정 생성/로그인 | https://apps.admob.com | ☐ |
| 3.2 | 앱 추가 (Android) | 패키지명: `com.yourcompany.yourapp` | ☐ |
| 3.3 | 앱 추가 (iOS) | Bundle ID: `com.yourcompany.yourapp` | ☐ |
| 3.4 | 앱 ID 기록 | Android: `ca-app-pub-XXXXXXXX~YYYYYY` | ☐ |
| 3.5 | 앱 ID 기록 | iOS: `ca-app-pub-XXXXXXXX~ZZZZZZ` | ☐ |
| 3.6 | 배너 광고 단위 생성 | Android: `ca-app-pub-XXXXXXXX/BANNER_ID` | ☐ |
| 3.7 | 배너 광고 단위 생성 | iOS: `ca-app-pub-XXXXXXXX/BANNER_ID` | ☐ |
| 3.8 | 전면 광고 단위 생성 | Android: `ca-app-pub-XXXXXXXX/INTER_ID` | ☐ |
| 3.9 | 전면 광고 단위 생성 | iOS: `ca-app-pub-XXXXXXXX/INTER_ID` | ☐ |

### 4단계: app.json 설정
| 순서 | 작업 | 설정 내용 | 완료 |
|------|------|-----------|------|
| 4.1 | 플러그인 추가 | 아래 코드 블록 참조 | ☐ |
| 4.2 | extra 설정 추가 | `"enableAds": true` | ☐ |
| 4.3 | 패키지명 설정 | Android: `"package": "com.yourcompany.yourapp"` | ☐ |
| 4.4 | Bundle ID 설정 | iOS: `"bundleIdentifier": "com.yourcompany.yourapp"` | ☐ |

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXX~ANDROID_APP_ID",
          "iosAppId": "ca-app-pub-XXXXXXXX~IOS_APP_ID"
        }
      ]
    ],
    "extra": {
      "enableAds": true
    }
  }
}
```

### 5단계: EAS 빌드 설정
| 순서 | 작업 | 설정 내용 | 완료 |
|------|------|-----------|------|
| 5.1 | eas.json 수정 | 아래 코드 블록 참조 | ☐ |
| 5.2 | 빌드 프로파일 확인 | `ad-test` 프로파일 존재 확인 | ☐ |

```json
{
  "build": {
    "ad-test": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "channel": "ad-test",
      "env": {
        "ENABLE_ADS": "true"
      }
    }
  }
}
```

### 6단계: 광고 컴포넌트 생성
| 순서 | 파일 | 작업 | 완료 |
|------|------|------|------|
| 6.1 | `constants/AdConfig.js` | 광고 설정 중앙 관리 파일 생성 | ☐ |
| 6.2 | `components/AdBanner.js` | 배너 광고 컴포넌트 생성 | ☐ |
| 6.3 | `components/AdInterstitial.js` | 전면 광고 훅 생성 | ☐ |

### 7단계: App.js 설정
| 순서 | 작업 | 설정 내용 | 완료 |
|------|------|-----------|------|
| 7.1 | AdMob import 추가 | `import mobileAds from 'react-native-google-mobile-ads';` | ☐ |
| 7.2 | AdMob 초기화 코드 추가 | useEffect에서 mobileAds().initialize() | ☐ |
| 7.3 | AdBanner import 추가 | `import AdBanner from './components/AdBanner';` | ☐ |
| 7.4 | AdBanner 컴포넌트 추가 | NavigationContainer 하단에 배치 | ☐ |

### 8단계: 빌드 및 테스트
| 순서 | 작업 | 명령어 | 완료 |
|------|------|--------|------|
| 8.1 | Prebuild 실행 | `npx expo prebuild --clean` | ☐ |
| 8.2 | 로컬 개발 서버 실행 | `npx expo start` | ☐ |
| 8.3 | 테스트 빌드 생성 | `eas build --platform android --profile ad-test` | ☐ |
| 8.4 | 빌드 완료 확인 | EAS 대시보드에서 성공 확인 | ☐ |
| 8.5 | APK 다운로드 및 설치 | 실제 기기에서 테스트 | ☐ |

## 📝 코드 템플릿

### AdConfig.js
```javascript
import { TestIds } from 'react-native-google-mobile-ads';

export const AD_UNIT_IDS = {
  BANNER: __DEV__ 
    ? TestIds.BANNER 
    : 'ca-app-pub-XXXXXXXX/BANNER_UNIT_ID',
  
  INTERSTITIAL: __DEV__ 
    ? TestIds.INTERSTITIAL 
    : 'ca-app-pub-XXXXXXXX/INTERSTITIAL_UNIT_ID',
};

export const AD_REQUEST_OPTIONS = {
  requestNonPersonalizedAdsOnly: true,
};

export const shouldShowAds = () => {
  const Constants = require('expo-constants').default;
  return Constants.expoConfig?.extra?.enableAds || 
         process.env.ENABLE_ADS === 'true' || 
         __DEV__;
};
```

### AdBanner.js (기본 구조)
```javascript
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, AD_REQUEST_OPTIONS, shouldShowAds } from '../constants/AdConfig';

const AdBanner = ({ size = 'banner' }) => {
  const [adError, setAdError] = useState(false);
  const enableAds = shouldShowAds();
  const adUnitId = AD_UNIT_IDS.BANNER;

  if (!enableAds) {
    return <View style={styles.container} />;
  }

  if (adError) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>광고를 불러올 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={AD_REQUEST_OPTIONS}
        onAdLoaded={() => console.log('[AdBanner] 광고 로드 완료')}
        onAdFailedToLoad={(error) => {
          console.error('[AdBanner] 광고 로드 실패:', error);
          setAdError(true);
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
    paddingVertical: 8,
  },
  fallback: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#666',
    fontSize: 14,
  },
});

export default AdBanner;
```

### App.js 수정 사항
```javascript
// imports에 추가
import mobileAds from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';
import AdBanner from './components/AdBanner';

// useEffect에 추가
useEffect(() => {
  const enableAds = Constants.expoConfig?.extra?.enableAds || 
                    process.env.ENABLE_ADS === 'true' || 
                    __DEV__;
  
  if (enableAds) {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('[App] AdMob 초기화 완료:', adapterStatuses);
      })
      .catch(error => {
        console.error('[App] AdMob 초기화 실패:', error);
      });
  }
}, []);

// return 부분 수정
return (
  <SafeAreaProvider>
    <View style={{ flex: 1 }}>
      {/* 메인 콘텐츠 */}
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          {/* 네비게이션 스택 */}
        </NavigationContainer>
      </View>
      
      {/* 하단 고정 광고 */}
      <AdBanner />
    </View>
  </SafeAreaProvider>
);
```

## ✅ 검증 체크리스트

### 개발 환경 테스트
| 항목 | 확인 사항 | 완료 |
|------|-----------|------|
| 테스트 광고 표시 | 개발 서버에서 테스트 광고가 표시되는가? | ☐ |
| 광고 로드 로그 | 콘솔에 광고 로드 성공 로그가 출력되는가? | ☐ |
| 에러 처리 | 네트워크 차단 시 적절한 에러 처리가 되는가? | ☐ |
| 레이아웃 확인 | 다양한 화면 크기에서 광고가 정상 표시되는가? | ☐ |

### 프로덕션 환경 테스트
| 항목 | 확인 사항 | 완료 |
|------|-----------|------|
| 실제 광고 표시 | 빌드된 APK에서 실제 광고가 표시되는가? | ☐ |
| 광고 단위 ID | 올바른 광고 단위 ID가 사용되고 있는가? | ☐ |
| AdMob 계정 연동 | AdMob 대시보드에서 광고 요청이 확인되는가? | ☐ |
| 성능 확인 | 앱 성능에 영향을 주지 않는가? | ☐ |

## 🚨 주의사항

| 항목 | 내용 |
|------|------|
| **버전 호환성** | 반드시 Expo SDK 53 + AdMob 14.2.4 조합 사용 |
| **광고 정책** | AdMob 정책 준수 (클릭 유도 금지, 적절한 배치) |
| **테스트 기기** | 개발 중에는 테스트 기기 등록 권장 |
| **광고 승인** | 실제 광고는 AdMob 승인 후 표시됨 (최대 24시간) |
| **패키지명 일치** | app.json의 패키지명과 AdMob 앱 설정 일치 필수 |

---
**작성일**: 2025-01-01  
**테스트 완료 환경**: Expo SDK 53, AdMob 14.2.4
