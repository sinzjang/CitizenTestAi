#!/usr/bin/env python3
"""
USCIS 시민권 시험 한국어 버전 CSV 변환기
- 영어와 한국어 문제/답변을 모두 추출
- 이중 언어 구조 처리
- 완전한 128개 문제 추출
"""

import re
import csv
import sys
from pathlib import Path

def contains_korean(text):
    """텍스트에 한국어가 포함되어 있는지 확인"""
    return bool(re.search(r'[\uac00-\ud7af]', text))

def clean_text_korean(text):
    """한국어 텍스트 정제"""
    if not text:
        return text
    
    # 헤더 정보만 제거 (문제 내용의 "미국 정부"는 보존)
    text = re.sub(r'128 Civics Questions and Answers \(2025 version\)', '', text)
    text = re.sub(r'시민권 시험 문제 및 답변 128가지\(2025년 버전\)', '', text)
    text = re.sub(r'^American Government$', '', text)  # 단독으로 나오는 헤더만 제거
    text = re.sub(r'^미국 정부$', '', text)  # 단독으로 나오는 헤더만 제거
    text = re.sub(r'A: Principles of American Government', '', text)
    text = re.sub(r'A: 미국 정부의 원칙들', '', text)
    
    # 페이지 번호와 불필요한 정보 제거
    text = re.sub(r'\b\d{1,2}\b(?=\s*$)', '', text)
    text = re.sub(r'^\s*\d+\s*$', '', text)
    
    # 연속된 공백 정리
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def extract_questions_korean(file_path):
    """
    한국어 파일에서 문제를 추출
    """
    
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    questions = {}
    current_en_question = None
    current_ko_question = None
    current_en_answers = []
    current_ko_answers = []
    current_number = None
    
    print(f"📖 총 {len(lines)}줄을 분석 중...")
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # 빈 줄이나 헤더 스킵
        if not line or 'uscis.gov' in line or 'of 19' in line:
            i += 1
            continue
        
        # 영어 문제 패턴 감지
        english_patterns = [
            r'^(\d+)\.\s*(.+?)(?:\s*\*)?$',
            r'^"(\d+)\.\s*(.+?)"?$',
            r'^"(\d+)\.\s*(.+?)$'
        ]
        
        english_match = None
        for pattern in english_patterns:
            english_match = re.match(pattern, line)
            if english_match and not contains_korean(line):
                break
        
        if english_match and not contains_korean(line):
            # 이전 문제 저장
            if current_number and current_en_question and current_ko_question:
                questions[current_number] = (
                    clean_text_korean(current_en_question),
                    [clean_text_korean(ans) for ans in current_en_answers if clean_text_korean(ans)],
                    clean_text_korean(current_ko_question),
                    [clean_text_korean(ans) for ans in current_ko_answers if clean_text_korean(ans)]
                )
                print(f"💾 문제 {current_number} 저장 완료")
            
            # 새 문제 시작
            current_number = int(english_match.group(1))
            current_en_question = english_match.group(2).strip()
            current_en_answers = []
            current_ko_question = None
            current_ko_answers = []
            
            print(f"✅ 영어 문제 {current_number}: {current_en_question[:50]}...")
            
            # 영어 답변 수집
            j = i + 1
            while j < len(lines):
                answer_line = lines[j].strip()
                if answer_line.startswith('●') and not contains_korean(answer_line):
                    current_en_answers.append(answer_line[1:].strip())
                elif answer_line.startswith('"●') and not contains_korean(answer_line):
                    # 따옴표로 둘러싸인 답변 처리
                    clean_answer = answer_line[2:].strip().rstrip('"')
                    current_en_answers.append(clean_answer)
                elif re.match(r'^\d+\.', answer_line) or contains_korean(answer_line):
                    break
                elif answer_line and not answer_line.startswith('●') and not answer_line.startswith('"●'):
                    # 헤더나 섹션 제목 체크
                    if ('128 Civics Questions' in answer_line or 
                        'American Government' in answer_line or
                        answer_line.isdigit()):
                        break
                j += 1
            
            i = j - 1  # 다음 반복에서 올바른 위치부터 시작
        
        # 한국어 문제 패턴 감지
        elif current_number and contains_korean(line):
            korean_match = re.match(r'^(\d+)\.\s*(.+?)(?:\s*\*)?$', line)
            if korean_match and int(korean_match.group(1)) == current_number:
                current_ko_question = korean_match.group(2).strip()
                print(f"✅ 한국어 문제 {current_number}: {current_ko_question[:30]}...")
                
                # 한국어 답변 수집
                j = i + 1
                while j < len(lines):
                    answer_line = lines[j].strip()
                    if answer_line.startswith('●') and contains_korean(answer_line):
                        current_ko_answers.append(answer_line[1:].strip())
                    elif answer_line.startswith('"●') and contains_korean(answer_line):
                        # 따옴표로 둘러싸인 답변 처리
                        clean_answer = answer_line[2:].strip().rstrip('"')
                        current_ko_answers.append(clean_answer)
                    elif re.match(r'^\d+\.', answer_line) or (answer_line.startswith('●') and not contains_korean(answer_line)):
                        break
                    elif answer_line and not answer_line.startswith('●') and not answer_line.startswith('"●'):
                        # 헤더나 섹션 제목 체크
                        if ('시민권 시험 문제' in answer_line or 
                            answer_line == '미국 정부' or  # 단독 헤더만 체크
                            answer_line.isdigit()):
                            break
                    j += 1
                
                i = j - 1  # 다음 반복에서 올바른 위치부터 시작
        
        i += 1
    
    # 마지막 문제 저장
    if current_number and current_en_question and current_ko_question:
        questions[current_number] = (
            clean_text_korean(current_en_question),
            [clean_text_korean(ans) for ans in current_en_answers if clean_text_korean(ans)],
            clean_text_korean(current_ko_question),
            [clean_text_korean(ans) for ans in current_ko_answers if clean_text_korean(ans)]
        )
        print(f"💾 마지막 문제 {current_number} 저장 완료")
    
    return questions, sorted(questions.keys())

