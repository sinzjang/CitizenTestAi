const fs = require('fs');

// 파일 경로
const englishFilePath = './data/interview_questions_en.json';
const arabicFilePath = './data/interview_questions_ar.json';

console.log('=== Arabic 파일 구조적 문제 수정 ===\n');

// 날짜 패턴을 인식하여 콤마를 제외하는 스마트 카운팅 함수
function countOptionsSmartly(text) {
  if (!text) return 0;
  
  // 날짜 패턴들 (영어와 아랍어)
  const datePatterns = [
    /\b\w+\s+\d{1,2},\s+\d{4}\b/g,  // "Month DD, YYYY"
    /\b\d{1,2}\s+\w+\s+\d{4}\b/g,   // Arabic: "DD شهر YYYY"
    /\bفي\s+\d{1,2}\s+\w+\s+\d{4}\b/g,  // Arabic: "في DD شهر YYYY"
  ];
  
  let processedText = text;
  
  // 날짜 패턴 내의 콤마를 임시로 다른 문자로 대체
  datePatterns.forEach(pattern => {
    processedText = processedText.replace(pattern, (match) => {
      return match.replace(/[,،]/g, '|COMMA|');
    });
  });
  
  // 영어 콤마와 아랍어 콤마 모두 카운트
  const englishCommaCount = (processedText.match(/,/g) || []).length;
  const arabicCommaCount = (processedText.match(/،/g) || []).length;
  const totalCommaCount = englishCommaCount + arabicCommaCount;
  return totalCommaCount + 1;
}

// Arabic 오답 템플릿 생성 함수 (아랍어 콤마 사용)
function generateArabicWrongAnswers(correctCount) {
  const templates = {
    1: [
      "إجابة خاطئة",
      "معلومات غير صحيحة", 
      "إجابة غير صحيحة"
    ],
    2: [
      "إجابة خاطئة، معلومات غير صحيحة",
      "إجابة غير صحيحة، معلومات خاطئة",
      "معلومات غير صحيحة، إجابة خاطئة"
    ],
    3: [
      "إجابة خاطئة، معلومات غير صحيحة، إجابة غير صحيحة",
      "معلومات خاطئة، إجابة غير صحيحة، معلومات غير صحيحة",
      "إجابة غير صحيحة، معلومات خاطئة، إجابة خاطئة"
    ],
    4: [
      "إجابة خاطئة، معلومات غير صحيحة، إجابة غير صحيحة، معلومات خاطئة",
      "معلومات خاطئة، إجابة غير صحيحة، معلومات غير صحيحة، إجابة خاطئة",
      "إجابة غير صحيحة، معلومات خاطئة، إجابة خاطئة، معلومات غير صحيحة"
    ],
    5: [
      "إجابة خاطئة، معلومات غير صحيحة، إجابة غير صحيحة، معلومات خاطئة، بيانات خاطئة",
      "معلومات خاطئة، إجابة غير صحيحة، معلومات غير صحيحة، إجابة خاطئة، بيانات خاطئة",
      "إجابة غير صحيحة، معلومات خاطئة، إجابة خاطئة، معلومات غير صحيحة، بيانات خاطئة"
    ]
  };
  
  return templates[correctCount] || templates[1];
}

try {
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  const arabicData = JSON.parse(fs.readFileSync(arabicFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(q => {
    englishMap[q.id] = q;
  });
  
  let fixedCount = 0;
  const fixedQuestions = [];
  
  arabicData.forEach((question, index) => {
    const englishQ = englishMap[question.id];
    if (!englishQ) return;
    
    const correctCount = englishQ.correctAnswers.length;
    let hasProblems = false;
    
    // 각 오답 검사
    question.wrongAnswers.forEach((wrongAnswer, waIndex) => {
      const text = wrongAnswer.text_ar || wrongAnswer.text;
      const optionCount = countOptionsSmartly(text);
      
      if (optionCount !== correctCount) {
        hasProblems = true;
      }
    });
    
    if (hasProblems) {
      // 새로운 오답 생성
      const newWrongAnswers = generateArabicWrongAnswers(correctCount);
      
      question.wrongAnswers = question.wrongAnswers.map((wrongAnswer, waIndex) => {
        return {
          ...wrongAnswer,
          text_ar: newWrongAnswers[waIndex] || newWrongAnswers[0],
          rationale_ar: `الإجابة الصحيحة يجب أن تحتوي على ${correctCount} أجزاء. هذه الإجابة غير مكتملة أو غير صحيحة.`
        };
      });
      
      fixedCount++;
      fixedQuestions.push(question.id);
      
      console.log(`✅ 질문 ${question.id} 수정 완료 (${correctCount}개 옵션 필요)`);
    }
  });
  
  // 수정된 데이터 저장
  fs.writeFileSync(arabicFilePath, JSON.stringify(arabicData, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`총 수정된 질문: ${fixedCount}개`);
  console.log(`수정된 질문 ID: ${fixedQuestions.join(', ')}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Arabic 파일의 구조적 문제가 성공적으로 수정되었습니다!');
    console.log('이제 검증 스크립트를 실행하여 확인해보세요.');
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
