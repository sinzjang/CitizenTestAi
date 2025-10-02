const fs = require('fs');

// 모든 언어 파일 정보
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

// 날짜 패턴들 (다국어 지원)
const datePatterns = [
  // 영어 날짜
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/gi,
  // 숫자 날짜
  /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/g,
  // 간단한 날짜
  /\b\w+\s+\d{1,2},\s+\d{4}\b/g,
  // 한국어 날짜 패턴
  /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/g,
  // 스페인어 월 이름
  /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{1,2},?\s+\d{4}\b/gi,
  // 프랑스어 월 이름
  /\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{1,2},?\s+\d{4}\b/gi
];

// 실제 옵션 개수 계산 (날짜 내 콤마 제외)
function countActualOptions(text) {
  let cleanText = text;
  
  // 모든 날짜 패턴에서 콤마를 임시로 교체
  datePatterns.forEach(pattern => {
    cleanText = cleanText.replace(pattern, (match) => match.replace(/,/g, '|DATECOMMA|'));
  });
  
  // 실제 옵션 구분자인 콤마만 계산
  const actualCommas = (cleanText.match(/,/g) || []).length;
  return actualCommas + 1;
}

console.log('=== 모든 언어 파일 구조적 문제 상세 분석 ===\n');

const allLanguageProblems = {};
let totalProblems = 0;

// 각 언어별 분석
languageFiles.forEach(lang => {
  console.log(`📁 ${lang.name} (${lang.code}) 분석 중...`);
  
  try {
    const data = JSON.parse(fs.readFileSync(lang.path, 'utf8'));
    const problems = [];
    
    data.forEach((question, index) => {
      const correctAnswerCount = question.correctAnswers ? question.correctAnswers.length : 0;
      
      if (question.wrongAnswers) {
        question.wrongAnswers.forEach((wrongAnswer, wrongIndex) => {
          const wrongAnswerText = wrongAnswer.text || wrongAnswer[`text_${lang.code}`] || '';
          const actualOptionCount = countActualOptions(wrongAnswerText);
          
          if (actualOptionCount !== correctAnswerCount) {
            problems.push({
              questionId: question.id,
              questionIndex: index,
              wrongAnswerIndex: wrongIndex,
              correctAnswerCount: correctAnswerCount,
              wrongAnswerOptionCount: actualOptionCount,
              wrongAnswerText: wrongAnswerText,
              question: question.question || question[`question_${lang.code}`] || 'No question text'
            });
          }
        });
      }
    });
    
    allLanguageProblems[lang.code] = {
      language: lang.name,
      problems: problems,
      totalQuestions: data.length
    };
    
    console.log(`   총 질문: ${data.length}개`);
    console.log(`   구조적 문제: ${problems.length}개`);
    
    if (problems.length > 0) {
      // 문제 질문 ID들 추출
      const problemQuestionIds = [...new Set(problems.map(p => p.questionId))].sort((a, b) => a - b);
      console.log(`   문제 질문 IDs: ${problemQuestionIds.slice(0, 10).join(', ')}${problemQuestionIds.length > 10 ? ` ... (총 ${problemQuestionIds.length}개)` : ''}`);
    } else {
      console.log(`   ✅ 모든 질문이 올바른 구조!`);
    }
    
    totalProblems += problems.length;
    
  } catch (error) {
    console.log(`   ❌ 파일 읽기 실패: ${error.message}`);
    allLanguageProblems[lang.code] = { language: lang.name, problems: [], error: error.message };
  }
  
  console.log('');
});

console.log('=== 전체 요약 ===');
console.log(`총 구조적 문제: ${totalProblems}개\n`);

// 언어별 문제 순위
const languagesByProblems = Object.keys(allLanguageProblems)
  .filter(code => !allLanguageProblems[code].error)
  .sort((a, b) => allLanguageProblems[b].problems.length - allLanguageProblems[a].problems.length);

console.log('📊 언어별 문제 순위:');
languagesByProblems.forEach((code, index) => {
  const langData = allLanguageProblems[code];
  const status = langData.problems.length === 0 ? '✅' : '🔴';
  console.log(`   ${index + 1}. ${status} ${langData.language}: ${langData.problems.length}개 문제`);
});

