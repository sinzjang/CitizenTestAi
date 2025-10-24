const fs = require('fs');
const path = require('path');

// interview_questions_en.json 파일 경로
const filePath = path.join(__dirname, 'data', 'interview_questions_en.json');

try {
  // JSON 파일 읽기
  const data = fs.readFileSync(filePath, 'utf8');
  const questions = JSON.parse(data);
  
  console.log('=== Wrong Answers 구조 상세 확인 ===');
  console.log('메모리 규칙: 각 wrongAnswer에는 정답 개수와 동일한 수의 오답이 콤마로 구분되어 포함되어야 함');
  console.log('');
  
  const problemQuestions = [];
  
  questions.forEach((question) => {
    const correctCount = question.correctAnswers ? question.correctAnswers.length : 0;
    const wrongAnswers = question.wrongAnswers || [];
    
    // 각 wrongAnswer의 구조 확인
    wrongAnswers.forEach((wrongAnswer, wrongIndex) => {
      const text = wrongAnswer.text || '';
      const commaCount = (text.match(/,/g) || []).length;
      const expectedAnswers = commaCount + 1; // 콤마 개수 + 1 = 답변 개수
      
      if (expectedAnswers !== correctCount) {
        problemQuestions.push({
          id: question.id,
          correctCount,
          wrongAnswerIndex: wrongIndex + 1,
          wrongAnswerText: text.substring(0, 80) + '...',
          expectedAnswers,
          problem: `정답 ${correctCount}개인데 오답에 ${expectedAnswers}개 포함`
        });
      }
    });
  });
  
  // 정답 개수별 샘플 확인
  console.log('📋 정답 개수별 샘플 확인:');
  [1, 2, 3, 4, 5].forEach(correctCount => {
    const sampleQuestion = questions.find(q => q.correctAnswers.length === correctCount);
    if (sampleQuestion) {
      console.log(`\n${correctCount}개 정답 질문 (ID: ${sampleQuestion.id}):`);
      console.log(`  질문: "${sampleQuestion.question.substring(0, 50)}..."`);
      console.log(`  정답들: ${sampleQuestion.correctAnswers.map(a => `"${a.text}"`).join(', ')}`);
      console.log(`  오답 구조:`);
      sampleQuestion.wrongAnswers.forEach((wa, index) => {
        const commaCount = (wa.text.match(/,/g) || []).length;
        console.log(`    ${index + 1}. "${wa.text.substring(0, 60)}..." (${commaCount + 1}개 답변)`);
      });
    }
  });
  
  console.log('\n');
  
  // 문제가 있는 질문들 출력
  if (problemQuestions.length > 0) {
    console.log('🚨 구조 문제가 있는 질문들:');
    problemQuestions.forEach(q => {
      console.log(`  질문 ${q.id} - 오답 ${q.wrongAnswerIndex}: ${q.problem}`);
      console.log(`    "${q.wrongAnswerText}"`);
    });
    
    console.log(`\n총 ${problemQuestions.length}개의 구조 문제 발견`);
  } else {
    console.log('✅ 모든 wrong answers가 올바른 구조를 가지고 있습니다!');
  }
  
} catch (error) {
  console.error('❌ 파일 읽기 오류:', error.message);
}
