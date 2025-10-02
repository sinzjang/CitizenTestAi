import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import i18n, { t, getCurrentLanguage, setLanguage, getSupportedLanguages } from '../utils/i18n';

const { width, height } = Dimensions.get('window');

const LanguageSelectionModal = ({ visible, onLanguageSelected }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [supportedLanguages, setSupportedLanguages] = useState([]);

  useEffect(() => {
    initializeLanguages();
  }, []);

  const initializeLanguages = async () => {
    try {
      const current = getCurrentLanguage();
      const supported = getSupportedLanguages();
      
      setSelectedLanguage(current);
      setSupportedLanguages(supported);
    } catch (error) {
      console.error('언어 초기화 오류:', error);
      // 기본값 설정
      // 미국 시민권 인터뷰 빈도순으로 정렬
      const languages = [
        { code: 'en', name: 'English', flag: 'EN' },
        { code: 'es', name: 'Español', flag: 'ES' },
        { code: 'zh', name: '中文(简体)', flag: 'ZH' },
        { code: 'ko', name: '한국어', flag: 'KO' },
        { code: 'tl', name: 'Filipino', flag: 'TL' },
        { code: 'vi', name: 'Tiếng Việt', flag: 'VI' },
        { code: 'hi', name: 'हिन्दी', flag: 'HI' },
        { code: 'fr', name: 'Français', flag: 'FR' },
        { code: 'ar', name: 'العربية', flag: 'AR' }
      ];
      setSupportedLanguages(languages);
    }
  };

  const handleLanguageSelect = async (languageCode) => {
    try {
      setSelectedLanguage(languageCode);
      const success = await setLanguage(languageCode);
      
      if (success) {
        console.log('언어 변경 성공:', languageCode);
        // 약간의 지연 후 콜백 호출 (사용자가 선택을 확인할 수 있도록)
        setTimeout(() => {
          onLanguageSelected(languageCode);
        }, 300);
      }
    } catch (error) {
      console.error('언어 변경 오류:', error);
    }
  };

  const getWelcomeMessage = () => {
    return {
      title: t('language.selectLanguage'),
      subtitle: t('language.selectLanguageDescription'),
      description: t('language.canChangeInSettings')
    };
  };

  const messages = getWelcomeMessage();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Ionicons name="language" size={32} color={theme.colors.primary} />
            <Text style={styles.title}>{messages.title}</Text>
            <Text style={styles.subtitle}>{messages.subtitle}</Text>
          </View>

          {/* 언어 선택 옵션들 (스크롤 가능) */}
          <ScrollView style={styles.languageScroll} contentContainerStyle={styles.languageScrollContent} showsVerticalScrollIndicator={true}>
            <View style={styles.languageContainer}>
              {supportedLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === language.code && styles.selectedOption
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageContent}>
                    <Text style={[
                      styles.languageName,
                      selectedLanguage === language.code && styles.selectedText
                    ]}>
                      {language.name}
                    </Text>
                  </View>
                  {selectedLanguage === language.code && (
                    <View style={styles.checkContainer}>
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* 설명 텍스트 */}
          <Text style={styles.description}>{messages.description}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxHeight: height * 0.75,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  languageScroll: {
    width: '100%',
    maxHeight: height * 0.4,
    marginBottom: 20,
  },
  languageScrollContent: {
    paddingBottom: 4,
  },
  languageContainer: {
    width: '100%',
    marginBottom: 0,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: theme.colors.primary,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  languageCode: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: theme.colors.primary,
  },
  selectedSubText: {
    color: theme.colors.primary,
    opacity: 0.8,
  },
  checkContainer: {
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
});

export default LanguageSelectionModal;