def add_missing_korean_questions(questions):
    """누락된 한국어 문제들 추가"""
    
    # 누락된 문제들을 완전히 추가
    complete_questions = {
        4: ("The U.S. Constitution starts with the words \"We the People.\" What does \"We the People\" mean?",
            ["Self-government", "Popular sovereignty", "Consent of the governed", "People should govern themselves", "(Example of) social contract"],
            "미국 헌법은 \"우리 인민\"이라는 말로 시작한다. \"우리 인민\"은 무엇을 의미하는가?",
            ["자치", "인민 주권", "피치자의 동의", "사람들이 스스로를 통치해야 함", "사회 계약의 (예)"]),
            
        11: ("The words \"Life, Liberty, and the pursuit of Happiness\" are in what founding document?",
             ["Declaration of Independence"],
             "\"생명, 자유, 행복 추구\"라는 말이 들어있는 건국 문서는 무엇인가?",
             ["독립선언서"]),
             
        19: ("What are the two parts of the U.S. Congress?",
             ["Senate and House (of Representatives)"],
             "미국 의회의 두 부문은 무엇인가?",
             ["상원과 하원 (하원의원)"]),
             
        30: ("What is the name of the Speaker of the House of Representatives now?",
             ["Visit uscis.gov/citizenship/testupdates for the name of the Speaker of the House of Representatives."],
             "현재 하원의장의 이름은 무엇인가?",
             ["하원의장의 이름은 uscis.gov/citizenship/testupdates를 방문하시오."]),
             
        38: ("What is the name of the President of the United States now?",
             ["Visit uscis.gov/citizenship/testupdates for the name of the President of the United States."],
             "현재 미국 대통령의 이름은 무엇인가?",
             ["미국 대통령의 이름은 uscis.gov/citizenship/testupdates를 방문하시오."]),
             
        39: ("What is the name of the Vice President of the United States now?",
             ["Visit uscis.gov/citizenship/testupdates for the name of the Vice President of the United States."],
             "현재 미국 부통령의 이름은 무엇인가?",
             ["미국 부통령의 이름은 uscis.gov/citizenship/testupdates를 방문하시오."]),
             
        40: ("If the president can no longer serve, who becomes president?",
             ["The Vice President (of the United States)"],
             "대통령이 더 이상 직무를 수행할 수 없으면, 누가 대통령이 되는가?",
             ["(미국의) 부통령"]),
             
        57: ("Who is the Chief Justice of the United States now?",
             ["Visit uscis.gov/citizenship/testupdates for the name of the Chief Justice of the United States."],
             "현재 미국 대법원장은 누구인가?",
             ["미국 대법원장의 이름은 uscis.gov/citizenship/testupdates를 방문하시오."]),
             
        64: ("Who can vote in federal elections, run for federal office, and serve on a jury in the United States?",
             ["Citizens", "Citizens of the United States", "U.S. citizens"],
             "미국에서 연방 선거에 투표하고, 연방 공직에 출마하고, 배심원으로 봉사할 수 있는 사람은 누구인가?",
             ["시민", "미국 시민", "미국 시민"]),
             
        66: ("What is one responsibility that is only for United States citizens?",
             ["Vote in a federal election", "Run for federal office"],
             "미국 시민만의 책임 중 하나는 무엇인가?",
             ["연방 선거에서 투표", "연방 공직에 출마"]),
             
        79: ("When was the Declaration of Independence adopted?",
             ["July 4, 1776"],
             "독립선언서는 언제 채택되었나?",
             ["1776년 7월 4일"]),
             
        89: ("Alexander Hamilton is famous for many things. Name one.",
             ["First Secretary of the Treasury", "Aide to General Washington", "Member of the Continental Congress", "Influenced the Federalist Papers", "Member of the Constitutional Convention"],
             "알렉산더 해밀턴은 여러 가지로 유명하다. 하나를 말하라.",
             ["초대 재무장관", "워싱턴 장군의 보좌관", "대륙회의 의원", "연방주의자 논문에 영향을 줌", "헌법제정회의 의원"]),
             
        97: ("What amendment says all persons born or naturalized in the United States, and subject to the jurisdiction thereof, are U.S. citizens?",
             ["14th Amendment"],
             "미국에서 태어나거나 귀화하여 그 관할권에 속하는 모든 사람은 미국 시민이라고 명시한 수정헌법은 무엇인가?",
             ["수정헌법 제14조"]),
             
        109: ("During the Cold War, what was one main concern of the United States?",
              ["Communism", "Nuclear war"],
              "냉전 시대에 미국의 주요 관심사 중 하나는 무엇이었나?",
              ["공산주의", "핵전쟁"]),
              
        113: ("Martin Luther King, Jr. is famous for many things. Name one.",
              ["Fought for civil rights", "Worked for equality for all Americans", "Worked to ensure that people would \"not be judged by the color of their skin, but by the content of their character\""],
              "마틴 루터 킹 주니어는 여러 가지로 유명하다. 하나를 말하라.",
              ["시민권을 위해 싸움", "모든 미국인의 평등을 위해 일함", "사람들이 \"피부색이 아닌 인격의 내용으로 판단받도록\" 노력함"]),
              
        115: ("What major event happened on September 11, 2001, in the United States?",
              ["Terrorists attacked the United States", "Terrorists took over two planes and crashed them into the World Trade Center in New York City", "Terrorists took over a plane and crashed into the Pentagon in Arlington, Virginia", "Terrorists took over a plane originally aimed at Washington, D.C., and crashed in a field in Pennsylvania"],
              "2001년 9월 11일 미국에서 일어난 주요 사건은 무엇인가?",
              ["테러리스트들이 미국을 공격함", "테러리스트들이 두 대의 비행기를 납치하여 뉴욕시의 세계무역센터에 충돌시킴", "테러리스트들이 비행기를 납치하여 버지니아주 알링턴의 펜타곤에 충돌시킴", "테러리스트들이 원래 워싱턴 D.C.를 겨냥한 비행기를 납치했으나 펜실베이니아주 들판에 추락함"]),
              
        116: ("Name one U.S. military conflict after the September 11, 2001 attacks.",
              ["(Global) War on Terror", "War in Afghanistan", "War in Iraq"],
              "2001년 9월 11일 공격 이후의 미국 군사 분쟁 하나를 말하라.",
              ["(세계) 테러와의 전쟁", "아프가니스탄 전쟁", "이라크 전쟁"]),
              
        120: ("Where is the Statue of Liberty?",
              ["New York (Harbor)", "Liberty Island", "[Also acceptable are New Jersey, near New York City, and on the Hudson (River).]"],
              "자유의 여신상은 어디에 있나?",
              ["뉴욕 (항구)", "자유섬", "[뉴저지, 뉴욕시 근처, 허드슨 강도 허용됨]"]),
              
        124: ("The Nation's first motto was \"E Pluribus Unum.\" What does that mean?",
              ["Out of many, one", "We all become one"],
              "국가의 첫 번째 모토는 \"E Pluribus Unum\"이었다. 그것은 무엇을 의미하는가?",
              ["다수에서 하나로", "우리 모두가 하나가 됨"])
    }
    
    added_count = 0
    for num, (en_q, en_a, ko_q, ko_a) in complete_questions.items():
        if num not in questions:
            questions[num] = (en_q, en_a, ko_q, ko_a)
            added_count += 1
            print(f"➕ 수동 추가: 문제 {num}")
    
    return added_count

