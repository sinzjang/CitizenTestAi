const fs = require('fs');

// 영어 템플릿과 스페인어 파일 로드
const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log('🔍 스페인어 번역 구조 분석 시작...\n');

// 구조적 문제 분석
const structuralIssues = [];
const translationIssues = [];

function countCommas(text) {
  if (!text) return 0;
  // 날짜 패턴 내의 콤마는 제외 (예: "December 7, 1941")
  const datePattern = /\b\w+\s+\d{1,2},\s+\d{4}\b/g;
  let cleanText = text.replace(datePattern, (match) => match.replace(/,/g, ''));
  return (cleanText.match(/,/g) || []).length;
}

englishQuestions.forEach((enQ, index) => {
  const esQ = spanishQuestions[index];
  
  if (!esQ || enQ.id !== esQ.id) {
    structuralIssues.push({
      id: enQ.id,
      issue: 'ID 불일치 또는 누락',
      english: enQ.id,
      spanish: esQ?.id || 'missing'
    });
    return;
  }

  // 정답 개수 비교
  const enCorrectCount = enQ.correctAnswers.length;
  const esCorrectCount = esQ.correctAnswers.length;
  
  if (enCorrectCount !== esCorrectCount) {
    structuralIssues.push({
      id: enQ.id,
      issue: '정답 개수 불일치',
      english: enCorrectCount,
      spanish: esCorrectCount
    });
  }

  // 오답 개수 비교
  const enWrongCount = enQ.wrongAnswers.length;
  const esWrongCount = esQ.wrongAnswers.length;
  
  if (enWrongCount !== esWrongCount) {
    structuralIssues.push({
      id: enQ.id,
      issue: '오답 개수 불일치',
      english: enWrongCount,
      spanish: esWrongCount
    });
  }

  // 다중 정답의 경우 오답 옵션 수 확인
  enQ.correctAnswers.forEach((correctAnswer, correctIndex) => {
    const correspondingWrongAnswer = esQ.wrongAnswers[correctIndex];
    if (correspondingWrongAnswer) {
      const enCommaCount = countCommas(correctAnswer.text);
      const esCommaCount = countCommas(correspondingWrongAnswer.text);
      
      if (enCommaCount !== esCommaCount) {
        structuralIssues.push({
          id: enQ.id,
          issue: `오답 ${correctIndex + 1}번 옵션 수 불일치`,
          english: `${enCommaCount + 1}개 옵션`,
          spanish: `${esCommaCount + 1}개 옵션`,
          englishText: correctAnswer.text,
          spanishText: correspondingWrongAnswer.text
        });
      }
    }
  });

  // 번역 품질 검사
  if (esQ.question === enQ.question) {
    translationIssues.push({
      id: enQ.id,
      issue: '질문 미번역',
      text: esQ.question
    });
  }

  esQ.correctAnswers.forEach((answer, idx) => {
    if (answer.text === enQ.correctAnswers[idx]?.text) {
      translationIssues.push({
        id: enQ.id,
        issue: `정답 ${idx + 1} 미번역`,
        text: answer.text
      });
    }
    if (answer.rationale === enQ.correctAnswers[idx]?.rationale) {
      translationIssues.push({
        id: enQ.id,
        issue: `정답 ${idx + 1} 설명 미번역`,
        text: answer.rationale
      });
    }
  });
});

// 결과 출력
console.log('📊 구조적 문제 분석 결과:');
if (structuralIssues.length === 0) {
  console.log('✅ 구조적 문제 없음');
} else {
  console.log(`❌ ${structuralIssues.length}개 구조적 문제 발견:`);
  structuralIssues.forEach(issue => {
    console.log(`  - 문제 ${issue.id}: ${issue.issue}`);
    console.log(`    영어: ${issue.english}`);
    console.log(`    스페인어: ${issue.spanish}`);
    if (issue.englishText) {
      console.log(`    영어 텍스트: ${issue.englishText.substring(0, 50)}...`);
      console.log(`    스페인어 텍스트: ${issue.spanishText.substring(0, 50)}...`);
    }
    console.log('');
  });
}

console.log('\n📝 번역 품질 분석 결과:');
if (translationIssues.length === 0) {
  console.log('✅ 번역 품질 문제 없음');
} else {
  console.log(`❌ ${translationIssues.length}개 번역 문제 발견:`);
  translationIssues.slice(0, 10).forEach(issue => {
    console.log(`  - 문제 ${issue.id}: ${issue.issue}`);
    console.log(`    텍스트: ${issue.text.substring(0, 80)}...`);
  });
  if (translationIssues.length > 10) {
    console.log(`  ... 및 ${translationIssues.length - 10}개 추가 문제`);
  }
}

// 구조적 문제가 있는 경우 상세 분석 결과를 파일로 저장
if (structuralIssues.length > 0) {
  const analysisResult = {
    timestamp: new Date().toISOString(),
    totalQuestions: englishQuestions.length,
    structuralIssues: structuralIssues,
    translationIssues: translationIssues.slice(0, 20) // 처음 20개만 저장
  };
  
  fs.writeFileSync('./spanish_analysis_result.json', JSON.stringify(analysisResult, null, 2));
  console.log('\n📁 상세 분석 결과가 spanish_analysis_result.json에 저장되었습니다.');
}

console.log('\n🎯 다음 단계 권장사항:');
if (structuralIssues.length > 0) {
  console.log('1. 구조적 문제 수정 스크립트 실행');
}
if (translationIssues.length > 0) {
  console.log('2. 번역 품질 개선 작업');
}
console.log('3. 영어 템플릿 기준으로 전체 동기화');
