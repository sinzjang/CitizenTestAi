const fs = require('fs');
const path = require('path');

// Korean 파일 경로
const filePath = path.join(__dirname, 'data', 'interview_questions_ko.json');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const questions = JSON.parse(data);
  
  console.log('=== Korean 파일 Wrong Answers 문제 상세 분석 ===\n');
  
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
  
  problemQuestions.forEach((q, idx) => {
    console.log(`${idx + 1}. 질문 ID ${q.id} (인덱스 ${q.index}):`);
    console.log(`   질문: "${q.question}"`);
    console.log(`   정답 개수: ${q.correctAnswersCount}개`);
    console.log(`   오답 개수: ${q.wrongAnswersCount}개 (3개 필요)`);
    console.log(`   정답들:`);
    q.correctAnswers.forEach((ca, i) => {
      console.log(`     ${i + 1}. "${ca.text}"`);
    });
    console.log(`   현재 오답들:`);
    q.wrongAnswers.forEach((wa, i) => {
      console.log(`     ${i + 1}. "${wa.text}"`);
    });
    console.log('');
  });
  
  // English 파일에서 해당 질문들 찾기
  const englishPath = path.join(__dirname, 'data', 'interview_questions_en.json');
  const englishData = fs.readFileSync(englishPath, 'utf8');
  const englishQuestions = JSON.parse(englishData);
  
  console.log('=== English 파일에서 해당 질문들의 구조 확인 ===\n');
  
  problemQuestions.forEach((q, idx) => {
    const englishQ = englishQuestions.find(eq => eq.id === q.id);
    if (englishQ) {
      console.log(`${idx + 1}. 질문 ID ${q.id} (English 참조):`);
      console.log(`   English 정답 개수: ${englishQ.correctAnswers.length}개`);
      console.log(`   English 오답 개수: ${englishQ.wrongAnswers.length}개`);
      console.log(`   English 오답들:`);
      englishQ.wrongAnswers.forEach((wa, i) => {
        console.log(`     ${i + 1}. "${wa.text}"`);
      });
      console.log('');
    }
  });
  
} catch (error) {
  console.error('❌ 파일 읽기 오류:', error.message);
}
