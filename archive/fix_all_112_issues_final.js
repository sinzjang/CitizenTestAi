const fs = require('fs');

console.log('🔧 스페인어 질문 112개 이슈 종합 수정 시작...\n');

// 스페인어 질문 파일 로드
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

// 백업 생성
const backupFilename = `./data/interview_questions_es_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.json`;
fs.writeFileSync(backupFilename, JSON.stringify(spanishQuestions, null, 2));
console.log(`📁 백업 파일 생성: ${backupFilename}`);

// 종합적인 영어-스페인어 번역 사전
const comprehensiveTranslations = {
  // 영어 동사들
  'did': 'hizo',
  'fought': 'luchó',
  'wrote': 'escribió',
  'lived': 'vivió',
  'tried': 'trató',
  'ended': 'terminó',
  'must': 'debe',
  'can': 'puede',
  'will': 'será',
  'would': 'sería',
  'has': 'tiene',
  'have': 'tienen',
  'is': 'es',
  'are': 'son',
  'was': 'fue',
  'were': 'fueron',
  
  // 영어 전치사들
  'on': 'en',
  'at': 'en',
  'in': 'en',
  'of': 'de',
  'for': 'para',
  'to': 'a',
  'with': 'con',
  'from': 'de',
  'after': 'después de',
  'before': 'antes de',
  'during': 'durante',
  
  // 영어 접속사들
  'and': 'y',
  'but': 'pero',
  'or': 'o',
  
  // 영어 관사들
  'the': 'el/la/los/las',
  'an': 'un/una',
  
  // 영어 단어들
  'federal': 'federal',
  'register': 'registrarse',
  'end': 'fin',
  'government': 'gobierno',
  'official': 'oficial',
  'year': 'año',
  'day': 'día',
  'you': 'tú/usted',
  'last': 'último',
  'tax': 'impuesto',
  'forms': 'formularios',
  'income': 'ingresos',
  'send': 'enviar',
  
  // 월 이름들
  'January': 'enero',
  'February': 'febrero',
  'March': 'marzo',
  'April': 'abril',
  'May': 'mayo',
  'June': 'junio',
  'July': 'julio',
  'August': 'agosto',
  'September': 'septiembre',
  'October': 'octubre',
  'November': 'noviembre',
  'December': 'diciembre',
  
  // 숫자들
  'eighteen': 'dieciocho',
  'twenty-six': 'veintiséis',
  
  // 기타 중요 단어들
  'New Year\'s Day': 'Día de Año Nuevo',
  'Age': 'Edad',
  'slavery': 'esclavitud',
  'abolishing': 'aboliendo',
  'written': 'escrito',
  'convention': 'convención',
  'ratified': 'ratificado',
  'adopted': 'adoptado',
  'formed': 'formado'
};

