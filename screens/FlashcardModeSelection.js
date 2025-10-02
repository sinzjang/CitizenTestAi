import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { t, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';

const FlashcardModeSelection = ({ navigation }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // 언어 변경 리스너 등록
    const handleLanguageChange = (newLanguage) => {
      setCurrentLanguage(newLanguage);
    };
    
    addLanguageChangeListener(handleLanguageChange);
    
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  const flashcardOptions = [
    {
      id: 1,
      title: t('flashcardSelection.quizMode.title'),
      subtitle: t('flashcardSelection.quizMode.subtitle'),
      icon: 'help-circle-outline',
      color: '#2E86AB',
      subOptions: [
        {
          id: '1-1',
          title: t('flashcardSelection.quizMode.sequential'),
          subtitle: t('flashcardSelection.quizMode.sequentialSubtitle'),
          icon: 'list-outline',
          screen: 'FlashcardMode',
          params: { mode: 'sequential' }
        },
        {
          id: '1-2',
          title: t('flashcardSelection.quizMode.random'),
          subtitle: t('flashcardSelection.quizMode.randomSubtitle'),
          icon: 'shuffle-outline',
          screen: 'FlashcardMode',
          params: { mode: 'random' }
        }
      ]
    },
    {
      id: 2,
      title: t('flashcardSelection.subjectiveMode.title'),
      subtitle: t('flashcardSelection.subjectiveMode.subtitle'),
      icon: 'eye-off-outline',
      color: '#28a745',
      subOptions: [
        {
          id: '2-1',
          title: t('flashcardSelection.subjectiveMode.sequential'),
          subtitle: t('flashcardSelection.subjectiveMode.sequentialSubtitle'),
          icon: 'list-outline',
          screen: 'FlashcardSubjectiveMode',
          params: { mode: 'sequential' }
        },
        {
          id: '2-2',
          title: t('flashcardSelection.subjectiveMode.random'),
          subtitle: t('flashcardSelection.subjectiveMode.randomSubtitle'),
          icon: 'shuffle-outline',
          screen: 'FlashcardSubjectiveMode',
          params: { mode: 'random' }
        }
      ]
    }
  ];

  const handleOptionPress = (screen, params = {}) => {
    navigation.navigate(screen, params);
  };

  const renderSubOption = (subOption, parentColor) => (
    <TouchableOpacity
      key={subOption.id}
      style={[styles.subOptionCard, { borderLeftColor: parentColor }]}
      onPress={() => handleOptionPress(subOption.screen, subOption.params)}
    >
      <View style={styles.subOptionContent}>
        <View style={[styles.subOptionIcon, { backgroundColor: parentColor + '20' }]}>
          <Ionicons name={subOption.icon} size={24} color={parentColor} />
        </View>
        <View style={styles.subOptionText}>
          <Text style={styles.subOptionTitle}>{subOption.title}</Text>
          <Text style={styles.subOptionSubtitle}>{subOption.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const renderMainOption = (option) => (
    <View key={option.id} style={styles.mainOptionContainer}>
      {/* Main Option Header */}
      <View style={[styles.mainOptionHeader, { backgroundColor: option.color + '10' }]}>
        <View style={[styles.mainOptionIcon, { backgroundColor: option.color }]}>
          <Ionicons name={option.icon} size={28} color="#fff" />
        </View>
        <View style={styles.mainOptionText}>
          <Text style={styles.mainOptionTitle}>{option.title}</Text>
          <Text style={styles.mainOptionSubtitle}>{option.subtitle}</Text>
        </View>
      </View>

      {/* Sub Options */}
      <View style={styles.subOptionsContainer}>
        {option.subOptions.map(subOption => renderSubOption(subOption, option.color))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('flashcardSelection.title')}</Text>
        <View style={styles.headerRight}>
          <View style={styles.languageIndicator}>
            <Text style={styles.languageIndicatorText}>
              {t('languages.' + currentLanguage)}
            </Text>
            <Ionicons name="language" size={16} color="#2E86AB" />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          {t('flashcardSelection.description')}
        </Text>

        {flashcardOptions.map(option => renderMainOption(option))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  languageIndicatorText: {
    fontSize: 12,
    color: '#2E86AB',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  mainOptionContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  mainOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainOptionText: {
    flex: 1,
  },
  mainOptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mainOptionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  subOptionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  subOptionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  subOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subOptionText: {
    flex: 1,
  },
  subOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subOptionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default FlashcardModeSelection;
