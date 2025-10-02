import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n, { t, getCurrentLanguage, setLanguage, getSupportedLanguages } from '../utils/i18n';

const LanguageSelector = ({ onLanguageChange }) => {
  const [currentLang, setCurrentLang] = useState('ko');
  const [supportedLangs, setSupportedLangs] = useState([]);

  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
    setSupportedLangs(getSupportedLanguages());
  }, []);

  const handleLanguageChange = async (langCode) => {
    try {
      const success = await setLanguage(langCode);
      if (success) {
        setCurrentLang(langCode);
        
        // 앱 전체 리렌더링을 위한 콜백
        if (onLanguageChange) {
          onLanguageChange(langCode);
        }
        
        Alert.alert(
          t('common.success'),
          t('settings.languageChanged', { language: i18n.getLanguageName(langCode) })
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.languageChangeError'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.language')}</Text>
      
      {supportedLangs.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageOption,
            currentLang === lang.code && styles.selectedOption
          ]}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <Text style={[
            styles.languageText,
            currentLang === lang.code && styles.selectedText
          ]}>
            {lang.name}
          </Text>
          
          {currentLang === lang.code && (
            <Ionicons name="checkmark" size={20} color="#2E86AB" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2E86AB',
    borderWidth: 1,
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#2E86AB',
    fontWeight: 'bold',
  },
});

export default LanguageSelector;
