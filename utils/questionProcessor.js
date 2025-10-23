import LocationManager from './locationManager';
import { getCurrentLanguage, t } from './i18n';

// 지역별로 답이 다른 문제들의 ID 목록 (128문제 기준)
const LOCATION_DEPENDENT_QUESTIONS = {
  23: 'senator',        // "Who is one of your state's U.S. senators now?"
  29: 'representative', // "Name your U.S. representative."
  30: 'speaker',        // "What is the name of the Speaker of the House of Representatives now?"
  38: 'president',      // "What is the name of the President of the United States now?"
  39: 'vice_president', // "What is the name of the Vice President of the United States now?"
  61: 'governor',       // "Who is the governor of your state now?"
  62: 'state_capital'   // "What is the capital of your state?"
};

class QuestionProcessor {
  // 문제 데이터를 처리하여 사용자 설정에 맞는 답으로 변경
  static async processQuestion(question) {
    const questionId = question.id;
    
    // 지역별 답이 필요한 문제인지 확인
    if (LOCATION_DEPENDENT_QUESTIONS[questionId]) {
      const questionType = LOCATION_DEPENDENT_QUESTIONS[questionId];
      const userAnswer = await LocationManager.getLocationBasedAnswer(questionType);
      
      // 사용자가 설정한 답이 있으면 정답을 업데이트
      if (userAnswer && userAnswer !== 'Answers will vary') {
        const processedQuestion = { ...question };
        
        // 정답 업데이트 (새로운 파일 구조에 맞게)
        processedQuestion.correctAnswers = [
          {
            text: userAnswer,
            rationale: t('interview.userSetAnswer')
          }
        ];
        
        return processedQuestion;
      }
    }
    
    return question;
  }

  // 문제 배열을 처리
  static async processQuestions(questions) {
    console.log('🔄 QuestionProcessor.processQuestions 시작');
    console.log('처리할 문제 수:', questions.length);
    
    // 먼저 사용자 위치 정보 디버깅
    await LocationManager.debugUserLocation();
    
    const processedQuestions = [];
    
    for (const question of questions) {
      const processedQuestion = await this.processQuestion(question);
      processedQuestions.push(processedQuestion);
    }
    
    console.log('✅ QuestionProcessor.processQuestions 완료');
    return processedQuestions;
  }

  // 특정 문제가 지역 설정이 필요한 문제인지 확인
  static isLocationDependentQuestion(questionId) {
    return LOCATION_DEPENDENT_QUESTIONS.hasOwnProperty(questionId);
  }

  // 사용자가 설정해야 할 정보가 있는지 확인
  static async checkMissingLocationInfo() {
    const userLocation = await LocationManager.getUserLocation();
    
    if (!userLocation) {
      return {
        hasState: false,
        missingInfo: ['state', 'governor', 'senators', 'representative']
      };
    }

    const missingInfo = [];
    
    if (!userLocation.governor) missingInfo.push('governor');
    if (!userLocation.senators || !userLocation.senators[0] || !userLocation.senators[1]) {
      missingInfo.push('senators');
    }
    if (!userLocation.representative) missingInfo.push('representative');

    return {
      hasState: true,
      missingInfo
    };
  }

  // 지역 설정 안내 메시지 생성
  static generateLocationSettingMessage(missingInfo) {
    if (missingInfo.includes('state')) {
      return t('interview.locationSettingRequired');
    }

    const missingItems = [];
    if (missingInfo.includes('governor')) missingItems.push(t('location.governor'));
    if (missingInfo.includes('senators')) missingItems.push(t('location.senators'));
    if (missingInfo.includes('representative')) missingItems.push(t('location.representative'));

    if (missingItems.length > 0) {
      return t('interview.additionalInfoRequired', { missingInfo: missingItems.join(', ') });
    }

    return null;
  }
}

export default QuestionProcessor;
