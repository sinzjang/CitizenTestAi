const fs = require('fs');

console.log('🆕 완전히 새로운 스페인어 번역 생성 시작...\n');

// 영어 원본 파일 로드
const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));

console.log(`📖 영어 원본 로드 완료: ${englishQuestions.length}개 질문`);

// 종합적인 영어-스페인어 번역 사전
const translations = {
  // 질문 키워드
  'What': '¿Qué',
  'Who': '¿Quién',
  'When': '¿Cuándo',
  'Where': '¿Dónde',
  'Why': '¿Por qué',
  'How': '¿Cómo',
  'Which': '¿Cuál',
  'Name': 'Nombra',
  'There were': 'Había',
  'There are': 'Hay',
  
  // 정부 관련
  'government': 'gobierno',
  'federal': 'federal',
  'state': 'estado',
  'local': 'local',
  'Constitution': 'Constitución',
  'amendment': 'enmienda',
  'Bill of Rights': 'Declaración de Derechos',
  'Declaration of Independence': 'Declaración de Independencia',
  'President': 'Presidente',
  'Congress': 'Congreso',
  'Senate': 'Senado',
  'House of Representatives': 'Cámara de Representantes',
  'Supreme Court': 'Tribunal Supremo',
  'judicial branch': 'rama judicial',
  'executive branch': 'rama ejecutiva',
  'legislative branch': 'rama legislativa',
  'checks and balances': 'controles y equilibrios',
  'separation of powers': 'separación de poderes',
  'rule of law': 'estado de derecho',
  'federalism': 'federalismo',
  
  // 권리와 자유
  'freedom': 'libertad',
  'liberty': 'libertad',
  'rights': 'derechos',
  'freedom of speech': 'libertad de expresión',
  'freedom of religion': 'libertad de religión',
  'freedom of the press': 'libertad de prensa',
  'right to vote': 'derecho al voto',
  'citizenship': 'ciudadanía',
  'citizen': 'ciudadano',
  'citizens': 'ciudadanos',
  
  // 역사 관련
  'Civil War': 'Guerra Civil',
  'Revolutionary War': 'Guerra de Independencia',
  'World War I': 'Primera Guerra Mundial',
  'World War II': 'Segunda Guerra Mundial',
  'Cold War': 'Guerra Fría',
  'Great Depression': 'Gran Depresión',
  'colonies': 'colonias',
  'colonists': 'colonos',
  'independence': 'independencia',
  'slavery': 'esclavitud',
  'Emancipation Proclamation': 'Proclamación de Emancipación',
  
  // 지리 관련
  'United States': 'Estados Unidos',
  'America': 'América',
  'American': 'estadounidense',
  'Americans': 'estadounidenses',
  'Native Americans': 'nativos americanos',
  'Atlantic Ocean': 'Océano Atlántico',
  'Pacific Ocean': 'Océano Pacífico',
  'Mississippi River': 'Río Mississippi',
  'Missouri River': 'Río Missouri',
  'Rocky Mountains': 'Montañas Rocosas',
  'Great Lakes': 'Grandes Lagos',
  
  // 시간 관련
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
  
  // 기타 중요 단어
  'law': 'ley',
  'laws': 'leyes',
  'vote': 'votar',
  'voting': 'votación',
  'election': 'elección',
  'democracy': 'democracia',
  'republic': 'república',
  'tax': 'impuesto',
  'taxes': 'impuestos',
  'military': 'militar',
  'war': 'guerra',
  'peace': 'paz',
  'flag': 'bandera',
  'national anthem': 'himno nacional',
  'Pledge of Allegiance': 'Juramento de Lealtad',
  'holiday': 'día festivo',
  'Independence Day': 'Día de la Independencia',
  'Memorial Day': 'Día de los Caídos',
  'Veterans Day': 'Día de los Veteranos',
  'Thanksgiving': 'Día de Acción de Gracias',
  'Christmas': 'Navidad',
  'New Year\'s Day': 'Día de Año Nuevo'
};

