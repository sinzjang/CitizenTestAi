#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
힌디어 테이블 수정 - 누락된 질문 추가
"""

import csv
from pathlib import Path

def fix_hindi_table():
    """누락된 질문들을 수동으로 수정"""
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    # 파일 읽기
    table_file = data_dir / 'script_work' / '2025_CitizenTest_128 - Hindi_Table.csv'
    english_file = data_dir / 'Completed' / 'Complete_128_Questions - English.csv'
    
    print(f"📖 힌디어 테이블 읽기...")
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
        97: {
            'Question_HI': 'कौन सा संशोधन कहता है कि संयुक्त राज्य अमेरिका में पैदा हुए या प्राकृतिक सभी व्यक्ति, और इसके अधिकार क्षेत्र के अधीन, अमेरिकी नागरिक हैं?',
            'Answers_EN': '14th Amendment',
            'Answers_HI': '14वां संशोधन'
        },
        101: {
            'Question_HI': 'अमेरिका नेप्रथम विश्व युद्ध मेंभाग क्यों लिया था?',
            'Answers_HI': 'क्योंकि जर्मनी ने अमेरिकी (नागरिक) जहाजों पर हमला किया था, मित्र राष्ट्रों (इंग्लैंड, फ्रांस, इटली और रूस) का समर्थन करने के लिए, केंद्रीय शक्तियों (जर्मनी, ऑस्ट्रिया-हंगरी, ओटोमन साम्राज्य और बुल्गारिया) का विरोध करने के लिए'
        },
        117: {
            'Question_HI': 'संयुक्त राज्य अमेरिका मेंएक अमेरिकी भारतीय जनजाति का नाम.',
            'Answers_HI': 'Apache, Blackfeet, Cayuga, Cherokee, Cheyenne, Chippewa, Choctaw, Creek, Crow, Hopi, Huron, Inupiat, Lakota, Mohawk, Mohegan, Navajo, Oneida, Onondaga, Pueblo, Seminole, Seneca, Shawnee, Sioux, Teton, Tuscarora'
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
            print(f"  🔧 문제 {index}: 힌디어 질문/답변 수정")
            for key, value in manual_fixes[index].items():
                row[key] = value
    
    # 저장
    output_file = data_dir / 'script_work' / '2025_CitizenTest_128 - Hindi_Table_Fixed.csv'
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category_EN', 'SubCategory_EN', 'Category_HI', 'SubCategory_HI',
                      'Question_EN', 'Answers_EN', 'Question_HI', 'Answers_HI']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✅ 수정 완료: {output_file.name}")
    
    # 검증
    empty_q_hi = [r['Index'] for r in rows if not r['Question_HI'].strip()]
    empty_a_hi = [r['Index'] for r in rows if not r['Answers_HI'].strip()]
    empty_q_en = [r['Index'] for r in rows if not r['Question_EN'].strip()]
    empty_a_en = [r['Index'] for r in rows if not r['Answers_EN'].strip()]
    
    if empty_q_hi:
        print(f"⚠️  여전히 빈 힌디어 질문: {empty_q_hi}")
    else:
        print(f"✅ 모든 문제에 힌디어 질문이 있습니다!")
    
    if empty_a_hi:
        print(f"⚠️  여전히 빈 힌디어 답변: {empty_a_hi}")
    else:
        print(f"✅ 모든 문제에 힌디어 답변이 있습니다!")
    
    if not empty_q_en and not empty_a_en and not empty_q_hi and not empty_a_hi:
        print(f"\n✅✅✅ 완벽합니다! 모든 128개 문제에 질문과 답변이 있습니다! ✅✅✅")
    
    return rows

def main():
    print("=" * 60)
    print("🎯 힌디어 테이블 수정")
    print("=" * 60)
    
    rows = fix_hindi_table()
    
    print("\n" + "=" * 60)
    print("🎉 수정 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main()
