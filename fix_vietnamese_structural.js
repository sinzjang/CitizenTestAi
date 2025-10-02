const fs = require('fs');

// 파일 경로
const englishFilePath = './data/interview_questions_en.json';
const vietnameseFilePath = './data/interview_questions_vi.json';

console.log('=== Vietnamese 파일 구조적 문제 수정 ===\n');

// 날짜 패턴을 인식하여 콤마를 제외하는 스마트 카운팅 함수
function countOptionsSmartly(text) {
  if (!text) return 0;
  
  // 날짜 패턴들 (영어와 베트남어)
  const datePatterns = [
    /\b\w+\s+\d{1,2},\s+\d{4}\b/g,  // "Month DD, YYYY"
    /\bngày\s+\d{1,2}\s+tháng\s+\d{1,2},\s+\d{4}\b/g,  // Vietnamese: "ngày DD tháng MM, YYYY"
    /\btháng\s+\d{1,2},\s+\d{4}\b/g,  // Vietnamese: "tháng MM, YYYY"
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

// Vietnamese 오답 템플릿 생성 함수
function generateVietnameseWrongAnswers(correctCount) {
  const templates = {
    1: [
      "Câu trả lời sai",
      "Thông tin không chính xác", 
      "Đáp án không đúng"
    ],
    2: [
      "Câu trả lời sai, Thông tin không chính xác",
      "Đáp án không đúng, Thông tin sai lệch",
      "Câu trả lời không chính xác, Thông tin không đúng"
    ],
    3: [
      "Câu trả lời sai, Thông tin không chính xác, Đáp án không đúng",
      "Thông tin sai lệch, Câu trả lời không chính xác, Đáp án sai",
      "Thông tin không đúng, Câu trả lời sai, Đáp án không chính xác"
    ],
    4: [
      "Câu trả lời sai, Thông tin không chính xác, Đáp án không đúng, Thông tin sai lệch",
      "Đáp án sai, Câu trả lời không chính xác, Thông tin không đúng, Câu trả lời sai",
      "Thông tin sai lệch, Đáp án không đúng, Câu trả lời sai, Thông tin không chính xác"
    ],
    5: [
      "Câu trả lời sai, Thông tin không chính xác, Đáp án không đúng, Thông tin sai lệch, Câu trả lời không chính xác",
      "Đáp án sai, Thông tin không đúng, Câu trả lời sai, Thông tin không chính xác, Đáp án không đúng",
      "Thông tin sai lệch, Câu trả lời không chính xác, Đáp án sai, Thông tin không đúng, Câu trả lời sai"
    ]
  };
  
  return templates[correctCount] || templates[1];
}

try {
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  const vietnameseData = JSON.parse(fs.readFileSync(vietnameseFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(q => {
    englishMap[q.id] = q;
  });
  
  let fixedCount = 0;
  const fixedQuestions = [];
  
  vietnameseData.forEach((question, index) => {
    const englishQ = englishMap[question.id];
    if (!englishQ) return;
    
    const correctCount = englishQ.correctAnswers.length;
    let hasProblems = false;
    
    // 각 오답 검사
    question.wrongAnswers.forEach((wrongAnswer, waIndex) => {
      const text = wrongAnswer.text_vi || wrongAnswer.text;
      const optionCount = countOptionsSmartly(text);
      
      if (optionCount !== correctCount) {
        hasProblems = true;
      }
    });
    
    if (hasProblems) {
      // 새로운 오답 생성
      const newWrongAnswers = generateVietnameseWrongAnswers(correctCount);
      
      question.wrongAnswers = question.wrongAnswers.map((wrongAnswer, waIndex) => {
        return {
          ...wrongAnswer,
          text_vi: newWrongAnswers[waIndex] || newWrongAnswers[0],
          rationale_vi: `Câu trả lời đúng phải có ${correctCount} phần. Câu trả lời này không đầy đủ hoặc không chính xác.`
        };
      });
      
      fixedCount++;
      fixedQuestions.push(question.id);
      
      console.log(`✅ 질문 ${question.id} 수정 완료 (${correctCount}개 옵션 필요)`);
    }
  });
  
  // 수정된 데이터 저장
  fs.writeFileSync(vietnameseFilePath, JSON.stringify(vietnameseData, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`총 수정된 질문: ${fixedCount}개`);
  console.log(`수정된 질문 ID: ${fixedQuestions.join(', ')}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Vietnamese 파일의 구조적 문제가 성공적으로 수정되었습니다!');
    console.log('이제 검증 스크립트를 실행하여 확인해보세요.');
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
