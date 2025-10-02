const fs = require('fs');

// 파일 경로
const koreanFilePath = './data/interview_questions_ko.json';
const englishFilePath = './data/interview_questions_en.json';

console.log('=== Korean 파일 구조적 문제 상세 분석 ===\n');

// 날짜 패턴들
const datePatterns = [
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/gi,
  /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/g,
  /\b\w+\s+\d{1,2},\s+\d{4}\b/g,
  /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/g
];

function countActualOptions(text) {
  let cleanText = text;
  
  datePatterns.forEach(pattern => {
    cleanText = cleanText.replace(pattern, (match) => match.replace(/,/g, '|DATECOMMA|'));
  });
  
  const actualCommas = (cleanText.match(/,/g) || []).length;
  return actualCommas + 1;
}

try {
  const koreanData = JSON.parse(fs.readFileSync(koreanFilePath, 'utf8'));
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(question => {
    englishMap[question.id] = question;
  });
  
  const problems = [];
  
  koreanData.forEach((question, index) => {
    const correctAnswerCount = question.correctAnswers ? question.correctAnswers.length : 0;
    
    if (question.wrongAnswers) {
      question.wrongAnswers.forEach((wrongAnswer, wrongIndex) => {
        const wrongAnswerText = wrongAnswer.text_ko || wrongAnswer.text || '';
        const actualOptionCount = countActualOptions(wrongAnswerText);
        
        if (actualOptionCount !== correctAnswerCount) {
          problems.push({
            questionId: question.id,
            questionIndex: index,
            wrongAnswerIndex: wrongIndex,
            correctAnswerCount: correctAnswerCount,
            wrongAnswerOptionCount: actualOptionCount,
            wrongAnswerText: wrongAnswerText,
            question: question.question_ko || question.question || 'No question text',
            englishReference: englishMap[question.id]
          });
        }
      });
    }
  });
  
  console.log(`총 구조적 문제: ${problems.length}개\n`);
  
  if (problems.length > 0) {
    // 문제를 질문별로 그룹화
    const problemsByQuestion = {};
    problems.forEach(problem => {
      if (!problemsByQuestion[problem.questionId]) {
        problemsByQuestion[problem.questionId] = [];
      }
      problemsByQuestion[problem.questionId].push(problem);
    });
    
    const questionIds = Object.keys(problemsByQuestion).map(id => parseInt(id)).sort((a, b) => a - b);
    
    console.log('=== 문제 질문 상세 분석 ===\n');
    
    questionIds.forEach(questionId => {
      const problems = problemsByQuestion[questionId];
      const firstProblem = problems[0];
      const englishRef = firstProblem.englishReference;
      
      console.log(`🔴 질문 ${questionId}: "${firstProblem.question}"`);
      console.log(`   정답 개수: ${firstProblem.correctAnswerCount}개`);
      
      if (englishRef) {
        console.log(`   영어 참조: "${englishRef.question}"`);
        console.log(`   영어 오답 예시:`);
        englishRef.wrongAnswers.slice(0, 1).forEach((wa, idx) => {
          const englishOptionCount = countActualOptions(wa.text);
          console.log(`     영어 오답 ${idx + 1}: ${englishOptionCount}개 옵션 - "${wa.text.substring(0, 60)}${wa.text.length > 60 ? '...' : ''}"`);
        });
      }
      
      console.log(`   한국어 문제 오답들:`);
      problems.forEach(problem => {
        console.log(`     오답 ${problem.wrongAnswerIndex + 1}: ${problem.wrongAnswerOptionCount}개 옵션 (${problem.correctAnswerCount}개 필요)`);
        console.log(`       텍스트: "${problem.wrongAnswerText.substring(0, 80)}${problem.wrongAnswerText.length > 80 ? '...' : ''}"`);
      });
      console.log('');
    });
    
    // 정답 개수별 분류
    console.log('=== 정답 개수별 문제 분류 ===');
    const by1Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 1);
    const by2Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 2);
    const by3Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 3);
    const by4Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 4);
    const by5Correct = questionIds.filter(id => problemsByQuestion[id][0].correctAnswerCount === 5);
    
    if (by1Correct.length > 0) {
      console.log(`⚪ 1개 정답 질문들 (${by1Correct.length}개): ${by1Correct.join(', ')}`);
    }
    if (by2Correct.length > 0) {
      console.log(`🟠 2개 정답 질문들 (${by2Correct.length}개): ${by2Correct.join(', ')}`);
    }
    if (by3Correct.length > 0) {
      console.log(`🟡 3개 정답 질문들 (${by3Correct.length}개): ${by3Correct.join(', ')}`);
    }
    if (by4Correct.length > 0) {
      console.log(`🟢 4개 정답 질문들 (${by4Correct.length}개): ${by4Correct.join(', ')}`);
    }
    if (by5Correct.length > 0) {
      console.log(`🔵 5개 정답 질문들 (${by5Correct.length}개): ${by5Correct.join(', ')}`);
    }
    
    // 수정 가능한 질문들 식별
    console.log('\n=== 수정 계획 ===');
    const fixableQuestions = questionIds.filter(id => {
      const englishRef = englishMap[id];
      return englishRef && englishRef.wrongAnswers && englishRef.wrongAnswers.length === 3;
    });
    
    console.log(`수정 가능한 질문: ${fixableQuestions.length}개`);
    console.log(`수정 가능한 질문 IDs: ${fixableQuestions.join(', ')}`);
    
  } else {
    console.log('🎉 모든 질문이 올바른 구조를 가지고 있습니다!');
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
