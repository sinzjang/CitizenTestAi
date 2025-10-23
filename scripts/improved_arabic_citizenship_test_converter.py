#!/usr/bin/env python3
"""
개선된 USCIS 시민권 시험 아랍어 버전 CSV 변환기
- 데이터 정제 로직 강화
- 누락된 문제 자동 보완
- 헤더 오염 제거
- 아랍어 특수 문자 처리 개선
"""

import re
import csv
import sys
from pathlib import Path
from collections import defaultdict

def clean_text(text):
    """텍스트 정제 함수"""
    if not text:
        return text
    
    # 헤더 정보 제거
    text = re.sub(r'128 Civics Questions and Answers \(2025 version\)', '', text)
    text = re.sub(r'128 سؤاالً وجواًبا عن التربية المدنية \)نسخة 2025\(', '', text)
    text = re.sub(r'American Government', '', text)
    text = re.sub(r'الحكومة األمریكیة', '', text)
    text = re.sub(r'A: Principles of American Government', '', text)
    text = re.sub(r'أ\. مبادئ الحكومة الأمریكیة', '', text)
    text = re.sub(r'Symbols and holidays', '', text)
    text = re.sub(r'الرموز والعطالت', '', text)
    text = re.sub(r'A: Symbols', '', text)
    text = re.sub(r'أ: الرموز', '', text)
    text = re.sub(r'B: Holidays', '', text)
    text = re.sub(r'ب: العطلات', '', text)
    
    # 페이지 번호 제거
    text = re.sub(r'\b\d{1,2}\b(?=\s*$)', '', text)
    
    # 연속된 공백 정리
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def extract_all_questions_arabic_improved(file_path):
    """
    개선된 아랍어 파일 추출 함수
    """
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    questions = {}
    found_numbers = set()
    
    lines = content.split('\n')
    current_question_en = None
    current_answers_en = []
    current_question_ar = None
    current_answers_ar = []
    current_number = None
    is_collecting_en_answers = False
    is_collecting_ar_answers = False
    
    print(f"📖 총 {len(lines)}줄을 분석 중...")
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        
        # 빈 줄이나 헤더 스킵
        if not line or 'uscis.gov' in line or 'of 19' in line:
            continue
        
        # 영어 문제 패턴 감지
        english_match = re.match(r'^(\d+)\.\s*(.+?)(?:\s*\*)?$', line)
        if english_match:
            # 이전 문제 저장
            if current_number and current_question_en and current_question_ar:
                questions[current_number] = (
                    clean_text(current_question_en), 
                    [clean_text(ans) for ans in current_answers_en if clean_text(ans)],
                    clean_text(current_question_ar),
                    [clean_text(ans) for ans in current_answers_ar if clean_text(ans)]
                )
                found_numbers.add(current_number)
            
            # 새 문제 시작
            current_number = int(english_match.group(1))
            current_question_en = english_match.group(2).strip()
            current_answers_en = []
            current_question_ar = None
            current_answers_ar = []
            is_collecting_en_answers = True
            is_collecting_ar_answers = False
            print(f"✅ 영어 문제 {current_number} 발견: {current_question_en[:50]}...")
            continue
        
        # 아랍어 문제 패턴 감지 (다양한 패턴 지원)
        arabic_patterns = [
            r'^\.([٠-٩0-9]+)\s*(.+?)(?:\s*\*)?$',  # 기본 패턴
            r'^([٠-٩0-9]+)\.\s*(.+?)(?:\s*\*)?$',  # 점이 앞에 있는 패턴
        ]
        
        arabic_match = None
        for pattern in arabic_patterns:
            arabic_match = re.match(pattern, line)
            if arabic_match:
                break
        
        if arabic_match and current_number:
            current_question_ar = arabic_match.group(2).strip()
            is_collecting_en_answers = False
            is_collecting_ar_answers = True
            print(f"✅ 아랍어 문제 {current_number} 발견: {current_question_ar[:30]}...")
            continue
        
        # 답변 패턴 감지
        if line.startswith('•') and current_number:
            answer = line[1:].strip()
            
            # 연속 줄 병합 로직
            next_line_idx = line_num
            while next_line_idx < len(lines) - 1:
                next_line_idx += 1
                next_line = lines[next_line_idx].strip()
                
                # 중단 조건
                if (next_line.startswith('•') or 
                    re.match(r'^\d+\.', next_line) or
                    re.match(r'^\.([٠-٩0-9]+)', next_line) or
                    re.match(r'^([٠-٩0-9]+)\.', next_line) or
                    'uscis.gov' in next_line or
                    not next_line):
                    break
                
                # 헤더나 섹션 제목이면 중단
                if ('128 Civics Questions' in next_line or 
                    'American Government' in next_line or
                    'الحكومة' in next_line or
                    'Symbols and holidays' in next_line):
                    break
                
                # 의미있는 내용이면 병합
                if next_line and not next_line.startswith('•'):
                    answer += ' ' + next_line
                else:
                    break
            
            # 정제된 답변 추가
            cleaned_answer = clean_text(answer)
            if cleaned_answer and len(cleaned_answer) > 1:
                if is_collecting_en_answers:
                    current_answers_en.append(cleaned_answer)
                elif is_collecting_ar_answers:
                    current_answers_ar.append(cleaned_answer)
    
    # 마지막 문제 저장
    if current_number and current_question_en and current_question_ar:
        questions[current_number] = (
            clean_text(current_question_en), 
            [clean_text(ans) for ans in current_answers_en if clean_text(ans)],
            clean_text(current_question_ar),
            [clean_text(ans) for ans in current_answers_ar if clean_text(ans)]
        )
        found_numbers.add(current_number)
    
    return questions, sorted(found_numbers)

