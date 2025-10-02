const fs = require('fs');

// 파일 경로
const filePath = './data/interview_questions_en.json';

console.log('=== 영어 파일 구조적 문제 상세 분석 ===\n');

try {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const structuralProblems = [];
  
  data.forEach((question, index) => {
    const correctAnswerCount = question.correctAnswers ? question.correctAnswers.length : 0;
    
    if (question.wrongAnswers) {
      question.wrongAnswers.forEach((wrongAnswer, wrongIndex) => {
        const wrongAnswerText = wrongAnswer.text || '';
        const commaCount = (wrongAnswerText.match(/,/g) || []).length;
        const optionCount = commaCount + 1; // 콤마 개수 + 1 = 옵션 개수
        
        if (optionCount !== correctAnswerCount) {
          structuralProblems.push({
            questionId: question.id,
            questionIndex: index,
            wrongAnswerIndex: wrongIndex,
            correctAnswerCount: correctAnswerCount,
            wrongAnswerOptionCount: optionCount,
            wrongAnswerText: wrongAnswerText,
            question: question.question
          });
        }
      });
    }
  });
  
  console.log(`총 구조적 문제: ${structuralProblems.length}개\n`);
  
  if (structuralProblems.length > 0) {
    // 질문별로 그룹화
    const problemsByQuestion = {};
    structuralProblems.forEach(problem => {
      if (!problemsByQuestion[problem.questionId]) {
        problemsByQuestion[problem.questionId] = [];
      }
      problemsByQuestion[problem.questionId].push(problem);
    });
    
    console.log('=== 문제 질문 상세 분석 ===\n');
    
    Object.keys(problemsByQuestion).sort((a, b) => parseInt(a) - parseInt(b)).forEach(questionId => {
      const problems = problemsByQuestion[questionId];
      const firstProblem = problems[0];
      
      console.log(`🔴 질문 ${questionId}: "${firstProblem.question}"`);
      console.log(`   정답 개수: ${firstProblem.correctAnswerCount}개`);
      console.log(`   문제가 있는 오답들:`);
      
      problems.forEach(problem => {
        console.log(`     오답 ${problem.wrongAnswerIndex + 1}: ${problem.wrongAnswerOptionCount}개 옵션 (${problem.correctAnswerCount}개 필요)`);
        console.log(`       텍스트: "${problem.wrongAnswerText.substring(0, 80)}${problem.wrongAnswerText.length > 80 ? '...' : ''}"`);
      });
      console.log('');
    });
    
    // 우선순위별 분류
    console.log('=== 우선순위별 분류 ===\n');
    
    const questionIds = Object.keys(problemsByQuestion).map(id => parseInt(id)).sort((a, b) => a - b);
    
    // 정답 개수별로 분류
    const by4Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 4);
    const by3Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 3);
    const by2Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 2);
    const by5Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 5);
    const by1Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 1);
    
    if (by4Correct.length > 0) {
      console.log(`🟢 4개 정답 질문들 (${by4Correct.length}개): ${by4Correct.join(', ')}`);
    }
    if (by3Correct.length > 0) {
      console.log(`🟡 3개 정답 질문들 (${by3Correct.length}개): ${by3Correct.join(', ')}`);
    }
    if (by2Correct.length > 0) {
      console.log(`🟠 2개 정답 질문들 (${by2Correct.length}개): ${by2Correct.join(', ')}`);
    }
    if (by5Correct.length > 0) {
      console.log(`🔵 5개 정답 질문들 (${by5Correct.length}개): ${by5Correct.join(', ')}`);
    }
    if (by1Correct.length > 0) {
      console.log(`⚪ 1개 정답 질문들 (${by1Correct.length}개): ${by1Correct.join(', ')}`);
    }
    
    console.log(`\n📊 총 ${questionIds.length}개 질문에 구조적 문제가 있습니다.`);
    
  } else {
    console.log('🎉 모든 질문이 올바른 구조를 가지고 있습니다!');
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
