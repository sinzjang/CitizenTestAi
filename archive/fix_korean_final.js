const fs = require('fs');

// 파일 경로
const koreanFilePath = './data/interview_questions_ko.json';

console.log('=== Korean 파일 최종 구조적 문제 수정 ===\n');

try {
  const koreanData = JSON.parse(fs.readFileSync(koreanFilePath, 'utf8'));
  
  let fixedCount = 0;
  
  koreanData.forEach((question, index) => {
    if (question.id === 51) {
      // 질문 51: 4개 정답이므로 각 오답에 4개 옵션 필요 (현재 5개 옵션)
      console.log(`🔧 질문 51 수정 중: "${question.question_ko || question.question}"`);
      
      question.wrongAnswers = [
        {
          text: "연방 선거에서 투표할 권리, 연방 공직에 출마할 권리, 미국 여권을 받을 권리, 배심원으로 봉사할 권리",
          text_ko: "연방 선거에서 투표할 권리, 연방 공직에 출마할 권리, 미국 여권을 받을 권리, 배심원으로 봉사할 권리",
          rationale: "이러한 권리들은 주로 미국 시민에게만 제한되어 있으며, 미국에 거주하는 모든 사람에게 보장되는 권리가 아닙니다.",
          rationale_ko: "이러한 권리들은 주로 미국 시민에게만 제한되어 있으며, 미국에 거주하는 모든 사람에게 보장되는 권리가 아닙니다."
        },
        {
          text: "사회보장 혜택을 받을 권리, 메디케어를 받을 권리, 실업 수당을 받을 권리, 연방 공무원이 될 권리",
          text_ko: "사회보장 혜택을 받을 권리, 메디케어를 받을 권리, 실업 수당을 받을 권리, 연방 공무원이 될 권리",
          rationale: "이러한 혜택들은 주로 시민권자나 특정 조건을 만족하는 사람들에게 제한되어 있습니다.",
          rationale_ko: "이러한 혜택들은 주로 시민권자나 특정 조건을 만족하는 사람들에게 제한되어 있습니다."
        },
        {
          text: "가족 이민 신청권, 무제한 미국 재입국권, 연방 공직 보유권, 해외에서 외교적 보호를 받을 권리",
          text_ko: "가족 이민 신청권, 무제한 미국 재입국권, 연방 공직 보유권, 해외에서 외교적 보호를 받을 권리",
          rationale: "이러한 권리들은 주로 시민권자에게만 부여되는 특별한 권리들입니다.",
          rationale_ko: "이러한 권리들은 주로 시민권자에게만 부여되는 특별한 권리들입니다."
        }
      ];
      
      console.log(`   ✅ 4개 옵션으로 수정됨 (5개 → 4개)`);
      fixedCount++;
    }
    
    if (question.id === 98) {
      // 질문 98: 1개 정답이므로 각 오답에 1개 옵션 필요
      console.log(`🔧 질문 98 수정 중: "${question.question_ko || question.question}"`);
      
      // 기존 오답들을 확인하고 문제가 있는 오답만 수정
      question.wrongAnswers.forEach((wrongAnswer, idx) => {
        if (idx === 1) { // 오답 2 (인덱스 1)
          wrongAnswer.text = "나의 조국을 위하여";
          wrongAnswer.text_ko = "나의 조국을 위하여";
          wrongAnswer.rationale = "나의 조국을 위하여는 애국가이지만 국가가 아닙니다.";
          wrongAnswer.rationale_ko = "나의 조국을 위하여는 애국가이지만 국가가 아닙니다.";
          console.log(`   ✅ 오답 ${idx + 1} 수정됨 (콤마 제거)`);
        }
      });
      
      fixedCount++;
    }
  });
  
  // 수정된 파일 저장
  fs.writeFileSync(koreanFilePath, JSON.stringify(koreanData, null, 2), 'utf8');
  
  console.log(`\n=== 최종 수정 완료 ===`);
  console.log(`✅ 총 ${fixedCount}개 질문의 구조적 문제 수정됨`);
  console.log(`📁 파일 저장됨: ${koreanFilePath}`);
  
  // 검증
  console.log('\n=== 최종 검증 ===');
  [51, 98].forEach(questionId => {
    const question = koreanData.find(q => q.id === questionId);
    if (question) {
      const correctCount = question.correctAnswers.length;
      console.log(`질문 ${questionId}: 정답 ${correctCount}개`);
      
      question.wrongAnswers.forEach((wa, idx) => {
        const text = wa.text_ko || wa.text;
        const commaCount = (text.match(/,/g) || []).length;
        const optionCount = commaCount + 1;
        const isCorrect = optionCount === correctCount;
        console.log(`  오답 ${idx + 1}: ${optionCount}개 옵션 ${isCorrect ? '✅' : '❌'} - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      });
    }
  });
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
