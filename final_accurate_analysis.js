const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));

console.log('🔍 스페인어 질문 최종 정확한 분석...\n');

// 정확한 혼재 패턴 감지 함수 (스페인어 "a" 전치사 제외)
function detectAccurateMixedLanguage(text) {
  if (!text) return [];
  
  const issues = [];
  
  // 영어 단어들이 스페인어 문장에 섞여있는 패턴들 (스페인어 "a" 전치사 제외)
  const englishPatterns = [
    // 전치사 (스페인어 "a" 제외)
    { pattern: /\bat\b/g, issue: '영어 전치사 "at"' },
    { pattern: /\bin\b/g, issue: '영어 전치사 "in"' },
    { pattern: /\bof\b/g, issue: '영어 전치사 "of"' },
    { pattern: /\bfor\b/g, issue: '영어 전치사 "for"' },
    { pattern: /\bto\b/g, issue: '영어 전치사 "to"' },
    { pattern: /\bwith\b/g, issue: '영어 전치사 "with"' },
    { pattern: /\bfrom\b/g, issue: '영어 전치사 "from"' },
    { pattern: /\bafter\b/g, issue: '영어 전치사 "after"' },
    { pattern: /\bbefore\b/g, issue: '영어 전치사 "before"' },
    { pattern: /\bduring\b/g, issue: '영어 전치사 "during"' },
    { pattern: /\bon\b/g, issue: '영어 전치사 "on"' },
    
    // 동사
    { pattern: /\bis\b/g, issue: '영어 동사 "is"' },
    { pattern: /\bare\b/g, issue: '영어 동사 "are"' },
    { pattern: /\bwas\b/g, issue: '영어 동사 "was"' },
    { pattern: /\bwere\b/g, issue: '영어 동사 "were"' },
    { pattern: /\bhas\b/g, issue: '영어 동사 "has"' },
    { pattern: /\bhave\b/g, issue: '영어 동사 "have"' },
    { pattern: /\bcan\b/g, issue: '영어 조동사 "can"' },
    { pattern: /\bwill\b/g, issue: '영어 조동사 "will"' },
    { pattern: /\bwould\b/g, issue: '영어 조동사 "would"' },
    { pattern: /\bmust\b/g, issue: '영어 조동사 "must"' },
    { pattern: /\bended\b/g, issue: '영어 동사 "ended"' },
    { pattern: /\bbegun\b/g, issue: '영어 동사 "begun"' },
    { pattern: /\bstarted\b/g, issue: '영어 동사 "started"' },
    { pattern: /\bhappened\b/g, issue: '영어 동사 "happened"' },
    { pattern: /\boccurred\b/g, issue: '영어 동사 "occurred"' },
    { pattern: /\btook place\b/g, issue: '영어 구문 "took place"' },
    { pattern: /\bwent into effect\b/g, issue: '영어 구문 "went into effect"' },
    { pattern: /\bdid\b/g, issue: '영어 조동사 "did"' },
    { pattern: /\bwrote\b/g, issue: '영어 동사 "wrote"' },
    { pattern: /\blived\b/g, issue: '영어 동사 "lived"' },
    { pattern: /\bfought\b/g, issue: '영어 동사 "fought"' },
    { pattern: /\btried\b/g, issue: '영어 동사 "tried"' },
    
    // 관사 (스페인어 "a" 전치사는 제외, 명확한 영어 관사만)
    { pattern: /\bthe\b/g, issue: '영어 관사 "the"' },
    { pattern: /\ban\b/g, issue: '영어 관사 "an"' },
    // "a" 관사는 스페인어 전치사와 구별하기 어려우므로 제외
    
    // 접속사
    { pattern: /\band\b/g, issue: '영어 접속사 "and"' },
    { pattern: /\bbut\b/g, issue: '영어 접속사 "but"' },
    { pattern: /\bor\b/g, issue: '영어 접속사 "or"' },
    
    // 의문사 (문장 시작이 아닌 경우만)
    { pattern: /(?<!^)\bwhen\b/gi, issue: '영어 의문사 "when"' },
    { pattern: /(?<!^)\bwhere\b/gi, issue: '영어 의문사 "where"' },
    { pattern: /(?<!^)\bwhat\b/gi, issue: '영어 의문사 "what"' },
    { pattern: /(?<!^)\bwho\b/gi, issue: '영어 의문사 "who"' },
    { pattern: /(?<!^)\bwhy\b/gi, issue: '영어 의문사 "why"' },
    { pattern: /(?<!^)\bhow\b/gi, issue: '영어 의문사 "how"' },
    
    // 기타 명확한 영어 단어들
    { pattern: /\byear\b/g, issue: '영어 단어 "year"' },
    { pattern: /\bgovernment\b/g, issue: '영어 단어 "government"' },
    { pattern: /\bofficial\b/g, issue: '영어 단어 "official"' },
    { pattern: /\bformed\b/g, issue: '영어 단어 "formed"' },
    { pattern: /\badopted\b/g, issue: '영어 단어 "adopted"' },
    { pattern: /\bratified\b/g, issue: '영어 단어 "ratified"' },
    { pattern: /\babolishing\b/g, issue: '영어 단어 "abolishing"' },
    { pattern: /\bslavery\b/g, issue: '영어 단어 "slavery"' },
    { pattern: /\bwritten\b/gi, issue: '영어 단어 "written"' },
    { pattern: /\bconvention\b/gi, issue: '영어 단어 "convention"' },
    { pattern: /\bregister\b/g, issue: '영어 단어 "register"' },
    { pattern: /\bsend\b/g, issue: '영어 단어 "send"' },
    { pattern: /\btax\b/g, issue: '영어 단어 "tax"' },
    { pattern: /\bforms\b/g, issue: '영어 단어 "forms"' },
    { pattern: /\blast\b/g, issue: '영어 단어 "last"' },
    { pattern: /\bday\b/g, issue: '영어 단어 "day"' },
    { pattern: /\byou\b/g, issue: '영어 대명사 "you"' },
    { pattern: /\bpuede\b/g, issue: '혼재: "puede" (스페인어 동사가 영어 문맥에서 사용됨)' },
    { pattern: /\ben\b(?=\s+federal)/g, issue: '영어 전치사 "en" (federal 앞에서)' },
    { pattern: /\bfederal\b/g, issue: '영어 단어 "federal"' },
    { pattern: /\bincome\b/g, issue: '영어 단어 "income"' },
    { pattern: /\bJanuary\b/g, issue: '영어 월 이름 "January"' },
    { pattern: /\bDecember\b/g, issue: '영어 월 이름 "December"' },
    { pattern: /\bJuly\b/g, issue: '영어 월 이름 "July"' },
    { pattern: /\bApril\b/g, issue: '영어 월 이름 "April"' },
    { pattern: /\bNew Year's Day\b/g, issue: '영어 구문 "New Year\'s Day"' },
    { pattern: /\bend\b/g, issue: '영어 단어 "end"' },
    { pattern: /\bAge\b/g, issue: '영어 단어 "Age"' },
    { pattern: /\beighteen\b/g, issue: '영어 숫자 "eighteen"' },
    { pattern: /\btwenty-six\b/g, issue: '영어 숫자 "twenty-six"' }
  ];
  
  // 스페인어 문장에서 영어 패턴 찾기
  for (const {pattern, issue} of englishPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      issues.push(`${issue} (${matches.length}회)`);
    }
  }
  
  // 철자 오류 감지
  const spellingErrors = [
    { pattern: /Constituciónal/g, issue: '철자 오류: "Constituciónal" → "Constitutional"' },
    { pattern: /díun/g, issue: '철자 오류: "díun" → "día"' },
    { pattern: /un(?=\s+(?:register|send|escape|acquire|better|new|major|participate))/g, issue: '혼재: "un" (영어 문맥에서 사용됨)' }
  ];
  
  for (const {pattern, issue} of spellingErrors) {
    if (pattern.test(text)) {
      issues.push(issue);
    }
  }
  
  return issues;
}