def manual_add_missing_questions_arabic():
    """
    누락된 아랍어 문제들을 수동으로 추가합니다.
    """
    manual_questions = {
        4: (
            "The U.S. Constitution starts with the words \"We the People.\" What does \"We the People\" mean?",
            ["Self-government", "Popular sovereignty", "Consent of the governed", "People should govern themselves", "(Example of) social contract"],
            "يبدأ دستور الواليات المتحدة بعبارة \"نحن الشعب\". ماذا تعني عبارة \"الشعب\"؟",
            ["الحكم الذاتي", "السيادة الشعبية", "رضا المحكومين", "أن يحكم الناس أنفسهم", "(مثال على) العقد الاجتماعي"]
        ),
        
        11: (
            "The words \"Life, Liberty, and the pursuit of Happiness\" are in what founding document?",
            ["Declaration of Independence"],
            "الكلمات \"الحياة والحرية والسعي وراء السعادة\" موجودة في أي وثيقة تأسيسية؟",
            ["إعلان الاستقلال"]
        ),
        
        17: (
            "The President of the United States is in charge of which branch of government?",
            ["Executive branch"],
            "رئيس الولايات المتحدة مسؤول عن أي فرع من فروع الحكومة؟",
            ["الفرع التنفيذي"]
        ),
        
        18: (
            "What part of the federal government writes laws?",
            ["(U.S.) Congress", "(U.S.) legislature", "Legislative branch"],
            "أي جزء من الحكومة الفيدرالية يكتب القوانين؟",
            ["الكونغرس الأمريكي", "السلطة التشريعية الأمريكية", "الفرع التشريعي"]
        ),
        
        38: (
            "What is the name of the President of the United States now?",
            ["Visit uscis.gov/citizenship/testupdates for the name of the President of the United States."],
            "ما اسم رئيس الولايات المتحدة الآن؟",
            ["قم بزيارة uscis.gov/citizenship/testupdates لمعرفة اسم رئيس الولايات المتحدة."]
        ),
        
        40: (
            "If the president can no longer serve, who becomes president?",
            ["The Vice President (of the United States)"],
            "إذا لم يعد بإمكان الرئيس الخدمة، من يصبح رئيساً؟",
            ["نائب الرئيس (للولايات المتحدة)"]
        ),
        
        64: (
            "Who can vote in federal elections, run for federal office, and serve on a jury in the United States?",
            ["Citizens", "Citizens of the United States", "U.S. citizens"],
            "من يمكنه التصويت في الانتخابات الفيدرالية والترشح للمناصب الفيدرالية والخدمة في هيئة المحلفين في الولايات المتحدة؟",
            ["المواطنون", "مواطنو الولايات المتحدة", "المواطنون الأمريكيون"]
        ),
        
        74: (
            "Who lived in America before the Europeans arrived?",
            ["American Indians", "Native Americans"],
            "من عاش في أمريكا قبل وصول الأوروبيين؟",
            ["الهنود الأمريكيون", "الأمريكيون الأصليون"]
        ),
        
        92: (
            "Name the U.S. war between the North and the South.",
            ["The Civil War", "The War between the States"],
            "اذكر الحرب الأمريكية بين الشمال والجنوب.",
            ["الحرب الأهلية", "الحرب بين الولايات"]
        ),
        
        95: (
            "What did the Emancipation Proclamation do?",
            ["Freed slaves in the Confederacy", "Freed slaves in the Confederate states", "Freed slaves in most Southern states"],
            "ماذا فعل إعلان التحرر؟",
            ["حرر العبيد في الكونفدرالية", "حرر العبيد في الولايات الكونفدرالية", "حرر العبيد في معظم الولايات الجنوبية"]
        ),
        
        97: (
            "What amendment says all persons born or naturalized in the United States, and subject to the jurisdiction thereof, are U.S. citizens?",
            ["14th Amendment"],
            "أي تعديل ينص على أن جميع الأشخاص المولودين أو المتجنسين في الولايات المتحدة، والخاضعين لولايتها القضائية، هم مواطنون أمريكيون؟",
            ["التعديل الرابع عشر"]
        ),
        
        105: (
            "Who was president during the Great Depression and World War II?",
            ["(Franklin) Roosevelt", "Franklin D. Roosevelt", "FDR"],
            "من كان الرئيس خلال الكساد الكبير والحرب العالمية الثانية؟",
            ["(فرانكلين) روزفلت", "فرانكلين د. روزفلت", "FDR"]
        ),
        
        109: (
            "During the Cold War, what was one main concern of the United States?",
            ["Communism", "Nuclear war"],
            "خلال الحرب الباردة، ما كان أحد الاهتمامات الرئيسية للولايات المتحدة؟",
            ["الشيوعية", "الحرب النووية"]
        ),
        
        113: (
            "Martin Luther King, Jr. is famous for many things. Name one.",
            ["Fought for civil rights", "Worked for equality for all Americans", "Worked to ensure that people would \"not be judged by the color of their skin, but by the content of their character\""],
            "اشتهر مارتن لوثر كينغ الابن بأشياء كثيرة. اذكر واحداً.",
            ["ناضل من أجل الحقوق المدنية", "عمل من أجل المساواة لجميع الأمريكيين", "عمل على ضمان \"عدم الحكم على الناس بلون بشرتهم، بل بمحتوى شخصيتهم\""]
        ),
        
        115: (
            "What major event happened on September 11, 2001, in the United States?",
            ["Terrorists attacked the United States", "Terrorists took over two planes and crashed them into the World Trade Center in New York City"],
            "ما الحدث الرئيسي الذي حدث في 11 سبتمبر 2001 في الولايات المتحدة؟",
            ["هاجم الإرهابيون الولايات المتحدة", "استولى الإرهابيون على طائرتين وأسقطوهما في مركز التجارة العالمي في نيويورك"]
        ),
        
        116: (
            "Name one U.S. military conflict after the September 11, 2001 attacks.",
            ["(Global) War on Terror", "War in Afghanistan", "War in Iraq"],
            "اذكر صراعاً عسكرياً أمريكياً واحداً بعد هجمات 11 سبتمبر 2001.",
            ["الحرب (العالمية) على الإرهاب", "الحرب في أفغانستان", "الحرب في العراق"]
        ),
        
        124: (
            "The Nation's first motto was \"E Pluribus Unum.\" What does that mean?",
            ["Out of many, one", "We all become one"],
            "كان الشعار الأول للأمة \"E Pluribus Unum\". ماذا يعني ذلك؟",
            ["من الكثيرين، واحد", "نصبح جميعاً واحداً"]
        )
    }
    
    return manual_questions

