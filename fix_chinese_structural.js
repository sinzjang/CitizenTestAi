const fs = require('fs');

// 파일 경로
const englishFilePath = './data/interview_questions_en.json';
const chineseFilePath = './data/interview_questions_zh.json';

console.log('=== Chinese 파일 구조적 문제 수정 ===\n');

// 날짜 패턴을 인식하여 콤마를 제외하는 스마트 카운팅 함수
function countOptionsSmartly(text) {
  if (!text) return 0;
  
  const datePatterns = [
    /\b\w+\s+\d{1,2},\s+\d{4}\b/g,  // "Month DD, YYYY"
    /\b\d{4}年\d{1,2}月\d{1,2}日\b/g,  // Chinese: "YYYY年MM月DD日"
    /\b\d{1,2}月\d{1,2}日,\s*\d{4}年\b/g,  // Chinese: "MM月DD日, YYYY年"
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

// 중국어 오답 생성 함수
function generateChineseWrongAnswers(questionId, correctCount) {
  const wrongAnswerSets = {
    // 1개 정답 질문들
    44: [
      "北京", "上海", "广州"
    ],
    81: [
      "苏联", "中国", "法国"
    ],
    98: [
      "美丽的美国", "我的祖国", "上帝保佑美国"
    ],
    
    // 2개 정답 질문들
    4: [
      "联邦法律, 总统令",
      "最高法院决定, 行政命令",
      "国际条约, 州法规"
    ],
    11: [
      "社会主义经济, 共产主义经济",
      "计划经济, 混合经济",
      "传统经济, 指令经济"
    ],
    14: [
      "总统否决权, 国会弹劾权",
      "最高法院审查权, 州政府权力",
      "人民选举权, 媒体监督权"
    ],
    49: [
      "纳税, 遵守法律",
      "在地方选举中投票, 担任陪审员",
      "登记兵役, 获得驾驶执照"
    ],
    50: [
      "言论自由, 宗教自由",
      "持枪权, 公正审判权",
      "隐私权, 旅行权"
    ],
    52: [
      "总统, 国会",
      "你居住的州, 你的城市",
      "宪法, 联邦政府"
    ],
    57: [
      "参军时, 投票时",
      "成为公民时, 21岁时",
      "高中毕业时, 结婚时"
    ],
    59: [
      "没有人, 非洲人",
      "欧洲人, 亚洲人",
      "加拿大人, 墨西哥人"
    ],
    73: [
      "独立战争, 1812年战争",
      "第一次世界大战, 第二次世界大战",
      "越南战争, 朝鲜战争"
    ],
    76: [
      "解放了所有奴隶, 宣布脱离英国独立",
      "给予妇女选举权, 建立宪法",
      "结束内战, 创建社会保障"
    ],
    77: [
      "第一位当选参议员的女性, 内战中的护士",
      "签署解放宣言, 第一位女总统",
      "撰写独立宣言, 最高法院法官"
    ],
    85: [
      "第一位黑人总统, 美国参议员",
      "为解放奴隶而战, 最高法院法官",
      "撰写宪法, 乔治亚州州长"
    ],
    88: [
      "尼罗河, 亚马逊河",
      "科罗拉多河, 哈德逊河",
      "哥伦比亚河, 俄亥俄河"
    ],
    95: [
      "巴黎, 波士顿",
      "华盛顿特区, 费城",
      "洛杉矶, 芝加哥"
    ],
    
    // 3개 정답 질문들
    12: [
      "人人必须遵守法律, 没有人凌驾于法律之上, 法律面前人人平等",
      "政府制定法律, 公民投票决定法律, 法官解释法律",
      "宪法是最高法律, 总统签署法律, 国会通过法律"
    ],
    13: [
      "立法, 行政, 司法",
      "联邦, 州, 地方",
      "参议院, 众议院, 最高法院"
    ],
    42: [
      "建立学校, 颁发驾驶执照, 举行选举",
      "宣战, 印制货币, 创建军队",
      "管理州际贸易, 建立邮局, 铸造硬币"
    ],
    53: [
      "每年投票, 总是说英语, 永远不离开美国",
      "缴纳所有税款, 在军队服役, 服从所有命令",
      "为政府工作, 永远住在美国, 不批评政府"
    ],
    58: [
      "为英国国王服务, 度假, 征服美洲原住民",
      "寻找黄金, 成为富有, 统治其他人",
      "逃避战争, 寻找工作, 探索新大陆"
    ],
    61: [
      "因为他们想要新国王, 因为他们想与法国结盟, 因为他们想废除所有税收",
      "因为他们想要更多土地, 因为他们想要奴隶, 因为他们想要黄金",
      "因为他们想要独立, 因为他们想要自由贸易, 因为他们想要宗教自由"
    ],
    67: [
      "托马斯·杰斐逊, 乔治·华盛顿, 约翰·汉考克",
      "本杰明·富兰克林, 塞缪尔·亚当斯, 约翰·亚当斯",
      "帕特里克·亨利, 保罗·里维尔, 内森·黑尔"
    ],
    68: [
      "美国第一任总统, 撰写独立宣言, 大陆军将军",
      "发明灯泡, 第二任总统, 撰写宪法",
      "创立哈佛, 宾夕法尼亚州州长, 发明电话"
    ],
    74: [
      "与英国的战争, 宗教分歧, 石油争端",
      "经济问题, 文化差异, 领土争端",
      "与法国的战争, 移民问题, 政治分歧"
    ],
    75: [
      "撰写独立宣言, 第一任总统, 给予妇女选举权",
      "创立共和党, 建立社会保障, 结束第一次世界大战",
      "发明电报, 伊利诺伊州州长, 撰写宪法"
    ],
    
    // 4개 정답 질문들
    36: [
      "国务卿, 国防部长, 财政部长, 司法部长",
      "副总统, 众议院议长, 参议院多数党领袖, 最高法院首席大法官",
      "州长, 市长, 参议员, 众议员"
    ],
    41: [
      "宣战, 印制货币, 创建军队, 签订条约",
      "建立学校, 颁发驾驶执照, 举行选举, 创建地方政府",
      "管理州际贸易, 建立邮局, 铸造硬币, 管理移民"
    ],
    48: [
      "18岁或以上公民可以投票, 不能因种族拒绝投票, 不能因性别拒绝投票, 不能因未缴税拒绝投票",
      "只有男性可以投票, 只有财产所有者可以投票, 只有在美国出生的公民可以投票, 只有纳税人可以投票",
      "公民必须21岁才能投票, 公民必须会读书才能投票, 公民必须拥有财产才能投票, 公民必须纳税才能投票"
    ],
    51: [
      "在联邦选举中投票的权利, 竞选联邦职位的权利, 获得美国护照的权利, 担任陪审员的权利",
      "社会保障福利权, 医疗保险权, 失业救济权, 联邦就业权",
      "担保家庭移民权, 海外外交保护权, 返回美国权, 担任联邦职务权"
    ],
    55: [
      "看电视新闻, 悬挂美国国旗, 纳税, 上学",
      "为政府工作, 搬到另一个州, 买房子, 生孩子",
      "说英语, 庆祝7月4日, 了解美国历史, 尊重国旗"
    ],
    64: [
      "佛罗里达, 加利福尼亚, 俄亥俄, 德克萨斯",
      "阿拉斯加, 夏威夷, 亚利桑那, 内华达",
      "伊利诺伊, 密歇根, 威斯康星, 明尼苏达"
    ],
    72: [
      "独立战争, 第一次世界大战, 朝鲜战争, 越南战争",
      "法印战争, 七年战争, 德克萨斯独立战争, 美西战争",
      "南北战争, 1812年战争, 美墨战争, 内战"
    ],
    87: [
      "印加, 阿兹特克, 玛雅, 奥尔梅克",
      "维京, 凯尔特, 盎格鲁撒克逊, 诺曼",
      "西班牙, 法国, 荷兰, 葡萄牙"
    ],
    92: [
      "俄勒冈, 加利福尼亚, 科罗拉多, 内华达",
      "德克萨斯, 佛罗里达, 乔治亚, 南卡罗来纳",
      "亚利桑那, 新墨西哥, 犹他, 怀俄明"
    ],
    93: [
      "内华达, 佛罗里达, 科罗拉多, 俄勒冈",
      "犹他, 怀俄明, 堪萨斯, 内布拉斯加",
      "俄克拉荷马, 阿肯色, 路易斯安那, 密西西比"
    ],
    100: [
      "情人节, 万圣节, 愚人节, 土拨鼠日",
      "母亲节, 父亲节, 退伍军人节, 劳动节",
      "复活节, 感恩节, 圣诞节, 新年"
    ],
    
    // 5개 정답 질문들
    6: [
      "集会自由, 新闻自由, 请愿权, 贸易自由, 迁徙自由",
      "投票权, 持枪权, 公正审判权, 隐私权, 财产权",
      "工作自由, 教育自由, 健康自由, 住房自由, 交通自由"
    ],
    78: [
      "内战, 独立战争, 美墨战争, 1812年战争, 法印战争",
      "三十年战争, 西班牙王位继承战争, 七年战争, 拿破仑战争, 克里米亚战争",
      "独立战争, 南北战争, 西法战争, 太平洋战争, 古巴战争"
    ],
    91: [
      "夏威夷, 菲律宾, 古巴, 阿拉斯加, 德克萨斯",
      "墨西哥, 加拿大, 格陵兰, 冰岛, 牙买加",
      "巴哈马, 百慕大, 巴巴多斯, 特立尼达, 格林纳达"
    ]
  };
  
  return wrongAnswerSets[questionId] || [];
}

try {
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  const chineseData = JSON.parse(fs.readFileSync(chineseFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(q => {
    englishMap[q.id] = q;
  });
  
  let fixedCount = 0;
  const problemQuestions = [4, 6, 11, 12, 13, 14, 36, 41, 42, 44, 48, 49, 50, 51, 52, 53, 55, 57, 58, 59, 61, 64, 67, 68, 72, 73, 74, 75, 76, 77, 78, 81, 85, 87, 88, 91, 92, 93, 95, 98, 100];
  
  chineseData.forEach((question, index) => {
    if (!problemQuestions.includes(question.id)) return;
    
    const englishQ = englishMap[question.id];
    if (!englishQ) return;
    
    const correctCount = englishQ.correctAnswers.length;
    let hasProblems = false;
    
    // 현재 구조적 문제 확인
    question.wrongAnswers.forEach((wrongAnswer, waIndex) => {
      const text = wrongAnswer.text_zh || wrongAnswer.text;
      const optionCount = countOptionsSmartly(text);
      
      if (optionCount !== correctCount) {
        hasProblems = true;
      }
    });
    
    if (hasProblems) {
      console.log(`🔧 질문 ${question.id} 수정 중: "${(question.question_zh || question.question).substring(0, 60)}..."`);
      console.log(`   정답 개수: ${correctCount}개`);
      
      // 새로운 오답 생성
      const newWrongAnswers = generateChineseWrongAnswers(question.id, correctCount);
      
      if (newWrongAnswers.length > 0) {
        question.wrongAnswers = newWrongAnswers.map((wrongText, idx) => ({
          text: wrongText,
          text_zh: wrongText,
          rationale: `这个答案是错误的。${wrongText.split(', ').length === 1 ? '这个选项不是' : '这些选项不是'}问题的正确答案。`,
          rationale_zh: `这个答案是错误的。${wrongText.split(', ').length === 1 ? '这个选项不是' : '这些选项不是'}问题的正确答案。`
        }));
        
        console.log(`   ✅ ${newWrongAnswers.length}개 오답을 ${correctCount}개 옵션으로 수정됨`);
        fixedCount++;
      } else {
        console.log(`   ⚠️  질문 ${question.id}에 대한 중국어 오답 템플릿이 없습니다.`);
      }
    }
  });
  
  // 수정된 파일 저장
  fs.writeFileSync(chineseFilePath, JSON.stringify(chineseData, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`✅ 총 ${fixedCount}개 질문의 구조적 문제 수정됨`);
  console.log(`📁 파일 저장됨: ${chineseFilePath}`);
  
  // 검증
  console.log('\n=== 수정 검증 ===');
  let remainingProblems = 0;
  
  problemQuestions.slice(0, 10).forEach(questionId => {
    const question = chineseData.find(q => q.id === questionId);
    if (question) {
      const englishQ = englishMap[questionId];
      const correctCount = englishQ.correctAnswers.length;
      
      console.log(`질문 ${questionId}: 정답 ${correctCount}개`);
      
      question.wrongAnswers.forEach((wa, idx) => {
        const text = wa.text_zh || wa.text;
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