// 전체 분석 결과 저장
const analysisResults = {
  totalQuestions: 100,
  questionsWithIssues: [],
  summary: {
    questionsWithMixedLanguage: 0,
    questionsWithGrammarIssues: 0,
    totalIssuesFound: 0
  }
};

console.log('📋 질문별 정확한 분석 중...\n');

// 각 질문 분석
for (let i = 0; i < spanishQuestions.length; i++) {
  const spanishQ = spanishQuestions[i];
  const englishQ = englishQuestions.find(q => q.id === spanishQ.id);
  
  if (!englishQ) {
    console.log(`⚠️  질문 ${spanishQ.id}: 영어 원본을 찾을 수 없음`);
    continue;
  }
  
  const questionIssues = {
    id: spanishQ.id,
    question: spanishQ.question,
    issues: {
      question: [],
      correctAnswers: [],
      wrongAnswers: []
    },
    totalIssues: 0
  };
  
  // 질문 분석
  const questionMixed = detectAccurateMixedLanguage(spanishQ.question);
  if (questionMixed.length > 0) {
    questionIssues.issues.question = questionMixed;
    questionIssues.totalIssues += questionMixed.length;
  }
  
  // 정답 분석
  spanishQ.correctAnswers.forEach((answer, index) => {
    const textMixed = detectAccurateMixedLanguage(answer.text);
    const rationaleMixed = detectAccurateMixedLanguage(answer.rationale);
    
    if (textMixed.length > 0 || rationaleMixed.length > 0) {
      questionIssues.issues.correctAnswers.push({
        index,
        text: answer.text,
        rationale: answer.rationale,
        textIssues: textMixed,
        rationaleIssues: rationaleMixed
      });
      questionIssues.totalIssues += textMixed.length + rationaleMixed.length;
    }
  });
  
  // 오답 분석
  spanishQ.wrongAnswers.forEach((answer, index) => {
    const textMixed = detectAccurateMixedLanguage(answer.text);
    const rationaleMixed = detectAccurateMixedLanguage(answer.rationale);
    
    if (textMixed.length > 0 || rationaleMixed.length > 0) {
      questionIssues.issues.wrongAnswers.push({
        index,
        text: answer.text,
        rationale: answer.rationale,
        textIssues: textMixed,
        rationaleIssues: rationaleMixed
      });
      questionIssues.totalIssues += textMixed.length + rationaleMixed.length;
    }
  });
  
  // 이슈가 있는 질문만 결과에 추가
  if (questionIssues.totalIssues > 0) {
    analysisResults.questionsWithIssues.push(questionIssues);
    analysisResults.summary.totalIssuesFound += questionIssues.totalIssues;
    
    if (questionIssues.issues.question.length > 0) {
      analysisResults.summary.questionsWithMixedLanguage++;
    }
    if (questionIssues.issues.correctAnswers.length > 0 || questionIssues.issues.wrongAnswers.length > 0) {
      analysisResults.summary.questionsWithGrammarIssues++;
    }
    
    console.log(`🚨 질문 ${spanishQ.id}: ${questionIssues.totalIssues}개 실제 이슈 발견`);
    
    // 주요 이슈들 미리보기
    if (questionIssues.issues.question.length > 0) {
      console.log(`   📝 질문: ${questionIssues.issues.question.slice(0, 3).join(', ')}${questionIssues.issues.question.length > 3 ? '...' : ''}`);
    }
    if (questionIssues.issues.correctAnswers.length > 0) {
      console.log(`   ✅ 정답: ${questionIssues.issues.correctAnswers.length}개 답변에서 이슈`);
    }
    if (questionIssues.issues.wrongAnswers.length > 0) {
      console.log(`   ❌ 오답: ${questionIssues.issues.wrongAnswers.length}개 답변에서 이슈`);
    }
  }
  
  // 진행률 표시
  if ((i + 1) % 25 === 0) {
    console.log(`📊 진행률: ${i + 1}/100 (${Math.round((i + 1)/100*100)}%)`);
  }
}