def save_to_csv_arabic_improved(questions, output_path):
    """
    개선된 아랍어 버전 CSV 저장 함수
    """
    
    # 수동 추가 문제들 병합
    manual_questions = manual_add_missing_questions_arabic()
    
    # 누락된 문제들을 수동으로 추가
    for num, (en_q, en_a, ar_q, ar_a) in manual_questions.items():
        if num not in questions:
            questions[num] = (en_q, en_a, ar_q, ar_a)
            print(f"➕ 수동 추가: 문제 {num}")
    
    # 문제 번호순으로 정렬
    sorted_questions = sorted(questions.items())
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더 작성
        writer.writerow(['문제번호', '영어문제', '영어답변', '아랍어문제', '아랍어답변'])
        
        # 데이터 작성
        for question_num, (en_question, en_answers, ar_question, ar_answers) in sorted_questions:
            en_answers_text = ", ".join(en_answers) if en_answers else ""
            ar_answers_text = ", ".join(ar_answers) if ar_answers else ""
            writer.writerow([question_num, en_question, en_answers_text, ar_question, ar_answers_text])
    
    print(f"\n💾 개선된 아랍어 버전 CSV 파일 저장 완료: {output_path}")
    print(f"📊 총 {len(sorted_questions)}개 문제 저장")
    
    return len(sorted_questions)

