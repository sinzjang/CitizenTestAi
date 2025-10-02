import { getCurrentLanguage } from './i18n';
import QuestionProcessor from './questionProcessor';

// 언어별 질문 파일 매핑
const QUESTION_FILES = {
  ko: require('../data/interview_questions_ko.json'),
  en: require('../data/interview_questions_en.json'),
  es: require('../data/interview_questions_es.json'),
  zh: require('../data/interview_questions_zh.json'),
  tl: require('../data/interview_questions_tl.json'),
  vi: require('../data/interview_questions_vi.json'),
  hi: require('../data/interview_questions_hi.json'),
  fr: require('../data/interview_questions_fr.json'),
  ar: require('../data/interview_questions_ar.json')
};

class QuestionLoader {
  /**
   * 현재 언어에 맞는 질문들을 로드합니다.
   * @returns {Array} 질문 배열
   */
  static async loadQuestions() {
    try {
      const currentLanguage = getCurrentLanguage();
      
      // 해당 언어의 질문 파일이 있는지 확인
      let questions;
      if (QUESTION_FILES[currentLanguage]) {
        console.log(`${currentLanguage} 언어 질문 로드 중...`);
        questions = QUESTION_FILES[currentLanguage];
      } else {
        // 해당 언어가 없으면 영어로 폴백
        console.warn(`${currentLanguage} 언어 파일이 없습니다. 영어로 폴백합니다.`);
        questions = QUESTION_FILES.en;
      }
      
      // 사용자 설정에 따라 질문 처리 (위치 기반 답변 등)
      console.log('🔄 QuestionProcessor로 질문 처리 시작...');
      const processedQuestions = await QuestionProcessor.processQuestions(questions);
      console.log('✅ QuestionProcessor 처리 완료');
      
      // 23번 문제 확인
      const question23 = processedQuestions.find(q => q.id === 23);
      if (question23) {
        console.log('📋 23번 문제 최종 상태:');
        console.log('질문:', question23.question);
        console.log('정답:', question23.correctAnswers);
      }
      
      return processedQuestions;
    } catch (error) {
      console.error('질문 로드 중 오류:', error);
      // 오류 발생 시 영어로 폴백
      const questions = QUESTION_FILES.en;
      const processedQuestions = await QuestionProcessor.processQuestions(questions);
      return processedQuestions;
    }
  }

  /**
   * 특정 언어의 질문들을 로드합니다.
   * @param {string} languageCode - 언어 코드 (ko, en, es, etc.)
   * @returns {Array} 질문 배열
   */
  static async loadQuestionsForLanguage(languageCode) {
    try {
      if (QUESTION_FILES[languageCode]) {
        console.log(`${languageCode} 언어 질문 로드 중...`);
        const questions = QUESTION_FILES[languageCode];
        
        // 사용자 설정에 따라 질문 처리 (위치 기반 답변 등)
        const processedQuestions = await QuestionProcessor.processQuestions(questions);
        return processedQuestions;
      } else {
        console.warn(`${languageCode} 언어 파일이 없습니다. 영어로 폴백합니다.`);
        const questions = QUESTION_FILES.en;
        const processedQuestions = await QuestionProcessor.processQuestions(questions);
        return processedQuestions;
      }
    } catch (error) {
      console.error(`${languageCode} 질문 로드 중 오류:`, error);
      const questions = QUESTION_FILES.en;
      const processedQuestions = await QuestionProcessor.processQuestions(questions);
      return processedQuestions;
    }
  }

  /**
   * 특정 ID의 질문을 로드합니다.
   * @param {number} questionId - 질문 ID
   * @param {string} languageCode - 언어 코드 (선택사항, 현재 언어 사용)
   * @returns {Object|null} 질문 객체
   */
  static async loadQuestionById(questionId, languageCode = null) {
    try {
      const language = languageCode || getCurrentLanguage();
      const questions = await this.loadQuestionsForLanguage(language);
      
      return questions.find(q => q.id === questionId) || null;
    } catch (error) {
      console.error(`질문 ID ${questionId} 로드 중 오류:`, error);
      return null;
    }
  }

  /**
   * 지원되는 언어 목록을 반환합니다.
   * @returns {Array} 지원되는 언어 코드 배열
   */
  static getSupportedLanguages() {
    return Object.keys(QUESTION_FILES);
  }

  /**
   * 특정 언어의 질문 파일이 존재하는지 확인합니다.
   * @param {string} languageCode - 언어 코드
   * @returns {boolean} 파일 존재 여부
   */
  static isLanguageSupported(languageCode) {
    return QUESTION_FILES.hasOwnProperty(languageCode);
  }

  /**
   * 질문 통계를 반환합니다.
   * @param {string} languageCode - 언어 코드 (선택사항)
   * @returns {Object} 질문 통계
   */
  static async getQuestionStats(languageCode = null) {
    try {
      const language = languageCode || getCurrentLanguage();
      const questions = await this.loadQuestionsForLanguage(language);
      
      return {
        totalQuestions: questions.length,
        language: language,
        firstQuestionId: questions.length > 0 ? questions[0].id : null,
        lastQuestionId: questions.length > 0 ? questions[questions.length - 1].id : null
      };
    } catch (error) {
      console.error('질문 통계 로드 중 오류:', error);
      return {
        totalQuestions: 0,
        language: language,
        firstQuestionId: null,
        lastQuestionId: null
      };
    }
  }
}

export default QuestionLoader;
