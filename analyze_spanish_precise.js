const fs = require('fs');

const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log('🔍 스페인어-영어 1:1 정밀 분석 시작...\n');

let analysisResults = {
  totalQuestions: englishQuestions.length,
  structuralIssues: [],
  translationIssues: [],
  summary: {
    questionsNeedTranslation: 0,
    correctAnswersNeedTranslation: 0,
    wrongAnswersNeedTranslation: 0,
    correctRationaleNeedTranslation: 0,
    wrongRationaleNeedTranslation: 0
  }
};

// 번역이 필요한지 확인하는 함수
function needsTranslation(text) {
  if (!text) return false;
  return text.includes('[Traducción necesaria]') || 
         text.includes('This ') || 
         text.includes('The ') || 
         text.includes('These ') ||
         text.includes('That ') ||
         text.includes('It ') ||
         text.includes('In ') ||
         text.includes('During ') ||
         text.includes('After ') ||
         text.includes('Before ');
}

console.log('📋 질문별 상세 분석 중...\n');

for (let i = 0; i < englishQuestions.length; i++) {
  const englishQ = englishQuestions[i];
  const spanishQ = spanishQuestions[i];
  
  if (!spanishQ) {
    analysisResults.structuralIssues.push({
      questionId: englishQ.id,
      issue: 'Missing Spanish question'
    });
    continue;
  }
  
  if (englishQ.id !== spanishQ.id) {
    analysisResults.structuralIssues.push({
      questionId: englishQ.id,
      issue: `ID mismatch: English(${englishQ.id}) vs Spanish(${spanishQ.id})`
    });
    continue;
  }
  
  console.log(`질문 ${englishQ.id} 분석 중...`);
  
  // 1. 질문 번역 상태 확인
  if (needsTranslation(spanishQ.question)) {
    analysisResults.translationIssues.push({
      questionId: englishQ.id,
      type: 'question',
      spanish: spanishQ.question,
      english: englishQ.question,
      issue: 'Question needs translation'
    });
    analysisResults.summary.questionsNeedTranslation++;
  }
  
  // 2. 정답 개수 확인
  if (englishQ.correctAnswers.length !== spanishQ.correctAnswers.length) {
    analysisResults.structuralIssues.push({
      questionId: englishQ.id,
      issue: `Correct answers count mismatch: English(${englishQ.correctAnswers.length}) vs Spanish(${spanishQ.correctAnswers.length})`
    });
  }
  
  // 3. 정답 1:1 비교
  for (let j = 0; j < Math.max(englishQ.correctAnswers.length, spanishQ.correctAnswers.length); j++) {
    const englishAnswer = englishQ.correctAnswers[j];
    const spanishAnswer = spanishQ.correctAnswers[j];
    
    if (!englishAnswer) {
      analysisResults.structuralIssues.push({
        questionId: englishQ.id,
        issue: `Extra Spanish correct answer at index ${j}`
      });
      continue;
    }
    
    if (!spanishAnswer) {
      analysisResults.structuralIssues.push({
        questionId: englishQ.id,
        issue: `Missing Spanish correct answer at index ${j}`
      });
      continue;
    }
    
    // 정답 텍스트 확인
    if (needsTranslation(spanishAnswer.text)) {
      analysisResults.translationIssues.push({
        questionId: englishQ.id,
        type: 'correctAnswer',
        index: j,
        spanish: spanishAnswer.text,
        english: englishAnswer.text,
        issue: 'Correct answer needs translation'
      });
      analysisResults.summary.correctAnswersNeedTranslation++;
    }
    
    // 정답 설명 확인
    if (needsTranslation(spanishAnswer.rationale)) {
      analysisResults.translationIssues.push({
        questionId: englishQ.id,
        type: 'correctRationale',
        index: j,
        spanish: spanishAnswer.rationale,
        english: englishAnswer.rationale,
        issue: 'Correct answer rationale needs translation'
      });
      analysisResults.summary.correctRationaleNeedTranslation++;
    }
  }
  
  // 4. 오답 개수 확인
  if (englishQ.wrongAnswers.length !== spanishQ.wrongAnswers.length) {
    analysisResults.structuralIssues.push({
      questionId: englishQ.id,
      issue: `Wrong answers count mismatch: English(${englishQ.wrongAnswers.length}) vs Spanish(${spanishQ.wrongAnswers.length})`
    });
  }
  
  // 5. 오답 1:1 비교
  for (let j = 0; j < Math.max(englishQ.wrongAnswers.length, spanishQ.wrongAnswers.length); j++) {
    const englishAnswer = englishQ.wrongAnswers[j];
    const spanishAnswer = spanishQ.wrongAnswers[j];
    
    if (!englishAnswer) {
      analysisResults.structuralIssues.push({
        questionId: englishQ.id,
        issue: `Extra Spanish wrong answer at index ${j}`
      });
      continue;
    }
    
    if (!spanishAnswer) {
      analysisResults.structuralIssues.push({
        questionId: englishQ.id,
        issue: `Missing Spanish wrong answer at index ${j}`
      });
      continue;
    }
    
    // 오답 텍스트 확인
    if (needsTranslation(spanishAnswer.text)) {
      analysisResults.translationIssues.push({
        questionId: englishQ.id,
        type: 'wrongAnswer',
        index: j,
        spanish: spanishAnswer.text,
        english: englishAnswer.text,
        issue: 'Wrong answer needs translation'
      });
      analysisResults.summary.wrongAnswersNeedTranslation++;
    }
    
    // 오답 설명 확인
    if (needsTranslation(spanishAnswer.rationale)) {
      analysisResults.translationIssues.push({
        questionId: englishQ.id,
        type: 'wrongRationale',
        index: j,
        spanish: spanishAnswer.rationale,
        english: englishAnswer.rationale,
        issue: 'Wrong answer rationale needs translation'
      });
      analysisResults.summary.wrongRationaleNeedTranslation++;
    }
  }
}

