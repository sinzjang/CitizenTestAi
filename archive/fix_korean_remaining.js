const fs = require('fs');
const path = require('path');

// 수정할 질문들과 추가할 오답들
const fixData = {
  59: {
    newWrongAnswer: {
      text: "스페인 정복자들, 영국 식민지 개척자들",
      rationale: "스페인 정복자들과 영국 식민지 개척자들은 유럽인들이므로 원주민이 아닙니다. 이들은 아메리카 원주민들이 이미 수천 년 동안 거주하고 있던 땅에 나중에 도착한 사람들입니다."
    }
  },
  73: {
    newWrongAnswer: {
      text: "멕시코-미국 전쟁, 스페인-미국 전쟁",
      rationale: "멕시코-미국 전쟁(1846-1848)과 스페인-미국 전쟁(1898)은 남북전쟁과는 다른 별개의 전쟁들입니다. 이들은 외국과의 전쟁이었지만, 남북전쟁은 미국 내부의 분열로 인한 내전이었습니다."
    }
  },
  76: {
    newWrongAnswer: {
      text: "헌법을 제정했다, 권리장전을 만들었다",
      rationale: "헌법은 1787년에 제정되었고 권리장전은 1791년에 추가되었습니다. 해방선언은 1863년에 발표된 것으로, 헌법이나 권리장전과는 전혀 다른 문서입니다."
    }
  },
  77: {
    newWrongAnswer: {
      text: "미국 적십자사를 설립했다, 독립선언서를 작성했다",
      rationale: "미국 적십자사는 클라라 바튼이 설립했습니다. 독립선언서는 토마스 제퍼슨이 주로 작성했습니다. 수전 B. 앤서니는 여성 참정권 운동가였습니다."
    }
  },
  85: {
    newWrongAnswer: {
      text: "대법원 판사였다, 전화를 발명했다",
      rationale: "마틴 루터 킹 주니어는 대법원 판사가 아니었습니다. 전화는 알렉산더 그레이엄 벨이 발명했습니다. 킹 박사는 민권 운동의 지도자였습니다."
    }
  },
  88: {
    newWrongAnswer: {
      text: "오하이오 강, 컬럼비아 강",
      rationale: "오하이오 강과 컬럼비아 강은 중요한 강들이지만 미국에서 가장 긴 두 강은 아닙니다. 미주리 강과 미시시피 강이 미국에서 가장 긴 강들입니다."
    }
  },
  95: {
    newWrongAnswer: {
      text: "샌프란시스코, 로스앤젤레스",
      rationale: "자유의 여신상은 서부 해안의 샌프란시스코나 로스앤젤레스에 있지 않습니다. 뉴욕 항구의 리버티 섬에 위치하고 있습니다."
    }
  }
};

// Korean 파일 읽기
const koPath = path.join(__dirname, 'data', 'interview_questions_ko.json');
const koData = fs.readFileSync(koPath, 'utf8');
let questions = JSON.parse(koData);

console.log('=== Korean 파일 나머지 질문들 수정 중 ===\n');

// 각 질문 수정
Object.keys(fixData).forEach(questionId => {
  const id = parseInt(questionId);
  const questionIndex = questions.findIndex(q => q.id === id);
  
  if (questionIndex !== -1) {
    const question = questions[questionIndex];
    const newWrongAnswer = fixData[questionId].newWrongAnswer;
    
    // 세 번째 오답 추가
    question.wrongAnswers.push(newWrongAnswer);
    
    console.log(`✅ 질문 ${id} 수정 완료: 세 번째 오답 추가`);
    console.log(`   추가된 오답: "${newWrongAnswer.text}"`);
  } else {
    console.log(`❌ 질문 ${id}를 찾을 수 없음`);
  }
});

// 파일에 저장
fs.writeFileSync(koPath, JSON.stringify(questions, null, 2), 'utf8');

console.log('\n=== 수정 완료 ===');
console.log('Korean 파일의 모든 문제 질문들이 수정되었습니다.');
console.log('이제 모든 질문이 3개의 wrongAnswers를 가집니다.');
