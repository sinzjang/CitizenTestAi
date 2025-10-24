const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const analysisResults = JSON.parse(fs.readFileSync('./spanish_comprehensive_analysis.json', 'utf8'));

console.log('🔧 스페인어 마지막 12개 이슈 완전 정리...\n');
console.log(`🎯 목표: ${analysisResults.questionsWithIssues.length}개 질문의 모든 이슈 완전 해결\n`);

// 마지막 12개 이슈를 위한 정확한 번역 사전
const finalTranslations = {
  // 질문 55 - estadounidenses 문제
  "estadounidenses": "americanos",
  
  // 질문 56 - 세금 관련 혼재
  "cuándo es el last day you puede send en federal income tax forms?": "¿Cuándo es el último día que puedes enviar los formularios de impuestos federales?",
  
  // 질문 58 - 관사 문제  
  "¿Cuál es una razón por la que los colonos vinieron a América?": "¿Cuál es una razón por la que los colonos vinieron a América?",
  
  // 질문 66 - 헌법 관련 오답들
  "1776 es el año en que se adoptó la Declaración de Independencia.": "1776 es el año en que se adoptó la Declaración de Independencia.",
  "1865 es el año en que terminó la Guerra Civil y se ratificó la Enmienda 13, que abolió la esclavitud.": "1865 es el año en que terminó la Guerra Civil y se ratificó la Enmienda 13, que abolió la esclavitud.",
  "1789 es el año en que la Constitución entró en vigor y se formó oficialmente el gobierno de EE.UU.": "1789 es el año en que la Constitución entró en vigor y se formó oficialmente el gobierno de EE.UU.",
  
  // 질문 87 - Native American tribes 완전 번역
  "Los Blackfeet son a tribu nativa americana de the Northern Great Plains.": "Los Blackfeet son una tribu nativa americana de las Grandes Llanuras del Norte.",
  "The Arawak were pueblos indígenas of the Caribbean and South América.": "Los Arawak fueron pueblos indígenas del Caribe y Sudamérica.",
  "The Huron (Wyandot) are a tribu nativa americana de la región de los Grandes Lagos.": "Los Huron (Wyandot) son una tribu nativa americana de la región de los Grandes Lagos.",
  "Los Oneida son a tribu nativa americana and parte de la Confederación Iroquois.": "Los Oneida son una tribu nativa americana y parte de la Confederación Iroquois.",
  "Los Lakota son a tribu nativa americana and parte de la nación Sioux.": "Los Lakota son una tribu nativa americana y parte de la nación Sioux.",
  "Los Crow son a tribu nativa americana de the Northern Great Plains.": "Los Crow son una tribu nativa americana de las Grandes Llanuras del Norte.",
  "El Teton are a division de la Lakota Sioux tribe.": "Los Teton son una división de la tribu Lakota Sioux.",
  "El Inuit are indigenous peoples from Alaska and the Arctic regions.": "Los Inuit son pueblos indígenas de Alaska y las regiones árticas."
};

