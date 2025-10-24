const fs = require('fs');
const https = require('https');

// 언어별 번역 매핑
const languageConfig = {
  ko: {
    name: '한국어',
    code: 'ko',
    file: './data/interview_questions_ko.json'
  },
  zh: {
    name: '중국어',
    code: 'zh-CN',
    file: './data/interview_questions_zh.json'
  },
  vi: {
    name: '베트남어',
    code: 'vi',
    file: './data/interview_questions_vi.json'
  },
  tl: {
    name: '타갈로그어',
    code: 'tl',
    file: './data/interview_questions_tl.json'
  },
  hi: {
    name: '힌디어',
    code: 'hi',
    file: './data/interview_questions_hi.json'
  }
};

// 간단한 번역 함수 (Google Translate API 대신 기본 번역 사전 사용)
const translationDictionary = {
  ko: {
    // 확장된 번역 사전 - 한국어
    'life': '생명',
    'liberty': '자유',
    'pursuit of happiness': '행복추구권',
    'freedom': '자유',
    'political liberty': '정치적 자유',
    'religious freedom': '종교의 자유',
    'economic opportunity': '경제적 기회',
    'practice their religion': '종교 실천',
    'escape persecution': '박해 탈출',
    'Africans': '아프리카인',
    'people from Africa': '아프리카 출신 사람들',
    
    // 정부 및 정치 관련
    'vote': '투표',
    'join a political party': '정당 가입',
    'help with a campaign': '선거 운동 도움',
    'join a civic group': '시민 단체 가입',
    'join a community group': '지역 사회 단체 가입',
    'give an elected official your opinion on an issue': '선출직 공무원에게 의견 전달',
    'call Senators and Representatives': '상원의원과 하원의원에게 전화',
    'publicly support or oppose an issue or policy': '정책에 대한 공개적 지지 또는 반대',
    'run for office': '공직 출마',
    'write to a newspaper': '신문에 기고',
    
    // 독립선언서 관련
    'declared our independence (from Great Britain)': '영국으로부터 독립을 선언했다',
    'said that the United States is free (from Great Britain)': '미국이 영국으로부터 자유롭다고 선언했다',
    'The Declaration formally declared the colonies\' independence from British rule.': '독립선언서는 식민지들이 영국 통치로부터 독립함을 공식적으로 선언했습니다.',
    'The Declaration stated that the United States was a free and independent nation.': '독립선언서는 미국이 자유롭고 독립적인 국가임을 명시했습니다.',
    
    // 시민권 서약 관련
    'give up loyalty to other countries': '다른 나라에 대한 충성을 포기한다',
    'defend the Constitution and laws of the United States': '미국 헌법과 법률을 수호한다',
    'serve (do important work for) the nation (if needed)': '(필요시) 국가를 위해 봉사한다',
    'The Oath of Allegiance includes renouncing allegiance to foreign states.': '충성 서약에는 외국에 대한 충성을 포기하는 내용이 포함됩니다.',
    'New citizens promise to support and defend the Constitution and laws.': '새로운 시민들은 헌법과 법률을 지지하고 수호할 것을 약속합니다.',
    'Citizens promise to perform work of national importance when required.': '시민들은 필요시 국가적으로 중요한 일을 수행할 것을 약속합니다.',
    
    // 주 이름들
    'New Hampshire': '뉴햄프셔',
    'Massachusetts': '매사추세츠',
    'Rhode Island': '로드아일랜드',
    'Connecticut': '코네티컷',
    'New York': '뉴욕',
    'New Jersey': '뉴저지',
    'Pennsylvania': '펜실베이니아',
    'Delaware': '델라웨어',
    'Maryland': '메릴랜드',
    'Virginia': '버지니아',
    'North Carolina': '노스캐롤라이나',
    'South Carolina': '사우스캐롤라이나',
    'Georgia': '조지아',
    
    // 헌법 제정 회의 관련
    'The Constitution was written.': '헌법이 작성되었다.',
    'The Founding Fathers wrote the Constitution.': '건국의 아버지들이 헌법을 작성했다.',
    'The Constitutional Convention was held to create a new framework of government, resulting in the U.S. Constitution.': '헌법 제정 회의는 새로운 정부 체계를 만들기 위해 열렸으며, 그 결과 미국 헌법이 탄생했습니다.',
    'The Founding Fathers gathered at the Constitutional Convention to write the Constitution.': '건국의 아버지들이 헌법 제정 회의에 모여 헌법을 작성했습니다.',
    
    // 연방주의 논문 관련
    'Publius': '퍼블리우스',
    'Publius was the pen name used by Madison, Hamilton, and Jay when writing the Federalist Papers.': '퍼블리우스는 매디슨, 해밀턴, 제이가 연방주의 논문을 쓸 때 사용한 필명입니다.',
    
    // 벤자민 프랭클린 관련
    'first Postmaster General of the United States': '미국 초대 우체국장',
    'writer of "Poor Richard\'s Almanac"': '가난한 리처드의 연감 저자',
    'Franklin was appointed as the first Postmaster General under the Continental Congress.': '프랭클린은 대륙회의 하에서 초대 우체국장으로 임명되었습니다.',
    'Franklin published Poor Richard\'s Almanac, which contained weather forecasts, household hints, and proverbs.': '프랭클린은 날씨 예보, 생활 정보, 격언이 담긴 가난한 리처드의 연감을 출간했습니다.',
    
    // 루이지애나 구매 관련
    'Louisiana': '루이지애나',
    'The Louisiana Territory was purchased from France in 1803.': '루이지애나 준주는 1803년 프랑스로부터 구매되었습니다.',
    
    // 전쟁 관련
    'Spanish-American War': '미서전쟁',
    'The Spanish-American War was fought in 1898.': '미서전쟁은 1898년에 벌어졌습니다.',
    
    // 2차 대전 관련
    'Japan': '일본',
    'Germany': '독일',
    'Italy': '이탈리아',
    'Japan was a major Axis power that the U.S. fought against.': '일본은 미국이 맞서 싸운 주요 추축국이었습니다.',
    'Germany was a major Axis power that the U.S. fought against.': '독일은 미국이 맞서 싸운 주요 추축국이었습니다.',
    'Italy was an Axis power that the U.S. fought against.': '이탈리아는 미국이 맞서 싸운 추축국이었습니다.',
    
    // 노예해방선언 관련
    'freed slaves in the Confederate states': '남부연합 주들의 노예를 해방시켰다',
    'freed slaves in most Southern states': '대부분의 남부 주들의 노예를 해방시켰다',
    'The Emancipation Proclamation declared freedom for enslaved people.': '노예해방선언은 노예들의 자유를 선언했습니다.',
    'The proclamation applied to slaves in states that had seceded from the Union.': '이 선언은 연방에서 탈퇴한 주들의 노예들에게 적용되었습니다.',
    'It freed slaves in the rebellious Southern states during the Civil War.': '남북전쟁 중 반란을 일으킨 남부 주들의 노예들을 해방시켰습니다.',
    
    // 수잔 B. 앤서니 관련
    'fought for women\'s suffrage': '여성 참정권을 위해 싸웠다',
    'She was a leader in the movement to secure voting rights for women.': '그녀는 여성의 투표권을 확보하기 위한 운동의 지도자였습니다.',
    
    // 자유의 여신상 관련
    'New Jersey': '뉴저지',
    'near New York City': '뉴욕시 근처',
    'on the Hudson (River)': '허드슨 강에',
    'Liberty Island is technically in New Jersey waters, though administered by New York.': '자유의 여신상이 있는 리버티 아일랜드는 기술적으로 뉴저지 해역에 있지만 뉴욕이 관리합니다.',
    'The Statue of Liberty is located near New York City in the harbor.': '자유의 여신상은 뉴욕시 근처 항구에 위치해 있습니다.',
    'The statue is located where the Hudson River meets New York Harbor.': '동상은 허드슨 강이 뉴욕 항구와 만나는 지점에 위치해 있습니다.',
    
    // 국기 관련
    'because of the 13 original states': '13개 원래 주들 때문에',
    'The 13 stripes represent the 13 original states that formed the Union.': '13개 줄무늬는 연방을 구성한 13개 원래 주들을 나타냅니다.'
  },
  'zh-CN': {
    // 기본 번역 사전 - 중국어
    'life': '生命',
    'liberty': '自由',
    'pursuit of happiness': '追求幸福',
    'freedom': '自由',
    'vote': '投票',
    'Africans': '非洲人',
    'people from Africa': '来自非洲的人'
  },
  vi: {
    // 기본 번역 사전 - 베트남어
    'life': 'cuộc sống',
    'liberty': 'tự do',
    'pursuit of happiness': 'theo đuổi hạnh phúc',
    'freedom': 'tự do',
    'vote': 'bỏ phiếu',
    'Africans': 'người châu Phi'
  },
  tl: {
    // 기본 번역 사전 - 타갈로그어
    'life': 'buhay',
    'liberty': 'kalayaan',
    'pursuit of happiness': 'paghahanap ng kaligayahan',
    'freedom': 'kalayaan',
    'vote': 'bumoto',
    'Africans': 'mga Aprikano'
  },
  hi: {
    // 기본 번역 사전 - 힌디어
    'life': 'जीवन',
    'liberty': 'स्वतंत्रता',
    'pursuit of happiness': 'खुशी की खोज',
    'freedom': 'स्वतंत्रता',
    'vote': 'वोट',
    'Africans': 'अफ्रीकी'
  }
};

