const fs = require('fs');
const path = require('path');

// 확인할 언어 파일들
const languageFiles = [
  { code: 'en', name: 'English', file: 'interview_questions_en.json' },
  { code: 'ko', name: 'Korean', file: 'interview_questions_ko.json' },
  { code: 'es', name: 'Spanish', file: 'interview_questions_es.json' },
  { code: 'zh', name: 'Chinese', file: 'interview_questions_zh.json' },
  { code: 'tl', name: 'Filipino', file: 'interview_questions_tl.json' },
  { code: 'vi', name: 'Vietnamese', file: 'interview_questions_vi.json' },
  { code: 'hi', name: 'Hindi', file: 'interview_questions_hi.json' },
  { code: 'fr', name: 'French', file: 'interview_questions_fr.json' },
  { code: 'ar', name: 'Arabic', file: 'interview_questions_ar.json' }
];

console.log('=== 모든 언어 파일 Wrong Answers 개수 확인 ===\n');

languageFiles.forEach(lang => {
  const filePath = path.join(__dirname, 'data', lang.file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${lang.name} (${lang.code}): 파일이 존재하지 않음\n`);
      return;
    }
    
    // JSON 파일 읽기
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);
    
    console.log(`📁 ${lang.name} (${lang.code}) - ${lang.file}:`);
    console.log(`총 질문 수: ${questions.length}`);
    console.log('');
    
    // 각 질문의 wrongAnswers 개수 확인
    const wrongAnswerCounts = {};
    const problemQuestions = [];
    
    questions.forEach((question, index) => {
      const wrongAnswersCount = question.wrongAnswers ? question.wrongAnswers.length : 0;
      const correctAnswersCount = question.correctAnswers ? question.correctAnswers.length : 0;
      
      // 개수별 통계
      if (wrongAnswerCounts[wrongAnswersCount]) {
        wrongAnswerCounts[wrongAnswersCount]++;
      } else {
        wrongAnswerCounts[wrongAnswersCount] = 1;
      }
      
      // 3개가 아닌 경우 문제 질문으로 기록
      if (wrongAnswersCount !== 3) {
        problemQuestions.push({
          id: question.id,
          index: index + 1,
          wrongAnswersCount,
          correctAnswersCount,
          question: question.question ? question.question.substring(0, 60) + '...' : 'No question text'
        });
      }
    });
    
    // 통계 출력
    console.log('📊 Wrong Answers 개수별 통계:');
    Object.keys(wrongAnswerCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(count => {
      console.log(`  ${count}개: ${wrongAnswerCounts[count]}개 질문`);
    });
    
    console.log('');
    
    // 문제가 있는 질문들 출력
    if (problemQuestions.length > 0) {
      console.log('🚨 Wrong Answers가 3개가 아닌 질문들:');
      problemQuestions.slice(0, 5).forEach(q => {
        console.log(`  질문 ${q.id}: ${q.wrongAnswersCount}개 wrong answers, ${q.correctAnswersCount}개 correct answers`);
        console.log(`    "${q.question}"`);
      });
      if (problemQuestions.length > 5) {
        console.log(`  ... 그 외 ${problemQuestions.length - 5}개 더`);
      }
    } else {
      console.log('✅ 모든 질문이 3개의 wrong answers를 가지고 있습니다!');
    }
    
    console.log('');
    console.log('📊 Correct Answers 개수별 통계:');
    
    // 정답 개수별 분석
    const correctAnswerCounts = {};
    questions.forEach(question => {
      const correctCount = question.correctAnswers ? question.correctAnswers.length : 0;
      if (correctAnswerCounts[correctCount]) {
        correctAnswerCounts[correctCount]++;
      } else {
        correctAnswerCounts[correctCount] = 1;
      }
    });
    
    Object.keys(correctAnswerCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(count => {
      console.log(`  ${count}개: ${correctAnswerCounts[count]}개 질문`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
  } catch (error) {
    console.log(`❌ ${lang.name} (${lang.code}): 읽기 오류 - ${error.message}\n`);
  }
});

console.log('=== 전체 요약 ===');
console.log('각 언어별로 Wrong Answers 개수와 Correct Answers 개수를 확인했습니다.');
console.log('메모리 규칙에 따르면: 각 wrongAnswer에는 정답 개수와 동일한 수의 오답이 콤마로 구분되어 포함되어야 합니다.');
