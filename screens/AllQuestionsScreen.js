import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInterstitialAd } from '../components/AdInterstitial';
import QuestionLoader from '../utils/questionLoader';
import LocationManager from '../utils/locationManager';
import { getCurrentLanguage, t, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';

const AllQuestionsScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [englishQuestions, setEnglishQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  // Interstitial 광고 훅
  const { showAd } = useInterstitialAd();

  useEffect(() => {
    loadQuestions();
    loadUserLocation();
    setCurrentLanguage(getCurrentLanguage());
    
    // 언어 변경 리스너 등록
    const handleLanguageChange = (newLanguage) => {
      console.log('AllQuestionsScreen - 언어 변경 감지:', newLanguage);
      setCurrentLanguage(newLanguage);
      // 언어가 변경되면 질문을 다시 로드
      loadQuestionsForLanguage(newLanguage);
    };
    
    addLanguageChangeListener(handleLanguageChange);
    
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  const loadUserLocation = async () => {
    try {
      const location = await LocationManager.getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const questionsData = await QuestionLoader.loadQuestions();
      setQuestions(questionsData || []);
      
      // Load English questions for bilingual display (if current language is not English)
      const currentLang = getCurrentLanguage();
      if (currentLang !== 'en') {
        const englishQuestionsData = await QuestionLoader.loadQuestionsForLanguage('en');
        setEnglishQuestions(englishQuestionsData || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load questions.');
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForLanguage = async (languageCode) => {
    try {
      setLoading(true);
      console.log('Loading questions for language:', languageCode);
      
      const questionsData = await QuestionLoader.loadQuestionsForLanguage(languageCode);
      setQuestions(questionsData || []);
      
      // Load English questions for bilingual display (if current language is not English)
      if (languageCode !== 'en') {
        const englishQuestionsData = await QuestionLoader.loadQuestionsForLanguage('en');
        setEnglishQuestions(englishQuestionsData || []);
      } else {
        setEnglishQuestions([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load questions for language: ' + languageCode);
      console.error('Error loading questions for language:', languageCode, error);
    } finally {
      setLoading(false);
    }
  };

  // 동적 답변 생성 함수
  const generateDynamicAnswer = (question, answer, isCorrect = true) => {
    if (!userLocation) {
      console.log('No user location found');
      return answer;
    }

    const { state } = userLocation;
    if (!state) {
      console.log('No state found in user location');
      return answer;
    }
    
    console.log(`Processing question ${question.id} for state: ${state}`);
    console.log('User location:', userLocation);

    // 상원의원 관련 질문 (ID: 20)
    if (question.id === 20 && isCorrect) {
      const senators = LocationManager.getStateSenators(state);
      console.log('Senators for state', state, ':', senators);
      if (senators && senators.length > 0) {
        const senatorName = senators[0]; // 첫 번째 상원의원 (문자열)
        console.log('Selected senator:', senatorName);
        if (senatorName) {
          return {
            ...answer,
            text: senatorName
          };
        }
      }
    }

    // 주지사 관련 질문 (ID: 43)
    if (question.id === 43 && isCorrect) {
      const governor = LocationManager.getStateGovernor(state);
      if (governor && governor !== 'Answers will vary') {
        return {
          ...answer,
          text: governor
        };
      }
    }

    // 주도 관련 질문 (ID: 44)
    if (question.id === 44 && isCorrect) {
      const capital = LocationManager.getStateCapital(state);
      if (capital && capital !== 'Answers will vary') {
        return {
          ...answer,
          text: capital
        };
      }
    }

    // 하원의원 관련 질문 (ID: 23)
    if (question.id === 23 && isCorrect) {
      const representative = userLocation.representative;
      if (representative && representative.name) {
        return {
          ...answer,
          text: representative.name_ko || representative.name
        };
      }
    }

    return answer;
  };

  // Find corresponding English question by ID
  const findEnglishQuestion = (questionId) => {
    return englishQuestions.find(q => q.id === questionId);
  };

  // Get bilingual text (original language + English in parentheses)
  const getBilingualText = (originalText, englishText) => {
    if (currentLanguage === 'en' || !englishText || originalText === englishText) {
      return originalText;
    }
    return `${originalText} (${englishText})`;
  };

  const renderQuestion = (question, index) => {
    const correctAnswers = question.correctAnswers || [];
    const wrongAnswers = question.wrongAnswers || [];
    const englishQuestion = findEnglishQuestion(question.id);
    
    return (
      <View key={question.id} style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Q.{question.id}</Text>
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => {/* TODO: Implement expand/collapse */}}
          >
            <Ionicons name="chevron-down" size={20} color="#2E86AB" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.questionContent}>
          <Text style={styles.questionText}>
            {getBilingualText(question.question, englishQuestion?.question)}
          </Text>
        </View>

        <View style={styles.answersSection}>
          <Text style={styles.answersTitle}>{t('questions.correctAnswers')}:</Text>
          {correctAnswers.map((answer, answerIndex) => {
            const dynamicAnswer = generateDynamicAnswer(question, answer, true);
            const englishAnswer = englishQuestion?.correctAnswers?.[answerIndex];
            const englishDynamicAnswer = englishQuestion ? generateDynamicAnswer(englishQuestion, englishAnswer, true) : null;
            
            return (
              <View key={answerIndex} style={styles.answerItem}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.answerText}>
                  {getBilingualText(dynamicAnswer.text, englishDynamicAnswer?.text)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('menu.learn.allQuestions')} ({questions.length})</Text>
        <View style={styles.headerRight}>
          <View style={styles.languageIndicator}>
            <Text style={styles.languageIndicatorText}>
              {currentLanguage === 'ko' ? '한국어' : 
               currentLanguage === 'en' ? 'English' :
               currentLanguage === 'es' ? 'Español' :
               currentLanguage === 'zh' ? '中文' :
               currentLanguage === 'tl' ? 'Filipino' :
               currentLanguage === 'vi' ? 'Tiếng Việt' :
               currentLanguage === 'hi' ? 'हिंदी' :
               currentLanguage === 'fr' ? 'Français' :
               currentLanguage === 'ar' ? 'العربية' : 'English'}
            </Text>
            <Ionicons name="language" size={16} color="#2E86AB" />
          </View>
        </View>
      </View>

      {/* Questions List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question, index) => renderQuestion(question, index))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E86AB',
  },
  languageIndicatorText: {
    fontSize: 12,
    color: '#2E86AB',
    fontWeight: '600',
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  expandButton: {
    padding: 4,
  },
  questionContent: {
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  questionTextEn: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  answersSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
});

export default AllQuestionsScreen;