// 텍스트 번역 함수
function translateText(text) {
  if (!text) return text;
  
  let translated = text;
  
  // 기본 번역 적용
  for (const [english, spanish] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, spanish);
  }
  
  // 특수 패턴 처리
  translated = translated
    // 질문 형태 수정
    .replace(/^What is /gi, '¿Qué es ')
    .replace(/^Who is /gi, '¿Quién es ')
    .replace(/^When was /gi, '¿Cuándo fue ')
    .replace(/^Where is /gi, '¿Dónde está ')
    .replace(/^Why did /gi, '¿Por qué ')
    .replace(/^How old /gi, '¿Qué edad ')
    .replace(/^Name one /gi, 'Nombra un ')
    .replace(/^Name two /gi, 'Nombra dos ')
    .replace(/^Name three /gi, 'Nombra tres ')
    
    // 일반적인 구문 번역
    .replace(/\bis\b/g, 'es')
    .replace(/\bare\b/g, 'son')
    .replace(/\bwas\b/g, 'fue')
    .replace(/\bwere\b/g, 'fueron')
    .replace(/\bhas\b/g, 'tiene')
    .replace(/\bhave\b/g, 'tienen')
    .replace(/\bcan\b/g, 'puede')
    .replace(/\bmust\b/g, 'debe')
    .replace(/\bwill\b/g, 'será')
    .replace(/\bdo\b/g, 'hacer')
    .replace(/\bdoes\b/g, 'hace')
    .replace(/\bdid\b/g, 'hizo')
    
    // 전치사
    .replace(/\bof\b/g, 'de')
    .replace(/\bfor\b/g, 'para')
    .replace(/\bto\b/g, 'a')
    .replace(/\bin\b/g, 'en')
    .replace(/\bon\b/g, 'en')
    .replace(/\bat\b/g, 'en')
    .replace(/\bwith\b/g, 'con')
    .replace(/\bfrom\b/g, 'de')
    .replace(/\bby\b/g, 'por')
    
    // 접속사
    .replace(/\band\b/g, 'y')
    .replace(/\bor\b/g, 'o')
    .replace(/\bbut\b/g, 'pero')
    
    // 관사
    .replace(/\bthe\b/g, 'el/la')
    .replace(/\ba\b/g, 'un/una')
    .replace(/\ban\b/g, 'un/una')
    
    // 기타
    .replace(/\bone\b/g, 'uno')
    .replace(/\btwo\b/g, 'dos')
    .replace(/\bthree\b/g, 'tres')
    .replace(/\bfour\b/g, 'cuatro')
    .replace(/\bfive\b/g, 'cinco')
    .replace(/\byou\b/g, 'tú')
    .replace(/\byour\b/g, 'tu')
    .replace(/\bwe\b/g, 'nosotros')
    .replace(/\bour\b/g, 'nuestro')
    .replace(/\bthey\b/g, 'ellos')
    .replace(/\btheir\b/g, 'su')
    
    // 질문 끝에 물음표 추가
    .replace(/\?$/, '?')
    .replace(/([^?])$/, '$1?');
  
  // 첫 글자 대문자 처리
  if (translated.length > 0) {
    translated = translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  
  return translated;
}

// 새로운 스페인어 질문 배열 생성
const spanishQuestions = [];

console.log('🔄 질문별 번역 시작...\n');

for (let i = 0; i < englishQuestions.length; i++) {
  const englishQ = englishQuestions[i];
  
  console.log(`📝 질문 ${englishQ.id} 번역 중...`);
  
  const spanishQ = {
    id: englishQ.id,
    question: translateText(englishQ.question),
    correctAnswers: englishQ.correctAnswers.map(answer => ({
      text: translateText(answer.text),
      rationale: translateText(answer.rationale)
    })),
    wrongAnswers: englishQ.wrongAnswers.map(answer => ({
      text: translateText(answer.text),
      rationale: translateText(answer.rationale)
    }))
  };
  
  spanishQuestions.push(spanishQ);
  
  // 진행률 표시
  if ((i + 1) % 10 === 0) {
    console.log(`📊 진행률: ${i + 1}/100 (${Math.round((i + 1)/100*100)}%)`);
  }
}

// 새로운 스페인어 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 완전히 새로운 스페인어 번역 완료!`);
console.log(`📊 결과:`);
console.log(`  - 총 질문: ${spanishQuestions.length}개`);
console.log(`  - 새 파일: ./data/interview_questions_es.json`);
console.log(`  - 백업 파일: ./data/interview_questions_es_old_mixed_backup.json`);

console.log(`\n🔍 다음 단계: 번역 품질 검증을 위해 분석 스크립트 실행`);
console.log(`   node final_accurate_analysis.js`);
