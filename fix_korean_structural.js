const fs = require('fs');

// 파일 경로
const koreanFilePath = './data/interview_questions_ko.json';
const englishFilePath = './data/interview_questions_en.json';

console.log('=== Korean 파일 구조적 문제 수정 ===\n');

try {
  const koreanData = JSON.parse(fs.readFileSync(koreanFilePath, 'utf8'));
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(question => {
    englishMap[question.id] = question;
  });
  
  let fixedCount = 0;
  
  // 수정할 질문들과 새로운 오답들
  const fixes = {
    4: {
      // 질문 4: "수정헌법이란 무엇인가?" (2개 정답)
      // 현재: 3개 옵션 → 2개 옵션으로 수정
      wrongAnswers: [
        {
          text: "새로운 법, 대법원 판결",
          text_ko: "새로운 법, 대법원 판결",
          rationale: "수정헌법은 새로운 법이나 대법원 판결이 아닙니다. 수정헌법은 헌법에 대한 변경 또는 추가입니다.",
          rationale_ko: "수정헌법은 새로운 법이나 대법원 판결이 아닙니다. 수정헌법은 헌법에 대한 변경 또는 추가입니다."
        },
        {
          text: "조약, 행정협정",
          text_ko: "조약, 행정협정", 
          rationale: "조약과 행정협정은 수정헌법이 아닙니다. 수정헌법은 헌법 문서 자체에 대한 공식적인 변경입니다.",
          rationale_ko: "조약과 행정협정은 수정헌법이 아닙니다. 수정헌법은 헌법 문서 자체에 대한 공식적인 변경입니다."
        },
        {
          text: "주법, 지방조례",
          text_ko: "주법, 지방조례",
          rationale: "주법과 지방조례는 수정헌법이 아닙니다. 수정헌법은 연방 헌법에 대한 변경입니다.",
          rationale_ko: "주법과 지방조례는 수정헌법이 아닙니다. 수정헌법은 연방 헌법에 대한 변경입니다."
        }
      ]
    },
    10: {
      // 질문 10: "종교의 자유란 무엇인가?" (1개 정답)
      // 현재: 3개 옵션 → 1개 옵션으로 수정
      wrongAnswers: [
        {
          text: "기독교만 믿을 수 있다",
          text_ko: "기독교만 믿을 수 있다",
          rationale: "종교의 자유는 어떤 종교든 믿거나 믿지 않을 자유를 의미합니다. 특정 종교로 제한되지 않습니다.",
          rationale_ko: "종교의 자유는 어떤 종교든 믿거나 믿지 않을 자유를 의미합니다. 특정 종교로 제한되지 않습니다."
        },
        {
          text: "정부가 승인한 종교만 믿을 수 있다",
          text_ko: "정부가 승인한 종교만 믿을 수 있다",
          rationale: "종교의 자유는 정부의 승인이나 간섭 없이 종교를 선택할 자유를 보장합니다.",
          rationale_ko: "종교의 자유는 정부의 승인이나 간섭 없이 종교를 선택할 자유를 보장합니다."
        },
        {
          text: "공공장소에서만 종교를 믿을 수 있다",
          text_ko: "공공장소에서만 종교를 믿을 수 있다",
          rationale: "종교의 자유는 공적, 사적 공간 모두에서 종교를 실천할 자유를 포함합니다.",
          rationale_ko: "종교의 자유는 공적, 사적 공간 모두에서 종교를 실천할 자유를 포함합니다."
        }
      ]
    },
    49: {
      // 질문 49: "미국 시민에게만 해당되는 책임 중 하나는 무엇인가?" (2개 정답)
      // 현재: 3개 옵션 → 2개 옵션으로 수정
      wrongAnswers: [
        {
          text: "세금을 내는 것, 법을 준수하는 것",
          text_ko: "세금을 내는 것, 법을 준수하는 것",
          rationale: "세금 납부와 법 준수는 시민뿐만 아니라 미국에 거주하는 모든 사람의 의무입니다.",
          rationale_ko: "세금 납부와 법 준수는 시민뿐만 아니라 미국에 거주하는 모든 사람의 의무입니다."
        },
        {
          text: "운전면허 취득하는 것, 사회보장번호 받는 것",
          text_ko: "운전면허 취득하는 것, 사회보장번호 받는 것",
          rationale: "운전면허와 사회보장번호는 시민권과 관계없이 합법적 거주자도 취득할 수 있습니다.",
          rationale_ko: "운전면허와 사회보장번호는 시민권과 관계없이 합법적 거주자도 취득할 수 있습니다."
        },
        {
          text: "교육받을 권리, 응급의료 받을 권리",
          text_ko: "교육받을 권리, 응급의료 받을 권리",
          rationale: "교육과 응급의료는 권리이지 책임이 아니며, 시민이 아닌 사람들도 이용할 수 있습니다.",
          rationale_ko: "교육과 응급의료는 권리이지 책임이 아니며, 시민이 아닌 사람들도 이용할 수 있습니다."
        }
      ]
    },
    50: {
      // 질문 50: "미국 시민에게만 해당되는 권리 중 하나를 말해보시오." (2개 정답)
      // 현재: 3개 옵션 → 2개 옵션으로 수정
      wrongAnswers: [
        {
          text: "종교의 자유, 언론의 자유",
          text_ko: "종교의 자유, 언론의 자유",
          rationale: "종교의 자유와 언론의 자유는 미국에 거주하는 모든 사람에게 보장되는 권리입니다.",
          rationale_ko: "종교의 자유와 언론의 자유는 미국에 거주하는 모든 사람에게 보장되는 권리입니다."
        },
        {
          text: "공교육을 받을 권리, 응급의료를 받을 권리",
          text_ko: "공교육을 받을 권리, 응급의료를 받을 권리",
          rationale: "공교육과 응급의료는 시민이 아닌 사람들도 받을 수 있는 권리입니다.",
          rationale_ko: "공교육과 응급의료는 시민이 아닌 사람들도 받을 수 있는 권리입니다."
        },
        {
          text: "집회의 자유, 언론 출판의 자유",
          text_ko: "집회의 자유, 언론 출판의 자유",
          rationale: "집회의 자유와 언론 출판의 자유는 미국에 거주하는 모든 사람에게 보장되는 권리입니다.",
          rationale_ko: "집회의 자유와 언론 출판의 자유는 미국에 거주하는 모든 사람에게 보장되는 권리입니다."
        }
      ]
    },
    51: {
      // 질문 51: "미국에 거주하는 비시민의 권리는 무엇인가?" (5개 정답)
      // 현재: 3개 옵션 → 5개 옵션으로 수정 (영어 기준 4개 옵션이지만 5개 정답이므로 5개 옵션 필요)
      wrongAnswers: [
        {
          text: "연방 선거에서 투표할 권리, 연방 공직에 출마할 권리, 미국 여권을 받을 권리, 배심원으로 봉사할 권리, 시민권자 가족 초청권",
          text_ko: "연방 선거에서 투표할 권리, 연방 공직에 출마할 권리, 미국 여권을 받을 권리, 배심원으로 봉사할 권리, 시민권자 가족 초청권",
          rationale: "이러한 권리들은 주로 미국 시민에게만 제한되어 있으며, 미국에 거주하는 모든 사람에게 보장되는 권리가 아닙니다.",
          rationale_ko: "이러한 권리들은 주로 미국 시민에게만 제한되어 있으며, 미국에 거주하는 모든 사람에게 보장되는 권리가 아닙니다."
        },
        {
          text: "사회보장 혜택을 받을 권리, 메디케어를 받을 권리, 실업 수당을 받을 권리, 연방 공무원이 될 권리, 해외에서 외교적 보호를 받을 권리",
          text_ko: "사회보장 혜택을 받을 권리, 메디케어를 받을 권리, 실업 수당을 받을 권리, 연방 공무원이 될 권리, 해외에서 외교적 보호를 받을 권리",
          rationale: "이러한 혜택들은 주로 시민권자나 특정 조건을 만족하는 사람들에게 제한되어 있습니다.",
          rationale_ko: "이러한 혜택들은 주로 시민권자나 특정 조건을 만족하는 사람들에게 제한되어 있습니다."
        },
        {
          text: "가족 이민 신청권, 무제한 미국 재입국권, 연방 공직 보유권, 정치 활동 참여권, 시민권 포기 불가권",
          text_ko: "가족 이민 신청권, 무제한 미국 재입국권, 연방 공직 보유권, 정치 활동 참여권, 시민권 포기 불가권",
          rationale: "이러한 권리들은 주로 시민권자에게만 부여되는 특별한 권리들입니다.",
          rationale_ko: "이러한 권리들은 주로 시민권자에게만 부여되는 특별한 권리들입니다."
        }
      ]
    },
    81: {
      // 질문 81: "미국은 제2차 세계 대전에서 누구와 싸웠는가?" (1개 정답)
      // 현재: 3개 옵션 → 1개 옵션으로 수정
      wrongAnswers: [
        {
          text: "소련",
          text_ko: "소련",
          rationale: "소련은 제2차 세계 대전에서 미국의 주요 동맹국이었습니다.",
          rationale_ko: "소련은 제2차 세계 대전에서 미국의 주요 동맹국이었습니다."
        },
        {
          text: "영국",
          text_ko: "영국",
          rationale: "영국은 제2차 세계 대전에서 미국의 주요 동맹국이었습니다.",
          rationale_ko: "영국은 제2차 세계 대전에서 미국의 주요 동맹국이었습니다."
        },
        {
          text: "프랑스",
          text_ko: "프랑스",
          rationale: "프랑스는 제2차 세계 대전에서 미국과 연합군이 해방시킨 국가였습니다.",
          rationale_ko: "프랑스는 제2차 세계 대전에서 미국과 연합군이 해방시킨 국가였습니다."
        }
      ]
    },
    98: {
      // 질문 98: "국가의 이름은 무엇인가?" (1개 정답)
      // 현재: 오답 2만 3개 옵션 → 1개 옵션으로 수정, 다른 오답들도 1개 옵션으로 맞춤
      wrongAnswers: [
        {
          text: "아름다운 아메리카",
          text_ko: "아름다운 아메리카",
          rationale: "아름다운 아메리카는 인기 있는 애국가이지만 국가가 아닙니다.",
          rationale_ko: "아름다운 아메리카는 인기 있는 애국가이지만 국가가 아닙니다."
        },
        {
          text: "나의 조국, 그대를 노래하노라",
          text_ko: "나의 조국, 그대를 노래하노라",
          rationale: "나의 조국, 그대를 노래하노라는 애국가이지만 국가가 아닙니다.",
          rationale_ko: "나의 조국, 그대를 노래하노라는 애국가이지만 국가가 아닙니다."
        },
        {
          text: "하나님이 아메리카를 축복하소서",
          text_ko: "하나님이 아메리카를 축복하소서",
          rationale: "하나님이 아메리카를 축복하소서는 인기 있는 애국가이지만 국가가 아닙니다.",
          rationale_ko: "하나님이 아메리카를 축복하소서는 인기 있는 애국가이지만 국가가 아닙니다."
        }
      ]
    }
  };
  
  koreanData.forEach((question, index) => {
    if (fixes[question.id]) {
      console.log(`🔧 질문 ${question.id} 수정 중: "${question.question_ko || question.question}"`);
      
      // 기존 오답을 새로운 구조적으로 올바른 오답으로 교체
      question.wrongAnswers = fixes[question.id].wrongAnswers;
      
      console.log(`   ✅ ${question.wrongAnswers.length}개 오답으로 교체됨`);
      fixedCount++;
    }
  });
  
  // 수정된 파일 저장
  fs.writeFileSync(koreanFilePath, JSON.stringify(koreanData, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`✅ 총 ${fixedCount}개 질문의 구조적 문제 수정됨`);
  console.log(`📁 파일 저장됨: ${koreanFilePath}`);
  
  // 검증
  console.log('\n=== 수정 결과 검증 ===');
  Object.keys(fixes).forEach(questionId => {
    const question = koreanData.find(q => q.id === parseInt(questionId));
    if (question) {
      const correctCount = question.correctAnswers.length;
      console.log(`질문 ${questionId}: 정답 ${correctCount}개`);
      
      question.wrongAnswers.forEach((wa, idx) => {
        const text = wa.text_ko || wa.text;
        const commaCount = (text.match(/,/g) || []).length;
        const optionCount = commaCount + 1;
        const isCorrect = optionCount === correctCount;
        console.log(`  오답 ${idx + 1}: ${optionCount}개 옵션 ${isCorrect ? '✅' : '❌'}`);
      });
    }
  });
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
