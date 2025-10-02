const fs = require('fs');
const path = require('path');

// 확인할 언어 파일들
const languageFiles = [
  'interview_questions_en.json',
  'interview_questions_ko.json',
  'interview_questions_es.json',
  'interview_questions_zh.json',
  'interview_questions_tl.json',
  'interview_questions_vi.json',
  'interview_questions_hi.json',
  'interview_questions_fr.json',
  'interview_questions_ar.json'
];

console.log('=== 모든 언어 파일 Wrong Answers 구조 확인 ===\n');

languageFiles.forEach(fileName => {
  const filePath = path.join(__dirname, 'data', fileName);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${fileName}: 파일이 존재하지 않음`);
      return;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);
    
    console.log(`📁 ${fileName}:`);
    console.log(`   총 질문 수: ${questions.length}`);
    
    const problemQuestions = [];
    
    questions.forEach((question) => {
      const correctCount = question.correctAnswers ? question.correctAnswers.length : 0;
      const wrongAnswers = question.wrongAnswers || [];
      
      wrongAnswers.forEach((wrongAnswer, wrongIndex) => {
        const text = wrongAnswer.text || '';
        const commaCount = (text.match(/,/g) || []).length;
        const expectedAnswers = commaCount + 1;
        
        if (expectedAnswers !== correctCount) {
          problemQuestions.push({
            id: question.id,
            correctCount,
            wrongAnswerIndex: wrongIndex + 1,
            expectedAnswers
          });
        }
      });
    });
    
    if (problemQuestions.length > 0) {
      console.log(`   🚨 구조 문제: ${problemQuestions.length}개`);
      
      // 문제 질문 ID들 그룹화
      const problemIds = [...new Set(problemQuestions.map(p => p.id))];
      console.log(`   문제 질문 IDs: ${problemIds.join(', ')}`);
    } else {
      console.log(`   ✅ 구조 문제 없음`);
    }
    
    console.log('');
    
  } catch (error) {
    console.log(`❌ ${fileName}: 읽기 오류 - ${error.message}`);
    console.log('');
  }
});

console.log('=== 요약 ===');
console.log('구조 문제가 있는 파일들을 우선적으로 수정해야 합니다.');
console.log('메모리 규칙: 각 wrongAnswer에는 정답 개수와 동일한 수의 오답이 콤마로 구분되어 포함되어야 함');
