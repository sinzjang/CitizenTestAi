#!/usr/bin/env python3
import json
import csv
import os

def convert_json_to_csv():
    # JSON 파일 경로
    json_file_path = '/Users/seshin/Desktop/Personal/Private_Projects/CitizenTestAi/data/interview_questions_en.json'
    csv_file_path = '/Users/seshin/Desktop/Personal/Private_Projects/CitizenTestAi/interview_questions_en.csv'
    
    try:
        # JSON 파일 읽기
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
        
        # CSV 파일 생성
        with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
            writer = csv.writer(csv_file)
            
            # CSV 헤더 작성
            headers = ['ID', 'DataName', 'Value']
            writer.writerow(headers)
            
            # 각 질문에 대해 CSV 행 생성
            for item in data:
                question_id = item.get('id', '')
                
                # 질문 추가
                writer.writerow([question_id, 'Question', item.get('question', '')])
                
                # 정답들 추가
                correct_answers = item.get('correctAnswers', [])
                for i, answer in enumerate(correct_answers, 1):
                    writer.writerow([question_id, f'Correct_Answer_{i}', answer.get('text', '')])
                    writer.writerow([question_id, f'Correct_Rationale_{i}', answer.get('rationale', '')])
                
                # 오답들 추가
                wrong_answers = item.get('wrongAnswers', [])
                for i, answer in enumerate(wrong_answers, 1):
                    writer.writerow([question_id, f'Wrong_Answer_{i}', answer.get('text', '')])
                    writer.writerow([question_id, f'Wrong_Rationale_{i}', answer.get('rationale', '')])
        
        print(f"✅ CSV 파일이 성공적으로 생성되었습니다: {csv_file_path}")
        print(f"📊 총 {len(data)}개의 질문이 변환되었습니다.")
        
        # 파일 크기 확인
        file_size = os.path.getsize(csv_file_path)
        print(f"📁 파일 크기: {file_size:,} bytes")
        
        # 총 행 수 계산
        total_rows = 0
        for item in data:
            total_rows += 1  # Question
            total_rows += len(item.get('correctAnswers', [])) * 2  # Answer + Rationale
            total_rows += len(item.get('wrongAnswers', [])) * 2   # Answer + Rationale
        
        print(f"📋 총 데이터 행 수: {total_rows}개 (헤더 제외)")
        
    except FileNotFoundError:
        print(f"❌ JSON 파일을 찾을 수 없습니다: {json_file_path}")
    except json.JSONDecodeError:
        print("❌ JSON 파일 형식이 올바르지 않습니다.")
    except Exception as e:
        print(f"❌ 변환 중 오류가 발생했습니다: {str(e)}")

if __name__ == "__main__":
    convert_json_to_csv()
