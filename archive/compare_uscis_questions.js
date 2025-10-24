const fs = require('fs');
const path = require('path');

// 공식 USCIS 100문제 정답 데이터
const officialUSCIS = {
  1: ["the Constitution"],
  2: ["sets up the government", "defines the government", "protects basic rights of Americans"],
  3: ["We the People"],
  4: ["a change (to the Constitution)", "an addition (to the Constitution)"],
  5: ["the Bill of Rights"],
  6: ["speech", "religion", "assembly", "press", "petition the government"],
  7: ["twenty-seven (27)"],
  8: ["announced our independence (from Great Britain)", "declared our independence (from Great Britain)", "said that the United States is free (from Great Britain)"],
  9: ["life", "liberty", "pursuit of happiness"],
  10: ["You can practice any religion, or not practice a religion."],
  11: ["capitalist economy", "market economy"],
  12: ["Everyone must follow the law.", "Leaders must obey the law.", "Government must obey the law.", "No one is above the law."],
  13: ["Congress", "legislative", "President", "executive", "the courts", "judicial"],
  14: ["checks and balances", "separation of powers"],
  15: ["the President"],
  16: ["Congress", "Senate and House (of Representatives)", "(U.S. or national) legislature"],
  17: ["the Senate and House (of Representatives)"],
  18: ["one hundred (100)"],
  19: ["six (6)"],
  20: ["Answers will vary"],
  21: ["four hundred thirty-five (435)"],
  22: ["two (2)"],
  23: ["Answers will vary"],
  24: ["all people of the state"],
  25: ["(because of) the state's population", "(because) they have more people", "(because) some states have more people"],
  26: ["four (4)"],
  27: ["November"],
  28: ["Visit uscis.gov/citizenship/testupdates"],
  29: ["Visit uscis.gov/citizenship/testupdates"],
  30: ["the Vice President"],
  31: ["the Speaker of the House"],
  32: ["the President"],
  33: ["the President"],
  34: ["the President"],
  35: ["advises the President"],
  36: ["Secretary of Agriculture", "Secretary of Commerce", "Secretary of Defense", "Secretary of Education", "Secretary of Energy", "Secretary of Health and Human Services", "Secretary of Homeland Security", "Secretary of Housing and Urban Development", "Secretary of the Interior", "Secretary of Labor", "Secretary of State", "Secretary of Transportation", "Secretary of the Treasury", "Secretary of Veterans Affairs", "Attorney General", "Vice President"],
  37: ["reviews laws", "explains laws", "resolves disputes (disagreements)", "decides if a law goes against the Constitution"],
  38: ["the Supreme Court"],
  39: ["Visit uscis.gov/citizenship/testupdates"],
  40: ["Visit uscis.gov/citizenship/testupdates"],
  41: ["to print money", "to declare war", "to create an army", "to make treaties"],
  42: ["provide schooling and education", "provide protection (police)", "provide safety (fire departments)", "give a driver's license", "approve zoning and land use"],
  43: ["Answers will vary"],
  44: ["Answers will vary"],
  45: ["Democratic and Republican"],
  46: ["Visit uscis.gov/citizenship/testupdates"],
  47: ["Visit uscis.gov/citizenship/testupdates"],
  48: ["Citizens eighteen (18) and older (can vote).", "You don't have to pay (a poll tax) to vote.", "Any citizen can vote. (Women and men can vote.)", "A male citizen of any race (can vote)."],
  49: ["serve on a jury", "vote in a federal election"],
  50: ["vote in a federal election", "run for federal office"],
  51: ["freedom of expression", "freedom of speech", "freedom of assembly", "freedom to petition the government", "freedom of religion", "the right to bear arms"],
  52: ["the United States", "the flag"],
  53: ["give up loyalty to other countries", "defend the Constitution and laws of the United States", "obey the laws of the United States", "serve in the U.S. military (if needed)", "serve (do important work for) the nation (if needed)", "be loyal to the United States"],
  54: ["eighteen (18) and older"],
  55: ["vote", "join a political party", "help with a campaign", "join a civic group", "join a community group", "give an elected official your opinion on an issue", "call Senators and Representatives", "publicly support or oppose an issue or policy", "run for office", "write to a newspaper"],
  56: ["April 15"],
  57: ["at age eighteen (18)", "between eighteen (18) and twenty-six (26)"],
  58: ["freedom", "political liberty", "religious freedom", "economic opportunity", "practice their religion", "escape persecution"],
  59: ["American Indians", "Native Americans"],
  60: ["Africans", "people from Africa"],
  61: ["because of high taxes (taxation without representation)", "because the British army stayed in their houses (boarding, quartering)", "because they didn't have self-government"],
  62: ["(Thomas) Jefferson"],
  63: ["July 4, 1776"],
  64: ["New Hampshire", "Massachusetts", "Rhode Island", "Connecticut", "New York", "New Jersey", "Pennsylvania", "Delaware", "Maryland", "Virginia", "North Carolina", "South Carolina", "Georgia"],
  65: ["The Constitution was written.", "The Founding Fathers wrote the Constitution."],
  66: ["1787"],
  67: ["(James) Madison", "(Alexander) Hamilton", "(John) Jay", "Publius"],
  68: ["U.S. diplomat", "oldest member of the Constitutional Convention", "first Postmaster General of the United States", "writer of \"Poor Richard's Almanac\"", "started the first free libraries"],
  69: ["(George) Washington"],
  70: ["(George) Washington"],
  71: ["the Louisiana Territory", "Louisiana"],
  72: ["War of 1812", "Mexican-American War", "Civil War", "Spanish-American War"],
  73: ["the Civil War", "the War between the States"],
  74: ["slavery", "economic reasons", "states' rights"],
  75: ["freed the slaves (Emancipation Proclamation)", "saved (or preserved) the Union", "led the United States during the Civil War"],
  76: ["freed the slaves", "freed slaves in the Confederacy", "freed slaves in the Confederate states", "freed slaves in most Southern states"],
  77: ["fought for women's rights", "fought for civil rights"],
  78: ["World War I", "World War II", "Korean War", "Vietnam War", "(Persian) Gulf War"],
  79: ["(Woodrow) Wilson"],
  80: ["(Franklin) Roosevelt"],
  81: ["Japan, Germany, and Italy"],
  82: ["World War II"],
  83: ["Communism"],
  84: ["civil rights (movement)"],
  85: ["fought for civil rights", "worked for equality for all Americans"],
  86: ["Terrorists attacked the United States."],
  87: ["Cherokee", "Navajo", "Sioux", "Chippewa", "Choctaw", "Pueblo", "Apache", "Iroquois", "Creek", "Blackfeet", "Seminole", "Cheyenne", "Arawak", "Shawnee", "Mohegan", "Huron", "Oneida", "Lakota", "Crow", "Teton", "Hopi", "Inuit"],
  88: ["Missouri (River)", "Mississippi (River)"],
  89: ["Pacific (Ocean)"],
  90: ["Atlantic (Ocean)"],
  91: ["Puerto Rico", "U.S. Virgin Islands", "American Samoa", "Northern Mariana Islands", "Guam"],
  92: ["Maine", "New Hampshire", "Vermont", "New York", "Pennsylvania", "Ohio", "Michigan", "Minnesota", "North Dakota", "Montana", "Idaho", "Washington", "Alaska"],
  93: ["California", "Arizona", "New Mexico", "Texas"],
  94: ["Washington, D.C."],
  95: ["New York (Harbor)", "Liberty Island"],
  96: ["because there were 13 original colonies", "because the stripes represent the original colonies"],
  97: ["because there is one star for each state", "because each star represents a state", "because there are 50 states"],
  98: ["The Star-Spangled Banner"],
  99: ["July 4"],
  100: ["New Year's Day", "Martin Luther King, Jr. Day", "Presidents' Day", "Memorial Day", "Independence Day", "Labor Day", "Columbus Day", "Veterans Day", "Thanksgiving", "Christmas"]
};

