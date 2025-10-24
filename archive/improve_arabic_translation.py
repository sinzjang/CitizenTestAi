#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re

def improve_arabic_translation():
    """
    아랍어 번역의 품질을 개선합니다.
    """
    
    # 아랍어 파일 로드
    with open('data/interview_questions_ar.json', 'r', encoding='utf-8') as f:
        arabic_questions = json.load(f)
    
    # 개선된 아랍어 번역 매핑
    improved_translations = {
        # 질문 번역 개선
        "What is the supreme law of the land?": "ما هو القانون الأعلى في البلاد؟",
        "What does the Constitution do?": "ماذا يفعل الدستور؟",
        "The idea of self-government is in the first three words of the Constitution. What are these words?": "فكرة الحكم الذاتي موجودة في الكلمات الثلاث الأولى من الدستور. ما هي هذه الكلمات؟",
        "What is an amendment?": "ما هو التعديل؟",
        "What do we call the first ten amendments to the Constitution?": "ماذا نسمي التعديلات العشرة الأولى على الدستور؟",
        "What is one right or freedom from the First Amendment?": "ما هو حق أو حرية واحدة من التعديل الأول؟",
        "How many amendments does the Constitution have?": "كم عدد التعديلات التي يحتويها الدستور؟",
        "What did the Declaration of Independence do?": "ماذا فعل إعلان الاستقلال؟",
        "What are two rights in the Declaration of Independence?": "ما هما حقان في إعلان الاستقلال؟",
        "What is freedom of religion?": "ما هي حرية الدين؟",
        "What is the economic system in the United States?": "ما هو النظام الاقتصادي في الولايات المتحدة؟",
        "What is the 'rule of law'?": "ما هو 'سيادة القانون'؟",
        "Who wrote the Declaration of Independence?": "من كتب إعلان الاستقلال؟",
        "Name one branch or part of the government.": "اذكر فرعاً أو جزءاً واحداً من الحكومة.",
        "What stops one branch of government from becoming too powerful?": "ما الذي يمنع فرعاً واحداً من الحكومة من أن يصبح قوياً جداً؟",
        "Who is in charge of the executive branch?": "من المسؤول عن السلطة التنفيذية؟",
        "Who makes federal laws?": "من يضع القوانين الفيدرالية؟",
        "What are the two parts of the U.S. Congress?": "ما هما الجزءان من الكونغرس الأمريكي؟",
        "How many U.S. Senators are there?": "كم عدد أعضاء مجلس الشيوخ الأمريكي؟",
        "We elect a U.S. Senator for how many years?": "ننتخب عضو مجلس الشيوخ الأمريكي لكم سنة؟",
        "Who is one of your state's U.S. Senators now?": "من هو أحد أعضاء مجلس الشيوخ الأمريكي لولايتك الآن؟",
        "The House of Representatives has how many voting members?": "كم عدد الأعضاء المصوتين في مجلس النواب؟",
        "We elect a U.S. Representative for how many years?": "ننتخب نائباً أمريكياً لكم سنة؟",
        "Name your U.S. Representative.": "اذكر نائبك الأمريكي.",
        "Who does a U.S. Senator represent?": "من يمثل عضو مجلس الشيوخ الأمريكي؟",
        "Why do some states have more Representatives than other states?": "لماذا تملك بعض الولايات نواباً أكثر من الولايات الأخرى؟",
        "We elect a President for how many years?": "ننتخب رئيساً لكم سنة؟",
        "In what month do we vote for President?": "في أي شهر نصوت للرئيس؟",
        "What is the name of the President of the United States now?": "ما اسم رئيس الولايات المتحدة الآن؟",
        "What is the name of the Vice President of the United States now?": "ما اسم نائب رئيس الولايات المتحدة الآن؟",
        "If the President can no longer serve, who becomes President?": "إذا لم يعد الرئيس قادراً على الخدمة، من يصبح رئيساً؟",
        "If both the President and the Vice President can no longer serve, who becomes President?": "إذا لم يعد كل من الرئيس ونائب الرئيس قادرين على الخدمة، من يصبح رئيساً؟",
        "Who is the Commander in Chief of the military?": "من هو القائد الأعلى للجيش؟",
        "Who signs bills to become laws?": "من يوقع مشاريع القوانين لتصبح قوانين؟",
        "Who vetoes bills?": "من يستخدم حق النقض ضد مشاريع القوانين؟",
        "What does the President's Cabinet do?": "ماذا تفعل حكومة الرئيس؟",
        "What are two Cabinet-level positions?": "ما هما منصبان على مستوى الحكومة؟",
        "What does the judicial branch do?": "ماذا تفعل السلطة القضائية؟",
        "What is the highest court in the United States?": "ما هي أعلى محكمة في الولايات المتحدة؟",
        "How many justices are on the Supreme Court?": "كم عدد القضاة في المحكمة العليا؟",
        "Who is the Chief Justice of the United States now?": "من هو رئيس القضاة في الولايات المتحدة الآن؟",
        
        # 답변 번역 개선
        "the Constitution": "الدستور",
        "sets up the government": "ينشئ الحكومة",
        "defines the government": "يحدد الحكومة",
        "protects basic rights of Americans": "يحمي الحقوق الأساسية للأمريكيين",
        "We the People": "نحن الشعب",
        "a change to the Constitution": "تغيير في الدستور",
        "an addition to the Constitution": "إضافة إلى الدستور",
        "the Bill of Rights": "وثيقة الحقوق",
        "speech": "الكلام",
        "religion": "الدين",
        "assembly": "التجمع",
        "press": "الصحافة",
        "petition the government": "تقديم عريضة للحكومة",
        "Twenty-seven (27)": "سبعة وعشرون (27)",
        "announced our independence": "أعلن استقلالنا",
        "declared our independence": "أعلن استقلالنا",
        "said that the United States is free": "قال أن الولايات المتحدة حرة",
        "life": "الحياة",
        "liberty": "الحرية",
        "pursuit of happiness": "السعي وراء السعادة",
        "You can practice any religion, or not practice a religion": "يمكنك ممارسة أي دين، أو عدم ممارسة دين",
        "capitalist economy": "اقتصاد رأسمالي",
        "market economy": "اقتصاد السوق",
        "Everyone must follow the law": "يجب على الجميع اتباع القانون",
        "Leaders must obey the law": "يجب على القادة طاعة القانون",
        "Government must obey the law": "يجب على الحكومة طاعة القانون",
        "No one is above the law": "لا أحد فوق القانون",
        "Thomas Jefferson": "توماس جيفرسون",
        "Congress (legislative)": "الكونغرس (التشريعي)",
        "President (executive)": "الرئيس (التنفيذي)",
        "the courts (judicial)": "المحاكم (القضائي)",
        "checks and balances": "الضوابط والتوازنات",
        "separation of powers": "فصل السلطات",
        "the President": "الرئيس",
        "Congress": "الكونغرس",
        "the Senate and House (of Representatives)": "مجلس الشيوخ ومجلس النواب",
        "One hundred (100)": "مائة (100)",
        "Six (6)": "ستة (6)",
        "Answers will vary": "ستختلف الإجابات",
        "Four hundred thirty-five (435)": "أربعمائة وخمسة وثلاثون (435)",
        "Two (2)": "اثنان (2)",
        "all people of the state": "جميع سكان الولاية",
        "(because of) the state's population": "(بسبب) سكان الولاية",
        "Four (4)": "أربعة (4)",
        "November": "نوفمبر",
        "Donald J. Trump": "دونالد جي. ترامب",
        "JD Vance": "جي دي فانس",
        "the Vice President": "نائب الرئيس",
        "the Speaker of the House": "رئيس مجلس النواب",
        "the Commander in Chief": "القائد الأعلى",
        "advises the President": "ينصح الرئيس",
        "the Supreme Court": "المحكمة العليا",
        "Nine (9)": "تسعة (9)",
        "John Roberts": "جون روبرتس",
        "to print money": "طباعة النقود",
        "to declare war": "إعلان الحرب",
        "to create an army": "إنشاء جيش",
        "to make treaties": "عقد معاهدات",
        "provide schooling and education": "توفير التعليم والتربية",
        "provide protection (police)": "توفير الحماية (الشرطة)",
        "provide safety (fire departments)": "توفير الأمان (إدارات الإطفاء)",
        "give a driver's license": "إعطاء رخصة قيادة",
        "approve zoning and land use": "الموافقة على تقسيم المناطق واستخدام الأراضي",
        "Democratic Party": "الحزب الديمقراطي",
        "Republican Party": "الحزب الجمهوري",
        "Mike Johnson": "مايك جونسون"
    }
    
    # 설명 번역 개선을 위한 패턴
    rationale_patterns = {
        "Correct": "صحيح",
        "is the foundational, supreme law": "هو القانون الأساسي الأعلى",
        "is a crucial document": "وثيقة مهمة",
        "but it is not a law": "لكنه ليس قانوناً",
        "is a part of the Constitution": "جزء من الدستور",
        "but not the entire supreme law": "لكن ليس القانون الأعلى بأكمله",
        "were a series of essays": "كانت سلسلة من المقالات",
        "to persuade people to ratify": "لإقناع الناس بالتصديق",
        "One of the main functions": "إحدى الوظائف الرئيسية",
        "is to establish and define": "هو إنشاء وتحديد",
        "specifies the powers and responsibilities": "يحدد السلطات والمسؤوليات",
        "Several amendments": "عدة تعديلات",
        "protect the basic rights": "تحمي الحقوق الأساسية",
        "outlines the process": "يحدد العملية",
        "but it does not elect": "لكنه لا ينتخب",
        "are made by Congress": "يتم إنشاؤها من قبل الكونغرس",
        "not directly by": "ليس مباشرة من قبل",
        "is a power granted": "سلطة ممنوحة",
        "not an action of": "ليس عمل",
        "The answer to this question depends on your state/district": "إجابة هذا السؤال تعتمد على ولايتك/منطقتك",
        "You should check official websites": "يجب أن تتحقق من المواقع الرسمية"
    }
    
    # 모든 질문에 대해 개선된 번역 적용
    for question in arabic_questions:
        # 질문 텍스트 개선
        if question['question_en'] in improved_translations:
            question['question_ar'] = improved_translations[question['question_en']]
        
        # 정답 개선
        for correct in question['correctAnswers']:
            if correct['text_en'] in improved_translations:
                correct['text_ar'] = improved_translations[correct['text_en']]
            
            # 설명 개선
            rationale = correct['rationale_ar']
            for eng_pattern, ar_pattern in rationale_patterns.items():
                rationale = rationale.replace(eng_pattern, ar_pattern)
            correct['rationale_ar'] = rationale
        
        # 오답 개선
        for wrong in question['wrongAnswers']:
            if wrong['text_en'] in improved_translations:
                wrong['text_ar'] = improved_translations[wrong['text_en']]
            
            # 설명 개선
            rationale = wrong['rationale_ar']
            for eng_pattern, ar_pattern in rationale_patterns.items():
                rationale = rationale.replace(eng_pattern, ar_pattern)
            wrong['rationale_ar'] = rationale
    
    # 개선된 파일 저장
    with open('data/interview_questions_ar.json', 'w', encoding='utf-8') as f:
        json.dump(arabic_questions, f, ensure_ascii=False, indent=4)
    
    print("تم تحسين جودة الترجمة العربية!")
    return len(arabic_questions)

if __name__ == "__main__":
    improve_arabic_translation()