// 결과 저장
fs.writeFileSync('./spanish_final_accurate_analysis.json', JSON.stringify(analysisResults, null, 2));

console.log(`\n🎉 정확한 분석 완료!`);
console.log(`📊 분석 결과:`);
console.log(`  - 전체 질문: ${analysisResults.totalQuestions}개`);
console.log(`  - 실제 이슈가 있는 질문: ${analysisResults.questionsWithIssues.length}개`);
console.log(`  - 혼재 언어 문제: ${analysisResults.summary.questionsWithMixedLanguage}개 질문`);
console.log(`  - 문법 문제: ${analysisResults.summary.questionsWithGrammarIssues}개 질문`);
console.log(`  - 총 실제 이슈: ${analysisResults.summary.totalIssuesFound}개`);

if (analysisResults.questionsWithIssues.length === 0) {
  console.log(`\n🎉🎉🎉 축하합니다! 스페인어 번역 100% 완성! 🎉🎉🎉`);
  console.log(`✅ 모든 질문이 완벽하게 번역되었습니다!`);
} else {
  console.log(`\n🔍 남은 실제 문제들:`);
  analysisResults.questionsWithIssues.forEach((q, index) => {
    console.log(`  ${index + 1}. 질문 ${q.id}: ${q.totalIssues}개 실제 이슈`);
    console.log(`     "${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}"`);
  });
}

console.log(`\n💾 정확한 분석 결과가 spanish_final_accurate_analysis.json에 저장되었습니다.`);
