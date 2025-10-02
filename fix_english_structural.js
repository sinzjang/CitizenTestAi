const fs = require('fs');

// 파일 경로
const filePath = './data/interview_questions_en.json';

console.log('=== 영어 파일 구조적 문제 수정 ===\n');

try {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let fixedCount = 0;
  
  // 문제가 있는 질문들과 수정 방법
  const fixes = {
    44: {
      // 질문 44: "What is the capital of your state?" (1개 정답)
      // 현재 오답 1: "Washington, D.C." (2개 옵션) → 1개 옵션으로 수정
      wrongAnswers: [
        {
          text: "Washington D.C.",
          rationale: "Washington, D.C. is the capital of the United States, not a state capital. Each state has its own capital city."
        },
        {
          text: "New York City",
          rationale: "New York City is the largest city in New York state, but Albany is the capital of New York."
        },
        {
          text: "Los Angeles",
          rationale: "Los Angeles is the largest city in California, but Sacramento is the capital of California."
        }
      ]
    },
    63: {
      // 질문 63: "When was the Declaration of Independence adopted?" (1개 정답)
      // 현재 모든 오답이 2개 옵션 → 1개 옵션으로 수정
      wrongAnswers: [
        {
          text: "September 17, 1787",
          rationale: "September 17, 1787 was when the Constitution was signed, not when the Declaration of Independence was adopted."
        },
        {
          text: "October 12, 1492",
          rationale: "October 12, 1492 was when Christopher Columbus reached the Americas, not when the Declaration was adopted."
        },
        {
          text: "April 19, 1775",
          rationale: "April 19, 1775 was the start of the Revolutionary War at Lexington and Concord, not when the Declaration was adopted."
        }
      ]
    },
    81: {
      // 질문 81: "Who did the United States fight in World War II?" (1개 정답)
      // 현재 모든 오답이 3개 옵션 → 1개 옵션으로 수정
      wrongAnswers: [
        {
          text: "the Soviet Union",
          rationale: "The Soviet Union was an ally of the United States during World War II, not an enemy."
        },
        {
          text: "Great Britain",
          rationale: "Great Britain was a major ally of the United States during World War II, not an enemy."
        },
        {
          text: "France",
          rationale: "France was liberated by the United States and its allies during World War II, not an enemy."
        }
      ]
    },
    95: {
      // 질문 95: "Where is the Statue of Liberty?" (2개 정답)
      // 현재 오답 1: "Washington, D.C., Paris" (3개 옵션) → 2개 옵션으로 수정
      wrongAnswers: [
        {
          text: "Washington D.C., Philadelphia",
          rationale: "The Statue of Liberty is not in Washington, D.C., which is the nation's capital. It is also not in Philadelphia, the birthplace of American independence."
        },
        {
          text: "Boston Harbor, San Francisco Bay",
          rationale: "The Statue of Liberty is not in Boston Harbor or San Francisco Bay. It stands in New York Harbor."
        },
        {
          text: "Los Angeles, Chicago",
          rationale: "The Statue of Liberty is not in Los Angeles or Chicago. It is located in New York Harbor."
        }
      ]
    },
    98: {
      // 질문 98: "What is the name of the national anthem?" (1개 정답)
      // 오답 2: "My Country, 'Tis of Thee" (2개 옵션) → 1개 옵션으로 수정
      wrongAnswers: [
        {
          text: "America the Beautiful",
          rationale: "America the Beautiful is a popular patriotic song, but it is not the national anthem."
        },
        {
          text: "My Country 'Tis of Thee",
          rationale: "My Country, 'Tis of Thee is a patriotic song, but it is not the national anthem."
        },
        {
          text: "God Bless America",
          rationale: "God Bless America is a popular patriotic song, but it is not the national anthem."
        }
      ]
    }
  };
  
  data.forEach((question, index) => {
    if (fixes[question.id]) {
      console.log(`🔧 질문 ${question.id} 수정 중: "${question.question}"`);
      
      // 기존 오답을 새로운 구조적으로 올바른 오답으로 교체
      question.wrongAnswers = fixes[question.id].wrongAnswers;
      
      console.log(`   ✅ ${question.wrongAnswers.length}개 오답으로 교체됨`);
      fixedCount++;
    }
  });
  
  // 수정된 파일 저장
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`✅ 총 ${fixedCount}개 질문의 구조적 문제 수정됨`);
  console.log(`📁 파일 저장됨: ${filePath}`);
  
  // 검증
  console.log('\n=== 수정 결과 검증 ===');
  Object.keys(fixes).forEach(questionId => {
    const question = data.find(q => q.id === parseInt(questionId));
    if (question) {
      const correctCount = question.correctAnswers.length;
      const allCorrect = question.wrongAnswers.every(wa => {
        const commaCount = (wa.text.match(/,/g) || []).length;
        const optionCount = commaCount + 1;
        return optionCount === correctCount;
      });
      console.log(`질문 ${questionId}: ${allCorrect ? '✅ 구조 올바름' : '❌ 구조 문제 있음'}`);
    }
  });
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
