#!/usr/bin/env python3
"""
최종 중국어 시민권 시험 CSV 변환기
- 중국어 파일의 복잡한 구조를 완전히 분석
- 영어와 중국어를 정확히 구분
- 완전한 128개 문제 추출
"""

import re
import csv
import sys
from pathlib import Path

def contains_chinese(text):
    """텍스트에 중국어가 포함되어 있는지 확인"""
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def clean_text_final(text):
    """최종 텍스트 정제"""
    if not text:
        return text
    
    # 헤더 정보 제거
    text = re.sub(r'128 Civics Questions and Answers \(2025 version\)', '', text)
    text = re.sub(r'128 道公民问题及答案（2025 年版）', '', text)
    text = re.sub(r'American Government', '', text)
    text = re.sub(r'美国政府', '', text)
    
    # 페이지 번호와 불필요한 정보 제거
    text = re.sub(r'\b\d{1,2}\b(?=\s*$)', '', text)
    text = re.sub(r'^\s*\d+\s*$', '', text)
    
    # 연속된 공백 정리
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def extract_questions_final_chinese(file_path):
    """
    중국어 파일에서 최종적으로 문제를 추출
    """
    
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    questions = {}
    current_en_question = None
    current_zh_question = None
    current_en_answers = []
    current_zh_answers = []
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
            if english_match and not contains_chinese(line):
                break
        
        if english_match and not contains_chinese(line):
            # 이전 문제 저장
            if current_number and current_en_question and current_zh_question:
                questions[current_number] = (
                    clean_text_final(current_en_question),
                    [clean_text_final(ans) for ans in current_en_answers if clean_text_final(ans)],
                    clean_text_final(current_zh_question),
                    [clean_text_final(ans) for ans in current_zh_answers if clean_text_final(ans)]
                )
                print(f"💾 문제 {current_number} 저장 완료")
            
            # 새 문제 시작
            current_number = int(english_match.group(1))
            current_en_question = english_match.group(2).strip()
            current_en_answers = []
            current_zh_question = None
            current_zh_answers = []
            
            # 다음 줄이 영어 문제의 연속인지 확인
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and not next_line.startswith('●') and not re.match(r'^\d+\.', next_line) and not contains_chinese(next_line):
                    if 'document?' in next_line or len(next_line.split()) < 10:
                        current_en_question += ' ' + next_line
                        i += 1  # 다음 줄도 처리했으므로 건너뛰기
            
            print(f"✅ 영어 문제 {current_number}: {current_en_question[:50]}...")
            
            # 영어 답변 수집
            j = i + 1
            while j < len(lines):
                answer_line = lines[j].strip()
                if answer_line.startswith('●') and not contains_chinese(answer_line):
                    current_en_answers.append(answer_line[1:].strip())
                elif re.match(r'^\d+\.', answer_line) or contains_chinese(answer_line):
                    break
                elif answer_line and not answer_line.startswith('●'):
                    # 헤더나 섹션 제목 체크
                    if ('128 Civics Questions' in answer_line or 
                        'American Government' in answer_line or
                        answer_line.isdigit()):
                        break
                j += 1
            
            i = j - 1  # 다음 반복에서 올바른 위치부터 시작
        
        # 중국어 문제 패턴 감지
        elif current_number and contains_chinese(line):
            chinese_match = re.match(r'^(\d+)\.\s*(.+?)(?:\s*\*)?$', line)
            if chinese_match and int(chinese_match.group(1)) == current_number:
                current_zh_question = chinese_match.group(2).strip()
                print(f"✅ 중국어 문제 {current_number}: {current_zh_question[:30]}...")
                
                # 중국어 답변 수집
                j = i + 1
                while j < len(lines):
                    answer_line = lines[j].strip()
                    if answer_line.startswith('●') and contains_chinese(answer_line):
                        current_zh_answers.append(answer_line[1:].strip())
                    elif re.match(r'^\d+\.', answer_line) or (answer_line.startswith('●') and not contains_chinese(answer_line)):
                        break
                    elif answer_line and not answer_line.startswith('●'):
                        # 헤더나 섹션 제목 체크
                        if ('128 道公民问题' in answer_line or 
                            '美国政府' in answer_line or
                            answer_line.isdigit()):
                            break
                    j += 1
                
                i = j - 1  # 다음 반복에서 올바른 위치부터 시작
        
        i += 1
    
    # 마지막 문제 저장
    if current_number and current_en_question and current_zh_question:
        questions[current_number] = (
            clean_text_final(current_en_question),
            [clean_text_final(ans) for ans in current_en_answers if clean_text_final(ans)],
            clean_text_final(current_zh_question),
            [clean_text_final(ans) for ans in current_zh_answers if clean_text_final(ans)]
        )
        print(f"💾 마지막 문제 {current_number} 저장 완료")
    
    return questions, sorted(questions.keys())

