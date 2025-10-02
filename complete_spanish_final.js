const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log('🇪🇸 스페인어 번역 최종 완성 작업...\n');

// 남은 혼재 패턴들을 위한 최종 정리
const finalCleanupPatterns = [
  // 완전한 문장 교체
  [/The U\.S\. legislature, which is el Congreso, has the constitutional authority to make laws\./g, 
   'La legislatura de EE.UU., que es el Congreso, tiene la autoridad constitucional para hacer leyes.'],
  
  [/The Speaker of la Cámara sucede a la presidencia only if both el Presidente and Vice President cannot serve\./g,
   'El Presidente de la Cámara sucede a la presidencia solo si tanto el Presidente como el Vicepresidente no pueden servir.'],
  
  [/The Secretary of Defense is the civilian head of el Departamento de Defensa, acting under el Presidente's authority\./g,
   'El Secretario de Defensa es el jefe civil del Departamento de Defensa, actuando bajo la autoridad del Presidente.'],
  
  [/The Speaker of la Cámara leads the process for a bill to pass la Cámara, but does not sign bills into law\./g,
   'El Presidente de la Cámara lidera el proceso para que un proyecto de ley pase por la Cámara, pero no firma proyectos de ley para convertirlos en ley.'],
  
  [/The Mayor is the head of a city government, different from el Gobernador who is the head of state government\./g,
   'El Alcalde es el jefe de un gobierno municipal, diferente del Gobernador que es el jefe del gobierno estatal.'],
  
  [/The President is the head of the federal government, different from el Gobernador who is the head of state government\./g,
   'El Presidente es el jefe del gobierno federal, diferente del Gobernador que es el jefe del gobierno estatal.'],
  
  [/The Senate and House are the two parts of el Congreso, not political parties\./g,
   'El Senado y la Cámara son las dos partes del Congreso, no partidos políticos.'],
  
  [/The Libertarian Party is one of the third parties in EE\.UU\./g,
   'El Partido Libertario es uno de los terceros partidos en EE.UU.'],
  
  // 개별 패턴들
  [/\bel Congreso\b/g, 'el Congreso'],
  [/\bCongress\b/g, 'el Congreso'],
  [/\bla Cámara\b/g, 'la Cámara'],
  [/\bthe House\b/g, 'la Cámara'],
  [/\bel Senado\b/g, 'el Senado'],
  [/\bthe Senate\b/g, 'el Senado'],
  [/\bel Presidente\b/g, 'el Presidente'],
  [/\bthe President\b/g, 'el Presidente'],
  [/\bel Vicepresidente\b/g, 'el Vicepresidente'],
  [/\bthe Vice President\b/g, 'el Vicepresidente'],
  [/\bel Gobernador\b/g, 'el Gobernador'],
  [/\bthe Governor\b/g, 'el Gobernador'],
  [/\bel Alcalde\b/g, 'el Alcalde'],
  [/\bthe Mayor\b/g, 'el Alcalde'],
  [/\bel Senador\b/g, 'el Senador'],
  [/\bthe Senator\b/g, 'el Senador'],
  
  // 기관들
  [/\bel Departamento de Defensa\b/g, 'el Departamento de Defensa'],
  [/\bthe Department of Defense\b/g, 'el Departamento de Defensa'],
  [/\bel Tribunal Supremo\b/g, 'el Tribunal Supremo'],
  [/\bthe Supreme Court\b/g, 'el Tribunal Supremo'],
  [/\bel Gabinete\b/g, 'el Gabinete'],
  [/\bthe Cabinet\b/g, 'el Gabinete'],
  [/\bel Colegio Electoral\b/g, 'el Colegio Electoral'],
  [/\bthe Electoral College\b/g, 'el Colegio Electoral'],
  
  // 직책들
  [/\bthe Speaker\b/g, 'el Presidente de la Cámara'],
  [/\bthe Chief Justice\b/g, 'el Presidente del Tribunal Supremo'],
  [/\bthe Secretary of Defense\b/g, 'el Secretario de Defensa'],
  [/\bthe Secretary of State\b/g, 'el Secretario de Estado'],
  [/\bthe Chairman of the Joint Chiefs of Staff\b/g, 'el Presidente del Estado Mayor Conjunto'],
  
  // 정당들
  [/\bthe Democratic Party\b/g, 'el Partido Demócrata'],
  [/\bthe Republican Party\b/g, 'el Partido Republicano'],
  [/\bthe Libertarian Party\b/g, 'el Partido Libertario'],
  [/\bthe Labour and Conservative parties\b/g, 'los partidos Laborista y Conservador'],
  
  // 수정헌법들
  [/\bthe 15th Amendment\b/g, 'la 15ª Enmienda'],
  [/\bthe 19th Amendment\b/g, 'la 19ª Enmienda'],
  [/\bthe 24th Amendment\b/g, 'la 24ª Enmienda'],
  [/\bthe First Amendment\b/g, 'la Primera Enmienda'],
  
  // 일반적인 문장 시작
  [/^This is a fundamental right protected by/g, 'Este es un derecho fundamental protegido por'],
  [/^The Labour and Conservative parties are/g, 'Los partidos Laborista y Conservador son'],
  [/^The Democratic Party is currently/g, 'El Partido Demócrata es actualmente'],
  [/^The current President is a member/g, 'El Presidente actual es miembro'],
  [/^The Chairman of the Joint Chiefs/g, 'El Presidente del Estado Mayor Conjunto'],
  [/^The International Court of Justice/g, 'La Corte Internacional de Justicia'],
  
  // 동사 패턴들
  [/\bsucede a la presidencia\b/g, 'sucede a la presidencia'],
  [/\bsucceeds to the presidency\b/g, 'sucede a la presidencia'],
  [/\bleads the process\b/g, 'lidera el proceso'],
  [/\bsign bills into law\b/g, 'firmar proyectos de ley para convertirlos en ley'],
  [/\bcast a tie-breaking vote\b/g, 'emitir un voto de desempate'],
  [/\binterprets laws\b/g, 'interpreta las leyes'],
  [/\bhandles disputes\b/g, 'maneja disputas'],
  [/\bprovides expert advice\b/g, 'proporciona asesoramiento experto'],
  
  // 기타 패턴들
  [/\bin EE\.UU\./g, 'en EE.UU.'],
  [/\bin the U\.S\./g, 'en EE.UU.'],
  [/\bUnited States\b/g, 'Estados Unidos'],
  [/\bU\.S\./g, 'EE.UU.'],
  [/\bfederal elections\b/g, 'elecciones federales'],
  [/\bpolitical parties\b/g, 'partidos políticos'],
  [/\bthird parties\b/g, 'terceros partidos'],
  [/\bmajor political parties\b/g, 'principales partidos políticos'],
  [/\bopposition party\b/g, 'partido de oposición'],
  [/\bvoting discrimination\b/g, 'discriminación electoral'],
  [/\bpoll taxes\b/g, 'impuestos electorales'],
  [/\bthe right to vote\b/g, 'el derecho al voto'],
  [/\bthe right to express\b/g, 'el derecho a expresar'],
  [/\bthe right to speak freely\b/g, 'el derecho a hablar libremente']
];

