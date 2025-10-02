const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log('🔍 스페인어 파일 실제 번역 상태 확인...\n');

let stats = {
  totalQuestions: spanishQuestions.length,
  questionsNeedTranslation: 0,
  correctAnswersNeedTranslation: 0,
  wrongAnswersNeedTranslation: 0,
  rationaleNeedTranslation: 0,
  englishTextRemaining: 0
};

let untranslatedItems = [];

for (const question of spanishQuestions) {
  // 질문 확인
  if (question.question.includes('[Traducción necesaria]')) {
    stats.questionsNeedTranslation++;
    untranslatedItems.push({
      questionId: question.id,
      type: 'question',
      text: question.question
    });
  }
  
  // 정답 확인
  for (let i = 0; i < question.correctAnswers.length; i++) {
    const answer = question.correctAnswers[i];
    if (answer.text.includes('[Traducción necesaria]')) {
      stats.correctAnswersNeedTranslation++;
      untranslatedItems.push({
        questionId: question.id,
        type: 'correctAnswer',
        index: i,
        text: answer.text
      });
    }
    if (answer.rationale.includes('[Traducción necesaria]') || 
        (answer.rationale.includes('This ') || answer.rationale.includes('The ') || answer.rationale.includes('These '))) {
      stats.rationaleNeedTranslation++;
      untranslatedItems.push({
        questionId: question.id,
        type: 'correctRationale',
        index: i,
        text: answer.rationale
      });
    }
  }
  
  // 오답 확인
  for (let i = 0; i < question.wrongAnswers.length; i++) {
    const answer = question.wrongAnswers[i];
    if (answer.text.includes('[Traducción necesaria]')) {
      stats.wrongAnswersNeedTranslation++;
      untranslatedItems.push({
        questionId: question.id,
        type: 'wrongAnswer',
        index: i,
        text: answer.text
      });
    }
    if (answer.rationale.includes('[Traducción necesaria]') || 
        (answer.rationale.includes('This ') || answer.rationale.includes('The ') || answer.rationale.includes('These '))) {
      stats.rationaleNeedTranslation++;
      untranslatedItems.push({
        questionId: question.id,
        type: 'wrongRationale',
        index: i,
        text: answer.rationale
      });
    }
  }
}

stats.totalUntranslated = untranslatedItems.length;

console.log('📊 실제 번역 상태:');
console.log(`  - 전체 질문: ${stats.totalQuestions}개`);
console.log(`  - 번역 필요한 질문: ${stats.questionsNeedTranslation}개`);
console.log(`  - 번역 필요한 정답: ${stats.correctAnswersNeedTranslation}개`);
console.log(`  - 번역 필요한 오답: ${stats.wrongAnswersNeedTranslation}개`);
console.log(`  - 번역 필요한 설명: ${stats.rationaleNeedTranslation}개`);
console.log(`  - 총 번역 필요 항목: ${stats.totalUntranslated}개\n`);

// 처음 20개 미번역 항목 표시
console.log('🔍 미번역 항목 샘플 (처음 20개):');
for (let i = 0; i < Math.min(20, untranslatedItems.length); i++) {
  const item = untranslatedItems[i];
  console.log(`  ${i+1}. 질문 ${item.questionId} - ${item.type}: ${item.text.substring(0, 80)}...`);
}

if (untranslatedItems.length > 20) {
  console.log(`  ... 그리고 ${untranslatedItems.length - 20}개 더`);
}

// 특정 질문들 상세 확인
console.log('\n🔍 특정 질문 상세 확인:');
const checkQuestions = [1, 10, 20, 30, 40, 50, 60, 63, 70, 80, 90, 100];

for (const qId of checkQuestions) {
  const q = spanishQuestions.find(question => question.id === qId);
  if (q) {
    const needsTranslation = q.question.includes('[Traducción necesaria]') ||
                           q.correctAnswers.some(a => a.text.includes('[Traducción necesaria]')) ||
                           q.wrongAnswers.some(a => a.text.includes('[Traducción necesaria]'));
    
    console.log(`  질문 ${qId}: ${needsTranslation ? '❌ 번역 필요' : '✅ 번역 완료'}`);
    if (needsTranslation && qId <= 10) {
      console.log(`    질문: ${q.question}`);
    }
  }
}

// 결과 저장
fs.writeFileSync('./spanish_actual_status.json', JSON.stringify({
  stats,
  untranslatedItems: untranslatedItems.slice(0, 100) // 처음 100개만 저장
}, null, 2));

console.log('\n💾 실제 상태가 spanish_actual_status.json에 저장되었습니다.');

const completionRate = Math.round(((stats.totalQuestions * 7 - stats.totalUntranslated) / (stats.totalQuestions * 7)) * 100);
console.log(`\n📈 실제 완료율: ${completionRate}%`);
console.log(`🎯 남은 작업: ${stats.totalUntranslated}개 항목`);