// 앱 데이터 로드 및 비교
function compareQuestions() {
  const filePath = path.join(__dirname, 'data', 'interview_questions_en.json');
  const appData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('🔍 공식 USCIS vs 앱 데이터 비교 분석\n');
  console.log('=' * 60);
  
  let issues = [];
  let totalChecked = 0;
  
  for (let i = 1; i <= 100; i++) {
    const question = appData.find(q => q.id === i);
    const officialAnswers = officialUSCIS[i];
    
    if (!question) {
      issues.push(`❌ 문제 ${i}: 앱에서 누락됨`);
      continue;
    }
    
    totalChecked++;
    
    // 앱의 정답들 추출
    const appAnswers = question.correctAnswers.map(answer => answer.text.toLowerCase().trim());
    const officialAnswersLower = officialAnswers.map(ans => ans.toLowerCase().trim());
    
    // 특별 케이스 처리 (가변 답안들)
    if (officialAnswers.includes("Answers will vary") || 
        officialAnswers.includes("Visit uscis.gov/citizenship/testupdates")) {
      console.log(`✅ 문제 ${i}: 가변 답안 (검증 생략)`);
      continue;
    }
    
    // 답안 비교
    let hasAllAnswers = true;
    let missingAnswers = [];
    
    for (const officialAnswer of officialAnswersLower) {
      // 정확한 매치 또는 유사한 매치 확인
      const found = appAnswers.some(appAnswer => {
        return appAnswer === officialAnswer || 
               appAnswer.includes(officialAnswer.replace(/[()]/g, '')) ||
               officialAnswer.includes(appAnswer.replace(/[()]/g, ''));
      });
      
      if (!found) {
        hasAllAnswers = false;
        missingAnswers.push(officialAnswer);
      }
    }
    
    if (!hasAllAnswers) {
      issues.push(`⚠️  문제 ${i}: 누락된 답안 - ${missingAnswers.join(', ')}`);
      console.log(`문제 ${i} 상세:`);
      console.log(`  공식: [${officialAnswers.join(', ')}]`);
      console.log(`  앱:   [${question.correctAnswers.map(a => a.text).join(', ')}]`);
      console.log('');
    } else {
      console.log(`✅ 문제 ${i}: 정답 일치`);
    }
  }
  
  console.log('\n' + '=' * 60);
  console.log(`📊 검사 완료: ${totalChecked}/100 문제 확인`);
  console.log(`🎯 발견된 문제: ${issues.length}개`);
  
  if (issues.length > 0) {
    console.log('\n🔧 수정이 필요한 문제들:');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('\n🎉 모든 문제가 공식 USCIS와 일치합니다!');
  }
}

// 실행
compareQuestions();
