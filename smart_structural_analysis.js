const fs = require('fs');

// 파일 경로
const filePath = './data/interview_questions_en.json';

console.log('=== 영어 파일 스마트 구조 분석 ===\n');

// 날짜 패턴 (월 일, 년도 형식)
const datePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/gi;

// 숫자 날짜 패턴 (월/일/년도 또는 월-일-년도)
const numericDatePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/g;

// 간단한 날짜 패턴 (월 일, 년도)
const simpleDatePattern = /\b\w+\s+\d{1,2},\s+\d{4}\b/g;

function countActualOptions(text) {
  // 날짜 내의 콤마를 임시로 제거
  let cleanText = text;
  
  // 날짜 패턴들을 찾아서 콤마를 임시 문자로 교체
  cleanText = cleanText.replace(datePattern, (match) => match.replace(/,/g, '|DATECOMMA|'));
  cleanText = cleanText.replace(numericDatePattern, (match) => match.replace(/,/g, '|DATECOMMA|'));
  cleanText = cleanText.replace(simpleDatePattern, (match) => match.replace(/,/g, '|DATECOMMA|'));
  
  // 이제 실제 옵션 구분자인 콤마만 남음
  const actualCommas = (cleanText.match(/,/g) || []).length;
  const optionCount = actualCommas + 1;
  
  return optionCount;
}

try {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const structuralProblems = [];
  
  data.forEach((question, index) => {
    const correctAnswerCount = question.correctAnswers ? question.correctAnswers.length : 0;
    
    if (question.wrongAnswers) {
      question.wrongAnswers.forEach((wrongAnswer, wrongIndex) => {
        const wrongAnswerText = wrongAnswer.text || '';
        const actualOptionCount = countActualOptions(wrongAnswerText);
        
        if (actualOptionCount !== correctAnswerCount) {
          structuralProblems.push({
            questionId: question.id,
            questionIndex: index,
            wrongAnswerIndex: wrongIndex,
            correctAnswerCount: correctAnswerCount,
            wrongAnswerOptionCount: actualOptionCount,
            wrongAnswerText: wrongAnswerText,
            question: question.question
          });
        }
      });
    }
  });
  
  console.log(`총 실제 구조적 문제: ${structuralProblems.length}개\n`);
  
  if (structuralProblems.length > 0) {
    // 질문별로 그룹화
    const problemsByQuestion = {};
    structuralProblems.forEach(problem => {
      if (!problemsByQuestion[problem.questionId]) {
        problemsByQuestion[problem.questionId] = [];
      }
      problemsByQuestion[problem.questionId].push(problem);
    });
    
    console.log('=== 실제 문제 질문 상세 분석 ===\n');
    
    Object.keys(problemsByQuestion).sort((a, b) => parseInt(a) - parseInt(b)).forEach(questionId => {
      const problems = problemsByQuestion[questionId];
      const firstProblem = problems[0];
      
      console.log(`🔴 질문 ${questionId}: "${firstProblem.question}"`);
      console.log(`   정답 개수: ${firstProblem.correctAnswerCount}개`);
      console.log(`   문제가 있는 오답들:`);
      
      problems.forEach(problem => {
        console.log(`     오답 ${problem.wrongAnswerIndex + 1}: ${problem.wrongAnswerOptionCount}개 옵션 (${problem.correctAnswerCount}개 필요)`);
        console.log(`       텍스트: "${problem.wrongAnswerText.substring(0, 100)}${problem.wrongAnswerText.length > 100 ? '...' : ''}"`);
      });
      console.log('');
    });
    
  } else {
    console.log('🎉 모든 질문이 올바른 구조를 가지고 있습니다!');
  }
  
  // 특별히 질문 63 확인
  const question63 = data.find(q => q.id === 63);
  if (question63) {
    console.log('=== 질문 63 특별 확인 ===');
    console.log(`질문: "${question63.question}"`);
    console.log(`정답 개수: ${question63.correctAnswers.length}개`);
    console.log('오답들:');
    question63.wrongAnswers.forEach((wa, index) => {
      const actualCount = countActualOptions(wa.text);
      console.log(`  ${index + 1}. "${wa.text}" → ${actualCount}개 옵션`);
    });
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
