#!/usr/bin/env python3
"""
새로운 번역 키를 모든 언어 파일에 추가하는 스크립트
"""

import json
import os

# 새로운 번역 키들
new_keys = {
    "en": {
        "userSetAnswer": "This is the answer you have set in your location settings.",
        "locationSettingRequired": "Some questions have different answers based on your location. Please set your state in Resources & Settings.",
        "additionalInfoRequired": "For more accurate answers, please set up {missingInfo} information in Resources & Settings."
    },
    "ko": {
        "userSetAnswer": "사용자가 설정한 답입니다.",
        "locationSettingRequired": "일부 문제는 거주 지역에 따라 답이 다릅니다. Resources & Settings에서 거주 주를 설정해주세요.",
        "additionalInfoRequired": "더 정확한 답변을 위해 Resources & Settings에서 {missingInfo} 정보를 설정해주세요."
    },
    "es": {
        "userSetAnswer": "Esta es la respuesta que ha configurado en su configuración de ubicación.",
        "locationSettingRequired": "Algunas preguntas tienen diferentes respuestas según su ubicación. Por favor configure su estado en Recursos y Configuración.",
        "additionalInfoRequired": "Para respuestas más precisas, por favor configure la información de {missingInfo} en Recursos y Configuración."
    },
    "zh": {
        "userSetAnswer": "这是您在位置设置中设置的答案。",
        "locationSettingRequired": "某些问题根据您的位置有不同的答案。请在资源和设置中设置您的州。",
        "additionalInfoRequired": "为了获得更准确的答案，请在资源和设置中设置{missingInfo}信息。"
    },
    "tl": {
        "userSetAnswer": "Ito ang sagot na inyong itinakda sa inyong location settings.",
        "locationSettingRequired": "Ang ilang tanong ay may iba't ibang sagot depende sa inyong lokasyon. Pakiset ang inyong estado sa Resources & Settings.",
        "additionalInfoRequired": "Para sa mas tumpak na mga sagot, pakiset ang {missingInfo} na impormasyon sa Resources & Settings."
    },
    "vi": {
        "userSetAnswer": "Đây là câu trả lời bạn đã thiết lập trong cài đặt vị trí của mình.",
        "locationSettingRequired": "Một số câu hỏi có câu trả lời khác nhau dựa trên vị trí của bạn. Vui lòng thiết lập bang của bạn trong Tài nguyên & Cài đặt.",
        "additionalInfoRequired": "Để có câu trả lời chính xác hơn, vui lòng thiết lập thông tin {missingInfo} trong Tài nguyên & Cài đặt."
    },
    "hi": {
        "userSetAnswer": "यह वह उत्तर है जो आपने अपनी स्थान सेटिंग्स में सेट किया है।",
        "locationSettingRequired": "कुछ प्रश्नों के उत्तर आपके स्थान के आधार पर अलग होते हैं। कृपया संसाधन और सेटिंग्स में अपना राज्य सेट करें।",
        "additionalInfoRequired": "अधिक सटीक उत्तरों के लिए, कृपया संसाधन और सेटिंग्स में {missingInfo} जानकारी सेट करें।"
    },
    "fr": {
        "userSetAnswer": "C'est la réponse que vous avez définie dans vos paramètres de localisation.",
        "locationSettingRequired": "Certaines questions ont des réponses différentes selon votre emplacement. Veuillez définir votre état dans Ressources et Paramètres.",
        "additionalInfoRequired": "Pour des réponses plus précises, veuillez configurer les informations {missingInfo} dans Ressources et Paramètres."
    },
    "ar": {
        "userSetAnswer": "هذه هي الإجابة التي قمت بتعيينها في إعدادات الموقع الخاص بك.",
        "locationSettingRequired": "بعض الأسئلة لها إجابات مختلفة حسب موقعك. يرجى تعيين ولايتك في الموارد والإعدادات.",
        "additionalInfoRequired": "للحصول على إجابات أكثر دقة، يرجى إعداد معلومات {missingInfo} في الموارد والإعدادات."
    }
}

def add_keys_to_file(language_code, file_path):
    """특정 언어 파일에 새로운 키 추가"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # interview 섹션이 있는지 확인
        if 'interview' in data:
            # 새로운 키들 추가
            for key, value in new_keys[language_code].items():
                if key not in data['interview']:
                    data['interview'][key] = value
                    print(f"Added '{key}' to {language_code}.json")
                else:
                    print(f"Key '{key}' already exists in {language_code}.json")
        else:
            print(f"No 'interview' section found in {language_code}.json")
            return False
        
        # 파일 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return True
        
    except Exception as e:
        print(f"Error processing {language_code}.json: {e}")
        return False

def main():
    """메인 함수"""
    locales_dir = "locales"
    
    # 각 언어 파일 처리
    for language_code in new_keys.keys():
        file_path = os.path.join(locales_dir, f"{language_code}.json")
        
        if os.path.exists(file_path):
            print(f"\nProcessing {language_code}.json...")
            success = add_keys_to_file(language_code, file_path)
            if success:
                print(f"✅ Successfully updated {language_code}.json")
            else:
                print(f"❌ Failed to update {language_code}.json")
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print("\n🎉 Translation key addition completed!")

if __name__ == "__main__":
    main()