// 가장 문제가 많은 언어 상세 분석
if (languagesByProblems.length > 0) {
  const mostProblematicLang = languagesByProblems[0];
  const langData = allLanguageProblems[mostProblematicLang];
  
  if (langData.problems.length > 0) {
    console.log(`\n=== ${langData.language} 상세 문제 분석 ===`);
    
    // 문제를 질문별로 그룹화
    const problemsByQuestion = {};
    langData.problems.forEach(problem => {
      if (!problemsByQuestion[problem.questionId]) {
        problemsByQuestion[problem.questionId] = [];
      }
      problemsByQuestion[problem.questionId].push(problem);
    });
    
    const questionIds = Object.keys(problemsByQuestion).map(id => parseInt(id)).sort((a, b) => a - b);
    
    console.log(`총 ${questionIds.length}개 질문에 문제가 있습니다.\n`);
    
    // 처음 10개 질문만 상세 표시
    questionIds.slice(0, 10).forEach(questionId => {
      const problems = problemsByQuestion[questionId];
      const firstProblem = problems[0];
      
      console.log(`🔴 질문 ${questionId}: "${firstProblem.question.substring(0, 60)}${firstProblem.question.length > 60 ? '...' : ''}"`);
      console.log(`   정답 개수: ${firstProblem.correctAnswerCount}개`);
      console.log(`   문제가 있는 오답들:`);
      
      problems.forEach(problem => {
        console.log(`     오답 ${problem.wrongAnswerIndex + 1}: ${problem.wrongAnswerOptionCount}개 옵션 (${problem.correctAnswerCount}개 필요)`);
        console.log(`       텍스트: "${problem.wrongAnswerText.substring(0, 80)}${problem.wrongAnswerText.length > 80 ? '...' : ''}"`);
      });
      console.log('');
    });
    
    if (questionIds.length > 10) {
      console.log(`... 그 외 ${questionIds.length - 10}개 질문 더 있음\n`);
    }
    
    // 정답 개수별 분류
    console.log('=== 정답 개수별 문제 분류 ===');
    const by1Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 1);
    const by2Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 2);
    const by3Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 3);
    const by4Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 4);
    const by5Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 5);
    
    if (by1Correct.length > 0) {
      console.log(`⚪ 1개 정답 질문들 (${by1Correct.length}개): ${by1Correct.join(', ')}`);
    }
    if (by2Correct.length > 0) {
      console.log(`🟠 2개 정답 질문들 (${by2Correct.length}개): ${by2Correct.join(', ')}`);
    }
    if (by3Correct.length > 0) {
      console.log(`🟡 3개 정답 질문들 (${by3Correct.length}개): ${by3Correct.join(', ')}`);
    }
    if (by4Correct.length > 0) {
      console.log(`🟢 4개 정답 질문들 (${by4Correct.length}개): ${by4Correct.join(', ')}`);
    }
    if (by5Correct.length > 0) {
      console.log(`🔵 5개 정답 질문들 (${by5Correct.length}개): ${by5Correct.join(', ')}`);
    }
  }
}

// 수정 우선순위 추천
console.log('\n=== 수정 우선순위 추천 ===');
const languagesToFix = languagesByProblems.filter(code => allLanguageProblems[code].problems.length > 0);

if (languagesToFix.length === 0) {
  console.log('🎉 모든 언어가 완벽한 구조를 가지고 있습니다!');
} else {
  console.log('다음 순서로 수정하는 것을 추천합니다:');
  languagesToFix.forEach((code, index) => {
    const langData = allLanguageProblems[code];
    console.log(`   ${index + 1}. ${langData.language}: ${langData.problems.length}개 문제`);
  });
  
  const nextLang = languagesToFix[0];
  const nextLangData = allLanguageProblems[nextLang];
  console.log(`\n🎯 다음 수정 대상: ${nextLangData.language} (${nextLangData.problems.length}개 문제)`);
}

// 결과를 JSON 파일로 저장
const analysisResult = {
  timestamp: new Date().toISOString(),
  totalProblems: totalProblems,
  languageAnalysis: allLanguageProblems,
  recommendedOrder: languagesToFix.map(code => ({
    code: code,
    language: allLanguageProblems[code].language,
    problemCount: allLanguageProblems[code].problems.length
  }))
};

fs.writeFileSync('./structural_analysis_result.json', JSON.stringify(analysisResult, null, 2), 'utf8');
console.log('\n📁 상세 분석 결과가 structural_analysis_result.json에 저장되었습니다.');
