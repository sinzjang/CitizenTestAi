const fs = require('fs');

// 파일 경로
const englishFilePath = './data/interview_questions_en.json';
const hindiFilePath = './data/interview_questions_hi.json';

console.log('=== Hindi 파일 구조적 문제 상세 분석 ===\n');

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

try {
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  const hindiData = JSON.parse(fs.readFileSync(hindiFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(q => {
    englishMap[q.id] = q;
  });
  
  let totalProblems = 0;
  const problemQuestions = [];
  
  console.log('📊 각 질문별 구조적 문제 분석:\n');
  
  hindiData.forEach((question, index) => {
    const englishQ = englishMap[question.id];
    if (!englishQ) {
      console.log(`⚠️  질문 ${question.id}: 영어 버전 없음`);
      return;
    }
    
    const correctCount = englishQ.correctAnswers.length;
    let hasProblems = false;
    const problemDetails = [];
    
    question.wrongAnswers.forEach((wrongAnswer, waIndex) => {
      const text = wrongAnswer.text_hi || wrongAnswer.text;
      const optionCount = countOptionsSmartly(text);
      
      if (optionCount !== correctCount) {
        hasProblems = true;
        problemDetails.push({
          wrongAnswerIndex: waIndex + 1,
          expected: correctCount,
          actual: optionCount,
          text: text.substring(0, 80) + (text.length > 80 ? '...' : '')
        });
      }
    });
    
    if (hasProblems) {
      totalProblems++;
      problemQuestions.push({
        id: question.id,
        question: question.question_hi || question.question,
        correctCount,
        problems: problemDetails
      });
      
      console.log(`❌ 질문 ${question.id}: "${(question.question_hi || question.question).substring(0, 60)}..."`);
      console.log(`   정답 개수: ${correctCount}개`);
      problemDetails.forEach(problem => {
        console.log(`   오답 ${problem.wrongAnswerIndex}: ${problem.actual}개 옵션 (${problem.expected}개 필요)`);
        console.log(`   내용: "${problem.text}"`);
      });
      console.log('');
    }
  });
  
  console.log(`\n=== 분석 결과 ===`);
  console.log(`총 구조적 문제: ${totalProblems}개`);
  
  if (totalProblems === 0) {
    console.log('🎉 모든 질문이 올바른 구조를 가지고 있습니다!');
  } else {
    console.log(`\n📋 문제가 있는 질문 ID: ${problemQuestions.map(q => q.id).join(', ')}`);
    
    // 정답 개수별 문제 분류
    const problemsByCorrectCount = {};
    problemQuestions.forEach(q => {
      if (!problemsByCorrectCount[q.correctCount]) {
        problemsByCorrectCount[q.correctCount] = [];
      }
      problemsByCorrectCount[q.correctCount].push(q.id);
    });
    
    console.log('\n📊 정답 개수별 문제 분류:');
    Object.keys(problemsByCorrectCount).sort((a, b) => parseInt(a) - parseInt(b)).forEach(count => {
      const ids = problemsByCorrectCount[count];
      console.log(`   ${count}개 정답: ${ids.length}개 질문 (${ids.join(', ')})`);
    });
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
