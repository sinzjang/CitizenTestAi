const fs = require('fs');

// 한국어 번역 필요 항목 분석 스크립트
function analyzeKoreanTranslation() {
  console.log('🔍 한국어 번역 필요 항목 분석 중...\n');
  
  const data = JSON.parse(fs.readFileSync('./data/interview_questions_ko.json', 'utf8'));
  const needsTranslation = [];
  
  data.forEach((question, index) => {
    const questionNeeds = {
      id: question.id,
      question: question.question.includes('[번역 필요]') ? question.question : null,
      correctAnswers: [],
      wrongAnswers: []
    };
    
    // 정답들 확인
    question.correctAnswers.forEach((answer, answerIndex) => {
      if (answer.text.includes('[번역 필요]') || answer.rationale.includes('[번역 필요]')) {
        questionNeeds.correctAnswers.push({
          index: answerIndex,
          text: answer.text.includes('[번역 필요]') ? answer.text : null,
          rationale: answer.rationale.includes('[번역 필요]') ? answer.rationale : null
        });
      }
    });
    
    // 오답들 확인
    question.wrongAnswers.forEach((wrong, wrongIndex) => {
      if (wrong.text.includes('[번역 필요]') || wrong.rationale.includes('[번역 필요]')) {
        questionNeeds.wrongAnswers.push({
          index: wrongIndex,
          text: wrong.text.includes('[번역 필요]') ? wrong.text : null,
          rationale: wrong.rationale.includes('[번역 필요]') ? wrong.rationale : null
        });
      }
    });
    
    // 번역이 필요한 항목이 있으면 추가
    if (questionNeeds.question || questionNeeds.correctAnswers.length > 0 || questionNeeds.wrongAnswers.length > 0) {
      needsTranslation.push(questionNeeds);
    }
  });
  
  console.log(`📊 번역 필요한 문제: ${needsTranslation.length}개`);
  
  // 카테고리별 분석
  const categories = {
    government: [],
    history: [],
    geography: [],
    civics: [],
    other: []
  };
  
  needsTranslation.forEach(item => {
    const id = item.id;
    if (id <= 47) {
      categories.civics.push(item);
    } else if (id <= 57) {
      categories.history.push(item);
    } else if (id <= 70) {
      categories.history.push(item);
    } else if (id <= 87) {
      categories.history.push(item);
    } else if (id <= 95) {
      categories.geography.push(item);
    } else {
      categories.civics.push(item);
    }
  });
  
  console.log('\n📋 카테고리별 번역 필요 문제:');
  console.log(`   시민학 (Civics): ${categories.civics.length}개`);
  console.log(`   역사 (History): ${categories.history.length}개`);
  console.log(`   지리 (Geography): ${categories.geography.length}개`);
  
  // 우선순위 높은 문제들 (새로 추가된 답안이 많은 문제들)
  const highPriority = needsTranslation.filter(item => 
    item.correctAnswers.length > 2 || item.wrongAnswers.length > 1
  );
  
  console.log(`\n🎯 우선순위 높은 문제: ${highPriority.length}개`);
  highPriority.slice(0, 10).forEach(item => {
    console.log(`   문제 ${item.id}: 정답 ${item.correctAnswers.length}개, 오답 ${item.wrongAnswers.length}개 번역 필요`);
  });
  
  // 번역 필요 항목들을 파일로 저장
  const translationTasks = needsTranslation.map(item => ({
    id: item.id,
    items: [
      ...(item.question ? [{ type: 'question', text: item.question }] : []),
      ...item.correctAnswers.map(ca => [
        ...(ca.text ? [{ type: 'correctAnswer', index: ca.index, field: 'text', text: ca.text }] : []),
        ...(ca.rationale ? [{ type: 'correctAnswer', index: ca.index, field: 'rationale', text: ca.rationale }] : [])
      ]).flat(),
      ...item.wrongAnswers.map(wa => [
        ...(wa.text ? [{ type: 'wrongAnswer', index: wa.index, field: 'text', text: wa.text }] : []),
        ...(wa.rationale ? [{ type: 'wrongAnswer', index: wa.index, field: 'rationale', text: wa.rationale }] : [])
      ]).flat()
    ]
  }));
  
  fs.writeFileSync('./korean_translation_tasks.json', JSON.stringify(translationTasks, null, 2), 'utf8');
  console.log('\n💾 번역 작업 목록이 korean_translation_tasks.json에 저장되었습니다.');
  
  return needsTranslation;
}

// 특정 문제의 번역 필요 항목만 보기
function showQuestionTranslationNeeds(questionId) {
  const data = JSON.parse(fs.readFileSync('./data/interview_questions_ko.json', 'utf8'));
  const question = data.find(q => q.id === questionId);
  
  if (!question) {
    console.log(`❌ 문제 ${questionId}를 찾을 수 없습니다.`);
    return;
  }
  
  console.log(`\n🔍 문제 ${questionId} 번역 필요 항목:`);
  console.log(`질문: ${question.question}`);
  
  if (question.question.includes('[번역 필요]')) {
    console.log('   ❌ 질문 번역 필요');
  }
  
  console.log('\n정답들:');
  question.correctAnswers.forEach((answer, index) => {
    console.log(`   ${index + 1}. ${answer.text}`);
    if (answer.text.includes('[번역 필요]')) {
      console.log('      ❌ 텍스트 번역 필요');
    }
    if (answer.rationale.includes('[번역 필요]')) {
      console.log('      ❌ 설명 번역 필요');
    }
  });
  
  console.log('\n오답들:');
  question.wrongAnswers.forEach((wrong, index) => {
    console.log(`   ${index + 1}. ${wrong.text.substring(0, 50)}...`);
    if (wrong.text.includes('[번역 필요]')) {
      console.log('      ❌ 텍스트 번역 필요');
    }
    if (wrong.rationale.includes('[번역 필요]')) {
      console.log('      ❌ 설명 번역 필요');
    }
  });
}

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.length > 0) {
  const questionId = parseInt(args[0]);
  showQuestionTranslationNeeds(questionId);
} else {
  analyzeKoreanTranslation();
}
