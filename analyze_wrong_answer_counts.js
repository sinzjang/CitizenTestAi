const fs = require('fs');

// 모든 언어 파일 경로
const languageFiles = [
  { code: 'en', path: './data/interview_questions_en.json', name: 'English' },
  { code: 'ko', path: './data/interview_questions_ko.json', name: 'Korean' },
  { code: 'es', path: './data/interview_questions_es.json', name: 'Spanish' },
  { code: 'zh', path: './data/interview_questions_zh.json', name: 'Chinese' },
  { code: 'tl', path: './data/interview_questions_tl.json', name: 'Filipino' },
  { code: 'vi', path: './data/interview_questions_vi.json', name: 'Vietnamese' },
  { code: 'hi', path: './data/interview_questions_hi.json', name: 'Hindi' },
  { code: 'fr', path: './data/interview_questions_fr.json', name: 'French' },
  { code: 'ar', path: './data/interview_questions_ar.json', name: 'Arabic' }
];

console.log('=== 모든 언어 파일 Wrong Answer Count 분석 ===\n');

const allProblems = {};

languageFiles.forEach(lang => {
  try {
    const data = JSON.parse(fs.readFileSync(lang.path, 'utf8'));
    console.log(`📁 ${lang.name} (${lang.code}): ${data.length}개 질문`);
    
    const problems = [];
    
    data.forEach((question, index) => {
      const wrongAnswerCount = question.wrongAnswers ? question.wrongAnswers.length : 0;
      
      // 모든 질문은 3개의 오답을 가져야 함 (표준 규칙)
      if (wrongAnswerCount !== 3) {
        problems.push({
          id: question.id,
          index: index,
          currentCount: wrongAnswerCount,
          requiredCount: 3,
          question: question.question || question[`question_${lang.code}`] || 'No question text'
        });
      }
    });
    
    if (problems.length > 0) {
      console.log(`   🚨 문제 질문: ${problems.length}개`);
      allProblems[lang.code] = problems;
      
      // 처음 5개만 상세 표시
      problems.slice(0, 5).forEach(problem => {
        console.log(`      질문 ${problem.id}: ${problem.currentCount}개 → ${problem.requiredCount}개 필요`);
      });
      
      if (problems.length > 5) {
        console.log(`      ... 그 외 ${problems.length - 5}개 더`);
      }
    } else {
      console.log(`   ✅ 모든 질문이 올바른 오답 개수를 가짐`);
    }
    
  } catch (error) {
    console.log(`   ❌ 파일 읽기 실패: ${error.message}`);
  }
  
  console.log('');
});

console.log('=== 요약 ===');
const languagesWithProblems = Object.keys(allProblems);

if (languagesWithProblems.length === 0) {
  console.log('🎉 모든 언어 파일이 올바른 wrong answer count를 가지고 있습니다!');
} else {
  console.log(`🔧 수정이 필요한 언어: ${languagesWithProblems.length}개`);
  
  languagesWithProblems.forEach(langCode => {
    const lang = languageFiles.find(l => l.code === langCode);
    const problemCount = allProblems[langCode].length;
    console.log(`   ${lang.name} (${langCode}): ${problemCount}개 질문`);
  });
  
  console.log('\n📋 수정 우선순위:');
  languagesWithProblems
    .sort((a, b) => allProblems[a].length - allProblems[b].length)
    .forEach((langCode, index) => {
      const lang = languageFiles.find(l => l.code === langCode);
      const problemCount = allProblems[langCode].length;
      console.log(`   ${index + 1}. ${lang.name}: ${problemCount}개 질문`);
    });
}

// 다음 수정할 언어 추천
if (languagesWithProblems.length > 0) {
  const nextLang = languagesWithProblems
    .filter(code => !['ko', 'es'].includes(code)) // 이미 수정된 언어 제외
    .sort((a, b) => allProblems[a].length - allProblems[b].length)[0];
  
  if (nextLang) {
    const lang = languageFiles.find(l => l.code === nextLang);
    console.log(`\n🎯 다음 수정 대상: ${lang.name} (${allProblems[nextLang].length}개 질문)`);
  }
}
