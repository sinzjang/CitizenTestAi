import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QuestionLoader from '../utils/questionLoader';
import LocationManager from '../utils/locationManager';
import { t, getCurrentLanguage } from '../utils/i18n';

const StoryMode = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [englishQuestions, setEnglishQuestions] = useState([]);
  const [storyData, setStoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  // When true, show content in current app language; when false, show English fallback
  const [showPrimary, setShowPrimary] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  // 각 챕터의 관련 문제 섹션 토글 상태
  const [expandedChapters, setExpandedChapters] = useState({});

  // Chapter colors and icons for visual appeal
  const chapterStyles = [
    { icon: "flag-outline", color: "#FF6B6B" },
    { icon: "business-outline", color: "#4ECDC4" },
    { icon: "people-outline", color: "#45B7D1" },
    { icon: "time-outline", color: "#96CEB4" },
    { icon: "star-outline", color: "#FECA57" }
  ];

  useEffect(() => {
    loadQuestions();
    loadUserLocation();
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
      // 현재 언어의 질문 데이터 로드
      const questionsData = await QuestionLoader.loadQuestions();
      // 영문 질문 데이터 별도 로드
      const englishQuestionsData = await QuestionLoader.loadQuestionsForLanguage('en');
      const storyData = require('../data/question_story.json');
      
      setQuestions(questionsData || []);
      setEnglishQuestions(englishQuestionsData || []);
      setStoryData(storyData.civicsStory || []);
    } catch (error) {
      Alert.alert(t('story.loadErrorTitle'), t('story.loadErrorMessage'));
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 스토리 텍스트에서 사용자 정보로 교체하는 함수
  const replaceUserInfo = (text) => {
    if (!userLocation || !text || typeof text !== 'string') return text;

    let replacedText = text;

    // 상원의원 교체
    if (userLocation.senators && userLocation.senators.length > 0) {
      // 두 명의 상원의원이 있는 경우
      if (userLocation.senators.length >= 2) {
        replacedText = replacedText.replace(/\[Senator1\]/g, userLocation.senators[0]);
        replacedText = replacedText.replace(/\[Senator2\]/g, userLocation.senators[1]);
        replacedText = replacedText.replace(/\[Senators\]/g, `${userLocation.senators[0]}과 ${userLocation.senators[1]}`);
      } else {
        replacedText = replacedText.replace(/\[Senator1\]/g, userLocation.senators[0]);
        replacedText = replacedText.replace(/\[Senator2\]/g, userLocation.senators[0]);
        replacedText = replacedText.replace(/\[Senators\]/g, userLocation.senators[0]);
      }
    }

    // 하원의원 교체
    if (userLocation.representatives && userLocation.representatives.length > 0) {
      const representative = userLocation.representatives[0];
      replacedText = replacedText.replace(/\[Representative\]/g, representative.name);
    }

    // 주지사 교체
    if (userLocation.governor) {
      replacedText = replacedText.replace(/\[Governor\]/g, userLocation.governor);
    }

    // 주 이름 교체
    if (userLocation.state) {
      replacedText = replacedText.replace(/\[State\]/g, userLocation.state);
    }

    return replacedText;
  };

  // 영문 질문 찾기
  const getEnglishQuestion = (questionId) => {
    return englishQuestions.find(q => q.id === questionId);
  };

  // 현재 언어에 따른 질문 텍스트 가져오기
  const getQuestionText = (question) => {
    const currentLang = getCurrentLanguage();
    if (currentLang === 'en') {
      return question.question;
    }
    return question.question; // 현재 언어의 질문
  };

  // 영문 질문 텍스트 가져오기
  const getEnglishQuestionText = (question) => {
    const englishQuestion = getEnglishQuestion(question.id);
    return englishQuestion ? englishQuestion.question : question.question;
  };

  // 현재 언어에 따른 답변 텍스트 가져오기
  const getAnswerText = (answer) => {
    return answer.text; // 현재 언어의 답변
  };

  // 영문 답변 텍스트 가져오기
  const getEnglishAnswerText = (answer, questionId) => {
    const englishQuestion = getEnglishQuestion(questionId);
    if (englishQuestion && englishQuestion.correctAnswers) {
      const englishAnswer = englishQuestion.correctAnswers.find(a => a.id === answer.id);
      return englishAnswer ? englishAnswer.text : answer.text;
    }
    return answer.text;
  };

  // 현재 언어에 따른 해설 텍스트 가져오기
  const getRationaleText = (answer) => {
    return answer.rationale; // 현재 언어의 해설
  };

  // 영문 해설 텍스트 가져오기
  const getEnglishRationaleText = (answer, questionId) => {
    const englishQuestion = getEnglishQuestion(questionId);
    if (englishQuestion && englishQuestion.correctAnswers) {
      const englishAnswer = englishQuestion.correctAnswers.find(a => a.id === answer.id);
      return englishAnswer && englishAnswer.rationale ? englishAnswer.rationale : answer.rationale;
    }
    return answer.rationale;
  };

  const getChapterQuestions = (chapter) => {
    if (!chapter.sections) return [];
    const allQuestionIds = [];
    chapter.sections.forEach(section => {
      if (section.linkedQuestions) {
        allQuestionIds.push(...section.linkedQuestions);
      }
    });
    return questions.filter(q => allQuestionIds.includes(q.id));
  };

  // (Q.1), (Q.2) 등을 동그라미 안에 숫자로 변환하는 함수
  const parseTextWithQuestionNumbers = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    const parts = [];
    const regex = /\(Q\.(\d+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // 매치 이전의 텍스트
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      // 질문 번호
      parts.push({
        type: 'question',
        number: match[1]
      });
      
      lastIndex = regex.lastIndex;
    }
    
    // 남은 텍스트
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    return parts;
  };

  // 질문 번호로 질문 찾기
  const findQuestionById = (questionId) => {
    return questions.find(q => q.id === parseInt(questionId));
  };

  // 질문 번호 배지 클릭 핸들러
  const handleQuestionBadgePress = (questionNumber) => {
    const question = findQuestionById(questionNumber);
    if (question) {
      openQuestionModal(question);
    }
  };

  // 챕터의 관련 문제 섹션 토글
  const toggleChapterQuestions = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const renderStoryContent = (contentArray) => {
    return contentArray.map((segment, segmentIndex) => {
      if (segment.type === 'answer') {
        const parts = parseTextWithQuestionNumbers(segment.text);
        if (Array.isArray(parts)) {
          return (
            <Text key={segmentIndex} style={styles.answerText}>
              {parts.map((part, partIndex) => {
                if (part.type === 'question') {
                  return (
                    <TouchableOpacity
                      key={partIndex}
                      onPress={() => handleQuestionBadgePress(part.number)}
                      style={styles.inlineQuestionBadgeWrapper}
                    >
                      <View style={styles.inlineQuestionBadge}>
                        <Text style={styles.inlineQuestionNumber}>{part.number}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }
                return <Text key={partIndex}>{part.content}</Text>;
              })}
            </Text>
          );
        }
        return (
          <Text key={segmentIndex} style={styles.answerText}>
            {segment.text}
          </Text>
        );
      }
      
      const parts = parseTextWithQuestionNumbers(segment.text);
      if (Array.isArray(parts)) {
        return (
          <Text key={segmentIndex} style={styles.normalText}>
            {parts.map((part, partIndex) => {
              if (part.type === 'question') {
                return (
                  <TouchableOpacity
                    key={partIndex}
                    onPress={() => handleQuestionBadgePress(part.number)}
                    style={styles.inlineQuestionBadgeWrapper}
                  >
                    <View style={styles.inlineQuestionBadge}>
                      <Text style={styles.inlineQuestionNumber}>{part.number}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }
              return <Text key={partIndex}>{part.content}</Text>;
            })}
          </Text>
        );
      }
      
      return (
        <Text key={segmentIndex} style={styles.normalText}>
          {segment.text}
        </Text>
      );
    });
  };

  const openQuestionModal = (question) => {
    setSelectedQuestion(question);
    setModalVisible(true);
  };

  const renderChapter = (chapter, index) => {
    const chapterQuestions = getChapterQuestions(chapter);
    const chapterStyle = chapterStyles[index] || chapterStyles[0];
    const translations = chapter.translations || {};
    const appLang = getCurrentLanguage() || 'en';
    const langForChapter = showPrimary ? appLang : 'en';
    const title = translations[langForChapter]?.title || translations['en']?.title || t('story.chapter', { number: index + 1 });
    const introduction = translations[langForChapter]?.introduction || translations['en']?.introduction || '';
    
    return (
      <View key={chapter.chapterId} style={styles.chapterCard}>
        <View style={[styles.chapterHeader, { backgroundColor: chapterStyle.color }]}>
          <Ionicons name={chapterStyle.icon} size={32} color="#fff" />
          <View style={styles.chapterTitleContainer}>
            <Text style={styles.chapterTitle}>{title}</Text>
            <Text style={styles.chapterSubtitle}>{introduction}</Text>
          </View>
          <Text style={styles.chapterNumber}>{index + 1}</Text>
        </View>
        
        <View style={styles.chapterContent}>
          {chapter.sections && chapter.sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.sectionContainer}>
              {(section[`sectionTitle_${showPrimary ? (getCurrentLanguage() || 'en') : 'en'}`] || section.sectionTitle_en) && (
                <Text style={styles.sectionTitle}>
                  {section[`sectionTitle_${showPrimary ? (getCurrentLanguage() || 'en') : 'en'}`] || section.sectionTitle_en}
                </Text>
              )}
              <Text style={styles.storyText}>
                {renderStoryContent(
                  replaceUserInfo(
                    section[`content_${showPrimary ? (getCurrentLanguage() || 'en') : 'en'}`] || section.content_en || []
                  )
                )}
              </Text>
            </View>
          ))}
          
          <View style={styles.questionsSection}>
            <TouchableOpacity 
              style={styles.questionsSectionHeader}
              onPress={() => toggleChapterQuestions(chapter.chapterId)}
              activeOpacity={0.7}
            >
              <Text style={styles.questionsSectionTitle}>
                {t('story.relatedQuestions', { count: chapterQuestions.length })}
              </Text>
              <Ionicons 
                name={expandedChapters[chapter.chapterId] ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#2E86AB" 
              />
            </TouchableOpacity>
            
            {expandedChapters[chapter.chapterId] && (
              <View style={styles.questionsListContainer}>
                {chapterQuestions.map((question, qIndex) => (
                  <TouchableOpacity
                    key={question.id}
                    style={styles.questionItem}
                    onPress={() => openQuestionModal(question)}
                  >
                    <View style={styles.questionItemNumber}>
                      <Text style={styles.questionItemNumberText}>{question.id}</Text>
                    </View>
                    <Text style={styles.questionItemText} numberOfLines={2}>
                      {getQuestionText(question)}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderQuestionModal = () => {
    if (!selectedQuestion) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('story.modal.title')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalQuestion}>
                <Text style={styles.modalQuestionText}>
                  {getQuestionText(selectedQuestion)}
                  {getCurrentLanguage() !== 'en' && (
                    <Text style={styles.englishText}> ({getEnglishQuestionText(selectedQuestion)})</Text>
                  )}
                </Text>
              </View>
              
              <View style={styles.modalAnswer}>
                <Text style={styles.modalSectionTitle}>
                  {selectedQuestion.correctAnswers?.length > 1
                    ? t('story.modal.answersTitlePlural')
                    : t('story.modal.answersTitleSingular')}
                </Text>
                {selectedQuestion.correctAnswers?.map((answer, index) => (
                  <View key={index} style={styles.answerItem}>
                    <Text style={styles.modalCorrectAnswer}>
                      {getAnswerText(answer)}
                      {getCurrentLanguage() !== 'en' && (
                        <Text style={styles.englishText}> ({getEnglishAnswerText(answer, selectedQuestion.id)})</Text>
                      )}
                    </Text>
                    {answer.rationale && (
                      <Text style={styles.modalRationale}>
                        {getRationaleText(answer)}
                        {getCurrentLanguage() !== 'en' && answer.rationale && (
                          <Text style={styles.englishRationale}> ({getEnglishRationaleText(answer, selectedQuestion.id)})</Text>
                        )}
                      </Text>
                    )}
                    {selectedQuestion.correctAnswers.length > 1 && index < selectedQuestion.correctAnswers.length - 1 && (
                      <View style={styles.answerSeparator} />
                    )}
                  </View>
                )) || (
                  <Text style={styles.modalCorrectAnswer}>{t('story.modal.noAnswers')}</Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>{t('story.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>{t('menu.learn.storyMode')}</Text>
        <View style={styles.headerRight}>
          {getCurrentLanguage() !== 'en' && (
            <TouchableOpacity 
              style={styles.languageToggle}
              onPress={() => setShowPrimary(!showPrimary)}
            >
              <Text style={styles.languageToggleText}>
                {showPrimary ? t('story.languageToggle.english') : t('story.languageToggle.original')}
              </Text>
              <Ionicons name="language" size={16} color="#2E86AB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Story Chapters */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {storyData.map((chapter, index) => renderChapter(chapter, index))}
      </ScrollView>

      {/* Question Modal */}
      {renderQuestionModal()}
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
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E86AB',
  },
  languageToggleText: {
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
  chapterCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  chapterTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  chapterSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  chapterNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.7,
  },
  chapterContent: {
    padding: 20,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  answerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2E86AB',
    fontWeight: 'bold',
  },
  questionsSection: {
    marginTop: 10,
  },
  questionsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 8,
  },
  questionsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
    flex: 1,
  },
  questionsListContainer: {
    marginTop: 4,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  questionItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E86AB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionItemNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalQuestion: {
    marginBottom: 20,
  },
  modalQuestionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
  },
  modalQuestionTextEn: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    lineHeight: 24,
  },
  modalAnswer: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 8,
  },
  modalCorrectAnswer: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    lineHeight: 24,
  },
  modalCorrectAnswerEn: {
    fontSize: 15,
    color: '#28a745',
    marginTop: 4,
    lineHeight: 22,
  },
  answerItem: {
    marginBottom: 12,
  },
  answerSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
    marginBottom: 4,
  },
  englishText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'normal',
  },
  modalRationale: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  englishRationale: {
    fontSize: 13,
    color: '#999',
    fontWeight: 'normal',
  },
  inlineQuestionBadgeWrapper: {
    marginHorizontal: 2,
  },
  inlineQuestionBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2E86AB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineQuestionNumber: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default StoryMode;
