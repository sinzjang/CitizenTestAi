const fs = require('fs');

console.log('🎯 완전한 스페인어 번역 시작...\n');

// 스페인어 파일 로드
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log(`📖 스페인어 파일 로드: ${spanishQuestions.length}개 질문`);

// 백업 생성
const backupFilename = `./data/interview_questions_es_backup_complete_${Date.now()}.json`;
fs.writeFileSync(backupFilename, JSON.stringify(spanishQuestions, null, 2));
console.log(`📁 백업 생성: ${backupFilename}`);

// 완전한 번역 함수
function translateToSpanish(text) {
  if (!text) return text;
  
  let result = text;
  
  // 1단계: 영어 관사 제거/교체
  result = result.replace(/\bthe\s+/gi, '');
  result = result.replace(/\ba\s+/gi, '');
  result = result.replace(/\ban\s+/gi, '');
  
  // 2단계: 핵심 정부/역사 용어 번역
  const keyTerms = {
    'Constitution': 'Constitución',
    'Bill of Rights': 'Declaración de Derechos',
    'Declaration of Independence': 'Declaración de Independencia',
    'Federalist Papers': 'Documentos Federalistas',
    'Supreme Court': 'Tribunal Supremo',
    'Congress': 'Congreso',
    'Senate': 'Senado',
    'House of Representatives': 'Cámara de Representantes',
    'President': 'Presidente',
    'Vice President': 'Vicepresidente',
    'Speaker of the House': 'Presidente de la Cámara',
    'Chief Justice': 'Presidente del Tribunal Supremo',
    'Cabinet': 'Gabinete',
    'Governor': 'Gobernador',
    'Commander in Chief': 'Comandante en Jefe',
    'United States': 'Estados Unidos',
    'U.S.': 'EE.UU.',
    'Americans': 'estadounidenses',
    'American': 'estadounidense',
    'citizens': 'ciudadanos',
    'citizen': 'ciudadano',
    'government': 'gobierno',
    'federal': 'federal',
    'state': 'estado',
    'local': 'local',
    'national': 'nacional',
    'law': 'ley',
    'laws': 'leyes',
    'rights': 'derechos',
    'freedom': 'libertad',
    'liberty': 'libertad',
    'democracy': 'democracia',
    'republic': 'república',
    'amendment': 'enmienda',
    'amendments': 'enmiendas',
    'branch': 'rama',
    'branches': 'ramas',
    'executive': 'ejecutiva',
    'legislative': 'legislativa',
    'judicial': 'judicial',
    'powers': 'poderes',
    'power': 'poder',
    'authority': 'autoridad',
    'responsibility': 'responsabilidad',
    'responsibilities': 'responsabilidades',
    'independence': 'independencia',
    'slavery': 'esclavitud',
    'slaves': 'esclavos',
    'Civil War': 'Guerra Civil',
    'Revolutionary War': 'Guerra de Independencia',
    'World War I': 'Primera Guerra Mundial',
    'World War II': 'Segunda Guerra Mundial',
    'Cold War': 'Guerra Fría',
    'Great Depression': 'Gran Depresión',
    'colonists': 'colonos',
    'colonies': 'colonias',
    'British': 'británicos',
    'Europeans': 'europeos',
    'Native Americans': 'nativos americanos',
    'American Indians': 'indígenas americanos'
  };
  
  // 용어 번역 적용
  for (const [english, spanish] of Object.entries(keyTerms)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, spanish);
  }
  
  // 3단계: 기본 동사 번역
  const verbs = {
    'is': 'es',
    'are': 'son',
    'was': 'fue',
    'were': 'fueron',
    'has': 'tiene',
    'have': 'tienen',
    'can': 'puede',
    'cannot': 'no puede',
    'must': 'debe',
    'will': 'será',
    'would': 'sería',
    'does': 'hace',
    'do': 'hacer',
    'did': 'hizo',
    'make': 'hacer',
    'makes': 'hace',
    'made': 'hizo',
    'get': 'obtener',
    'gets': 'obtiene',
    'got': 'obtuvo',
    'give': 'dar',
    'gives': 'da',
    'gave': 'dio',
    'take': 'tomar',
    'takes': 'toma',
    'took': 'tomó',
    'establish': 'establecer',
    'establishes': 'establece',
    'established': 'estableció',
    'define': 'definir',
    'defines': 'define',
    'defined': 'definió',
    'protect': 'proteger',
    'protects': 'protege',
    'protected': 'protegió',
    'serve': 'servir',
    'serves': 'sirve',
    'served': 'sirvió',
    'elect': 'elegir',
    'elects': 'elige',
    'elected': 'eligió',
    'vote': 'votar',
    'votes': 'vota',
    'voted': 'votó',
    'represent': 'representar',
    'represents': 'representa',
    'represented': 'representó',
    'command': 'comandar',
    'commands': 'comanda',
    'commanded': 'comandó',
    'enforce': 'hacer cumplir',
    'enforces': 'hace cumplir',
    'enforced': 'hizo cumplir',
    'collect': 'recoger',
    'collects': 'recoge',
    'collected': 'recogió',
    'sign': 'firmar',
    'signs': 'firma',
    'signed': 'firmó',
    'write': 'escribir',
    'writes': 'escribe',
    'wrote': 'escribió',
    'written': 'escrito',
    'declare': 'declarar',
    'declares': 'declara',
    'declared': 'declaró',
    'fight': 'luchar',
    'fights': 'lucha',
    'fought': 'luchó',
    'win': 'ganar',
    'wins': 'gana',
    'won': 'ganó',
    'lose': 'perder',
    'loses': 'pierde',
    'lost': 'perdió',
    'live': 'vivir',
    'lives': 'vive',
    'lived': 'vivió',
    'work': 'trabajar',
    'works': 'trabaja',
    'worked': 'trabajó',
    'help': 'ayudar',
    'helps': 'ayuda',
    'helped': 'ayudó',
    'use': 'usar',
    'uses': 'usa',
    'used': 'usó',
    'create': 'crear',
    'creates': 'crea',
    'created': 'creó',
    'form': 'formar',
    'forms': 'forma',
    'formed': 'formó',
    'include': 'incluir',
    'includes': 'incluye',
    'included': 'incluyó',
    'provide': 'proporcionar',
    'provides': 'proporciona',
    'provided': 'proporcionó',
    'allow': 'permitir',
    'allows': 'permite',
    'allowed': 'permitió',
    'grant': 'otorgar',
    'grants': 'otorga',
    'granted': 'otorgó',
    'set up': 'establecer',
    'sets up': 'establece'
  };
  
  for (const [english, spanish] of Object.entries(verbs)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, spanish);
  }
  
  // 4단계: 전치사, 접속사, 기본 단어
  const basicWords = {
    'and': 'y',
    'or': 'o',
    'but': 'pero',
    'of': 'de',
    'for': 'para',
    'to': 'a',
    'in': 'en',
    'on': 'en',
    'at': 'en',
    'with': 'con',
    'from': 'de',
    'by': 'por',
    'into': 'en',
    'over': 'sobre',
    'under': 'bajo',
    'through': 'a través de',
    'during': 'durante',
    'before': 'antes de',
    'after': 'después de',
    'between': 'entre',
    'among': 'entre',
    'against': 'contra',
    'not': 'no',
    'this': 'esto',
    'that': 'eso',
    'these': 'estos',
    'those': 'esos',
    'one': 'uno',
    'two': 'dos',
    'three': 'tres',
    'first': 'primero',
    'second': 'segundo',
    'third': 'tercero',
    'main': 'principal',
    'important': 'importante',
    'new': 'nuevo',
    'old': 'viejo',
    'good': 'bueno',
    'bad': 'malo',
    'big': 'grande',
    'small': 'pequeño',
    'high': 'alto',
    'low': 'bajo',
    'basic': 'básico',
    'fundamental': 'fundamental',
    'supreme': 'supremo',
    'foundational': 'fundamental',
    'crucial': 'crucial',
    'entire': 'entero',
    'whole': 'todo',
    'part': 'parte',
    'section': 'sección',
    'document': 'documento',
    'documents': 'documentos',
    'essay': 'ensayo',
    'essays': 'ensayos',
    'series': 'serie',
    'people': 'gente',
    'person': 'persona',
    'itself': 'en sí',
    'themselves': 'en sí mismos',
    'each': 'cada',
    'every': 'cada',
    'all': 'todos',
    'some': 'algunos',
    'many': 'muchos',
    'several': 'varios',
    'both': 'ambos',
    'either': 'cualquiera',
    'neither': 'ninguno',
    'only': 'solo',
    'just': 'solo',
    'also': 'también',
    'too': 'también',
    'very': 'muy',
    'quite': 'bastante',
    'rather': 'bastante',
    'really': 'realmente',
    'actually': 'realmente',
    'truly': 'verdaderamente',
    'certainly': 'ciertamente',
    'definitely': 'definitivamente',
    'absolutely': 'absolutamente',
    'completely': 'completamente',
    'entirely': 'enteramente',
    'fully': 'completamente',
    'totally': 'totalmente',
    'partly': 'parcialmente',
    'partially': 'parcialmente',
    'mostly': 'principalmente',
    'mainly': 'principalmente',
    'primarily': 'principalmente',
    'especially': 'especialmente',
    'particularly': 'particularmente',
    'specifically': 'específicamente',
    'generally': 'generalmente',
    'usually': 'usualmente',
    'normally': 'normalmente',
    'typically': 'típicamente',
    'often': 'a menudo',
    'sometimes': 'a veces',
    'always': 'siempre',
    'never': 'nunca',
    'already': 'ya',
    'still': 'todavía',
    'yet': 'aún',
    'again': 'otra vez',
    'more': 'más',
    'most': 'la mayoría',
    'less': 'menos',
    'least': 'lo menos',
    'much': 'mucho',
    'many': 'muchos',
    'few': 'pocos',
    'little': 'poco',
    'enough': 'suficiente',
    'too': 'demasiado'
  };
  
  for (const [english, spanish] of Object.entries(basicWords)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, spanish);
  }
  
  // 5단계: 문장 구조 개선
  result = result
    .replace(/\bOne de\b/gi, 'Una de')
    .replace(/\bOne del\b/gi, 'Una del')
    .replace(/\bOne de las\b/gi, 'Una de las')
    .replace(/\bOne de los\b/gi, 'Una de los')
    .replace(/\bSeveral de\b/gi, 'Varias de')
    .replace(/\bSeveral enmiendas\b/gi, 'Varias enmiendas')
    .replace(/\bincluding\b/gi, 'incluyendo')
    .replace(/\bsuch as\b/gi, 'como')
    .replace(/\bfor example\b/gi, 'por ejemplo')
    .replace(/\bhowever\b/gi, 'sin embargo')
    .replace(/\btherefore\b/gi, 'por lo tanto')
    .replace(/\bmoreover\b/gi, 'además')
    .replace(/\bfurthermore\b/gi, 'además')
    .replace(/\bnevertheless\b/gi, 'sin embargo')
    .replace(/\bmeanwhile\b/gi, 'mientras tanto')
    .replace(/\bfinally\b/gi, 'finalmente')
    .replace(/\beventually\b/gi, 'eventualmente')
    .replace(/\bconsequently\b/gi, 'en consecuencia')
    .replace(/\bas a result\b/gi, 'como resultado')
    .replace(/\bin addition\b/gi, 'además')
    .replace(/\bin conclusion\b/gi, 'en conclusión')
    .replace(/\bin summary\b/gi, 'en resumen')
    .replace(/\bin other words\b/gi, 'en otras palabras')
    .replace(/\bthat is\b/gi, 'es decir')
    .replace(/\bnamely\b/gi, 'a saber')
    .replace(/\bspecifically\b/gi, 'específicamente')
    .replace(/\bparticularly\b/gi, 'particularmente')
    .replace(/\bespecially\b/gi, 'especialmente')
    .replace(/\bnotably\b/gi, 'notablemente')
    .replace(/\bremarkably\b/gi, 'notablemente')
    .replace(/\bsignificantly\b/gi, 'significativamente')
    .replace(/\bconsiderably\b/gi, 'considerablemente')
    .replace(/\bsubstantially\b/gi, 'sustancialmente')
    .replace(/\bextremely\b/gi, 'extremadamente')
    .replace(/\bincredibly\b/gi, 'increíblemente')
    .replace(/\bamazingly\b/gi, 'asombrosamente')
    .replace(/\bsurprisingly\b/gi, 'sorprendentemente')
    .replace(/\bobviously\b/gi, 'obviamente')
    .replace(/\bclearly\b/gi, 'claramente')
    .replace(/\bapparently\b/gi, 'aparentemente')
    .replace(/\bpresumably\b/gi, 'presumiblemente')
    .replace(/\bpossibly\b/gi, 'posiblemente')
    .replace(/\bprobably\b/gi, 'probablemente')
    .replace(/\blikely\b/gi, 'probablemente')
    .replace(/\bunlikely\b/gi, 'improbablemente')
    .replace(/\bcertainly\b/gi, 'ciertamente')
    .replace(/\bundoubtedly\b/gi, 'indudablemente')
    .replace(/\bwithout doubt\b/gi, 'sin duda')
    .replace(/\bno doubt\b/gi, 'sin duda')
    .replace(/\bof course\b/gi, 'por supuesto')
    .replace(/\bnaturally\b/gi, 'naturalmente')
    .replace(/\bobviously\b/gi, 'obviamente')
    .replace(/\bclearly\b/gi, 'claramente');
  
  // 6단계: 스페인어 관사 추가 (필요한 경우)
  result = result
    .replace(/^Constitución/gi, 'La Constitución')
    .replace(/^Declaración de Independencia/gi, 'La Declaración de Independencia')
    .replace(/^Declaración de Derechos/gi, 'La Declaración de Derechos')
    .replace(/^Documentos Federalistas/gi, 'Los Documentos Federalistas')
    .replace(/^Tribunal Supremo/gi, 'El Tribunal Supremo')
    .replace(/^Congreso/gi, 'El Congreso')
    .replace(/^Presidente/gi, 'El Presidente');
  
  return result;
}

