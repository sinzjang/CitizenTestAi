#!/usr/bin/env python3
import json
import os

# Translation mappings for "Correct Answers"
translations = {
    'zh': '正确答案',
    'tl': 'Tamang Sagot',
    'vi': 'Câu Trả Lời Đúng',
    'hi': 'सही उत्तर',
    'fr': 'Bonnes Réponses',
    'ar': 'الإجابات الصحيحة'
}

def add_questions_section(file_path, language_code):
    """Add questions section with correctAnswers key to a language file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Add questions section if it doesn't exist
        if 'questions' not in data:
            data['questions'] = {
                'correctAnswers': translations.get(language_code, 'Correct Answers')
            }
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Added questions.correctAnswers to {language_code}.json")
        else:
            print(f"⚠️  questions section already exists in {language_code}.json")
            
    except Exception as e:
        print(f"❌ Error processing {language_code}.json: {e}")

def main():
    locales_dir = '/Users/seshin/Desktop/Personal/Private_Projects/CitizenTestAi/locales'
    
    print("Adding questions.correctAnswers translation key to language files...")
    
    for lang_code in translations.keys():
        file_path = os.path.join(locales_dir, f'{lang_code}.json')
        if os.path.exists(file_path):
            add_questions_section(file_path, lang_code)
        else:
            print(f"❌ File not found: {lang_code}.json")
    
    print("\n🎉 Translation key addition complete!")

if __name__ == "__main__":
    main()
