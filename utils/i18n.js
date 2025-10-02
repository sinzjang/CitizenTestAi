import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

// 언어 파일 import
import ko from '../locales/ko.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import zh from '../locales/zh.json';
import tl from '../locales/tl.json';
import vi from '../locales/vi.json';
import hi from '../locales/hi.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';

const LANGUAGE_KEY = '@user_language';

class I18nManager {
  constructor() {
    this.currentLanguage = 'en'; // 기본값 (영어)
    this.translations = {
      ko,
      en,
      es,
      zh,
      tl,
      vi,
      hi,
      fr,
      ar
    };
    this.supportedLanguages = ['en', 'es', 'zh', 'ko', 'tl', 'vi', 'hi', 'fr', 'ar']; // 미국 시민권 인터뷰 빈도순
    this.listeners = [];
  }

  // 앱 시작 시 언어 초기화
  async initialize() {
    try {
      // 1. 저장된 언어 설정 확인
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      
      if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
        this.currentLanguage = savedLanguage;
        console.log('저장된 언어 설정 로드:', savedLanguage);
        return;
      }

      // 2. 시스템 언어 확인
      const locales = getLocales();
      const systemLanguage = locales[0]?.languageCode;
      
      if (systemLanguage && this.supportedLanguages.includes(systemLanguage)) {
        this.currentLanguage = systemLanguage;
        await this.setLanguage(systemLanguage);
        console.log('시스템 언어 적용:', systemLanguage);
      } else {
        // 3. 기본값 (영어) 사용
        this.currentLanguage = 'en';
        await this.setLanguage('en');
        console.log('기본 언어 적용: en');
      }
    } catch (error) {
      console.error('언어 초기화 오류:', error);
      this.currentLanguage = 'en';
    }
  }

  // 언어 변경
  async setLanguage(languageCode) {
    if (!this.supportedLanguages.includes(languageCode)) {
      console.warn('지원하지 않는 언어:', languageCode);
      return false;
    }

    try {
      this.currentLanguage = languageCode;
      await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
      console.log('언어 설정 저장:', languageCode);
      
      // 리스너들에게 언어 변경 알림
      this.listeners.forEach(listener => {
        try {
          listener(languageCode);
        } catch (error) {
          console.error('언어 변경 리스너 오류:', error);
        }
      });
      
      return true;
    } catch (error) {
      console.error('언어 설정 저장 오류:', error);
      return false;
    }
  }

  // 현재 언어 가져오기
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 지원 언어 목록
  getSupportedLanguages() {
    return this.supportedLanguages.map(code => ({
      code,
      name: this.getLanguageName(code)
    }));
  }

  // 언어 이름 가져오기
  getLanguageName(code) {
    const names = {
      en: 'English',
      es: 'Español',
      zh: '中文(简体)',
      ko: '한국어',
      tl: 'Filipino',
      vi: 'Tiếng Việt',
      hi: 'हिन्दी',
      fr: 'Français',
      ar: 'العربية'
    };
    return names[code] || code;
  }

  // 번역 텍스트 가져오기
  t(key, params = {}) {
    try {
      console.log('t() 함수 호출 - 키:', key, '현재 언어:', this.currentLanguage);
      const keys = key.split('.');
      let translation = this.translations[this.currentLanguage];

      // 중첩된 키 탐색
      for (const k of keys) {
        if (translation && typeof translation === 'object') {
          translation = translation[k];
        } else {
          translation = undefined;
          break;
        }
      }

      // 번역이 없으면 영어로 폴백
      if (!translation && this.currentLanguage !== 'en') {
        let fallback = this.translations.en;
        for (const k of keys) {
          if (fallback && typeof fallback === 'object') {
            fallback = fallback[k];
          } else {
            fallback = undefined;
            break;
          }
        }
        translation = fallback;
      }

      // 여전히 없으면 키 자체 반환
      if (!translation) {
        console.warn('번역 키를 찾을 수 없음:', key);
        return key;
      }

      // 번역이 객체인 경우 키 반환 (오류 방지)
      if (typeof translation === 'object') {
        console.warn('번역 결과가 객체입니다:', key, translation);
        return key;
      }

      // 번역이 문자열이 아닌 경우 문자열로 변환
      if (typeof translation !== 'string') {
        console.warn('번역 결과가 문자열이 아닙니다:', key, typeof translation, translation);
        return String(translation);
      }

      // 매개변수 치환
      if (Object.keys(params).length > 0) {
        const result = translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? params[paramKey] : match;
        });
        console.log('t() 번역 결과 (매개변수 치환):', result);
        return result;
      }

      console.log('t() 번역 결과:', translation);
      return translation;
    } catch (error) {
      console.error('번역 오류:', error, 'key:', key);
      return key;
    }
  }

  // 복수형 처리 (필요시)
  tp(key, count, params = {}) {
    const pluralKey = count === 1 ? key : `${key}_plural`;
    return this.t(pluralKey, { ...params, count });
  }

  // 언어 변경 리스너 추가
  addLanguageChangeListener(listener) {
    this.listeners.push(listener);
  }

  // 언어 변경 리스너 제거
  removeLanguageChangeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

// 싱글톤 인스턴스
const i18n = new I18nManager();

export default i18n;

// 편의 함수들
export const t = (key, params) => i18n.t(key, params);
export const tp = (key, count, params) => i18n.tp(key, count, params);
export const getCurrentLanguage = () => i18n.getCurrentLanguage();
export const setLanguage = (code) => i18n.setLanguage(code);
export const getSupportedLanguages = () => i18n.getSupportedLanguages();
export const addLanguageChangeListener = (listener) => i18n.addLanguageChangeListener(listener);
export const removeLanguageChangeListener = (listener) => i18n.removeLanguageChangeListener(listener);
