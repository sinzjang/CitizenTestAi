const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const analysisResults = JSON.parse(fs.readFileSync('./spanish_comprehensive_analysis.json', 'utf8'));

console.log('🔧 스페인어 1,061개 이슈 체계적 수정 시작...\n');
console.log(`🎯 목표: ${analysisResults.questionsWithIssues.length}개 질문의 모든 이슈 수정\n`);

// 완전한 번역 사전 (실제 분석 결과 기반)
const comprehensiveTranslations = {
  // 완전한 질문 교체
  "When was la Constitución written?": "¿Cuándo fue escrita la Constitución?",
  "What is one thing Benjamin Franklin is famous for?": "¿Por qué es famoso Benjamin Franklin?",
  "Who is the 'Father of Our Country'?": "¿Quién es el 'Padre de Nuestro País'?",
  "What is one reason colonists came to America?": "¿Cuál es una razón por la que los colonos vinieron a América?",
  "What is one promise you make when you become a Estados Unidos citizen?": "¿Cuál es una promesa que haces cuando te conviertes en ciudadano de Estados Unidos?",
  "What are two ways that Americans can participate in their democracy?": "¿Cuáles son dos maneras en que los estadounidenses pueden participar en su democracia?",
  "Name one American Indian tribe in the Estados Unidos.": "Nombra una tribu indígena americana en Estados Unidos.",
  "What is the capital of the Estados Unidos?": "¿Cuál es la capital de Estados Unidos?",
  "What ocean is on the West Coast of the Estados Unidos?": "¿Qué océano está en la Costa Oeste de Estados Unidos?",
  "What ocean is on the East Coast of the Estados Unidos?": "¿Qué océano está en la Costa Este de Estados Unidos?",
  "Name one of the two longest rivers in the Estados Unidos.": "Nombra uno de los dos ríos más largos de Estados Unidos.",
  "What is the name of the national anthem?": "¿Cuál es el nombre del himno nacional?",
  "When do we celebrate Independence Day?": "¿Cuándo celebramos el Día de la Independencia?",
  "Name two national EE.UU. holidays.": "Nombra dos días festivos nacionales de EE.UU.",
  "Why do some states have more Representatives than other states?": "¿Por qué algunos estados tienen más Representantes que otros estados?",
  "Why have the flag 13 stripes?": "¿Por qué tiene la bandera 13 franjas?",
  "What is the supreme law of the land?": "¿Cuál es la ley suprema del país?",
  "What does the Constitution do?": "¿Qué hace la Constitución?",
  "The idea of self-government is in the first three words of the Constitution. What are these words?": "La idea del autogobierno está en las primeras tres palabras de la Constitución. ¿Cuáles son estas palabras?",
  "What is an amendment?": "¿Qué es una enmienda?",
  "What do we call the first ten amendments to the Constitution?": "¿Cómo llamamos a las primeras diez enmiendas de la Constitución?",
  "What is one right or freedom from the First Amendment?": "¿Cuál es un derecho o libertad de la Primera Enmienda?",
  "How many amendments does the Constitution have?": "¿Cuántas enmiendas tiene la Constitución?",
  "What did the Declaration of Independence do?": "¿Qué hizo la Declaración de Independencia?",
  "What are two rights in the Declaration of Independence?": "¿Cuáles son dos derechos en la Declaración de Independencia?",
  "What is freedom of religion?": "¿Qué es la libertad de religión?",
  "What is the economic system in the Estados Unidos?": "¿Cuál es el sistema económico en Estados Unidos?",
  "What is the 'rule of law'?": "¿Qué es el 'estado de derecho'?",
  
  // 완전한 문장 교체
  "la Constitución fue escrita at la Constituciónal Convention in Philadelphia en 1787.": "La Constitución fue escrita en la Convención Constitucional en Filadelfia en 1787.",
  "1776 is the year the Declaración de Independencia fue adoptada.": "1776 es el año en que se adoptó la Declaración de Independencia.",
  "1865 is the year the Guerra Civil ended and the 13th Amendment, abolishing slavery, was ratified.": "1865 es el año en que terminó la Guerra Civil y se ratificó la Enmienda 13, que abolió la esclavitud.",
  "1789 is the year la Constitución went into effect and EE.UU. government was officially formed.": "1789 es el año en que la Constitución entró en vigor y se formó oficialmente el gobierno de EE.UU.",
  
  // Native American tribes 완전 번역
  "The Cherokee are a Native American tribe originally from the Southeastern United States.": "Los Cherokee son una tribu nativa americana originaria del sureste de Estados Unidos.",
  "The Navajo are a Native American tribe from the Southwestern United States.": "Los Navajo son una tribu nativa americana del suroeste de Estados Unidos.",
  "The Sioux are a Native American tribe from the Great Plains region.": "Los Sioux son una tribu nativa americana de la región de las Grandes Llanuras.",
  "The Chippewa (Ojibwe) are a Native American tribe from the Great Lakes region.": "Los Chippewa (Ojibwe) son una tribu nativa americana de la región de los Grandes Lagos.",
  "The Choctaw are a Native American tribe originally from the Southeastern United States.": "Los Choctaw son una tribu nativa americana originaria del sureste de Estados Unidos.",
  "The Pueblo peoples are Native American tribes from the Southwestern United States.": "Los pueblos Pueblo son tribus nativas americanas del suroeste de Estados Unidos.",
  "The Apache are a Native American tribe from the Southwestern United States.": "Los Apache son una tribu nativa americana del suroeste de Estados Unidos.",
  "The Iroquois are a confederacy of Native American tribes from the Northeastern United States.": "Los Iroquois son una confederación de tribus nativas americanas del noreste de Estados Unidos.",
  "The Creek (Muscogee) are a Native American tribe from the Southeastern United States.": "Los Creek (Muscogee) son una tribu nativa americana del sureste de Estados Unidos.",
  "The Seminole are a Native American tribe from Florida.": "Los Seminole son una tribu nativa americana de Florida.",
  "The Blackfeet are a Native American tribe from the northern Great Plains.": "Los Blackfeet son una tribu nativa americana de las Grandes Llanuras del norte.",
  "The Hopi are a Native American tribe from Arizona.": "Los Hopi son una tribu nativa americana de Arizona.",
  "The Inuit are indigenous peoples from Alaska and northern Canada.": "Los Inuit son pueblos indígenas de Alaska y el norte de Canadá.",
  "The Lakota are a Native American tribe, part of the Sioux nation.": "Los Lakota son una tribu nativa americana, parte de la nación Sioux.",
  "The Crow are a Native American tribe from the northern Great Plains.": "Los Crow son una tribu nativa americana de las Grandes Llanuras del norte.",
  "The Shoshone are a Native American tribe from the western United States.": "Los Shoshone son una tribu nativa americana del oeste de Estados Unidos.",
  "The Huron are a Native American tribe from the Great Lakes region.": "Los Huron son una tribu nativa americana de la región de los Grandes Lagos.",
  "The Mohegan are a Native American tribe from Connecticut.": "Los Mohegan son una tribu nativa americana de Connecticut.",
  "The Oneida are a Native American tribe, part of the Iroquois Confederacy.": "Los Oneida son una tribu nativa americana, parte de la Confederación Iroquois.",
  "The Teton Sioux are a Native American tribe from the Great Plains.": "Los Teton Sioux son una tribu nativa americana de las Grandes Llanuras.",
  "The Arapaho are a Native American tribe from the Great Plains.": "Los Arapaho son una tribu nativa americana de las Grandes Llanuras.",
  "The Shawnee are a Native American tribe originally from the Ohio Valley.": "Los Shawnee son una tribu nativa americana originaria del Valle de Ohio.",
  "The Mohawk are a Native American tribe, part of the Iroquois Confederacy.": "Los Mohawk son una tribu nativa americana, parte de la Confederación Iroquois.",
  "The Pawnee are a Native American tribe from the Great Plains.": "Los Pawnee son una tribu nativa americana de las Grandes Llanuras.",
  "The Cheyenne are a Native American tribe from the Great Plains.": "Los Cheyenne son una tribu nativa americana de las Grandes Llanuras."
};

