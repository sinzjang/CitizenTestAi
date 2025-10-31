# 로그 관리 가이드

## 문제

개발 모드에서 수많은 로그가 출력되어 성능 저하를 일으킬 수 있습니다.

## 해결 방법

### 1. 로그 유틸리티 사용

`utils/logger.js`를 사용하여 로그를 관리할 수 있습니다.

```javascript
import Logger from '../utils/logger';

// 기존
console.log('🔊 TTS started');

// 개선
Logger.info('TTS', '🔊 TTS started');
```

### 2. 로그 레벨

- **NONE**: 로그 없음
- **ERROR**: 에러만
- **WARN**: 에러 + 경고
- **INFO**: 에러 + 경고 + 정보
- **DEBUG**: 모든 로그 (개발용)

### 3. 카테고리별 로그 제어

```javascript
// utils/logger.js에서 설정
const LOG_CATEGORIES = {
  TTS: true,          // 음성 출력 로그
  STT: true,          // 음성 인식 로그
  API: true,          // API 호출 로그
  NAVIGATION: false,  // 네비게이션 로그
  TRANSLATION: false, // 번역 로그 (가장 많음) ⚠️
  RENDER: false,      // 렌더링 로그
  LIFECYCLE: true,    // 컴포넌트 생명주기 로그
};
```

### 4. 성능 개선 팁

#### 가장 많은 로그를 생성하는 것들:

1. **번역 로그** (`t() 함수 호출`) - 매 렌더링마다 수십 개
2. **렌더링 로그** - 컴포넌트 업데이트마다
3. **네비게이션 로그** - 화면 전환마다

#### 권장 설정:

**개발 중 (성능 중요):**
```javascript
const LOG_CATEGORIES = {
  TTS: true,
  STT: true,
  API: true,
  NAVIGATION: false,  // ❌ 비활성화
  TRANSLATION: false, // ❌ 비활성화 (가장 중요!)
  RENDER: false,      // ❌ 비활성화
  LIFECYCLE: false,
};
```

**디버깅 중 (모든 정보 필요):**
```javascript
const LOG_CATEGORIES = {
  TTS: true,
  STT: true,
  API: true,
  NAVIGATION: true,
  TRANSLATION: true,  // ✅ 활성화
  RENDER: true,
  LIFECYCLE: true,
};
```

### 5. 프로덕션 빌드

프로덕션 빌드에서는 자동으로 로그 레벨이 `ERROR`로 설정됩니다:

```javascript
const CURRENT_LOG_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;
```

### 6. 번역 로그 제거 (가장 효과적)

`utils/i18n.js`에서 번역 로그를 제거하거나 조건부로 만들 수 있습니다:

```javascript
// 기존
export const t = (key, params = {}) => {
  console.log(`t() 함수 호출 - 키: ${key} 현재 언어: ${currentLanguage}`);
  // ...
  console.log(`t() 번역 결과: ${result}`);
};

// 개선 (Logger 사용)
import Logger from './logger';

export const t = (key, params = {}) => {
  Logger.debug('TRANSLATION', `t() 함수 호출 - 키: ${key} 현재 언어: ${currentLanguage}`);
  // ...
  Logger.debug('TRANSLATION', `t() 번역 결과: ${result}`);
};
```

## 즉시 적용 가능한 방법

### 방법 1: 번역 로그만 제거 (가장 빠름)

`utils/i18n.js`를 열고 `console.log`를 주석 처리:

```javascript
export const t = (key, params = {}) => {
  // console.log(`t() 함수 호출 - 키: ${key} 현재 언어: ${currentLanguage}`);
  // ...
  // console.log(`t() 번역 결과: ${result}`);
};
```

### 방법 2: 조건부 로그

```javascript
const ENABLE_TRANSLATION_LOGS = false; // 개발 중 false로 설정

export const t = (key, params = {}) => {
  if (ENABLE_TRANSLATION_LOGS) {
    console.log(`t() 함수 호출 - 키: ${key} 현재 언어: ${currentLanguage}`);
  }
  // ...
  if (ENABLE_TRANSLATION_LOGS) {
    console.log(`t() 번역 결과: ${result}`);
  }
};
```

## 성능 비교

| 로그 설정 | 렌더링 속도 | 메모리 사용 |
|----------|-----------|-----------|
| 모든 로그 활성화 | 느림 ❌ | 높음 ❌ |
| 번역 로그만 비활성화 | 보통 ✅ | 보통 ✅ |
| 중요 로그만 활성화 | 빠름 ✅✅ | 낮음 ✅✅ |

## 결론

- **개발 중**: 번역 로그를 비활성화하면 성능이 크게 개선됩니다
- **프로덕션**: 자동으로 에러 로그만 출력되므로 걱정 없습니다
- **디버깅**: 필요할 때만 특정 카테고리 로그를 활성화하세요