def save_korean_csv(questions, output_path):
    """한국어 CSV 저장"""
    
    # 누락된 문제 추가
    added_count = add_missing_korean_questions(questions)
    
    # 정렬
    sorted_questions = sorted(questions.items())
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더
        writer.writerow(['문제번호', '영어문제', '영어답변', '한국어문제', '한국어답변'])
        
        # 데이터
        for num, (en_q, en_a, ko_q, ko_a) in sorted_questions:
            en_answers_text = ", ".join(en_a) if en_a else ""
            ko_answers_text = ", ".join(ko_a) if ko_a else ""
            writer.writerow([num, en_q, en_answers_text, ko_q, ko_answers_text])
    
    print(f"\n💾 한국어 CSV 저장 완료: {output_path}")
    print(f"📊 총 {len(sorted_questions)}개 문제 저장")
    print(f"🔧 수동 추가된 문제: {added_count}개")
    
    return len(sorted_questions)

def main():
    """메인 함수"""
    
    if len(sys.argv) != 3:
        print("사용법: python korean_citizenship_test_converter.py <입력파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not Path(input_file).exists():
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    try:
        print(f"🚀 한국어 시민권 시험 데이터 변환 시작")
        print(f"📁 입력 파일: {input_file}")
        print(f"📁 출력 파일: {output_file}")
        
        # 문제 추출
        questions, found_numbers = extract_questions_korean(input_file)
        
        print(f"\n🔍 추출 결과:")
        print(f"📊 발견된 문제 수: {len(found_numbers)}")
        print(f"📋 발견된 문제 번호: {found_numbers}")
        
        # 누락된 문제 확인
        expected = set(range(1, 129))
        found_set = set(found_numbers)
        missing = sorted(expected - found_set)
        
        if missing:
            print(f"❌ 누락된 문제 ({len(missing)}개): {missing}")
        else:
            print(f"✅ 누락된 문제: 없음")
        
        # CSV 저장
        total_saved = save_korean_csv(questions, output_file)
        
        print(f"\n🎉 한국어 버전 변환 완료!")
        print(f"📊 최종 저장된 문제 수: {total_saved}")
        
        # 샘플 출력
        if questions:
            print(f"\n📋 처리된 문제 샘플:")
            sample_questions = sorted(questions.items())[:3]
            for num, (en_q, en_a, ko_q, ko_a) in sample_questions:
                print(f"{num}. EN: {en_q}")
                print(f"    KO: {ko_q}")
                print(f"    EN답변: {', '.join(en_a[:2])}{'...' if len(en_a) > 2 else ''}")
                print(f"    KO답변: {', '.join(ko_a[:2])}{'...' if len(ko_a) > 2 else ''}")
                print()
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
