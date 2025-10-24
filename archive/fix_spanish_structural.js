const fs = require('fs');

// 파일 경로
const englishFilePath = './data/interview_questions_en.json';
const spanishFilePath = './data/interview_questions_es.json';

console.log('=== Spanish 파일 구조적 문제 수정 ===\n');

// 날짜 패턴을 인식하여 콤마를 제외하는 스마트 카운팅 함수
function countOptionsSmartly(text) {
  if (!text) return 0;
  
  const datePatterns = [
    /\b\w+\s+\d{1,2},\s+\d{4}\b/g,  // "Month DD, YYYY"
    /\b\d{1,2}\s+de\s+\w+\s+de\s+\d{4}\b/g,  // Spanish: "DD de Month de YYYY"
    /\b\w+\s+\d{1,2}\s+de\s+\d{4}\b/g,  // Spanish: "Month DD de YYYY"
  ];
  
  let processedText = text;
  datePatterns.forEach(pattern => {
    processedText = processedText.replace(pattern, (match) => {
      return match.replace(/,/g, '|COMMA|');
    });
  });
  
  const commaCount = (processedText.match(/,/g) || []).length;
  return commaCount + 1;
}

// 스페인어 오답 생성 함수
function generateSpanishWrongAnswers(questionId, correctCount) {
  const wrongAnswerSets = {
    // 1개 정답 질문들
    44: [
      "Madrid", "Barcelona", "México D.F."
    ],
    81: [
      "la Unión Soviética", "China", "Francia"
    ],
    98: [
      "América la Bella", "Mi País, Es de Ti", "Dios Bendiga América"
    ],
    
    // 2개 정답 질문들
    4: [
      "una ley federal, un decreto presidencial",
      "una decisión de la Corte Suprema, una orden ejecutiva",
      "un tratado internacional, una regulación estatal"
    ],
    49: [
      "pagar impuestos, obedecer las leyes",
      "votar en elecciones locales, servir en un jurado",
      "registrarse para el servicio militar, obtener una licencia de conducir"
    ],
    50: [
      "libertad de expresión, libertad de religión",
      "derecho a portar armas, derecho a un juicio justo",
      "derecho a la privacidad, derecho a viajar"
    ],
    52: [
      "el Presidente, el Congreso",
      "el estado donde vives, tu ciudad",
      "la Constitución, el gobierno federal"
    ],
    57: [
      "cuando se unen al ejército, cuando votan",
      "cuando se convierten en ciudadanos, cuando cumplen 21 años",
      "cuando se gradúan de la escuela secundaria, cuando se casan"
    ],
    59: [
      "nadie, africanos",
      "europeos, asiáticos",
      "canadienses, mexicanos"
    ],
    73: [
      "la Guerra Revolucionaria, la Guerra de 1812",
      "la Primera Guerra Mundial, la Segunda Guerra Mundial",
      "la Guerra de Vietnam, la Guerra de Corea"
    ],
    76: [
      "liberó a todos los esclavos, declaró la independencia de Gran Bretaña",
      "dio a las mujeres el derecho al voto, estableció la Constitución",
      "terminó la Guerra Civil, creó el Seguro Social"
    ],
    77: [
      "fue la primera mujer elegida al Senado, fue enfermera en la Guerra Civil",
      "firmó la Proclamación de Emancipación, fue la primera mujer Presidente",
      "escribió la Declaración de Independencia, fue jueza de la Corte Suprema"
    ],
    85: [
      "fue el primer Presidente negro, fue senador de EE.UU.",
      "luchó para liberar a los esclavos, fue juez de la Corte Suprema",
      "escribió la Constitución, fue gobernador de Georgia"
    ],
    88: [
      "río Nilo, río Amazonas",
      "río Colorado, río Hudson",
      "río Columbia, río Ohio"
    ],
    95: [
      "París, Boston",
      "Washington D.C., Filadelfia",
      "Los Ángeles, Chicago"
    ],
    
    // 3개 정답 질문들
    12: [
      "todos deben obedecer las leyes, nadie está por encima de la ley, las leyes se aplican por igual",
      "el gobierno hace las leyes, los ciudadanos votan por las leyes, los jueces interpretan las leyes",
      "la Constitución es la ley suprema, el Presidente firma las leyes, el Congreso aprueba las leyes"
    ],
    13: [
      "legislativo, ejecutivo, judicial",
      "federal, estatal, local",
      "Senado, Cámara, Corte Suprema"
    ],
    53: [
      "votar todos los años, hablar siempre inglés, nunca salir de Estados Unidos",
      "pagar todos los impuestos, servir en el ejército, obedecer todas las órdenes",
      "trabajar para el gobierno, vivir en Estados Unidos por siempre, no criticar al gobierno"
    ],
    68: [
      "primer Presidente de Estados Unidos, escribió la Declaración de Independencia, General del Ejército Continental",
      "inventó la bombilla, fue el segundo Presidente, escribió la Constitución",
      "fundó Harvard, fue gobernador de Pensilvania, inventó el teléfono"
    ],
    74: [
      "guerra con Inglaterra, diferencias religiosas, disputas sobre el petróleo",
      "problemas económicos, diferencias culturales, disputas territoriales",
      "guerra con Francia, problemas de inmigración, diferencias políticas"
    ],
    75: [
      "escribió la Declaración de Independencia, fue el primer Presidente, dio a las mujeres el derecho al voto",
      "fundó el Partido Republicano, estableció el Seguro Social, terminó la Primera Guerra Mundial",
      "inventó el telégrafo, fue gobernador de Illinois, escribió la Constitución"
    ],
    
    // 4개 정답 질문들
    36: [
      "Secretario de Estado, Secretario de Defensa, Secretario del Tesoro, Fiscal General",
      "Vicepresidente, Presidente de la Cámara, Líder de la Mayoría del Senado, Presidente del Tribunal Supremo",
      "Gobernador, Alcalde, Senador, Representante"
    ],
    41: [
      "hacer la guerra, imprimir dinero, crear un ejército, hacer tratados",
      "establecer escuelas, otorgar licencias de conducir, realizar elecciones, crear gobiernos locales",
      "regular el comercio interestatal, establecer oficinas de correos, acuñar moneda, regular la inmigración"
    ],
    48: [
      "ciudadanos de 18 años o más pueden votar, no se puede negar el voto por raza, no se puede negar el voto por sexo, no se puede negar el voto por no pagar impuestos",
      "solo los hombres pueden votar, solo los propietarios pueden votar, solo los ciudadanos nacidos en EE.UU. pueden votar, solo los que pagan impuestos pueden votar",
      "los ciudadanos deben tener 21 años para votar, los ciudadanos deben saber leer para votar, los ciudadanos deben poseer propiedades para votar, los ciudadanos deben pagar impuestos para votar"
    ],
    51: [
      "el derecho a votar en una elección federal, el derecho a postularse para un cargo federal, el derecho a un pasaporte estadounidense, el derecho a servir en un jurado",
      "el derecho a beneficios del Seguro Social, el derecho a Medicare, el derecho a beneficios de desempleo, el derecho al empleo federal",
      "el derecho a patrocinar inmigración familiar, el derecho a protección diplomática en el extranjero, el derecho a regresar a EE.UU., el derecho a ocupar cargos federales"
    ],
    55: [
      "ver las noticias en TV, izar una bandera americana, pagar impuestos, ir a la escuela",
      "trabajar para el gobierno, mudarse a otro estado, comprar una casa, tener hijos",
      "hablar inglés, celebrar el 4 de julio, conocer la historia americana, respetar la bandera"
    ],
    64: [
      "Florida, California, Ohio, Texas",
      "Alaska, Hawaii, Arizona, Nevada",
      "Illinois, Michigan, Wisconsin, Minnesota"
    ],
    72: [
      "Guerra Revolucionaria, Primera Guerra Mundial, Guerra de Corea, Guerra de Vietnam",
      "Guerra Franco-India, Guerra de los Siete Años, Guerra de Independencia de Texas, Guerra Hispano-Americana",
      "Guerra de Secesión, Guerra de 1812, Guerra México-Americana, Guerra Civil"
    ],
    87: [
      "Inca, Azteca, Maya, Olmeca",
      "Vikingo, Celta, Anglosajón, Normando",
      "Español, Francés, Holandés, Portugués"
    ],
    92: [
      "Oregón, California, Colorado, Nevada",
      "Texas, Florida, Georgia, Carolina del Sur",
      "Arizona, Nuevo México, Utah, Wyoming"
    ],
    93: [
      "Nevada, Florida, Colorado, Oregon",
      "Utah, Wyoming, Kansas, Nebraska",
      "Oklahoma, Arkansas, Louisiana, Mississippi"
    ],
    100: [
      "Día de San Valentín, Halloween, Día de los Inocentes, Día de la Marmota",
      "Día de la Madre, Día del Padre, Día de los Veteranos, Día del Trabajo",
      "Pascua, Acción de Gracias, Navidad, Año Nuevo"
    ],
    
    // 5개 정답 질문들
    6: [
      "libertad de reunión, libertad de prensa, derecho de petición, libertad de comercio, libertad de movimiento",
      "derecho al voto, derecho a portar armas, derecho a un juicio justo, derecho a la privacidad, derecho a la propiedad",
      "libertad de trabajo, libertad de educación, libertad de salud, libertad de vivienda, libertad de transporte"
    ],
    78: [
      "Guerra Civil, Guerra Revolucionaria, Guerra México-Americana, Guerra de 1812, Guerra Franco-India",
      "Guerra de los Treinta Años, Guerra de Sucesión Española, Guerra de los Siete Años, Guerra Napoleónica, Guerra de Crimea",
      "Guerra de Independencia, Guerra de Secesión, Guerra Hispano-Francesa, Guerra del Pacífico, Guerra de Cuba"
    ],
    91: [
      "Hawái, Filipinas, Cuba, Alaska, Texas",
      "México, Canadá, Groenlandia, Islandia, Jamaica",
      "Bahamas, Bermudas, Barbados, Trinidad, Granada"
    ]
  };
  
  return wrongAnswerSets[questionId] || [];
}

