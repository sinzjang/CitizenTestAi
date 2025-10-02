# AdMob 통합 가이드 - 시행착오와 해결책

## 📋 개요
Expo React Native 앱에 AdMob을 통합하는 과정에서 겪은 시행착오와 해결책을 정리한 가이드입니다.

## 🚨 주요 문제점들과 해결책

### 1. 버전 호환성 문제
**❌ 문제점:**
- `react-native-google-mobile-ads` 최신 버전(15.x)이 Expo SDK 53과 호환되지 않음
- React Native 0.81의 `currentActivity`, `runOnUiThread` API 변경으로 빌드 실패
- Kotlin 컴파일 오류 발생

**✅ 해결책:**
- **Expo SDK 53** + **react-native-google-mobile-ads 14.2.4** 조합 사용
- React Native 0.79.5 환경에서 안정적 작동 확인

**📝 교훈:**
- 버전 호환성 매트릭스를 먼저 확인해야 함
- 최신 버전이 항상 최선은 아님

### 2. Config Plugin 지원 여부
**❌ 문제점:**
- 12.9.0, 13.6.1 버전에서 config plugin 미지원
- `prebuild` 실행 시 "valid config plugin" 오류 발생
- 수동 설정 필요로 복잡성 증가

**✅ 해결책:**
- **14.2.4 버전**에서 config plugin 완벽 지원 확인
- `app.json`에서 자동 설정 가능

**📝 교훈:**
- 버전별 config plugin 지원 여부 사전 확인 필요
- 공식 문서의 버전별 기능 지원 표 참조

### 3. Gradle 설정 오류
**❌ 문제점:**
- `googleMobileAdsJson` 속성 오류
- `compileSdkVersion is not specified` 오류
- Google Services 플러그인 누락

**✅ 해결책:**
- Google Services 플러그인 추가:
  ```gradle
  // android/build.gradle
  classpath('com.google.gms:google-services:4.3.15')
  
  // android/app/build.gradle
  apply plugin: "com.google.gms.google-services"
  ```
- `google-services.json` 파일 생성
- `ext` 설정으로 `googleMobileAdsJson` 속성 정의

### 4. 실제 광고 단위 ID 설정
**❌ 문제점:**
- 테스트 ID만 설정되어 실제 광고 표시 안됨
- `YOUR_REAL_AD_UNIT_ID` 플레이스홀더 방치

**✅ 해결책:**
- AdMob 콘솔에서 생성한 실제 광고 단위 ID 적용:
  - **Banner**: `ca-app-pub-8924313553021933/9070454972`
  - **Interstitial**: `ca-app-pub-8924313553021933/4148752049`

### 5. 환경변수 설정 복잡성
**❌ 문제점:**
- 광고 표시 조건 설정이 복잡하고 일관성 없음
- 개발/프로덕션 환경 구분 어려움

**✅ 해결책:**
- `app.json`의 `extra.enableAds` 설정
- EAS 빌드 프로파일의 `ENABLE_ADS` 환경변수 조합 사용
- 중앙화된 광고 설정 관리 (`AdConfig.js`)

## 🎯 최종 작업 구조

### 버전 조합
```json
{
  "expo": "~53.0.0",
  "react-native-google-mobile-ads": "14.2.4"
}
```

### 파일 구조
```
├── components/
│   ├── AdBanner.js          # 배너 광고 컴포넌트
│   └── AdInterstitial.js    # 전면 광고 훅
├── constants/
│   └── AdConfig.js          # 광고 설정 중앙 관리
├── app.json                 # Expo 설정 + AdMob 플러그인
└── eas.json                 # 빌드 프로파일 + 환경변수
```

### 핵심 설정 파일들

#### 1. app.json
```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-8924313553021933~5986763110",
        "iosAppId": "ca-app-pub-8924313553021933~5986763110"
      }
    ]
  ],
  "extra": {
    "enableAds": true
  }
}
```

#### 2. eas.json
```json
{
  "build": {
    "ad-test": {
      "env": {
        "ENABLE_ADS": "true"
      }
    }
  }
}
```

#### 3. AdConfig.js
```javascript
export const AD_UNIT_IDS = {
  BANNER: __DEV__ 
    ? TestIds.BANNER 
    : 'ca-app-pub-8924313553021933/9070454972',
  
  INTERSTITIAL: __DEV__ 
    ? TestIds.INTERSTITIAL 
    : 'ca-app-pub-8924313553021933/4148752049',
};
```

## 🔄 다음번 설정 시 권장사항

### 1. 사전 준비
- [ ] Expo SDK와 AdMob 라이브러리 호환성 매트릭스 확인
- [ ] AdMob 계정에서 앱 등록 및 광고 단위 생성
- [ ] 테스트 기기 등록

### 2. 설치 순서
1. **호환 버전 설치**
   ```bash
   npm install react-native-google-mobile-ads@14.2.4
   ```

2. **app.json 설정**
   ```json
   {
     "plugins": [
       [
         "react-native-google-mobile-ads",
         {
           "androidAppId": "YOUR_ANDROID_APP_ID",
           "iosAppId": "YOUR_IOS_APP_ID"
         }
       ]
     ]
   }
   ```

3. **prebuild 실행**
   ```bash
   npx expo prebuild --clean
   ```

4. **빌드 테스트**
   ```bash
   eas build --platform android --profile development
   ```

### 3. 검증 체크리스트
- [ ] 테스트 광고가 개발 환경에서 표시되는가?
- [ ] 실제 광고 ID가 프로덕션 환경에서 작동하는가?
- [ ] 광고 로드 실패 시 적절한 에러 처리가 되는가?
- [ ] 다양한 화면 크기에서 광고 레이아웃이 정상인가?

### 4. 성능 최적화
- [ ] 광고 프리로딩 구현
- [ ] 광고 새로고침 주기 설정
- [ ] 메모리 누수 방지를 위한 적절한 cleanup

## 🐛 트러블슈팅 팁

### 빌드 실패 시
1. `node_modules` 삭제 후 재설치
2. `android/` 폴더 삭제 후 `prebuild` 재실행
3. Gradle 캐시 정리: `cd android && ./gradlew clean`

### 광고가 표시되지 않을 때
1. 네트워크 연결 확인
2. AdMob 계정 상태 확인 (승인 대기 중인지)
3. 광고 단위 ID 정확성 확인
4. 테스트 기기 등록 여부 확인

### 로그 확인 방법
```javascript
console.log('[AdBanner] enableAds:', enableAds);
console.log('[AdBanner] adUnitId:', adUnitId);
console.log('[AdBanner] __DEV__:', __DEV__);
```

## 📚 참고 자료
- [React Native Google Mobile Ads 공식 문서](https://docs.page/invertase/react-native-google-mobile-ads)
- [Expo Config Plugins 가이드](https://docs.expo.dev/guides/config-plugins/)
- [AdMob 정책 가이드](https://support.google.com/admob/answer/6128543)

---
**작성일**: 2025-01-01  
**최종 테스트 환경**: Expo SDK 53, react-native-google-mobile-ads 14.2.4
