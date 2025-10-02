const fs = require('fs');
const path = require('path');

// 영문 데이터를 기준으로 다른 언어 파일들을 동기화하는 스크립트
function syncMultilingualQuestions() {
  console.log('🚀 다국어 질문 데이터 동기화 시작...');
  
  // 영문 데이터 로드 (마스터 템플릿)
  const englishFilePath = './data/interview_questions_en.json';
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  
  console.log(`✅ 영문 데이터 로드 완료: ${englishData.length}개 문제`);
  
  // 다른 언어 파일들
  const languageFiles = [
    { code: 'ko', file: './data/interview_questions_ko.json', name: '한국어' },
    { code: 'zh', file: './data/interview_questions_zh.json', name: '중국어' },
    { code: 'vi', file: './data/interview_questions_vi.json', name: '베트남어' },
    { code: 'tl', file: './data/interview_questions_tl.json', name: '타갈로그어' },
    { code: 'hi', file: './data/interview_questions_hi.json', name: '힌디어' }
  ];
  
  languageFiles.forEach(lang => {
    console.log(`\n📝 ${lang.name} 파일 처리 중...`);
    
    try {
      // 기존 언어 데이터 로드
      const existingData = JSON.parse(fs.readFileSync(lang.file, 'utf8'));
      console.log(`   기존 데이터: ${existingData.length}개 문제`);
      
      // 영문 구조를 기반으로 새로운 데이터 생성
      const syncedData = englishData.map(englishQuestion => {
        // 기존 데이터에서 해당 문제 찾기
        const existingQuestion = existingData.find(q => q.id === englishQuestion.id);
        
        if (existingQuestion) {
          // 기존 번역이 있는 경우, 구조만 영문에 맞춰 업데이트
          const syncedQuestion = {
            id: englishQuestion.id,
            question: existingQuestion.question || englishQuestion.question,
            correctAnswers: [],
            wrongAnswers: []
          };
          
          // 정답들 동기화
          englishQuestion.correctAnswers.forEach((englishAnswer, index) => {
            const existingAnswer = existingQuestion.correctAnswers?.[index];
            syncedQuestion.correctAnswers.push({
              text: existingAnswer?.text || `[번역 필요] ${englishAnswer.text}`,
              rationale: existingAnswer?.rationale || `[번역 필요] ${englishAnswer.rationale}`
            });
          });
          
          // 오답들 동기화
          englishQuestion.wrongAnswers.forEach((englishWrong, index) => {
            const existingWrong = existingQuestion.wrongAnswers?.[index];
            syncedQuestion.wrongAnswers.push({
              text: existingWrong?.text || `[번역 필요] ${englishWrong.text}`,
              rationale: existingWrong?.rationale || `[번역 필요] ${englishWrong.rationale}`
            });
          });
          
          return syncedQuestion;
        } else {
          // 새로운 문제인 경우 번역 필요 표시
          return {
            id: englishQuestion.id,
            question: `[번역 필요] ${englishQuestion.question}`,
            correctAnswers: englishQuestion.correctAnswers.map(answer => ({
              text: `[번역 필요] ${answer.text}`,
              rationale: `[번역 필요] ${answer.rationale}`
            })),
            wrongAnswers: englishQuestion.wrongAnswers.map(wrong => ({
              text: `[번역 필요] ${wrong.text}`,
              rationale: `[번역 필요] ${wrong.rationale}`
            }))
          };
        }
      });
      
      // 백업 파일 생성
      const backupFile = lang.file.replace('.json', '_backup.json');
      fs.writeFileSync(backupFile, JSON.stringify(existingData, null, 2), 'utf8');
      console.log(`   ✅ 백업 파일 생성: ${backupFile}`);
      
      // 동기화된 데이터 저장
      fs.writeFileSync(lang.file, JSON.stringify(syncedData, null, 2), 'utf8');
      console.log(`   ✅ ${lang.name} 파일 업데이트 완료: ${syncedData.length}개 문제`);
      
      // 번역 필요한 항목 개수 확인
      const needsTranslation = JSON.stringify(syncedData).match(/\[번역 필요\]/g);
      const translationCount = needsTranslation ? needsTranslation.length : 0;
      console.log(`   📋 번역 필요한 항목: ${translationCount}개`);
      
    } catch (error) {
      console.error(`   ❌ ${lang.name} 파일 처리 실패:`, error.message);
    }
  });
  
  console.log('\n🎉 다국어 질문 데이터 동기화 완료!');
  console.log('\n📋 다음 단계:');
  console.log('1. 각 언어 파일에서 "[번역 필요]" 표시된 항목들을 번역');
  console.log('2. JSON 구문 검증 실행');
  console.log('3. 앱에서 이중 언어 표시 테스트');
}

// 특정 언어만 동기화하는 함수
function syncSpecificLanguage(languageCode) {
  console.log(`🎯 ${languageCode} 언어만 동기화 중...`);
  
  const englishData = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));
  const langFile = `./data/interview_questions_${languageCode}.json`;
  
  try {
    const existingData = JSON.parse(fs.readFileSync(langFile, 'utf8'));
    
    // 영문 기준으로 구조 동기화
    const syncedData = englishData.map(englishQuestion => {
      const existingQuestion = existingData.find(q => q.id === englishQuestion.id);
      
      if (existingQuestion) {
        return {
          id: englishQuestion.id,
          question: existingQuestion.question || englishQuestion.question,
          correctAnswers: englishQuestion.correctAnswers.map((englishAnswer, index) => {
            const existingAnswer = existingQuestion.correctAnswers?.[index];
            return {
              text: existingAnswer?.text || `[번역 필요] ${englishAnswer.text}`,
              rationale: existingAnswer?.rationale || `[번역 필요] ${englishAnswer.rationale}`
            };
          }),
          wrongAnswers: englishQuestion.wrongAnswers.map((englishWrong, index) => {
            const existingWrong = existingQuestion.wrongAnswers?.[index];
            return {
              text: existingWrong?.text || `[번역 필요] ${englishWrong.text}`,
              rationale: existingWrong?.rationale || `[번역 필요] ${englishWrong.rationale}`
            };
          })
        };
      } else {
        return {
          id: englishQuestion.id,
          question: `[번역 필요] ${englishQuestion.question}`,
          correctAnswers: englishQuestion.correctAnswers.map(answer => ({
            text: `[번역 필요] ${answer.text}`,
            rationale: `[번역 필요] ${answer.rationale}`
          })),
          wrongAnswers: englishQuestion.wrongAnswers.map(wrong => ({
            text: `[번역 필요] ${wrong.text}`,
            rationale: `[번역 필요] ${wrong.rationale}`
          }))
        };
      }
    });
    
    // 백업 및 저장
    const backupFile = langFile.replace('.json', '_backup.json');
    fs.writeFileSync(backupFile, JSON.stringify(existingData, null, 2), 'utf8');
    fs.writeFileSync(langFile, JSON.stringify(syncedData, null, 2), 'utf8');
    
    console.log(`✅ ${languageCode} 동기화 완료!`);
    
  } catch (error) {
    console.error(`❌ ${languageCode} 동기화 실패:`, error.message);
  }
}

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.length > 0) {
  const languageCode = args[0];
  syncSpecificLanguage(languageCode);
} else {
  syncMultilingualQuestions();
}