try {
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  const spanishData = JSON.parse(fs.readFileSync(spanishFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(q => {
    englishMap[q.id] = q;
  });
  
  let fixedCount = 0;
  const problemQuestions = [4, 6, 12, 13, 36, 41, 44, 48, 49, 50, 51, 52, 53, 55, 57, 59, 64, 68, 72, 73, 74, 75, 76, 77, 78, 81, 85, 87, 88, 91, 92, 93, 95, 98, 100];
  
  spanishData.forEach((question, index) => {
    if (!problemQuestions.includes(question.id)) return;
    
    const englishQ = englishMap[question.id];
    if (!englishQ) return;
    
    const correctCount = englishQ.correctAnswers.length;
    let hasProblems = false;
    
    // 현재 구조적 문제 확인
    question.wrongAnswers.forEach((wrongAnswer, waIndex) => {
      const text = wrongAnswer.text_es || wrongAnswer.text;
      const optionCount = countOptionsSmartly(text);
      
      if (optionCount !== correctCount) {
        hasProblems = true;
      }
    });
    
    if (hasProblems) {
      console.log(`🔧 질문 ${question.id} 수정 중: "${(question.question_es || question.question).substring(0, 60)}..."`);
      console.log(`   정답 개수: ${correctCount}개`);
      
      // 새로운 오답 생성
      const newWrongAnswers = generateSpanishWrongAnswers(question.id, correctCount);
      
      if (newWrongAnswers.length > 0) {
        question.wrongAnswers = newWrongAnswers.map((wrongText, idx) => ({
          text: wrongText,
          text_es: wrongText,
          rationale: `Esta respuesta es incorrecta. ${wrongText.split(', ').length === 1 ? 'Esta opción no es' : 'Estas opciones no son'} la respuesta correcta a la pregunta.`,
          rationale_es: `Esta respuesta es incorrecta. ${wrongText.split(', ').length === 1 ? 'Esta opción no es' : 'Estas opciones no son'} la respuesta correcta a la pregunta.`
        }));
        
        console.log(`   ✅ ${newWrongAnswers.length}개 오답을 ${correctCount}개 옵션으로 수정됨`);
        fixedCount++;
      } else {
        console.log(`   ⚠️  질문 ${question.id}에 대한 스페인어 오답 템플릿이 없습니다.`);
      }
    }
  });
  
  // 수정된 파일 저장
  fs.writeFileSync(spanishFilePath, JSON.stringify(spanishData, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`✅ 총 ${fixedCount}개 질문의 구조적 문제 수정됨`);
  console.log(`📁 파일 저장됨: ${spanishFilePath}`);
  
  // 검증
  console.log('\n=== 수정 검증 ===');
  let remainingProblems = 0;
  
  problemQuestions.slice(0, 10).forEach(questionId => {
    const question = spanishData.find(q => q.id === questionId);
    if (question) {
      const englishQ = englishMap[questionId];
      const correctCount = englishQ.correctAnswers.length;
      
      console.log(`질문 ${questionId}: 정답 ${correctCount}개`);
      
      question.wrongAnswers.forEach((wa, idx) => {
        const text = wa.text_es || wa.text;
        const optionCount = countOptionsSmartly(text);
        const isCorrect = optionCount === correctCount;
        if (!isCorrect) remainingProblems++;
        console.log(`  오답 ${idx + 1}: ${optionCount}개 옵션 ${isCorrect ? '✅' : '❌'} - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      });
    }
  });
  
  if (remainingProblems === 0) {
    console.log('\n🎉 검증된 질문들의 구조적 문제가 모두 해결되었습니다!');
  } else {
    console.log(`\n⚠️  아직 ${remainingProblems}개의 구조적 문제가 남아있습니다.`);
  }
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
