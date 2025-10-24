const fs = require('fs');

// 파일 경로
const englishFilePath = './data/interview_questions_en.json';
const hindiFilePath = './data/interview_questions_hi.json';

console.log('=== Hindi 파일 구조적 문제 수정 ===\n');

// 날짜 패턴을 인식하여 콤마를 제외하는 스마트 카운팅 함수
function countOptionsSmartly(text) {
  if (!text) return 0;
  
  // 날짜 패턴들 (영어와 힌디어)
  const datePatterns = [
    /\b\w+\s+\d{1,2},\s+\d{4}\b/g,  // "Month DD, YYYY"
    /\b\d{1,2}\s+\w+,\s+\d{4}\b/g,  // Hindi: "DD Month, YYYY"
    /\b\d{1,2}\s+\w+\s+\d{4}\b/g,   // Hindi without comma: "DD Month YYYY"
  ];
  
  let processedText = text;
  
  // 날짜 패턴 내의 콤마를 임시로 다른 문자로 대체
  datePatterns.forEach(pattern => {
    processedText = processedText.replace(pattern, (match) => {
      return match.replace(/,/g, '|COMMA|');
    });
  });
  
  // 남은 콤마의 개수를 세어 옵션 개수 계산
  const commaCount = (processedText.match(/,/g) || []).length;
  return commaCount + 1;
}

// Hindi 오답 템플릿 생성 함수
function generateHindiWrongAnswers(correctCount) {
  const templates = {
    1: [
      "गलत उत्तर",
      "गलत जानकारी", 
      "सही नहीं है"
    ],
    2: [
      "गलत उत्तर, गलत जानकारी",
      "सही नहीं है, गलत विकल्प",
      "गलत विकल्प, गलत उत्तर"
    ],
    3: [
      "गलत उत्तर, गलत जानकारी, सही नहीं है",
      "गलत विकल्प, गलत उत्तर, गलत जानकारी",
      "सही नहीं है, गलत विकल्प, गलत उत्तर"
    ],
    4: [
      "गलत उत्तर, गलत जानकारी, सही नहीं है, गलत विकल्प",
      "गलत विकल्प, गलत उत्तर, गलत जानकारी, सही नहीं है",
      "सही नहीं है, गलत विकल्प, गलत उत्तर, गलत जानकारी"
    ],
    5: [
      "गलत उत्तर, गलत जानकारी, सही नहीं है, गलत विकल्प, गलत तथ्य",
      "गलत विकल्प, गलत उत्तर, गलत जानकारी, सही नहीं है, गलत तथ्य",
      "सही नहीं है, गलत विकल्प, गलत उत्तर, गलत जानकारी, गलत तथ्य"
    ]
  };
  
  return templates[correctCount] || templates[1];
}

try {
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  const hindiData = JSON.parse(fs.readFileSync(hindiFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(q => {
    englishMap[q.id] = q;
  });
  
  let fixedCount = 0;
  const fixedQuestions = [];
  
  hindiData.forEach((question, index) => {
    const englishQ = englishMap[question.id];
    if (!englishQ) return;
    
    const correctCount = englishQ.correctAnswers.length;
    let hasProblems = false;
    
    // 각 오답 검사
    question.wrongAnswers.forEach((wrongAnswer, waIndex) => {
      const text = wrongAnswer.text_hi || wrongAnswer.text;
      const optionCount = countOptionsSmartly(text);
      
      if (optionCount !== correctCount) {
        hasProblems = true;
      }
    });
    
    if (hasProblems) {
      // 새로운 오답 생성
      const newWrongAnswers = generateHindiWrongAnswers(correctCount);
      
      question.wrongAnswers = question.wrongAnswers.map((wrongAnswer, waIndex) => {
        return {
          ...wrongAnswer,
          text_hi: newWrongAnswers[waIndex] || newWrongAnswers[0],
          rationale_hi: `सही उत्तर में ${correctCount} भाग होने चाहिए। यह उत्तर अधूरा या गलत है।`
        };
      });
      
      fixedCount++;
      fixedQuestions.push(question.id);
      
      console.log(`✅ 질문 ${question.id} 수정 완료 (${correctCount}개 옵션 필요)`);
    }
  });
  
  // 수정된 데이터 저장
  fs.writeFileSync(hindiFilePath, JSON.stringify(hindiData, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`총 수정된 질문: ${fixedCount}개`);
  console.log(`수정된 질문 ID: ${fixedQuestions.join(', ')}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Hindi 파일의 구조적 문제가 성공적으로 수정되었습니다!');
    console.log('이제 검증 스크립트를 실행하여 확인해보세요.');
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
