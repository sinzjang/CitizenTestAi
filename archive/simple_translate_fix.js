const fs = require('fs');

console.log('🎯 간단한 Text와 Rationale 번역 수정 시작...\n');

// 현재 스페인어 파일 로드
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log(`📖 현재 스페인어 파일 로드: ${spanishQuestions.length}개 질문`);

// 백업 생성
const backupFilename = `./data/interview_questions_es_backup_simple_${Date.now()}.json`;
fs.writeFileSync(backupFilename, JSON.stringify(spanishQuestions, null, 2));
console.log(`📁 백업 생성: ${backupFilename}`);

// 간단한 번역 함수
function simpleTranslate(text) {
  if (!text) return text;
  
  let result = text;
  
  // 1단계: 영어 관사 제거
  result = result.replace(/\bthe\s+/gi, '');
  result = result.replace(/\ba\s+/gi, '');
  result = result.replace(/\ban\s+/gi, '');
  
  // 2단계: 핵심 단어 번역
  const dict = {
    'Constitution': 'Constitución',
    'Bill of Rights': 'Declaración de Derechos',
    'Declaration of Independence': 'Declaración de Independencia',
    'Federalist Papers': 'Documentos Federalistas',
    'Supreme Court': 'Tribunal Supremo',
    'Congress': 'Congreso',
    'President': 'Presidente',
    'government': 'gobierno',
    'federal': 'federal',
    'law': 'ley',
    'laws': 'leyes',
    'rights': 'derechos',
    'freedom': 'libertad',
    'citizens': 'ciudadanos',
    'citizen': 'ciudadano',
    'Americans': 'estadounidenses',
    'American': 'estadounidense',
    'United States': 'Estados Unidos',
    'U.S.': 'EE.UU.',
    'amendment': 'enmienda',
    'amendments': 'enmiendas'
  };
  
  for (const [en, es] of Object.entries(dict)) {
    result = result.replace(new RegExp(`\\b${en}\\b`, 'gi'), es);
  }
  
  // 3단계: 기본 동사
  result = result
    .replace(/\bis\b/g, 'es')
    .replace(/\bare\b/g, 'son')
    .replace(/\bwas\b/g, 'fue')
    .replace(/\bwere\b/g, 'fueron')
    .replace(/\bhas\b/g, 'tiene')
    .replace(/\bhave\b/g, 'tienen')
    .replace(/\bcan\b/g, 'puede')
    .replace(/\bdoes\b/g, 'hace')
    .replace(/\bdo\b/g, 'hacer')
    .replace(/\bdid\b/g, 'hizo')
    .replace(/\bmake\b/g, 'hacer')
    .replace(/\bmakes\b/g, 'hace')
    .replace(/\bmade\b/g, 'hizo');
  
  // 4단계: 전치사와 접속사
  result = result
    .replace(/\band\b/g, 'y')
    .replace(/\bor\b/g, 'o')
    .replace(/\bbut\b/g, 'pero')
    .replace(/\bof\b/g, 'de')
    .replace(/\bfor\b/g, 'para')
    .replace(/\bto\b/g, 'a')
    .replace(/\bin\b/g, 'en')
    .replace(/\bon\b/g, 'en')
    .replace(/\bwith\b/g, 'con')
    .replace(/\bfrom\b/g, 'de')
    .replace(/\bby\b/g, 'por')
    .replace(/\bnot\b/g, 'no')
    .replace(/\bthis\b/g, 'esto')
    .replace(/\bthat\b/g, 'eso')
    .replace(/\bone\b/g, 'uno')
    .replace(/\btwo\b/g, 'dos')
    .replace(/\bthree\b/g, 'tres')
    .replace(/\bfirst\b/g, 'primero')
    .replace(/\bsecond\b/g, 'segundo')
    .replace(/\bthird\b/g, 'tercero')
    .replace(/\bmain\b/g, 'principal')
    .replace(/\bimportant\b/g, 'importante')
    .replace(/\bnew\b/g, 'nuevo')
    .replace(/\bold\b/g, 'viejo')
    .replace(/\bgood\b/g, 'bueno')
    .replace(/\bbad\b/g, 'malo')
    .replace(/\bbig\b/g, 'grande')
    .replace(/\bsmall\b/g, 'pequeño');
  
  return result;
}

let totalFixed = 0;

// 모든 질문 처리
for (let i = 0; i < spanishQuestions.length; i++) {
  const question = spanishQuestions[i];
  
  // 정답 번역
  question.correctAnswers.forEach(answer => {
    const originalText = answer.text;
    const originalRationale = answer.rationale;
    
    answer.text = simpleTranslate(answer.text);
    answer.rationale = simpleTranslate(answer.rationale);
    
    if (originalText !== answer.text || originalRationale !== answer.rationale) {
      totalFixed++;
    }
  });
  
  // 오답 번역
  question.wrongAnswers.forEach(answer => {
    const originalText = answer.text;
    const originalRationale = answer.rationale;
    
    answer.text = simpleTranslate(answer.text);
    answer.rationale = simpleTranslate(answer.rationale);
    
    if (originalText !== answer.text || originalRationale !== answer.rationale) {
      totalFixed++;
    }
  });
  
  if ((i + 1) % 25 === 0) {
    console.log(`📊 진행률: ${i + 1}/100 (${Math.round((i + 1)/100*100)}%)`);
  }
}

// 수정된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 번역 수정 완료!`);
console.log(`📊 결과:`);
console.log(`  - 수정된 항목: ${totalFixed}개`);
console.log(`  - 백업 파일: ${backupFilename}`);

console.log(`\n🔍 다음 단계: 번역 품질 검증`);
console.log(`   node final_accurate_analysis.js`);
