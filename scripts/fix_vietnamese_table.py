#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
베트남어 테이블 수정 - 누락된 질문 추가
"""

import csv
from pathlib import Path

def fix_vietnamese_table():
    """누락된 질문들을 수동으로 수정"""
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    # 파일 읽기
    table_file = data_dir / 'script_work' / '2025_CitizenTest_128 - Vietnamese_Table.csv'
    english_file = data_dir / 'Completed' / 'Complete_128_Questions - English.csv'
    
    print(f"📖 베트남어 테이블 읽기...")
    with open(table_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"📖 영어 CSV 읽기...")
    english_data = {}
    with open(english_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            english_data[int(row['Index'])] = row
    
    # 수동 수정이 필요한 문제들
    manual_fixes = {
        4: {
            'Answers_VI': 'Tự quản, Chủ quyền phổ biến, Sự ưng thuận của nhân dân, Người dân nên tự quản lý, (Ví dụ về) khế ước xã hội'
        },
        27: {
            'Answers_VI': 'Hai (2)'
        },
        64: {
            'Answers_VI': 'Công dân, Công dân của Hoa Kỳ, Công dân Hoa Kỳ'
        },
        78: {
            'Answers_VI': '(Thomas) Jefferson'
        },
        81: {
            'Answers_VI': 'New Hampshire, Massachusetts, Rhode Island, Connecticut, New York, New Jersey, Pennsylvania, Delaware, Maryland, Virginia, North Carolina, South Carolina, Georgia'
        },
        83: {
            'Answers_VI': '(James) Madison, (Alexander) Hamilton, (John) Jay, Publius'
        },
        97: {
            'Question_VI': 'Tu chính án nào quy định rằng tất cả những người sinh ra hoặc nhập tịch tại Hoa Kỳ và thuộc quyền tài phán của Hoa Kỳ là công dân Hoa Kỳ?',
            'Answers_EN': '14th Amendment',
            'Answers_VI': 'Tu chính án thứ 14'
        },
        99: {
            'Answers_VI': 'Susan B. Anthony, Elizabeth Cady Stanton, Sojourner Truth, Harriet Tubman, Lucretia Mott, Lucy Stone'
        },
        101: {
            'Question_VI': 'Tại sao Hoa Kỳ tham gia vào Thế chiến thứ I?',
            'Answers_VI': 'Vì Đức tấn công tàu (dân sự) của Hoa Kỳ, Để hỗ trợ Đồng minh (Anh, Pháp, Ý và Nga), Để chống lại Trung ương (Đức, Áo-Hung, Đế chế Ottoman và Bulgaria)'
        },
        102: {
            'Answers_VI': '1920, Sau Thế chiến thứ I, (Cùng với) Tu chính án thứ 19'
        },
        105: {
            'Answers_VI': '(Franklin) Roosevelt'
        },
        117: {
            'Question_VI': 'Kể tên một bộ tộc thổ dân ở Hoa Kỳ.',
            'Answers_VI': 'Apache, Blackfeet, Cayuga, Cherokee, Cheyenne, Chippewa, Choctaw, Creek, Crow, Hopi, Huron, Inupiat, Lakota, Mohawk, Mohegan, Navajo, Oneida, Onondaga, Pueblo, Seminole, Seneca, Shawnee, Sioux, Teton, Tuscarora'
        },
        119: {
            'Answers_VI': 'Washington, D.C.'
        }
    }
    
    # 수정 적용
    for row in rows:
        index = int(row['Index'])
        
        # 영어 질문/답변이 없으면 영어 CSV에서 가져오기
        if not row['Question_EN'].strip() and index in english_data:
            row['Question_EN'] = english_data[index]['Questions']
            row['Answers_EN'] = english_data[index]['Answers']
            print(f"  🔧 문제 {index}: 영어 질문/답변 추가")
        
        # 수동 수정
        if index in manual_fixes:
            print(f"  🔧 문제 {index}: 베트남어 질문/답변 수정")
            for key, value in manual_fixes[index].items():
                row[key] = value
    
    # 저장
    output_file = data_dir / 'script_work' / '2025_CitizenTest_128 - Vietnamese_Table_Fixed.csv'
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category_EN', 'SubCategory_EN', 'Category_VI', 'SubCategory_VI',
                      'Question_EN', 'Answers_EN', 'Question_VI', 'Answers_VI']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✅ 수정 완료: {output_file.name}")
    
    # 검증
    empty_q_vi = [r['Index'] for r in rows if not r['Question_VI'].strip()]
    empty_a_vi = [r['Index'] for r in rows if not r['Answers_VI'].strip()]
    
    if empty_q_vi:
        print(f"⚠️  여전히 빈 베트남어 질문: {empty_q_vi}")
    else:
        print(f"✅ 모든 문제에 베트남어 질문이 있습니다!")
    
    if empty_a_vi:
        print(f"⚠️  여전히 빈 베트남어 답변: {empty_a_vi}")
    
    return rows

def main():
    print("=" * 60)
    print("🎯 베트남어 테이블 수정")
    print("=" * 60)
    
    rows = fix_vietnamese_table()
    
    print("\n" + "=" * 60)
    print("🎉 수정 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main()
