import LocationManager from './locationManager';
import { getCurrentLanguage, t } from './i18n';

// 지역별로 답이 다른 문제들의 ID 목록
const LOCATION_DEPENDENT_QUESTIONS = {
  20: 'senator',        // "Who is one of your state's U.S. Senators now?"
  23: 'representative', // "Name your U.S. Representative."
  43: 'governor',       // "Who is the Governor of your state now?"
  44: 'state_capital'   // "What is the capital of your state?"
};

class QuestionProcessor {
  // 문제 데이터를 처리하여 사용자 설정에 맞는 답으로 변경
  static async processQuestion(question) {
    const questionId = question.id;
    
    // 23번 문제 디버깅
    if (questionId === 23) {
      console.log('🔍 23번 문제 처리 시작');
      console.log('질문:', question.question);
    }
    
    // 지역별 답이 필요한 문제인지 확인
    if (LOCATION_DEPENDENT_QUESTIONS[questionId]) {
      const questionType = LOCATION_DEPENDENT_QUESTIONS[questionId];
      
      if (questionId === 23) {
        console.log('✅ 23번 문제가 위치 의존 문제로 인식됨');
        console.log('문제 타입:', questionType);
      }
      
      const userAnswer = await LocationManager.getLocationBasedAnswer(questionType);
      
      if (questionId === 23) {
        console.log('사용자 답변:', userAnswer);
      }
      
      // 사용자가 설정한 답이 있으면 정답을 업데이트
      if (userAnswer && userAnswer !== 'Answers will vary') {
        const processedQuestion = { ...question };
        
        // 현재 언어에 맞는 답 생성
        const currentLanguage = getCurrentLanguage();
        
        // 정답 업데이트 (새로운 파일 구조에 맞게)
        processedQuestion.correctAnswers = [
          {
            text: userAnswer,
            rationale: t('interview.userSetAnswer')
          }
        ];
        
        if (questionId === 23) {
          console.log('🎉 23번 문제 답변 업데이트 완료');
          console.log('새로운 답변:', userAnswer);
        }
        
        return processedQuestion;
      } else if (questionId === 23) {
        console.log('❌ 23번 문제: 사용자 답변이 없거나 기본값임');
      }
    } else if (questionId === 23) {
      console.log('❌ 23번 문제가 위치 의존 문제로 인식되지 않음');
      console.log('LOCATION_DEPENDENT_QUESTIONS:', LOCATION_DEPENDENT_QUESTIONS);
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
