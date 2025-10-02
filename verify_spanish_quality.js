const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));

console.log('🔍 스페인어 번역 품질 검증 시작...\n');

let qualityIssues = [];
let translationStats = {
  totalQuestions: spanishQuestions.length,
  fullyTranslated: 0,
  partiallyTranslated: 0,
  untranslated: 0,
  qualityIssues: 0
};

// 각 질문 검증
for (let i = 0; i < spanishQuestions.length; i++) {
  const spanishQ = spanishQuestions[i];
  const englishQ = englishQuestions[i];
  
  if (!englishQ || spanishQ.id !== englishQ.id) {
    qualityIssues.push({
      questionId: spanishQ.id,
      type: 'structure',
      issue: 'ID mismatch with English version'
    });
    continue;
  }
  
  let questionStatus = {
    questionTranslated: spanishQ.question !== '[Traducción necesaria]',
    correctAnswersTranslated: 0,
    wrongAnswersTranslated: 0,
    rationaleTranslated: 0,
    totalCorrectAnswers: spanishQ.correctAnswers.length,
    totalWrongAnswers: spanishQ.wrongAnswers.length,
    totalRationale: spanishQ.correctAnswers.length + spanishQ.wrongAnswers.length
  };
  
  // 정답 확인
  for (const answer of spanishQ.correctAnswers) {
    if (answer.text !== '[Traducción necesaria]') {
      questionStatus.correctAnswersTranslated++;
    }
    if (answer.rationale !== '[Traducción necesaria]') {
      questionStatus.rationaleTranslated++;
    }
    
    // 품질 이슈 확인
    if (answer.text === answer.rationale) {
      qualityIssues.push({
        questionId: spanishQ.id,
        type: 'quality',
        issue: 'Correct answer text same as rationale'
      });
    }
  }
  
  // 오답 확인
  for (const answer of spanishQ.wrongAnswers) {
    if (answer.text !== '[Traducción necesaria]') {
      questionStatus.wrongAnswersTranslated++;
    }
    if (answer.rationale !== '[Traducción necesaria]') {
      questionStatus.rationaleTranslated++;
    }
    
    // 품질 이슈 확인
    if (answer.text === answer.rationale) {
      qualityIssues.push({
        questionId: spanishQ.id,
        type: 'quality',
        issue: 'Wrong answer text same as rationale'
      });
    }
  }
  
  // 답변 개수 확인
  if (spanishQ.correctAnswers.length !== englishQ.correctAnswers.length) {
    qualityIssues.push({
      questionId: spanishQ.id,
      type: 'structure',
      issue: `Correct answers count mismatch: Spanish(${spanishQ.correctAnswers.length}) vs English(${englishQ.correctAnswers.length})`
    });
  }
  
  if (spanishQ.wrongAnswers.length !== englishQ.wrongAnswers.length) {
    qualityIssues.push({
      questionId: spanishQ.id,
      type: 'structure',
      issue: `Wrong answers count mismatch: Spanish(${spanishQ.wrongAnswers.length}) vs English(${englishQ.wrongAnswers.length})`
    });
  }
  
  // 번역 상태 분류
  const totalItems = 1 + questionStatus.totalCorrectAnswers + questionStatus.totalWrongAnswers + questionStatus.totalRationale;
  const translatedItems = (questionStatus.questionTranslated ? 1 : 0) + 
                         questionStatus.correctAnswersTranslated + 
                         questionStatus.wrongAnswersTranslated + 
                         questionStatus.rationaleTranslated;
  
  if (translatedItems === totalItems) {
    translationStats.fullyTranslated++;
  } else if (translatedItems > 0) {
    translationStats.partiallyTranslated++;
  } else {
    translationStats.untranslated++;
  }
}

translationStats.qualityIssues = qualityIssues.length;

// 결과 출력
console.log('📊 번역 상태 통계:');
console.log(`  - 전체 질문: ${translationStats.totalQuestions}개`);
console.log(`  - 완전 번역: ${translationStats.fullyTranslated}개 (${Math.round(translationStats.fullyTranslated/translationStats.totalQuestions*100)}%)`);
console.log(`  - 부분 번역: ${translationStats.partiallyTranslated}개`);
console.log(`  - 미번역: ${translationStats.untranslated}개`);
console.log(`  - 품질 이슈: ${translationStats.qualityIssues}개\n`);

// 품질 이슈 상세 출력
if (qualityIssues.length > 0) {
  console.log('⚠️  발견된 품질 이슈:');
  const issuesByType = {};
  
  for (const issue of qualityIssues) {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  }
  
  for (const [type, issues] of Object.entries(issuesByType)) {
    console.log(`\n${type.toUpperCase()} 이슈 (${issues.length}개):`);
    issues.slice(0, 10).forEach(issue => {
      console.log(`  - 질문 ${issue.questionId}: ${issue.issue}`);
    });
    if (issues.length > 10) {
      console.log(`  ... 그리고 ${issues.length - 10}개 더`);
    }
  }
} else {
  console.log('✅ 품질 이슈가 발견되지 않았습니다!');
}

// 샘플 번역 확인
console.log('\n🔍 샘플 번역 확인 (처음 5개 질문):');
for (let i = 0; i < Math.min(5, spanishQuestions.length); i++) {
  const q = spanishQuestions[i];
  console.log(`\n질문 ${q.id}:`);
  console.log(`  스페인어: ${q.question}`);
  console.log(`  정답: ${q.correctAnswers[0]?.text || 'N/A'}`);
  console.log(`  오답: ${q.wrongAnswers[0]?.text || 'N/A'}`);
}

// 결과를 파일로 저장
const verificationResult = {
  timestamp: new Date().toISOString(),
  stats: translationStats,
  qualityIssues: qualityIssues,
  status: qualityIssues.length === 0 ? 'PASSED' : 'NEEDS_REVIEW'
};

fs.writeFileSync('./spanish_quality_verification.json', JSON.stringify(verificationResult, null, 2));

console.log('\n💾 검증 결과가 spanish_quality_verification.json에 저장되었습니다.');
console.log('\n🎯 최종 상태:', verificationResult.status === 'PASSED' ? '✅ 품질 검증 통과' : '⚠️  검토 필요');
