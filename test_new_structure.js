#!/usr/bin/env node
/**
 * 새로운 파일 구조와 QuestionLoader 테스트 스크립트
 */

const QuestionLoader = require('./utils/questionLoader');
const QuestionProcessor = require('./utils/questionProcessor');

async function testQuestionLoader() {
  console.log('🧪 Testing QuestionLoader...\n');
  
  try {
    // 1. 기본 질문 로드 테스트
    console.log('1. Loading questions with current language...');
    const questions = await QuestionLoader.loadQuestions();
    console.log(`✅ Loaded ${questions.length} questions`);
    
    if (questions.length > 0) {
      const firstQuestion = questions[0];
      console.log(`   First question ID: ${firstQuestion.id}`);
      console.log(`   Question: ${firstQuestion.question}`);
      console.log(`   Correct answers: ${firstQuestion.correctAnswers.length}`);
      console.log(`   First correct answer: ${firstQuestion.correctAnswers[0].text}`);
    }
    
    // 2. 특정 언어 로드 테스트
    console.log('\n2. Loading questions for specific languages...');
    const languages = ['en', 'ko', 'es', 'zh'];
    
    for (const lang of languages) {
      try {
        const langQuestions = await QuestionLoader.loadQuestionsForLanguage(lang);
        console.log(`✅ ${lang}: ${langQuestions.length} questions loaded`);
      } catch (error) {
        console.log(`❌ ${lang}: Failed to load - ${error.message}`);
      }
    }
    
    // 3. 특정 질문 ID로 로드 테스트
    console.log('\n3. Loading specific question by ID...');
    const question25 = await QuestionLoader.loadQuestionById(25);
    if (question25) {
      console.log(`✅ Question 25 loaded: ${question25.question}`);
    } else {
      console.log('❌ Question 25 not found');
    }
    
    // 4. 지원되는 언어 확인
    console.log('\n4. Supported languages:');
    const supportedLanguages = QuestionLoader.getSupportedLanguages();
    console.log(`✅ ${supportedLanguages.join(', ')}`);
    
    // 5. 질문 통계
    console.log('\n5. Question statistics:');
    const stats = await QuestionLoader.getQuestionStats();
    console.log(`✅ Language: ${stats.language}`);
    console.log(`   Total questions: ${stats.totalQuestions}`);
    console.log(`   Question ID range: ${stats.firstQuestionId} - ${stats.lastQuestionId}`);
    
  } catch (error) {
    console.error('❌ Error testing QuestionLoader:', error);
  }
}

async function testQuestionProcessor() {
  console.log('\n🧪 Testing QuestionProcessor...\n');
  
  try {
    // 1. 일반 질문 처리 테스트
    console.log('1. Processing regular question...');
    const questions = await QuestionLoader.loadQuestions();
    const regularQuestion = questions.find(q => q.id === 1); // 일반 질문
    
    if (regularQuestion) {
      const processed = await QuestionProcessor.processQuestion(regularQuestion);
      console.log(`✅ Regular question processed: ${processed.question}`);
    }
    
    // 2. 지역 의존 질문 처리 테스트
    console.log('\n2. Processing location-dependent question...');
    const locationQuestion = questions.find(q => q.id === 25); // 상원의원 질문
    
    if (locationQuestion) {
      const processed = await QuestionProcessor.processQuestion(locationQuestion);
      console.log(`✅ Location question processed: ${processed.question}`);
      console.log(`   Answer: ${processed.correctAnswers[0].text}`);
    }
    
    // 3. 누락된 위치 정보 확인
    console.log('\n3. Checking missing location info...');
    const missingInfo = await QuestionProcessor.checkMissingLocationInfo();
    console.log(`✅ Has state: ${missingInfo.hasState}`);
    console.log(`   Missing info: ${missingInfo.missingInfo.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error testing QuestionProcessor:', error);
  }
}

async function main() {
  console.log('🚀 Testing new question file structure...\n');
  
  await testQuestionLoader();
  await testQuestionProcessor();
  
  console.log('\n🎉 Testing completed!');
}

// CommonJS 환경에서 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testQuestionLoader, testQuestionProcessor };