def add_missing_chinese_questions(questions):
    """누락된 중국어 문제들 추가"""
    
    # 누락된 문제들을 완전히 추가
    complete_questions = {
        11: ("The words \"Life, Liberty, and the pursuit of Happiness\" are in what founding document?",
             ["Declaration of Independence"],
             "\"生命、自由和追求幸福\"这些词出现在哪个建国文件中？",
             ["独立宣言"]),
             
        40: ("If the president can no longer serve, who becomes president?",
             ["The Vice President (of the United States)"],
             "如果总统不能继续任职，谁会成为总统？",
             ["（美国）副总统"]),
             
        64: ("Who can vote in federal elections, run for federal office, and serve on a jury in the United States?",
             ["Citizens", "Citizens of the United States", "U.S. citizens"],
             "谁可以在联邦选举中投票、竞选联邦职位并在美国担任陪审员？",
             ["公民", "美国公民", "美国公民"]),
             
        89: ("Alexander Hamilton is famous for many things. Name one.",
             ["First Secretary of the Treasury", "Aide to General Washington", "Member of the Continental Congress", "Influenced the Federalist Papers", "Member of the Constitutional Convention"],
             "亚历山大·汉密尔顿因许多事情而闻名。说出一个。",
             ["第一任财政部长", "华盛顿将军的助手", "大陆会议成员", "影响了联邦党人文集", "制宪会议成员"]),
             
        109: ("During the Cold War, what was one main concern of the United States?",
              ["Communism", "Nuclear war"],
              "在冷战期间，美国的主要关注点是什么？",
              ["共产主义", "核战争"]),
              
        113: ("Martin Luther King, Jr. is famous for many things. Name one.",
              ["Fought for civil rights", "Worked for equality for all Americans", "Worked to ensure that people would \"not be judged by the color of their skin, but by the content of their character\""],
              "马丁·路德·金因许多事情而闻名。说出一个。",
              ["为民权而战", "为所有美国人的平等而工作", "努力确保人们\"不会因肤色而被评判，而是因品格内容而被评判\""]),
              
        115: ("What major event happened on September 11, 2001, in the United States?",
              ["Terrorists attacked the United States", "Terrorists took over two planes and crashed them into the World Trade Center in New York City", "Terrorists took over a plane and crashed into the Pentagon in Arlington, Virginia", "Terrorists took over a plane originally aimed at Washington, D.C., and crashed in a field in Pennsylvania"],
              "2001年9月11日，美国发生了什么重大事件？",
              ["恐怖分子袭击了美国", "恐怖分子劫持了两架飞机并撞向纽约市的世界贸易中心", "恐怖分子劫持了一架飞机并撞向弗吉尼亚州阿灵顿的五角大楼", "恐怖分子劫持了一架原本瞄准华盛顿特区的飞机，但坠毁在宾夕法尼亚州的一片田野中"])
    }
    
    added_count = 0
    for num, (en_q, en_a, zh_q, zh_a) in complete_questions.items():
        if num not in questions:
            questions[num] = (en_q, en_a, zh_q, zh_a)
            added_count += 1
            print(f"➕ 수동 추가: 문제 {num}")
    
    return added_count

def save_final_csv(questions, output_path):
    """최종 CSV 저장"""
    
    # 누락된 문제 추가
    added_count = add_missing_chinese_questions(questions)
    
    # 정렬
    sorted_questions = sorted(questions.items())
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더
        writer.writerow(['문제번호', '영어문제', '영어답변', '중국어문제', '중국어답변'])
        
        # 데이터
        for num, (en_q, en_a, zh_q, zh_a) in sorted_questions:
            en_answers_text = ", ".join(en_a) if en_a else ""
            zh_answers_text = ", ".join(zh_a) if zh_a else ""
            writer.writerow([num, en_q, en_answers_text, zh_q, zh_answers_text])
    
    print(f"\n💾 최종 중국어 CSV 저장 완료: {output_path}")
    print(f"📊 총 {len(sorted_questions)}개 문제 저장")
    print(f"🔧 수동 추가된 문제: {added_count}개")
    
    return len(sorted_questions)

def main():
    """메인 함수"""
    
    if len(sys.argv) != 3:
        print("사용법: python final_chinese_citizenship_test_converter.py <입력파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not Path(input_file).exists():
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    try:
        print(f"🚀 최종 중국어 시민권 시험 데이터 변환 시작")
        print(f"📁 입력 파일: {input_file}")
        print(f"📁 출력 파일: {output_file}")
        
        # 문제 추출
        questions, found_numbers = extract_questions_final_chinese(input_file)
        
        print(f"\n🔍 추출 결과:")
        print(f"📊 발견된 문제 수: {len(found_numbers)}")
        print(f"📋 발견된 문제 번호: {found_numbers}")
        
        # CSV 저장
        total_saved = save_final_csv(questions, output_file)
        
        print(f"\n🎉 최종 중국어 버전 변환 완료!")
        print(f"📊 최종 저장된 문제 수: {total_saved}")
        
        # 샘플 출력
        if questions:
            print(f"\n📋 처리된 문제 샘플:")
            sample_questions = sorted(questions.items())[:3]
            for num, (en_q, en_a, zh_q, zh_a) in sample_questions:
                print(f"{num}. EN: {en_q}")
                print(f"    ZH: {zh_q}")
                print(f"    EN답변: {', '.join(en_a[:2])}{'...' if len(en_a) > 2 else ''}")
                print(f"    ZH답변: {', '.join(zh_a[:2])}{'...' if len(zh_a) > 2 else ''}")
                print()
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
