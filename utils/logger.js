// 로그 레벨 관리 유틸리티
// 개발 중 성능 저하를 방지하기 위해 로그 레벨을 조정할 수 있습니다

const LOG_LEVELS = {
  NONE: 0,    // 로그 없음
  ERROR: 1,   // 에러만
  WARN: 2,    // 에러 + 경고
  INFO: 3,    // 에러 + 경고 + 정보
  DEBUG: 4,   // 모든 로그 (개발용)
};

// 현재 로그 레벨 설정
// 개발 중: DEBUG (모든 로그)
// 프로덕션: ERROR (에러만)
const CURRENT_LOG_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

// 특정 카테고리별 로그 활성화/비활성화
const LOG_CATEGORIES = {
  TTS: true,          // 음성 출력 로그
  STT: true,          // 음성 인식 로그
  API: true,          // API 호출 로그
  NAVIGATION: false,  // 네비게이션 로그
  TRANSLATION: false, // 번역 로그 (가장 많음)
  RENDER: false,      // 렌더링 로그
  LIFECYCLE: true,    // 컴포넌트 생명주기 로그
};

class Logger {
  static error(category, ...args) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR && LOG_CATEGORIES[category] !== false) {
      console.error(`[${category}]`, ...args);
    }
  }

  static warn(category, ...args) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN && LOG_CATEGORIES[category] !== false) {
      console.warn(`[${category}]`, ...args);
    }
  }

  static info(category, ...args) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO && LOG_CATEGORIES[category] !== false) {
      console.log(`[${category}]`, ...args);
    }
  }

  static debug(category, ...args) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG && LOG_CATEGORIES[category] !== false) {
      console.log(`[${category}]`, ...args);
    }
  }

  // 특정 카테고리 활성화/비활성화
  static setCategory(category, enabled) {
    LOG_CATEGORIES[category] = enabled;
  }

  // 모든 로그 비활성화
  static disableAll() {
    Object.keys(LOG_CATEGORIES).forEach(key => {
      LOG_CATEGORIES[key] = false;
    });
  }

  // 모든 로그 활성화
  static enableAll() {
    Object.keys(LOG_CATEGORIES).forEach(key => {
      LOG_CATEGORIES[key] = true;
    });
  }
}

export default Logger;
export { LOG_LEVELS, LOG_CATEGORIES };