// 번역 함수
function translateText(text, targetLanguage) {
  // [번역 필요] 접두사 제거
  const cleanText = text.replace(/^\[번역 필요\]\s*/, '');
  
  // 기본 사전에서 번역 찾기
  const dictionary = translationDictionary[targetLanguage];
  if (dictionary && dictionary[cleanText.toLowerCase()]) {
    return dictionary[cleanText.toLowerCase()];
  }
  
  // 부분 매칭 시도
  for (const [english, translated] of Object.entries(dictionary || {})) {
    if (cleanText.toLowerCase().includes(english.toLowerCase())) {
      return cleanText.replace(new RegExp(english, 'gi'), translated);
    }
  }
  
  // 번역을 찾지 못한 경우 원문 반환 (번역 필요 표시 유지)
  return `[번역 필요] ${cleanText}`;
}

// 특정 언어 파일 번역
async function translateLanguageFile(languageCode) {
  const config = languageConfig[languageCode];
  if (!config) {
    console.error(`❌ 지원하지 않는 언어 코드: ${languageCode}`);
    return;
  }
  
  console.log(`🚀 ${config.name} 번역 시작...`);
  
  try {
    // 데이터 로드
    const data = JSON.parse(fs.readFileSync(config.file, 'utf8'));
    let translatedCount = 0;
    let totalNeedsTranslation = 0;
    
    // 각 문제 처리
    const translatedData = data.map(question => {
      const translatedQuestion = { ...question };
      
      // 질문 번역
      if (question.question && question.question.includes('[번역 필요]')) {
        totalNeedsTranslation++;
        const translated = translateText(question.question, config.code);
        if (!translated.includes('[번역 필요]')) {
          translatedQuestion.question = translated;
          translatedCount++;
        }
      }
      
      // 정답들 번역
      translatedQuestion.correctAnswers = question.correctAnswers.map(answer => {
        const translatedAnswer = { ...answer };
        
        if (answer.text && answer.text.includes('[번역 필요]')) {
          totalNeedsTranslation++;
          const translated = translateText(answer.text, config.code);
          if (!translated.includes('[번역 필요]')) {
            translatedAnswer.text = translated;
            translatedCount++;
          }
        }
        
        if (answer.rationale && answer.rationale.includes('[번역 필요]')) {
          totalNeedsTranslation++;
          const translated = translateText(answer.rationale, config.code);
          if (!translated.includes('[번역 필요]')) {
            translatedAnswer.rationale = translated;
            translatedCount++;
          }
        }
        
        return translatedAnswer;
      });
      
      // 오답들 번역
      translatedQuestion.wrongAnswers = question.wrongAnswers.map(wrong => {
        const translatedWrong = { ...wrong };
        
        if (wrong.text && wrong.text.includes('[번역 필요]')) {
          totalNeedsTranslation++;
          const translated = translateText(wrong.text, config.code);
          if (!translated.includes('[번역 필요]')) {
            translatedWrong.text = translated;
            translatedCount++;
          }
        }
        
        if (wrong.rationale && wrong.rationale.includes('[번역 필요]')) {
          totalNeedsTranslation++;
          const translated = translateText(wrong.rationale, config.code);
          if (!translated.includes('[번역 필요]')) {
            translatedWrong.rationale = translated;
            translatedCount++;
          }
        }
        
        return translatedWrong;
      });
      
      return translatedQuestion;
    });
    
    // 번역된 데이터 저장
    fs.writeFileSync(config.file, JSON.stringify(translatedData, null, 2), 'utf8');
    
    console.log(`✅ ${config.name} 번역 완료!`);
    console.log(`   📊 번역된 항목: ${translatedCount}/${totalNeedsTranslation}`);
    console.log(`   📋 남은 번역 필요 항목: ${totalNeedsTranslation - translatedCount}개`);
    
    return { translated: translatedCount, remaining: totalNeedsTranslation - translatedCount };
    
  } catch (error) {
    console.error(`❌ ${config.name} 번역 실패:`, error.message);
    return null;
  }
}

