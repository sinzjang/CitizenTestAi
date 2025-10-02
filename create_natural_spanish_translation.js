const fs = require('fs');

console.log('🌟 자연스러운 스페인어 번역 생성 시작...\n');

// 영어 원본 파일 로드
const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));

console.log(`📖 영어 원본 로드 완료: ${englishQuestions.length}개 질문`);

// 자연스러운 스페인어 번역 함수
function translateToNaturalSpanish(text, isQuestion = false) {
  if (!text) return text;
  
  let translated = text;
  
  // 질문 패턴 번역 (자연스러운 스페인어 형태)
  const questionPatterns = [
    { pattern: /^What is the supreme law of the land\?/i, replacement: '¿Cuál es la ley suprema del país?' },
    { pattern: /^What does the Constitution do\?/i, replacement: '¿Qué hace la Constitución?' },
    { pattern: /^The idea of self-government is in the first three words of the Constitution\. What are these words\?/i, replacement: 'La idea del autogobierno está en las primeras tres palabras de la Constitución. ¿Cuáles son estas palabras?' },
    { pattern: /^What is an amendment\?/i, replacement: '¿Qué es una enmienda?' },
    { pattern: /^What do we call the first ten amendments to the Constitution\?/i, replacement: '¿Cómo llamamos a las primeras diez enmiendas de la Constitución?' },
    { pattern: /^What is one right or freedom from the First Amendment\?/i, replacement: '¿Cuál es un derecho o libertad de la Primera Enmienda?' },
    { pattern: /^How many amendments does the Constitution have\?/i, replacement: '¿Cuántas enmiendas tiene la Constitución?' },
    { pattern: /^What did the Declaration of Independence do\?/i, replacement: '¿Qué hizo la Declaración de Independencia?' },
    { pattern: /^What are two rights in the Declaration of Independence\?/i, replacement: '¿Cuáles son dos derechos en la Declaración de Independencia?' },
    { pattern: /^What is freedom of religion\?/i, replacement: '¿Qué es la libertad de religión?' },
    { pattern: /^What is the economic system in the United States\?/i, replacement: '¿Cuál es el sistema económico de Estados Unidos?' },
    { pattern: /^What is the "rule of law"\?/i, replacement: '¿Qué es el "estado de derecho"?' },
    { pattern: /^Name one branch or part of the government\./i, replacement: 'Nombra una rama o parte del gobierno.' },
    { pattern: /^What stops one branch of government from becoming too powerful\?/i, replacement: '¿Qué impide que una rama del gobierno se vuelva demasiado poderosa?' },
    { pattern: /^Who is in charge of the executive branch\?/i, replacement: '¿Quién está a cargo de la rama ejecutiva?' },
    { pattern: /^Who makes federal laws\?/i, replacement: '¿Quién hace las leyes federales?' },
    { pattern: /^What are the two parts of the U\.S\. Congress\?/i, replacement: '¿Cuáles son las dos partes del Congreso de EE.UU.?' },
    { pattern: /^How many U\.S\. Senators are there\?/i, replacement: '¿Cuántos senadores de EE.UU. hay?' },
    { pattern: /^We elect a U\.S\. Senator for how many years\?/i, replacement: '¿Por cuántos años elegimos a un senador de EE.UU.?' },
    { pattern: /^Who is one of your state's U\.S\. Senators now\?/i, replacement: '¿Quién es uno de los senadores de EE.UU. de tu estado ahora?' },
    { pattern: /^The House of Representatives has how many voting members\?/i, replacement: '¿Cuántos miembros con derecho a voto tiene la Cámara de Representantes?' },
    { pattern: /^We elect a U\.S\. Representative for how many years\?/i, replacement: '¿Por cuántos años elegimos a un representante de EE.UU.?' },
    { pattern: /^Name your U\.S\. Representative\./i, replacement: 'Nombra a tu representante de EE.UU.' },
    { pattern: /^Who does a U\.S\. Senator represent\?/i, replacement: '¿A quién representa un senador de EE.UU.?' },
    { pattern: /^Why do some states have more Representatives than other states\?/i, replacement: '¿Por qué algunos estados tienen más representantes que otros estados?' },
    { pattern: /^We elect a President for how many years\?/i, replacement: '¿Por cuántos años elegimos a un presidente?' },
    { pattern: /^In what month do we vote for President\?/i, replacement: '¿En qué mes votamos por el presidente?' },
    { pattern: /^What is the name of the President of the United States now\?/i, replacement: '¿Cuál es el nombre del presidente de Estados Unidos ahora?' },
    { pattern: /^What is the name of the Vice President of the United States now\?/i, replacement: '¿Cuál es el nombre del vicepresidente de Estados Unidos ahora?' },
    { pattern: /^If the President can no longer serve, who becomes President\?/i, replacement: 'Si el presidente ya no puede servir, ¿quién se convierte en presidente?' },
    { pattern: /^If both the President and the Vice President can no longer serve, who becomes President\?/i, replacement: 'Si tanto el presidente como el vicepresidente ya no pueden servir, ¿quién se convierte en presidente?' },
    { pattern: /^Who is the Commander in Chief of the military\?/i, replacement: '¿Quién es el comandante en jefe del ejército?' },
    { pattern: /^Who signs bills to become laws\?/i, replacement: '¿Quién firma los proyectos de ley para convertirlos en leyes?' },
    { pattern: /^Who vetoes bills\?/i, replacement: '¿Quién veta los proyectos de ley?' },
    { pattern: /^What does the President's Cabinet do\?/i, replacement: '¿Qué hace el gabinete del presidente?' },
    { pattern: /^What are two Cabinet-level positions\?/i, replacement: '¿Cuáles son dos puestos a nivel de gabinete?' },
    { pattern: /^What does the judicial branch do\?/i, replacement: '¿Qué hace la rama judicial?' },
    { pattern: /^What is the highest court in the United States\?/i, replacement: '¿Cuál es el tribunal más alto de Estados Unidos?' },
    { pattern: /^How many justices are on the Supreme Court\?/i, replacement: '¿Cuántos jueces hay en el Tribunal Supremo?' },
    { pattern: /^Who is the Chief Justice of the United States now\?/i, replacement: '¿Quién es el presidente del Tribunal Supremo de Estados Unidos ahora?' },
    { pattern: /^Under our Constitution, some powers belong to the federal government\. What is one power of the federal government\?/i, replacement: 'Bajo nuestra Constitución, algunos poderes pertenecen al gobierno federal. ¿Cuál es un poder del gobierno federal?' },
    { pattern: /^Under our Constitution, some powers belong to the states\. What is one power of the states\?/i, replacement: 'Bajo nuestra Constitución, algunos poderes pertenecen a los estados. ¿Cuál es un poder de los estados?' },
    { pattern: /^Who is the Governor of your state now\?/i, replacement: '¿Quién es el gobernador de tu estado ahora?' },
    { pattern: /^What is the capital of your state\?/i, replacement: '¿Cuál es la capital de tu estado?' },
    { pattern: /^What are the two major political parties in the United States\?/i, replacement: '¿Cuáles son los dos partidos políticos principales de Estados Unidos?' },
    { pattern: /^What is the political party of the President now\?/i, replacement: '¿Cuál es el partido político del presidente ahora?' },
    { pattern: /^What is the name of the Speaker of the House of Representatives now\?/i, replacement: '¿Cuál es el nombre del presidente de la Cámara de Representantes ahora?' },
    { pattern: /^There are four amendments to the Constitution about who can vote\. Describe one of them\./i, replacement: 'Hay cuatro enmiendas a la Constitución sobre quién puede votar. Describe una de ellas.' },
    { pattern: /^What is one responsibility that is only for United States citizens\?/i, replacement: '¿Cuál es una responsabilidad que es solo para ciudadanos de Estados Unidos?' },
    { pattern: /^Name one right only for United States citizens\./i, replacement: 'Nombra un derecho solo para ciudadanos de Estados Unidos.' },
    { pattern: /^What are two rights of everyone living in the United States\?/i, replacement: '¿Cuáles son dos derechos de todas las personas que viven en Estados Unidos?' },
    { pattern: /^What do we show loyalty to when we say the Pledge of Allegiance\?/i, replacement: '¿A qué mostramos lealtad cuando decimos el Juramento de Lealtad?' },
    { pattern: /^What is one promise you make when you become a United States citizen\?/i, replacement: '¿Cuál es una promesa que haces cuando te conviertes en ciudadano de Estados Unidos?' },
    { pattern: /^How old do citizens have to be to vote for President\?/i, replacement: '¿Qué edad deben tener los ciudadanos para votar por el presidente?' },
    { pattern: /^What are two ways that Americans can participate in their democracy\?/i, replacement: '¿Cuáles son dos maneras en que los estadounidenses pueden participar en su democracia?' },
    { pattern: /^When is the last day you can send in federal income tax forms\?/i, replacement: '¿Cuándo es el último día que puedes enviar los formularios de impuestos federales?' },
    { pattern: /^When must all men register for the Selective Service\?/i, replacement: '¿Cuándo deben registrarse todos los hombres para el Servicio Selectivo?' },
    { pattern: /^What is one reason colonists came to America\?/i, replacement: '¿Cuál es una razón por la que los colonos vinieron a América?' },
    { pattern: /^Who lived in America before the Europeans arrived\?/i, replacement: '¿Quién vivía en América antes de que llegaran los europeos?' },
    { pattern: /^What group of people was taken to America and sold as slaves\?/i, replacement: '¿Qué grupo de personas fue llevado a América y vendido como esclavos?' },
    { pattern: /^Why did the colonists fight the British\?/i, replacement: '¿Por qué lucharon los colonos contra los británicos?' },
    { pattern: /^Who wrote the Declaration of Independence\?/i, replacement: '¿Quién escribió la Declaración de Independencia?' },
    { pattern: /^When was the Declaration of Independence adopted\?/i, replacement: '¿Cuándo fue adoptada la Declaración de Independencia?' },
    { pattern: /^There were 13 original states\. Name three\./i, replacement: 'Había 13 estados originales. Nombra tres.' },
    { pattern: /^What happened at the Constitutional Convention\?/i, replacement: '¿Qué pasó en la Convención Constitucional?' },
    { pattern: /^When was the Constitution written\?/i, replacement: '¿Cuándo fue escrita la Constitución?' },
    { pattern: /^The Federalist Papers supported the passage of the U\.S\. Constitution\. Name one of the writers\./i, replacement: 'Los Documentos Federalistas apoyaron la aprobación de la Constitución de EE.UU. Nombra uno de los escritores.' },
    { pattern: /^What is one thing Benjamin Franklin is famous for\?/i, replacement: '¿Por qué cosa es famoso Benjamin Franklin?' },
    { pattern: /^Who is the "Father of Our Country"\?/i, replacement: '¿Quién es el "Padre de Nuestro País"?' },
    { pattern: /^Who was the first President\?/i, replacement: '¿Quién fue el primer presidente?' },
    { pattern: /^What territory did the United States buy from France in 1803\?/i, replacement: '¿Qué territorio compró Estados Unidos de Francia en 1803?' },
    { pattern: /^Name one war fought by the United States in the 1800s\./i, replacement: 'Nombra una guerra en la que luchó Estados Unidos en el siglo XIX.' },
    { pattern: /^Name the U\.S\. war between the North and the South\./i, replacement: 'Nombra la guerra de EE.UU. entre el Norte y el Sur.' },
    { pattern: /^Name one problem that led to the Civil War\./i, replacement: 'Nombra un problema que llevó a la Guerra Civil.' },
    { pattern: /^What was one important thing that Abraham Lincoln did\?/i, replacement: '¿Qué fue una cosa importante que hizo Abraham Lincoln?' },
    { pattern: /^What did the Emancipation Proclamation do\?/i, replacement: '¿Qué hizo la Proclamación de Emancipación?' },
    { pattern: /^What did Susan B\. Anthony do\?/i, replacement: '¿Qué hizo Susan B. Anthony?' },
    { pattern: /^Name one war fought by the United States in the 1900s\./i, replacement: 'Nombra una guerra en la que luchó Estados Unidos en el siglo XX.' },
    { pattern: /^Who was President during World War I\?/i, replacement: '¿Quién fue presidente durante la Primera Guerra Mundial?' },
    { pattern: /^Who was President during the Great Depression and World War II\?/i, replacement: '¿Quién fue presidente durante la Gran Depresión y la Segunda Guerra Mundial?' },
    { pattern: /^Who did the United States fight in World War II\?/i, replacement: '¿Contra quién luchó Estados Unidos en la Segunda Guerra Mundial?' },
    { pattern: /^Before he was President, Eisenhower was a general\. What war was he in\?/i, replacement: 'Antes de ser presidente, Eisenhower fue general. ¿En qué guerra estuvo?' },
    { pattern: /^During the Cold War, what was the main concern of the United States\?/i, replacement: 'Durante la Guerra Fría, ¿cuál era la principal preocupación de Estados Unidos?' },
    { pattern: /^What movement tried to end racial discrimination\?/i, replacement: '¿Qué movimiento trató de terminar con la discriminación racial?' },
    { pattern: /^What did Martin Luther King, Jr\. do\?/i, replacement: '¿Qué hizo Martin Luther King, Jr.?' },
    { pattern: /^What major event happened on September 11, 2001, in the United States\?/i, replacement: '¿Qué evento importante ocurrió el 11 de septiembre de 2001 en Estados Unidos?' },
    { pattern: /^Name one American Indian tribe in the United States\./i, replacement: 'Nombra una tribu de nativos americanos en Estados Unidos.' },
    { pattern: /^Name one of the two longest rivers in the United States\./i, replacement: 'Nombra uno de los dos ríos más largos de Estados Unidos.' },
    { pattern: /^What ocean is on the West Coast of the United States\?/i, replacement: '¿Qué océano está en la Costa Oeste de Estados Unidos?' },
    { pattern: /^What ocean is on the East Coast of the United States\?/i, replacement: '¿Qué océano está en la Costa Este de Estados Unidos?' },
    { pattern: /^Name one U\.S\. territory\./i, replacement: 'Nombra un territorio de EE.UU.' },
    { pattern: /^Name one state that borders Canada\./i, replacement: 'Nombra un estado que limita con Canadá.' },
    { pattern: /^Name one state that borders Mexico\./i, replacement: 'Nombra un estado que limita con México.' },
    { pattern: /^What is the capital of the United States\?/i, replacement: '¿Cuál es la capital de Estados Unidos?' },
    { pattern: /^Where is the Statue of Liberty\?/i, replacement: '¿Dónde está la Estatua de la Libertad?' },
    { pattern: /^Why does the flag have 13 stripes\?/i, replacement: '¿Por qué tiene la bandera 13 franjas?' },
    { pattern: /^Why does the flag have 50 stars\?/i, replacement: '¿Por qué tiene la bandera 50 estrellas?' },
    { pattern: /^What is the name of the national anthem\?/i, replacement: '¿Cuál es el nombre del himno nacional?' },
    { pattern: /^When do we celebrate Independence Day\?/i, replacement: '¿Cuándo celebramos el Día de la Independencia?' },
    { pattern: /^Name two national U\.S\. holidays\./i, replacement: 'Nombra dos días festivos nacionales de EE.UU.' }
  ];
  
  // 질문 패턴 적용
  for (const {pattern, replacement} of questionPatterns) {
    if (pattern.test(translated)) {
      translated = translated.replace(pattern, replacement);
      break; // 첫 번째 매치만 적용
    }
  }
  
  // 일반적인 단어 및 구문 번역
  const generalTranslations = {
    // 정부 관련
    'Constitution': 'Constitución',
    'Bill of Rights': 'Declaración de Derechos',
    'Declaration of Independence': 'Declaración de Independencia',
    'checks and balances': 'controles y equilibrios',
    'separation of powers': 'separación de poderes',
    'rule of law': 'estado de derecho',
    'federalism': 'federalismo',
    'Supreme Court': 'Tribunal Supremo',
    'Congress': 'Congreso',
    'Senate': 'Senado',
    'House of Representatives': 'Cámara de Representantes',
    'President': 'presidente',
    'Vice President': 'vicepresidente',
    'Speaker of the House': 'presidente de la Cámara',
    'Chief Justice': 'presidente del Tribunal Supremo',
    'Cabinet': 'gabinete',
    'Governor': 'gobernador',
    
    // 권리와 자유
    'freedom of speech': 'libertad de expresión',
    'freedom of religion': 'libertad de religión',
    'freedom of the press': 'libertad de prensa',
    'freedom of assembly': 'libertad de reunión',
    'right to petition': 'derecho de petición',
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
    'Emancipation Proclamation': 'Proclamación de Emancipación',
    'Constitutional Convention': 'Convención Constitucional',
    'Federalist Papers': 'Documentos Federalistas',
    
    // 지리 관련
    'United States': 'Estados Unidos',
    'America': 'América',
    'American': 'estadounidense',
    'Americans': 'estadounidenses',
    'Native Americans': 'nativos americanos',
    'American Indians': 'nativos americanos',
    'Atlantic Ocean': 'Océano Atlántico',
    'Pacific Ocean': 'Océano Pacífico',
    'Mississippi River': 'Río Mississippi',
    'Missouri River': 'Río Missouri',
    'Rocky Mountains': 'Montañas Rocosas',
    'Great Lakes': 'Grandes Lagos',
    'Statue of Liberty': 'Estatua de la Libertad',
    
    // 기타
    'Pledge of Allegiance': 'Juramento de Lealtad',
    'national anthem': 'himno nacional',
    'Independence Day': 'Día de la Independencia',
    'Memorial Day': 'Día de los Caídos',
    'Veterans Day': 'Día de los Veteranos',
    'Thanksgiving': 'Día de Acción de Gracias',
    'Christmas': 'Navidad',
    'New Year\'s Day': 'Día de Año Nuevo',
    'Selective Service': 'Servicio Selectivo',
    'federal income tax': 'impuestos federales sobre la renta'
  };
  
  // 일반 번역 적용
  for (const [english, spanish] of Object.entries(generalTranslations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, spanish);
  }
  
  // 기본 동사 및 구문 번역
  translated = translated
    .replace(/\bmakes laws\b/gi, 'hace las leyes')
    .replace(/\bsigns bills\b/gi, 'firma los proyectos de ley')
    .replace(/\bvetoes bills\b/gi, 'veta los proyectos de ley')
    .replace(/\bfought in\b/gi, 'luchó en')
    .replace(/\bfought against\b/gi, 'luchó contra')
    .replace(/\bfought by\b/gi, 'en la que luchó')
    .replace(/\blived in\b/gi, 'vivía en')
    .replace(/\bcame to\b/gi, 'vinieron a')
    .replace(/\barrived in\b/gi, 'llegaron a')
    .replace(/\bbought from\b/gi, 'compró de')
    .replace(/\bsold as\b/gi, 'vendido como')
    .replace(/\btaken to\b/gi, 'llevado a')
    .replace(/\bfamous for\b/gi, 'famoso por')
    .replace(/\bin charge of\b/gi, 'a cargo de')
    .replace(/\bbelong to\b/gi, 'pertenecen a')
    .replace(/\bparticipate in\b/gi, 'participar en')
    .replace(/\bregister for\b/gi, 'registrarse para')
    .replace(/\bvote for\b/gi, 'votar por')
    .replace(/\bshow loyalty to\b/gi, 'mostrar lealtad a')
    .replace(/\bborders with\b/gi, 'limita con')
    .replace(/\bon the coast\b/gi, 'en la costa')
    .replace(/\bduring the\b/gi, 'durante la')
    .replace(/\bbefore the\b/gi, 'antes de que')
    .replace(/\bafter the\b/gi, 'después de la');
  
  return translated;
}

// 새로운 스페인어 질문 배열 생성
const spanishQuestions = [];

console.log('🔄 자연스러운 번역 시작...\n');

for (let i = 0; i < englishQuestions.length; i++) {
  const englishQ = englishQuestions[i];
  
  console.log(`📝 질문 ${englishQ.id} 번역 중...`);
  
  const spanishQ = {
    id: englishQ.id,
    question: translateToNaturalSpanish(englishQ.question, true),
    correctAnswers: englishQ.correctAnswers.map(answer => ({
      text: translateToNaturalSpanish(answer.text),
      rationale: translateToNaturalSpanish(answer.rationale)
    })),
    wrongAnswers: englishQ.wrongAnswers.map(answer => ({
      text: translateToNaturalSpanish(answer.text),
      rationale: translateToNaturalSpanish(answer.rationale)
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

console.log(`\n🎉 자연스러운 스페인어 번역 완료!`);
console.log(`📊 결과:`);
console.log(`  - 총 질문: ${spanishQuestions.length}개`);
console.log(`  - 새 파일: ./data/interview_questions_es.json`);

console.log(`\n🔍 다음 단계: 번역 품질 검증`);
console.log(`   node final_accurate_analysis.js`);