// 특정 패턴 수정 함수
function fixSpecificPatterns(text) {
  if (!text) return text;
  
  let fixed = text;
  
  // 혼재된 문장 구조 수정
  const mixedPatterns = [
    // "There son four amendments" -> "Hay cuatro enmiendas"
    { pattern: /There son four amendments/g, replacement: 'Hay cuatro enmiendas' },
    
    // "qué es one responsibility" -> "¿cuál es una responsabilidad"
    { pattern: /qué es one responsibility/g, replacement: '¿cuál es una responsabilidad' },
    
    // "Name one right only para Estados Unidos citizens" -> "Nombra un derecho solo para ciudadanos de Estados Unidos"
    { pattern: /Name one right only para Estados Unidos citizens/g, replacement: 'Nombra un derecho solo para ciudadanos de Estados Unidos' },
    
    // "qué do we show loyalty" -> "¿qué mostramos lealtad"
    { pattern: /qué do we show loyalty/g, replacement: '¿qué mostramos lealtad' },
    
    // "cómo old do citizens tienen" -> "¿qué edad deben tener los ciudadanos"
    { pattern: /cómo old do citizens tienen/g, replacement: '¿qué edad deben tener los ciudadanos' },
    
    // "cuándo must all men register" -> "¿cuándo deben registrarse todos los hombres"
    { pattern: /cuándo must all men register/g, replacement: '¿cuándo deben registrarse todos los hombres' },
    
    // "quién lived en America" -> "¿quién vivía en América"
    { pattern: /quién lived en America/g, replacement: '¿quién vivía en América' },
    
    // "por qué did el colonists fight" -> "¿por qué lucharon los colonos contra"
    { pattern: /por qué did el colonists fight el British/g, replacement: '¿por qué lucharon los colonos contra los británicos' },
    
    // "quién wrote el Declaración" -> "¿quién escribió la Declaración"
    { pattern: /quién wrote el Declaración/g, replacement: '¿quién escribió la Declaración' },
    
    // "qué territory did el Estados Unidos buy" -> "¿qué territorio compró Estados Unidos"
    { pattern: /qué territory did el Estados Unidos buy de France/g, replacement: '¿qué territorio compró Estados Unidos de Francia' },
    
    // "Name one war fought by el Estados Unidos" -> "Nombra una guerra en la que luchó Estados Unidos"
    { pattern: /Name one war fought by el Estados Unidos/g, replacement: 'Nombra una guerra en la que luchó Estados Unidos' },
    
    // "Name one problem that led un el Guerra Civil" -> "Nombra un problema que llevó a la Guerra Civil"
    { pattern: /Name one problem that led un el Guerra Civil/g, replacement: 'Nombra un problema que llevó a la Guerra Civil' },
    
    // "qué fue one important thing" -> "¿qué fue una cosa importante"
    { pattern: /qué fue one important thing/g, replacement: '¿qué fue una cosa importante' },
    
    // "qué did el Emancipation Proclamation do" -> "¿qué hizo la Proclamación de Emancipación"
    { pattern: /qué did el Emancipation Proclamation do/g, replacement: '¿qué hizo la Proclamación de Emancipación' },
    
    // "qué did Susan B. Anthony do" -> "¿qué hizo Susan B. Anthony"
    { pattern: /qué did Susan B\. Anthony do/g, replacement: '¿qué hizo Susan B. Anthony' },
    
    // "quién did el Estados Unidos fight en World War II" -> "¿contra quién luchó Estados Unidos en la Segunda Guerra Mundial"
    { pattern: /quién did el Estados Unidos fight en World War II/g, replacement: '¿contra quién luchó Estados Unidos en la Segunda Guerra Mundial' },
    
    // "qué movement tried un end" -> "¿qué movimiento trató de terminar"
    { pattern: /qué movement tried un end/g, replacement: '¿qué movimiento trató de terminar' },
    
    // "qué did Martin Luther King, Jr. do" -> "¿qué hizo Martin Luther King, Jr."
    { pattern: /qué did Martin Luther King, Jr\. do/g, replacement: '¿qué hizo Martin Luther King, Jr.' },
    
    // "qué major event ocurrió on September 11" -> "¿qué evento importante ocurrió el 11 de septiembre"
    { pattern: /qué major event ocurrió on September 11/g, replacement: '¿qué evento importante ocurrió el 11 de septiembre' },
    
    // "dónde es el Statue de Liberty" -> "¿dónde está la Estatua de la Libertad"
    { pattern: /dónde es el Statue de Liberty/g, replacement: '¿dónde está la Estatua de la Libertad' },
    
    // "¿Cuándo celebramos Díun de la Independencia" -> "¿Cuándo celebramos el Día de la Independencia"
    { pattern: /¿Cuándo celebramos Díun de la Independencia/g, replacement: '¿Cuándo celebramos el Día de la Independencia' },
    
    // "Name two national EE.UU. holidays" -> "Nombra dos días festivos nacionales de EE.UU."
    { pattern: /Name two national EE\.UU\. holidays/g, replacement: 'Nombra dos días festivos nacionales de EE.UU.' },
    
    // 기타 일반적인 패턴들
    { pattern: /\bel Estados Unidos\b/g, replacement: 'Estados Unidos' },
    { pattern: /\bel British\b/g, replacement: 'los británicos' },
    { pattern: /\bel Europeans\b/g, replacement: 'los europeos' },
    { pattern: /\bel Declaración\b/g, replacement: 'la Declaración' },
    { pattern: /\bel Guerra Civil\b/g, replacement: 'la Guerra Civil' },
    { pattern: /\bel 1800s\b/g, replacement: 'el siglo XIX' },
    { pattern: /\bel 1900s\b/g, replacement: 'el siglo XX' },
    { pattern: /\ben el 1800s\b/g, replacement: 'en el siglo XIX' },
    { pattern: /\ben el 1900s\b/g, replacement: 'en el siglo XX' },
    { pattern: /\bWorld War II\b/g, replacement: 'la Segunda Guerra Mundial' },
    { pattern: /\bGuerra Fríun\b/g, replacement: 'Guerra Fría' },
    { pattern: /\bDíun de la Independencia\b/g, replacement: 'Día de la Independencia' }
  ];
  
  // 패턴 적용
  for (const {pattern, replacement} of mixedPatterns) {
    if (pattern.test(fixed)) {
      console.log(`   🔄 패턴 수정: "${fixed.match(pattern)?.[0]}" → "${replacement}"`);
      fixed = fixed.replace(pattern, replacement);
    }
  }
  
  // 개별 단어 번역
  for (const [english, spanish] of Object.entries(comprehensiveTranslations)) {
    const wordPattern = new RegExp(`\\b${english}\\b`, 'gi');
    if (wordPattern.test(fixed)) {
      console.log(`   🔄 단어 번역: "${english}" → "${spanish}"`);
      fixed = fixed.replace(wordPattern, spanish);
    }
  }
  
  return fixed;
}