// 결과 요약
const totalTranslationIssues = analysisResults.summary.questionsNeedTranslation +
                              analysisResults.summary.correctAnswersNeedTranslation +
                              analysisResults.summary.wrongAnswersNeedTranslation +
                              analysisResults.summary.correctRationaleNeedTranslation +
                              analysisResults.summary.wrongRationaleNeedTranslation;

console.log('\n📊 1:1 분석 결과:');
console.log(`  - 전체 질문: ${analysisResults.totalQuestions}개`);
console.log(`  - 구조적 이슈: ${analysisResults.structuralIssues.length}개`);
console.log(`  - 번역 필요 항목: ${totalTranslationIssues}개\n`);

console.log('📋 번역 필요 항목 세부사항:');
console.log(`  - 질문: ${analysisResults.summary.questionsNeedTranslation}개`);
console.log(`  - 정답 텍스트: ${analysisResults.summary.correctAnswersNeedTranslation}개`);
console.log(`  - 오답 텍스트: ${analysisResults.summary.wrongAnswersNeedTranslation}개`);
console.log(`  - 정답 설명: ${analysisResults.summary.correctRationaleNeedTranslation}개`);
console.log(`  - 오답 설명: ${analysisResults.summary.wrongRationaleNeedTranslation}개\n`);

// 구조적 이슈 출력
if (analysisResults.structuralIssues.length > 0) {
  console.log('⚠️  구조적 이슈:');
  analysisResults.structuralIssues.slice(0, 10).forEach((issue, index) => {
    console.log(`  ${index + 1}. 질문 ${issue.questionId}: ${issue.issue}`);
  });
  if (analysisResults.structuralIssues.length > 10) {
    console.log(`  ... 그리고 ${analysisResults.structuralIssues.length - 10}개 더\n`);
  }
} else {
  console.log('✅ 구조적 이슈 없음\n');
}

// 번역 이슈 샘플 출력
if (analysisResults.translationIssues.length > 0) {
  console.log('🔍 번역 필요 항목 샘플 (처음 20개):');
  analysisResults.translationIssues.slice(0, 20).forEach((issue, index) => {
    console.log(`  ${index + 1}. 질문 ${issue.questionId} - ${issue.type}${issue.index !== undefined ? `[${issue.index}]` : ''}`);
    console.log(`     스페인어: ${issue.spanish.substring(0, 80)}...`);
    console.log(`     영어: ${issue.english.substring(0, 80)}...\n`);
  });
  
  if (analysisResults.translationIssues.length > 20) {
    console.log(`  ... 그리고 ${analysisResults.translationIssues.length - 20}개 더\n`);
  }
}

// 특정 질문들 상세 상태 확인
console.log('🔍 주요 질문 번역 상태:');
const checkQuestions = [1, 10, 20, 30, 40, 50, 60, 63, 70, 80, 90, 100];

for (const qId of checkQuestions) {
  const issues = analysisResults.translationIssues.filter(issue => issue.questionId === qId);
  const structuralIssues = analysisResults.structuralIssues.filter(issue => issue.questionId === qId);
  
  const status = issues.length === 0 && structuralIssues.length === 0 ? '✅ 완료' : `❌ ${issues.length + structuralIssues.length}개 이슈`;
  console.log(`  질문 ${qId}: ${status}`);
}

// 완료율 계산
const totalItems = analysisResults.totalQuestions * 7; // 질문 + 정답들 + 오답들 + 설명들 평균
const completionRate = Math.round(((totalItems - totalTranslationIssues) / totalItems) * 100);

console.log(`\n📈 정확한 완료율: ${completionRate}%`);
console.log(`🎯 남은 번역 작업: ${totalTranslationIssues}개 항목`);

// 결과를 파일로 저장
fs.writeFileSync('./spanish_precise_analysis.json', JSON.stringify(analysisResults, null, 2));

console.log('\n💾 상세 분석 결과가 spanish_precise_analysis.json에 저장되었습니다.');

// 번역 우선순위 제안
console.log('\n🎯 번역 우선순위 제안:');
console.log('1. 질문 번역 (사용자가 가장 먼저 보는 부분)');
console.log('2. 정답 텍스트 (학습 효과에 직접적 영향)');
console.log('3. 정답 설명 (이해도 향상)');
console.log('4. 오답 설명 (혼동 방지)');