let totalTranslated = 0;
let questionsProcessed = 0;

// 모든 질문 처리
for (let i = 0; i < spanishQuestions.length; i++) {
  const question = spanishQuestions[i];
  questionsProcessed++;
  
  // 정답 번역
  question.correctAnswers.forEach(answer => {
    const originalText = answer.text;
    const originalRationale = answer.rationale;
    
    answer.text = translateToSpanish(answer.text);
    answer.rationale = translateToSpanish(answer.rationale);
    
    if (originalText !== answer.text || originalRationale !== answer.rationale) {
      totalTranslated++;
    }
  });
  
  // 오답 번역
  question.wrongAnswers.forEach(answer => {
    const originalText = answer.text;
    const originalRationale = answer.rationale;
    
    answer.text = translateToSpanish(answer.text);
    answer.rationale = translateToSpanish(answer.rationale);
    
    if (originalText !== answer.text || originalRationale !== answer.rationale) {
      totalTranslated++;
    }
  });
  
  if (questionsProcessed % 20 === 0) {
    console.log(`📊 진행률: ${questionsProcessed}/100 (${Math.round(questionsProcessed/100*100)}%)`);
  }
}

// 수정된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 완전한 스페인어 번역 완료!`);
console.log(`📊 결과:`);
console.log(`  - 처리된 질문: ${questionsProcessed}개`);
console.log(`  - 번역된 항목: ${totalTranslated}개`);
console.log(`  - 백업 파일: ${backupFilename}`);

console.log(`\n🔍 다음 단계: 번역 품질 검증`);
console.log(`   node final_accurate_analysis.js`);
