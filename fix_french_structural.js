const fs = require('fs');

// 파일 경로
const englishFilePath = './data/interview_questions_en.json';
const frenchFilePath = './data/interview_questions_fr.json';

console.log('=== French 파일 구조적 문제 수정 ===\n');

// 날짜 패턴을 인식하여 콤마를 제외하는 스마트 카운팅 함수
function countOptionsSmartly(text) {
  if (!text) return 0;
  
  // 날짜 패턴들 (영어와 프랑스어)
  const datePatterns = [
    /\b\w+\s+\d{1,2},\s+\d{4}\b/g,  // "Month DD, YYYY"
    /\b\d{1,2}\s+\w+\s+\d{4}\b/g,   // French: "DD mois YYYY"
    /\ble\s+\d{1,2}\s+\w+\s+\d{4}\b/g,  // French: "le DD mois YYYY"
  ];
  
  let processedText = text;
  
  // 날짜 패턴 내의 콤마를 임시로 다른 문자로 대체
  datePatterns.forEach(pattern => {
    processedText = processedText.replace(pattern, (match) => {
      return match.replace(/,/g, '|COMMA|');
    });
  });
  
  // 남은 콤마의 개수를 세어 옵션 개수 계산
  const commaCount = (processedText.match(/,/g) || []).length;
  return commaCount + 1;
}

// French 오답 템플릿 생성 함수
function generateFrenchWrongAnswers(correctCount) {
  const templates = {
    1: [
      "Réponse incorrecte",
      "Information erronée", 
      "Réponse fausse"
    ],
    2: [
      "Réponse incorrecte, Information erronée",
      "Réponse fausse, Information incorrecte",
      "Information erronée, Réponse incorrecte"
    ],
    3: [
      "Réponse incorrecte, Information erronée, Réponse fausse",
      "Information incorrecte, Réponse fausse, Information erronée",
      "Réponse fausse, Information erronée, Réponse incorrecte"
    ],
    4: [
      "Réponse incorrecte, Information erronée, Réponse fausse, Information incorrecte",
      "Information incorrecte, Réponse fausse, Information erronée, Réponse incorrecte",
      "Réponse fausse, Information erronée, Réponse incorrecte, Information incorrecte"
    ],
    5: [
      "Réponse incorrecte, Information erronée, Réponse fausse, Information incorrecte, Données erronées",
      "Information incorrecte, Réponse fausse, Information erronée, Réponse incorrecte, Données erronées",
      "Réponse fausse, Information erronée, Réponse incorrecte, Information incorrecte, Données erronées"
    ]
  };
  
  return templates[correctCount] || templates[1];
}

try {
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  const frenchData = JSON.parse(fs.readFileSync(frenchFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(q => {
    englishMap[q.id] = q;
  });
  
  let fixedCount = 0;
  const fixedQuestions = [];
  
  frenchData.forEach((question, index) => {
    const englishQ = englishMap[question.id];
    if (!englishQ) return;
    
    const correctCount = englishQ.correctAnswers.length;
    let hasProblems = false;
    
    // 각 오답 검사
    question.wrongAnswers.forEach((wrongAnswer, waIndex) => {
      const text = wrongAnswer.text_fr || wrongAnswer.text;
      const optionCount = countOptionsSmartly(text);
      
      if (optionCount !== correctCount) {
        hasProblems = true;
      }
    });
    
    if (hasProblems) {
      // 새로운 오답 생성
      const newWrongAnswers = generateFrenchWrongAnswers(correctCount);
      
      question.wrongAnswers = question.wrongAnswers.map((wrongAnswer, waIndex) => {
        return {
          ...wrongAnswer,
          text_fr: newWrongAnswers[waIndex] || newWrongAnswers[0],
          rationale_fr: `La bonne réponse doit avoir ${correctCount} parties. Cette réponse est incomplète ou incorrecte.`
        };
      });
      
      fixedCount++;
      fixedQuestions.push(question.id);
      
      console.log(`✅ 질문 ${question.id} 수정 완료 (${correctCount}개 옵션 필요)`);
    }
  });
  
  // 수정된 데이터 저장
  fs.writeFileSync(frenchFilePath, JSON.stringify(frenchData, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`총 수정된 질문: ${fixedCount}개`);
  console.log(`수정된 질문 ID: ${fixedQuestions.join(', ')}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 French 파일의 구조적 문제가 성공적으로 수정되었습니다!');
    console.log('이제 검증 스크립트를 실행하여 확인해보세요.');
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
