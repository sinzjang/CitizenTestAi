const fs = require('fs');

// 파일 경로
const koreanFilePath = './data/interview_questions_ko.json';

console.log('=== Korean 파일 중복 질문 제거 및 최종 수정 ===\n');

try {
  const koreanData = JSON.parse(fs.readFileSync(koreanFilePath, 'utf8'));
  
  console.log(`📊 수정 전 총 질문 수: ${koreanData.length}`);
  
  // 질문 ID별로 그룹화하여 중복 확인
  const questionGroups = {};
  koreanData.forEach((question, index) => {
    if (!questionGroups[question.id]) {
      questionGroups[question.id] = [];
    }
    questionGroups[question.id].push({ question, index });
  });
  
  // 중복된 질문 ID 찾기
  const duplicates = Object.keys(questionGroups).filter(id => questionGroups[id].length > 1);
  console.log(`🔍 중복된 질문 ID: ${duplicates.join(', ')}`);
  
  // 질문 51 중복 처리
  if (duplicates.includes('51')) {
    console.log('\n🔧 질문 51 중복 처리 중...');
    
    const q51Items = questionGroups['51'];
    q51Items.forEach((item, idx) => {
      const q = item.question;
      console.log(`  질문 51-${idx + 1}: "${q.question}" (정답 ${q.correctAnswers.length}개)`);
    });
    
    // 첫 번째 질문 51 제거 (잘못된 질문)
    const firstQ51Index = q51Items[0].index;
    console.log(`  ❌ 첫 번째 질문 51 제거 (인덱스 ${firstQ51Index})`);
    
    // 두 번째 질문 51이 올바른 질문이므로 유지
    console.log(`  ✅ 두 번째 질문 51 유지 (영어 버전과 일치)`);
  }
  
  // 중복 제거된 새로운 배열 생성
  const cleanedData = [];
  const seenIds = new Set();
  
  for (let i = koreanData.length - 1; i >= 0; i--) {
    const question = koreanData[i];
    if (!seenIds.has(question.id)) {
      seenIds.add(question.id);
      cleanedData.unshift(question); // 역순으로 추가하여 원래 순서 유지
    } else {
      console.log(`🗑️  중복 제거: 질문 ${question.id} (인덱스 ${i})`);
    }
  }
  
  console.log(`📊 수정 후 총 질문 수: ${cleanedData.length}`);
  
  // 질문 98 구조적 문제 수정
  const q98 = cleanedData.find(q => q.id === 98);
  if (q98) {
    console.log('\n🔧 질문 98 구조적 문제 수정 중...');
    
    // 오답 2번의 콤마 제거
    if (q98.wrongAnswers[1]) {
      const oldText = q98.wrongAnswers[1].text_ko || q98.wrongAnswers[1].text;
      q98.wrongAnswers[1].text = "나의 조국을 위하여";
      q98.wrongAnswers[1].text_ko = "나의 조국을 위하여";
      q98.wrongAnswers[1].rationale = "나의 조국을 위하여는 애국가이지만 국가가 아닙니다.";
      q98.wrongAnswers[1].rationale_ko = "나의 조국을 위하여는 애국가이지만 국가가 아닙니다.";
      
      console.log(`  ✅ 오답 2 수정: "${oldText}" → "나의 조국을 위하여"`);
    }
  }
  
  // 수정된 파일 저장
  fs.writeFileSync(koreanFilePath, JSON.stringify(cleanedData, null, 2), 'utf8');
  
  console.log(`\n=== 최종 수정 완료 ===`);
  console.log(`📁 파일 저장됨: ${koreanFilePath}`);
  
  // 최종 검증
  console.log('\n=== 최종 검증 ===');
  
  // 질문 51 검증
  const finalQ51 = cleanedData.find(q => q.id === 51);
  if (finalQ51) {
    const correctCount = finalQ51.correctAnswers.length;
    console.log(`질문 51: "${finalQ51.question}" (정답 ${correctCount}개)`);
    
    finalQ51.wrongAnswers.forEach((wa, idx) => {
      const text = wa.text_ko || wa.text;
      const commaCount = (text.match(/,/g) || []).length;
      const optionCount = commaCount + 1;
      const isCorrect = optionCount === correctCount;
      console.log(`  오답 ${idx + 1}: ${optionCount}개 옵션 ${isCorrect ? '✅' : '❌'}`);
    });
  }
  
  // 질문 98 검증
  const finalQ98 = cleanedData.find(q => q.id === 98);
  if (finalQ98) {
    const correctCount = finalQ98.correctAnswers.length;
    console.log(`질문 98: "${finalQ98.question}" (정답 ${correctCount}개)`);
    
    finalQ98.wrongAnswers.forEach((wa, idx) => {
      const text = wa.text_ko || wa.text;
      const commaCount = (text.match(/,/g) || []).length;
      const optionCount = commaCount + 1;
      const isCorrect = optionCount === correctCount;
      console.log(`  오답 ${idx + 1}: ${optionCount}개 옵션 ${isCorrect ? '✅' : '❌'} - "${text}"`);
    });
  }
  
  // 전체 질문 ID 순서 확인
  const allIds = cleanedData.map(q => q.id).sort((a, b) => a - b);
  const missingIds = [];
  for (let i = 1; i <= 100; i++) {
    if (!allIds.includes(i)) {
      missingIds.push(i);
    }
  }
  
  if (missingIds.length > 0) {
    console.log(`⚠️  누락된 질문 ID: ${missingIds.join(', ')}`);
  } else {
    console.log(`✅ 모든 질문 ID (1-100) 존재 확인`);
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