def validate_questions_arabic_improved(found_numbers, expected_total=128):
    """
    개선된 아랍어 버전 문제 검증 함수
    """
    print(f"\n🔍 개선된 아랍어 버전 문제 검증 중...")
    print(f"📊 발견된 문제 수: {len(found_numbers)}")
    print(f"📊 예상 문제 수: {expected_total}")
    
    # 1부터 expected_total까지의 모든 번호
    expected_numbers = set(range(1, expected_total + 1))
    found_set = set(found_numbers)
    
    # 누락된 문제들
    missing = sorted(expected_numbers - found_set)
    # 예상 범위를 벗어난 문제들
    extra = sorted(found_set - expected_numbers)
    
    print(f"\n📋 검증 결과:")
    print(f"✅ 발견된 문제: {len(found_numbers)}개")
    
    if missing:
        print(f"❌ 누락된 문제 ({len(missing)}개): {missing}")
    else:
        print(f"✅ 누락된 문제: 없음")
    
    if extra:
        print(f"⚠️  범위 초과 문제: {extra}")
    
    return missing, extra

def main():
    """메인 함수"""
    
    if len(sys.argv) != 3:
        print("사용법: python improved_arabic_citizenship_test_converter.py <입력파일> <출력파일>")
        print("예시: python improved_arabic_citizenship_test_converter.py input_arabic.csv output_arabic.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # 입력 파일 존재 확인
    if not Path(input_file).exists():
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    try:
        print(f"🚀 개선된 아랍어 시민권 시험 데이터 변환 시작")
        print(f"📁 입력 파일: {input_file}")
        print(f"📁 출력 파일: {output_file}")
        
        # 1. 문제 추출
        questions, found_numbers = extract_all_questions_arabic_improved(input_file)
        
        # 2. 검증
        missing, extra = validate_questions_arabic_improved(found_numbers)
        
        # 3. CSV 저장 (누락된 문제 자동 추가)
        total_saved = save_to_csv_arabic_improved(questions, output_file)
        
        # 4. 최종 결과 출력
        print(f"\n🎉 개선된 아랍어 버전 변환 완료!")
        print(f"📊 최종 저장된 문제 수: {total_saved}")
        
        if missing:
            manual_count = len([n for n in missing if n <= 128])
            print(f"🔧 자동 추가된 누락 문제: {manual_count}개")
        
        # 5. 샘플 출력
        print(f"\n📋 처리된 문제 샘플 (처음 2개):")
        sample_questions = sorted(questions.items())[:2]
        for num, (en_q, en_a, ar_q, ar_a) in sample_questions:
            print(f"{num}. EN: {en_q}")
            print(f"    AR: {ar_q}")
            print(f"    EN답변: {', '.join(en_a[:2])}{'...' if len(en_a) > 2 else ''}")
            print(f"    AR답변: {', '.join(ar_a[:2])}{'...' if len(ar_a) > 2 else ''}")
            print()
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
