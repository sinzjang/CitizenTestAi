#!/usr/bin/env python3
import json

def find_multiple_answer_questions(file_path):
    """Find all questions with multiple correct answers"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    multiple_answer_questions = []
    
    for question in data:
        if 'correctAnswers' in question and len(question['correctAnswers']) > 1:
            multiple_answer_questions.append({
                'id': question['id'],
                'question': question['question'],
                'correct_count': len(question['correctAnswers']),
                'correct_answers': [answer['text'] for answer in question['correctAnswers']]
            })
    
    return multiple_answer_questions

if __name__ == "__main__":
    file_path = "/Users/seshin/Desktop/Personal/Private_Projects/CitizenTestAi/data/interview_questions_en.json"
    
    multiple_questions = find_multiple_answer_questions(file_path)
    
    print(f"Found {len(multiple_questions)} questions with multiple correct answers:\n")
    
    for q in multiple_questions:
        print(f"Question {q['id']}: {q['question']}")
        print(f"  Number of correct answers: {q['correct_count']}")
        print(f"  Correct answers: {q['correct_answers']}")
        print()