// 정확한 패턴 기반 번역
function finalTranslate(text) {
  if (!text) return text;
  
  // 직접 매칭 먼저
  if (finalTranslations[text]) {
    return finalTranslations[text];
  }
  
  let translated = text;
  
  // 마지막 12개 이슈를 위한 정확한 패턴들
  const finalPatterns = [
    // 질문 55 - estadounidenses 문제
    [/\bestadounidenses\b/g, 'americanos'],
    
    // 질문 56 - 세금 관련 완전 번역
    [/cuándo es el last day you puede send en federal income tax forms\?/g, '¿Cuándo es el último día que puedes enviar los formularios de impuestos federales?'],
    [/last day you puede send/g, 'último día que puedes enviar'],
    [/federal income tax forms/g, 'formularios de impuestos federales'],
    
    // 질문 87 - Native American tribes 완전 정리
    [/son a tribu nativa americana de the Northern Great Plains/g, 'son una tribu nativa americana de las Grandes Llanuras del Norte'],
    [/were pueblos indígenas of the Caribbean and South América/g, 'fueron pueblos indígenas del Caribe y Sudamérica'],
    [/are a tribu nativa americana de la región de los Grandes Lagos/g, 'son una tribu nativa americana de la región de los Grandes Lagos'],
    [/son a tribu nativa americana and parte de la Confederación Iroquois/g, 'son una tribu nativa americana y parte de la Confederación Iroquois'],
    [/son a tribu nativa americana and parte de la nación Sioux/g, 'son una tribu nativa americana y parte de la nación Sioux'],
    [/son a tribu nativa americana de the Northern Great Plains/g, 'son una tribu nativa americana de las Grandes Llanuras del Norte'],
    [/El Teton are a division de la Lakota Sioux tribe/g, 'Los Teton son una división de la tribu Lakota Sioux'],
    [/El Inuit are indigenous peoples from Alaska and the Arctic regions/g, 'Los Inuit son pueblos indígenas de Alaska y las regiones árticas'],
    
    // 기본 패턴 정리
    [/\ba tribu\b/g, 'una tribu'],
    [/\band parte de\b/g, 'y parte de'],
    [/\bthe Northern Great Plains\b/g, 'las Grandes Llanuras del Norte'],
    [/\bthe Caribbean and South América\b/g, 'el Caribe y Sudamérica'],
    [/\bthe Arctic regions\b/g, 'las regiones árticas'],
    [/\bwere\b/g, 'fueron'],
    [/\bare a division\b/g, 'son una división'],
    [/\bEl Teton\b/g, 'Los Teton'],
    [/\bEl Inuit\b/g, 'Los Inuit']
  ];
  
  // 패턴 적용
  for (const [pattern, replacement] of finalPatterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
}

let finalFixed = 0;
let finalProcessed = 0;

console.log('🔧 마지막 12개 이슈 완전 정리 진행 중...');

// 분석 결과의 각 질문을 하나씩 정확히 처리
for (const questionIssue of analysisResults.questionsWithIssues) {
  const spanishQ = spanishQuestions.find(q => q.id === questionIssue.id);
  if (!spanishQ) continue;
  
  let questionFixed = 0;
  
  try {
    // 질문 수정
    if (questionIssue.issues.question.length > 0) {
      const originalQuestion = spanishQ.question;
      const translatedQuestion = finalTranslate(originalQuestion);
      if (translatedQuestion !== originalQuestion) {
        spanishQ.question = translatedQuestion;
        questionFixed++;
        console.log(`  ✅ 질문 ${questionIssue.id} 질문 완전 수정: "${originalQuestion}" → "${translatedQuestion}"`);
      }
    }
    
    // 정답 수정
    for (const correctIssue of questionIssue.issues.correctAnswers) {
      const answer = spanishQ.correctAnswers[correctIssue.index];
      if (answer) {
        // 텍스트 수정
        if (correctIssue.textIssues.length > 0) {
          const originalText = answer.text;
          const translatedText = finalTranslate(originalText);
          if (translatedText !== originalText) {
            answer.text = translatedText;
            questionFixed++;
            console.log(`  ✅ 질문 ${questionIssue.id} 정답[${correctIssue.index}] 텍스트 완전 수정`);
          }
        }
        
        // 설명 수정
        if (correctIssue.rationaleIssues.length > 0) {
          const originalRationale = answer.rationale;
          const translatedRationale = finalTranslate(originalRationale);
          if (translatedRationale !== originalRationale) {
            answer.rationale = translatedRationale;
            questionFixed++;
            console.log(`  ✅ 질문 ${questionIssue.id} 정답[${correctIssue.index}] 설명 완전 수정`);
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
          const translatedText = finalTranslate(originalText);
          if (translatedText !== originalText) {
            answer.text = translatedText;
            questionFixed++;
            console.log(`  ✅ 질문 ${questionIssue.id} 오답[${wrongIssue.index}] 텍스트 완전 수정`);
          }
        }
        
        // 설명 수정
        if (wrongIssue.rationaleIssues.length > 0) {
          const originalRationale = answer.rationale;
          const translatedRationale = finalTranslate(originalRationale);
          if (translatedRationale !== originalRationale) {
            answer.rationale = translatedRationale;
            questionFixed++;
            console.log(`  ✅ 질문 ${questionIssue.id} 오답[${wrongIssue.index}] 설명 완전 수정`);
          }
        }
      }
    }
    
    if (questionFixed > 0) {
      console.log(`  🎯 질문 ${questionIssue.id}: ${questionFixed}개 항목 완전 수정 완료 (원래 ${questionIssue.totalIssues}개 이슈)`);
    }
    
    finalFixed += questionFixed;
    finalProcessed++;
    
  } catch (error) {
    console.log(`⚠️  질문 ${questionIssue.id} 완전 수정 중 오류:`, error.message);
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 마지막 12개 이슈 완전 정리 완료!`);
console.log(`📊 최종 결과:`);
console.log(`  - 처리된 질문: ${finalProcessed}개`);
console.log(`  - 완전 수정된 항목: ${finalFixed}개`);
console.log(`  - 원래 남은 이슈: ${analysisResults.summary.totalIssuesFound}개`);
console.log(`  - 완전 수정 성공률: ${Math.round(finalFixed/analysisResults.summary.totalIssuesFound*100)}%`);

console.log(`\n🎯 다음 단계: 100% 달성 여부 최종 확인`);
