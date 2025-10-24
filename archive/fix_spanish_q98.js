const fs = require('fs');

// 파일 경로
const spanishFilePath = './data/interview_questions_es.json';

console.log('=== Spanish 질문 98 최종 수정 ===\n');

try {
  const spanishData = JSON.parse(fs.readFileSync(spanishFilePath, 'utf8'));
  
  // 질문 98 찾기
  const q98 = spanishData.find(q => q.id === 98);
  
  if (q98) {
    console.log(`🔧 질문 98 수정 중: "${q98.question_es || q98.question}"`);
    console.log(`   정답 개수: 1개 (각 오답에 1개 옵션 필요)`);
    
    // 현재 오답들 확인
    console.log('\n현재 오답들:');
    q98.wrongAnswers.forEach((wa, idx) => {
      const text = wa.text_es || wa.text;
      const commaCount = (text.match(/,/g) || []).length;
      const optionCount = commaCount + 1;
      console.log(`  오답 ${idx + 1}: ${optionCount}개 옵션 - "${text}"`);
    });
    
    // 오답 2번 수정 (콤마가 있는 문제)
    if (q98.wrongAnswers[1]) {
      const oldText = q98.wrongAnswers[1].text_es || q98.wrongAnswers[1].text;
      
      // "Mi País, Es de Ti" → "Mi País Es de Ti" (콤마 제거)
      q98.wrongAnswers[1].text = "Mi País Es de Ti";
      q98.wrongAnswers[1].text_es = "Mi País Es de Ti";
      q98.wrongAnswers[1].rationale = "Esta respuesta es incorrecta. Esta opción no es la respuesta correcta a la pregunta.";
      q98.wrongAnswers[1].rationale_es = "Esta respuesta es incorrecta. Esta opción no es la respuesta correcta a la pregunta.";
      
      console.log(`\n✅ 오답 2 수정됨:`);
      console.log(`   이전: "${oldText}"`);
      console.log(`   이후: "Mi País Es de Ti"`);
    }
    
    // 수정된 파일 저장
    fs.writeFileSync(spanishFilePath, JSON.stringify(spanishData, null, 2), 'utf8');
    
    console.log(`\n=== 수정 완료 ===`);
    console.log(`📁 파일 저장됨: ${spanishFilePath}`);
    
    // 검증
    console.log('\n=== 최종 검증 ===');
    console.log(`질문 98: "${q98.question_es || q98.question}"`);
    console.log(`정답 개수: 1개`);
    
    q98.wrongAnswers.forEach((wa, idx) => {
      const text = wa.text_es || wa.text;
      const commaCount = (text.match(/,/g) || []).length;
      const optionCount = commaCount + 1;
      const isCorrect = optionCount === 1;
      console.log(`  오답 ${idx + 1}: ${optionCount}개 옵션 ${isCorrect ? '✅' : '❌'} - "${text}"`);
    });
    
  } else {
    console.log('❌ 질문 98을 찾을 수 없습니다.');
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