// 수정 통계
let totalFixed = 0;
let questionsFixed = 0;

console.log('🔧 질문별 수정 시작...\n');

// 각 질문 수정
for (let i = 0; i < spanishQuestions.length; i++) {
  const question = spanishQuestions[i];
  let questionFixed = false;
  
  // 질문 텍스트 수정
  const originalQuestion = question.question;
  question.question = fixSpecificPatterns(question.question);
  if (originalQuestion !== question.question) {
    console.log(`📝 질문 ${question.id} 텍스트 수정:`);
    console.log(`   이전: "${originalQuestion}"`);
    console.log(`   수정: "${question.question}"`);
    questionFixed = true;
    totalFixed++;
  }
  
  // 정답 수정
  question.correctAnswers.forEach((answer, index) => {
    const originalText = answer.text;
    const originalRationale = answer.rationale;
    
    answer.text = fixSpecificPatterns(answer.text);
    answer.rationale = fixSpecificPatterns(answer.rationale);
    
    if (originalText !== answer.text || originalRationale !== answer.rationale) {
      console.log(`✅ 질문 ${question.id} 정답 ${index + 1} 수정:`);
      if (originalText !== answer.text) {
        console.log(`   텍스트: "${originalText}" → "${answer.text}"`);
        totalFixed++;
      }
      if (originalRationale !== answer.rationale) {
        console.log(`   설명: "${originalRationale}" → "${answer.rationale}"`);
        totalFixed++;
      }
      questionFixed = true;
    }
  });
  
  // 오답 수정
  question.wrongAnswers.forEach((answer, index) => {
    const originalText = answer.text;
    const originalRationale = answer.rationale;
    
    answer.text = fixSpecificPatterns(answer.text);
    answer.rationale = fixSpecificPatterns(answer.rationale);
    
    if (originalText !== answer.text || originalRationale !== answer.rationale) {
      console.log(`❌ 질문 ${question.id} 오답 ${index + 1} 수정:`);
      if (originalText !== answer.text) {
        console.log(`   텍스트: "${originalText}" → "${answer.text}"`);
        totalFixed++;
      }
      if (originalRationale !== answer.rationale) {
        console.log(`   설명: "${originalRationale}" → "${answer.rationale}"`);
        totalFixed++;
      }
      questionFixed = true;
    }
  });
  
  if (questionFixed) {
    questionsFixed++;
  }
  
  // 진행률 표시
  if ((i + 1) % 25 === 0) {
    console.log(`📊 진행률: ${i + 1}/100 (${Math.round((i + 1)/100*100)}%)`);
  }
}

// 수정된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 종합 수정 완료!`);
console.log(`📊 수정 결과:`);
console.log(`  - 수정된 질문: ${questionsFixed}개`);
console.log(`  - 총 수정된 항목: ${totalFixed}개`);
console.log(`  - 백업 파일: ${backupFilename}`);

console.log(`\n🔍 다음 단계: 수정 결과 검증을 위해 분석 스크립트를 다시 실행하세요.`);
console.log(`   node final_accurate_analysis.js`);
