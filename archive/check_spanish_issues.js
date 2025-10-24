const fs = require('fs');
const path = require('path');

// Spanish 파일 경로
const filePath = path.join(__dirname, 'data', 'interview_questions_es.json');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const questions = JSON.parse(data);
  
  console.log('=== Spanish 파일 Wrong Answers 문제 상세 분석 ===\n');
  
  const problemQuestions = [];
  
  questions.forEach((question, index) => {
    const wrongAnswersCount = question.wrongAnswers ? question.wrongAnswers.length : 0;
    const correctAnswersCount = question.correctAnswers ? question.correctAnswers.length : 0;
    
    if (wrongAnswersCount !== 3) {
      problemQuestions.push({
        id: question.id,
        index: index + 1,
        wrongAnswersCount,
        correctAnswersCount,
        question: question.question,
        correctAnswers: question.correctAnswers,
        wrongAnswers: question.wrongAnswers
      });
    }
  });
  
  console.log(`총 ${problemQuestions.length}개의 문제 질문 발견:\n`);
  
  // 처음 5개만 상세히 보여주기
  problemQuestions.slice(0, 5).forEach((q, idx) => {
    console.log(`${idx + 1}. 질문 ID ${q.id} (인덱스 ${q.index}):`);
    console.log(`   질문: "${q.question}"`);
    console.log(`   정답 개수: ${q.correctAnswersCount}개`);
    console.log(`   오답 개수: ${q.wrongAnswersCount}개 (3개 필요)`);
    console.log(`   현재 오답들:`);
    q.wrongAnswers.forEach((wa, i) => {
      console.log(`     ${i + 1}. "${wa.text}"`);
    });
    console.log('');
  });
  
  if (problemQuestions.length > 5) {
    console.log(`... 그 외 ${problemQuestions.length - 5}개 더\n`);
  }
  
  // 문제 질문 ID들 출력
  const problemIds = problemQuestions.map(q => q.id);
  console.log('모든 문제 질문 IDs:', problemIds.join(', '));
  
  // English 파일에서 해당 질문들 찾기
  const englishPath = path.join(__dirname, 'data', 'interview_questions_en.json');
  const englishData = fs.readFileSync(englishPath, 'utf8');
  const englishQuestions = JSON.parse(englishData);
  
  console.log('\n=== 문제 유형 분석 ===');
  
  // 1개 오답인 질문들 분석
  const oneWrongAnswerQuestions = problemQuestions.filter(q => q.wrongAnswersCount === 1);
  console.log(`\n1개 오답 질문들 (${oneWrongAnswerQuestions.length}개):`);
  oneWrongAnswerQuestions.slice(0, 3).forEach(q => {
    const englishQ = englishQuestions.find(eq => eq.id === q.id);
    console.log(`  질문 ${q.id}: ${q.correctAnswersCount}개 정답, English에서는 ${englishQ ? englishQ.wrongAnswers.length : 'N/A'}개 오답`);
  });
  
} catch (error) {
  console.error('❌ 파일 읽기 오류:', error.message);
}
