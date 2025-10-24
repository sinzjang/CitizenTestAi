const fs = require('fs');
const path = require('path');

// 각 언어별 "정답입니다" 접두사 정의 (단독 사용과 접두사 모두 처리)
const correctPrefixes = {
  'ko': [/^정답입니다\.\s*/, /^정답입니다\.?$/],           // 한국어: "정답입니다. " 또는 "정답입니다."
  'en': [/^Correct\.\s*/, /^Correct\.?$/],             // 영어: "Correct. " 또는 "Correct."
  'en2': [/^Correct\.\s*/, /^Correct\.?$/],            // 영어 (추가 파일): "Correct. " 또는 "Correct."
  'es': [/^Correcto\.\s*/, /^Correcto\.?$/],            // 스페인어: "Correcto. " 또는 "Correcto."
  'zh': [/^正确\.\s*/, /^正确\.?$/],                // 중국어: "正确. " 또는 "正确."
  'tl': [/^Tama\.\s*/, /^Tama\.?$/],                // 필리핀어: "Tama. " 또는 "Tama."
  'vi': [/^Đúng\.\s*/, /^Đúng\.?$/],                // 베트남어: "Đúng. " 또는 "Đúng."
  'hi': [/^सही\.\s*/, /^सही\.?$/],                 // 힌디어: "सही. " 또는 "सही."
  'fr': [/^Correct\.\s*/, /^Correct\.?$/],             // 프랑스어: "Correct. " 또는 "Correct."
  'ar': [/^صحيح\.\s*/, /^صحيح\.?$/]                 // 아랍어: "صحيح. " 또는 "صحيح."
};

// 언어별 파일 매핑
const languageFiles = {
  'ko': 'interview_questions_ko.json',
  'en': 'interview_questions.json',
  'en2': 'interview_questions_en.json',  // 추가 영어 파일
  'es': 'interview_questions_es.json',
  'zh': 'interview_questions_zh.json',
  'tl': 'interview_questions_tl.json',
  'vi': 'interview_questions_vi.json',
  'hi': 'interview_questions_hi.json',
  'fr': 'interview_questions_fr.json',
  'ar': 'interview_questions_ar.json'
};

// 모든 언어 파일에서 "정답입니다" 접두사 제거
function removeCorrectAnswerPrefixFromAllLanguages() {
  const dataDir = path.join(__dirname, 'data');
  let totalModified = 0;
  
  // 각 언어별로 처리
  Object.keys(correctPrefixes).forEach(langCode => {
    const fileName = languageFiles[langCode];
    const filePath = path.join(dataDir, fileName);
    
    // 파일이 존재하는지 확인
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일이 존재하지 않음: ${fileName}`);
      return;
    }
    
    try {
      console.log(`\n🔄 처리 중: ${fileName}`);
      
      // 파일 읽기
      const rawData = fs.readFileSync(filePath, 'utf8');
      const questions = JSON.parse(rawData);
      
      let modifiedCount = 0;
      const patterns = correctPrefixes[langCode];
      
      // 각 질문의 정답 rationale에서 접두사 제거
      questions.forEach((question) => {
        question.correctAnswers.forEach((answer, answerIndex) => {
          // 파일 구조에 따라 rationale 키 결정
          let rationaleKey = 'rationale';
          if (langCode === 'en' && answer['rationale_en']) {
            rationaleKey = 'rationale_en';
          } else if (answer[`rationale_${langCode}`]) {
            rationaleKey = `rationale_${langCode}`;
          }
          
          if (answer[rationaleKey]) {
            let originalRationale = answer[rationaleKey];
            let modified = false;
            
            // 각 패턴을 순서대로 확인
            for (const pattern of patterns) {
              if (pattern.test(answer[rationaleKey])) {
                // "정답입니다."만 있는 경우 완전히 제거, 아니면 접두사만 제거
                if (answer[rationaleKey].trim() === answer[rationaleKey].match(pattern)?.[0]?.trim()) {
                  answer[rationaleKey] = ''; // 완전히 제거
                } else {
                  answer[rationaleKey] = answer[rationaleKey].replace(pattern, '');
                }
                modified = true;
                break;
              }
            }
            
            if (modified) {
              console.log(`  질문 ${question.id}, 정답 ${answerIndex + 1}:`);
              console.log(`    이전: "${originalRationale}"`);
              console.log(`    이후: "${answer[rationaleKey]}"`);
              modifiedCount++;
            }
          }
        });
      });
      
      // 수정된 내용을 파일에 저장
      if (modifiedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
        console.log(`  ✅ ${modifiedCount}개의 rationale 수정됨`);
      } else {
        console.log(`  ℹ️  수정할 내용이 없음`);
      }
      
      totalModified += modifiedCount;
      
    } catch (error) {
      console.error(`❌ ${fileName} 처리 중 오류:`, error.message);
    }
  });
  
  console.log(`\n🎉 전체 완료: 총 ${totalModified}개의 rationale에서 "정답입니다" 접두사 제거됨`);
}

// 실행
removeCorrectAnswerPrefixFromAllLanguages();