// 모든 언어 번역
async function translateAllLanguages() {
  console.log('🌍 모든 언어 자동 번역 시작...\n');
  
  const results = {};
  
  for (const [code, config] of Object.entries(languageConfig)) {
    const result = await translateLanguageFile(code);
    if (result) {
      results[code] = result;
    }
    console.log(''); // 빈 줄 추가
  }
  
  console.log('🎉 자동 번역 완료!\n');
  console.log('📊 번역 결과 요약:');
  
  let totalTranslated = 0;
  let totalRemaining = 0;
  
  for (const [code, result] of Object.entries(results)) {
    const config = languageConfig[code];
    console.log(`   ${config.name}: ${result.translated}개 번역, ${result.remaining}개 남음`);
    totalTranslated += result.translated;
    totalRemaining += result.remaining;
  }
  
  console.log(`\n🎯 전체 결과: ${totalTranslated}개 번역 완료, ${totalRemaining}개 수동 번역 필요`);
  
  if (totalRemaining > 0) {
    console.log('\n📋 다음 단계:');
    console.log('1. 남은 "[번역 필요]" 항목들을 수동으로 번역');
    console.log('2. 전문 번역가 검토 권장');
    console.log('3. 앱에서 번역 품질 테스트');
  }
}

// 번역 사전 확장 함수
function expandTranslationDictionary() {
  console.log('📚 번역 사전 확장 중...');
  
  // 영문 데이터에서 자주 사용되는 용어들 추출
  const englishData = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));
  const commonTerms = new Set();
  
  englishData.forEach(question => {
    // 정답에서 용어 추출
    question.correctAnswers.forEach(answer => {
      const words = answer.text.toLowerCase().split(/[,\s]+/);
      words.forEach(word => {
        if (word.length > 3) commonTerms.add(word);
      });
    });
  });
  
  console.log(`📝 추출된 공통 용어: ${commonTerms.size}개`);
  console.log('💡 번역 사전을 수동으로 확장하여 번역 품질을 향상시킬 수 있습니다.');
}

// 명령행 인수 처리
const args = process.argv.slice(2);

if (args.length === 0) {
  translateAllLanguages();
} else if (args[0] === 'expand') {
  expandTranslationDictionary();
} else {
  const languageCode = args[0];
  translateLanguageFile(languageCode);
}