// 고급 패턴 기반 완전 번역
function comprehensiveTranslate(text) {
  if (!text) return text;
  
  // 직접 매칭 먼저
  if (comprehensiveTranslations[text]) {
    return comprehensiveTranslations[text];
  }
  
  let translated = text;
  
  // 완전 정리 패턴들 (1,061개 이슈 기반)
  const comprehensivePatterns = [
    // 질문 시작 패턴들 완전 번역
    [/^When was\b/gi, '¿Cuándo fue'],
    [/^What is one thing\b/gi, '¿Por qué es famoso'],
    [/^Who is the\b/gi, '¿Quién es el'],
    [/^What is one reason\b/gi, '¿Cuál es una razón por la que'],
    [/^What is one promise\b/gi, '¿Cuál es una promesa que'],
    [/^What are two ways\b/gi, '¿Cuáles son dos maneras en que'],
    [/^Name one American Indian tribe\b/gi, 'Nombra una tribu indígena americana'],
    [/^What is the capital\b/gi, '¿Cuál es la capital'],
    [/^What ocean is on\b/gi, '¿Qué océano está en'],
    [/^Name one of the two longest\b/gi, 'Nombra uno de los dos más largos'],
    [/^What is the name of\b/gi, '¿Cuál es el nombre de'],
    [/^When do we celebrate\b/gi, '¿Cuándo celebramos'],
    [/^Name two national\b/gi, 'Nombra dos días festivos nacionales'],
    [/^Why do some states have\b/gi, '¿Por qué algunos estados tienen'],
    [/^Why have the flag\b/gi, '¿Por qué tiene la bandera'],
    [/^What is the supreme law\b/gi, '¿Cuál es la ley suprema'],
    [/^What does the Constitution do\b/gi, '¿Qué hace la Constitución'],
    [/^What is an amendment\b/gi, '¿Qué es una enmienda'],
    [/^What do we call\b/gi, '¿Cómo llamamos'],
    [/^How many amendments\b/gi, '¿Cuántas enmiendas'],
    [/^What did the Declaration\b/gi, '¿Qué hizo la Declaración'],
    [/^What are two rights\b/gi, '¿Cuáles son dos derechos'],
    [/^What is freedom\b/gi, '¿Qué es la libertad'],
    [/^What is the economic system\b/gi, '¿Cuál es el sistema económico'],
    [/^What is the 'rule of law'\b/gi, '¿Qué es el \'estado de derecho\''],
    
    // 완전한 구문 교체
    [/fue escrita at la Constituciónal Convention in Philadelphia/g, 'fue escrita en la Convención Constitucional en Filadelfia'],
    [/is the year the/g, 'es el año en que'],
    [/fue adoptada/g, 'se adoptó'],
    [/Guerra Civil ended and/g, 'Guerra Civil terminó y'],
    [/abolishing slavery, was ratified/g, 'que abolió la esclavitud, fue ratificada'],
    [/went into effect and/g, 'entró en vigor y'],
    [/government was officially formed/g, 'gobierno se formó oficialmente'],
    
    // Native American 관련 완전 번역
    [/Native American tribe/g, 'tribu nativa americana'],
    [/Native American tribes/g, 'tribus nativas americanas'],
    [/indigenous peoples/g, 'pueblos indígenas'],
    [/originally from the Southeastern United States/g, 'originaria del sureste de Estados Unidos'],
    [/from the Southwestern United States/g, 'del suroeste de Estados Unidos'],
    [/from the Great Plains region/g, 'de la región de las Grandes Llanuras'],
    [/from the Great Lakes region/g, 'de la región de los Grandes Lagos'],
    [/from the northern Great Plains/g, 'de las Grandes Llanuras del norte'],
    [/from the Northeastern United States/g, 'del noreste de Estados Unidos'],
    [/from the western United States/g, 'del oeste de Estados Unidos'],
    [/from Alaska and northern Canada/g, 'de Alaska y el norte de Canadá'],
    [/from Connecticut/g, 'de Connecticut'],
    [/from Florida/g, 'de Florida'],
    [/from Arizona/g, 'de Arizona'],
    [/originally from the Ohio Valley/g, 'originaria del Valle de Ohio'],
    [/part of the Sioux nation/g, 'parte de la nación Sioux'],
    [/part of the Iroquois Confederacy/g, 'parte de la Confederación Iroquois'],
    [/a confederacy of/g, 'una confederación de'],
    
    // 기본 혼재 패턴 정리
    [/\bat\b/g, 'en'],
    [/\bin\b/g, 'en'],
    [/\bof\b/g, 'de'],
    [/\bfor\b/g, 'para'],
    [/\bto\b/g, 'a'],
    [/\bwith\b/g, 'con'],
    [/\bfrom\b/g, 'de'],
    [/\bafter\b/g, 'después de'],
    [/\bbefore\b/g, 'antes de'],
    [/\bduring\b/g, 'durante'],
    [/\bis\b/g, 'es'],
    [/\bare\b/g, 'son'],
    [/\bwas\b/g, 'fue'],
    [/\bwere\b/g, 'fueron'],
    [/\bhas\b/g, 'tiene'],
    [/\bhave\b/g, 'tienen'],
    [/\bcan\b/g, 'puede'],
    [/\bwill\b/g, 'será'],
    [/\bwould\b/g, 'sería'],
    [/\bended\b/g, 'terminó'],
    [/\bbegun\b/g, 'comenzó'],
    [/\bstarted\b/g, 'comenzó'],
    [/\bhappened\b/g, 'ocurrió'],
    [/\boccurred\b/g, 'ocurrió'],
    [/\btook place\b/g, 'tuvo lugar'],
    [/\bthe\b/g, 'el'],
    [/\ba\b(?!\s+tribu)/g, 'un'], // "a tribu" 제외
    [/\ban\b/g, 'un'],
    [/\band\b/g, 'y'],
    [/\bbut\b/g, 'pero'],
    [/\bor\b/g, 'o'],
    [/\bwhen\b/gi, 'cuándo'],
    [/\bwhere\b/gi, 'dónde'],
    [/\bwhat\b/gi, 'qué'],
    [/\bwho\b/gi, 'quién'],
    [/\bwhy\b/gi, 'por qué'],
    [/\bhow\b/gi, 'cómo'],
    [/\byear\b/g, 'año'],
    [/\bgovernment\b/g, 'gobierno'],
    [/\bofficial\b/g, 'oficial'],
    [/\bformed\b/g, 'formó'],
    [/\badopted\b/g, 'adoptó'],
    [/\bratified\b/g, 'ratificó'],
    [/\babolishing\b/g, 'aboliendo'],
    [/\bslavery\b/g, 'esclavitud'],
    [/\bwritten\b/gi, 'escrita'],
    [/\bconvention\b/gi, 'convención'],
    
    // 기본 용어 정리
    [/\bUnited States\b/g, 'Estados Unidos'],
    [/\bEstados Unidos\b/g, 'Estados Unidos'],
    [/\bU\.S\./g, 'EE.UU.'],
    [/\bEE\.UU\./g, 'EE.UU.'],
    [/\bthe Constitution\b/g, 'la Constitución'],
    [/\bla Constitución\b/g, 'la Constitución'],
    [/\bthe Declaration of Independence\b/g, 'la Declaración de Independencia'],
    [/\bla Declaración de Independencia\b/g, 'la Declaración de Independencia'],
    [/\bthe Civil War\b/g, 'la Guerra Civil'],
    [/\bla Guerra Civil\b/g, 'la Guerra Civil'],
    [/\bthe 13th Amendment\b/g, 'la Enmienda 13'],
    [/\bla Enmienda 13\b/g, 'la Enmienda 13'],
    
    // 철자 오류 수정
    [/Constituciónal/g, 'Constitucional'],
    [/estadounidense/g, 'americana']
  ];
  
  // 패턴 적용
  for (const [pattern, replacement] of comprehensivePatterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
}

let totalFixed = 0;
let questionsProcessed = 0;

console.log('🔧 1,061개 이슈 체계적 수정 진행 중...');

// 분석 결과의 각 질문을 하나씩 정확히 처리
for (const questionIssue of analysisResults.questionsWithIssues) {
  const spanishQ = spanishQuestions.find(q => q.id === questionIssue.id);
  if (!spanishQ) continue;
  
  let questionFixed = 0;
  
  try {
    // 질문 수정
    if (questionIssue.issues.question.length > 0) {
      const originalQuestion = spanishQ.question;
      const translatedQuestion = comprehensiveTranslate(originalQuestion);
      if (translatedQuestion !== originalQuestion) {
        spanishQ.question = translatedQuestion;
        questionFixed++;
        console.log(`  ✅ 질문 ${questionIssue.id} 질문 수정: "${originalQuestion.substring(0, 40)}..." → "${translatedQuestion.substring(0, 40)}..."`);
      }
    }
    
    // 정답 수정
    for (const correctIssue of questionIssue.issues.correctAnswers) {
      const answer = spanishQ.correctAnswers[correctIssue.index];
      if (answer) {
        // 텍스트 수정
        if (correctIssue.textIssues.length > 0) {
          const originalText = answer.text;
          const translatedText = comprehensiveTranslate(originalText);
          if (translatedText !== originalText) {
            answer.text = translatedText;
            questionFixed++;
          }
        }
        
        // 설명 수정
        if (correctIssue.rationaleIssues.length > 0) {
          const originalRationale = answer.rationale;
          const translatedRationale = comprehensiveTranslate(originalRationale);
          if (translatedRationale !== originalRationale) {
            answer.rationale = translatedRationale;
            questionFixed++;
          }
        }
      }
    }
    
    // 오답 수정
    for (const wrongIssue of questionIssue.issues.wrongAnswers) {
      const answer = spanishQ.wrongAnswers[wrongIssue.index];
      if (answer) {
        // 텍스트 수정
        if (wrongIssue.textIssues.length > 0) {
          const originalText = answer.text;
          const translatedText = comprehensiveTranslate(originalText);
          if (translatedText !== originalText) {
            answer.text = translatedText;
            questionFixed++;
          }
        }
        
        // 설명 수정
        if (wrongIssue.rationaleIssues.length > 0) {
          const originalRationale = answer.rationale;
          const translatedRationale = comprehensiveTranslate(originalRationale);
          if (translatedRationale !== originalRationale) {
            answer.rationale = translatedRationale;
            questionFixed++;
          }
        }
      }
    }
    
    if (questionFixed > 0) {
      console.log(`  🎯 질문 ${questionIssue.id}: ${questionFixed}개 항목 수정 완료 (원래 ${questionIssue.totalIssues}개 이슈)`);
    }
    
    totalFixed += questionFixed;
    questionsProcessed++;
    
    if (questionsProcessed % 20 === 0) {
      console.log(`  📊 진행률: ${questionsProcessed}/${analysisResults.questionsWithIssues.length} (${Math.round(questionsProcessed/analysisResults.questionsWithIssues.length*100)}%)`);
    }
    
  } catch (error) {
    console.log(`⚠️  질문 ${questionIssue.id} 수정 중 오류:`, error.message);
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 체계적 수정 작업 완료!`);
console.log(`📊 최종 결과:`);
console.log(`  - 처리된 질문: ${questionsProcessed}개`);
console.log(`  - 수정된 항목: ${totalFixed}개`);
console.log(`  - 원래 이슈: ${analysisResults.summary.totalIssuesFound}개`);
console.log(`  - 수정 성공률: ${Math.round(totalFixed/analysisResults.summary.totalIssuesFound*100)}%`);

console.log(`\n🎯 다음 단계: 수정 후 재분석으로 남은 이슈 확인`);