let cleanupCount = 0;
let totalProcessed = 0;

console.log('🔧 최종 패턴 정리 중...');

for (const question of spanishQuestions) {
  // 질문 정리
  const originalQuestion = question.question;
  let cleanedQuestion = question.question;
  
  for (const [pattern, replacement] of finalCleanupPatterns) {
    cleanedQuestion = cleanedQuestion.replace(pattern, replacement);
  }
  
  if (cleanedQuestion !== originalQuestion) {
    question.question = cleanedQuestion;
    cleanupCount++;
  }
  totalProcessed++;
  
  // 정답 정리
  for (const answer of question.correctAnswers) {
    // 정답 텍스트
    const originalText = answer.text;
    let cleanedText = answer.text;
    
    for (const [pattern, replacement] of finalCleanupPatterns) {
      cleanedText = cleanedText.replace(pattern, replacement);
    }
    
    if (cleanedText !== originalText) {
      answer.text = cleanedText;
      cleanupCount++;
    }
    totalProcessed++;
    
    // 정답 설명
    const originalRationale = answer.rationale;
    let cleanedRationale = answer.rationale;
    
    for (const [pattern, replacement] of finalCleanupPatterns) {
      cleanedRationale = cleanedRationale.replace(pattern, replacement);
    }
    
    if (cleanedRationale !== originalRationale) {
      answer.rationale = cleanedRationale;
      cleanupCount++;
    }
    totalProcessed++;
  }
  
  // 오답 정리
  for (const answer of question.wrongAnswers) {
    // 오답 텍스트
    const originalText = answer.text;
    let cleanedText = answer.text;
    
    for (const [pattern, replacement] of finalCleanupPatterns) {
      cleanedText = cleanedText.replace(pattern, replacement);
    }
    
    if (cleanedText !== originalText) {
      answer.text = cleanedText;
      cleanupCount++;
    }
    totalProcessed++;
    
    // 오답 설명
    const originalRationale = answer.rationale;
    let cleanedRationale = answer.rationale;
    
    for (const [pattern, replacement] of finalCleanupPatterns) {
      cleanedRationale = cleanedRationale.replace(pattern, replacement);
    }
    
    if (cleanedRationale !== originalRationale) {
      answer.rationale = cleanedRationale;
      cleanupCount++;
    }
    totalProcessed++;
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n✅ 최종 정리 완료!`);
console.log(`📊 정리 결과:`);
console.log(`  - 처리된 항목: ${totalProcessed}개`);
console.log(`  - 정리된 항목: ${cleanupCount}개`);

console.log(`\n🎯 다음 단계: 최종 검증 실행`);
