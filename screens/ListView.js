import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QuestionLoader from '../utils/questionLoader';
import { t } from '../utils/i18n';

const ListView = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [showKorean, setShowKorean] = useState(true); // true for Korean, false for English

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const questionsData = await QuestionLoader.loadQuestions();
      setQuestions(questionsData.questions || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load question data.');
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (questionId) => {
    setExpandedItems(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const renderQuestion = ({ item, index }) => {
    const isExpanded = expandedItems[item.id];
    
    return (
      <View style={styles.questionCard}>
        <TouchableOpacity
          style={styles.questionHeader}
          onPress={() => toggleExpanded(item.id)}
        >
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.questionContent}>
            <Text style={styles.questionText} numberOfLines={isExpanded ? 0 : 2}>
              {showKorean ? item.questionrean : item.questionglish}
            </Text>
            {showKorean && (
              <Text style={styles.questionTextEn} numberOfLines={isExpanded ? 0 : 1}>
                {item.questionglish}
              </Text>
            )}
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.answerSection}>
              <Text style={styles.sectionTitle}>Correct Answer</Text>
              <Text style={styles.correctAnswer}>
                {showKorean ? item.correct_answer_korean : item.correct_answer_english}
              </Text>
              {showKorean && (
                <Text style={styles.correctAnswerEn}>{item.correct_answer_english}</Text>
              )}
            </View>
            
            {item.wrong_answers_korean && item.wrong_answers_korean.length > 0 && (
              <View style={styles.answerSection}>
                <Text style={styles.sectionTitle}>Wrong Answer Examples</Text>
                {(showKorean ? item.wrong_answers_korean : item.wrong_answers_english).map((wrongAnswer, idx) => (
                  <View key={idx} style={styles.wrongAnswerItem}>
                    <Text style={styles.wrongAnswer}>• {wrongAnswer}</Text>
                    {showKorean && (
                      <Text style={styles.wrongAnswerEn}>• {item.wrong_answers_english[idx]}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.answerSection}>
              <Text style={styles.sectionTitle}>Explanation</Text>
              <Text style={styles.rationale}>
                {showKorean ? item.rationalerean : item.rationaleglish}
              </Text>
              {showKorean && (
                <Text style={styles.rationaleEn}>{item.rationaleglish}</Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading questions...</Text>
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
        <Text style={styles.headerTitle}>{t('menu.learn.allQuestions')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.languageToggle}
            onPress={() => setShowKorean(!showKorean)}
          >
            <Text style={styles.languageToggleText}>
              {showKorean ? '한국어' : 'English'}
            </Text>
            <Ionicons name="language" size={16} color="#2E86AB" />
          </TouchableOpacity>
          <Text style={styles.questionCount}>{questions.length} Questions</Text>
        </View>
      </View>

      {/* Questions List */}
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderQuestion}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'flex-end',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    gap: 4,
  },
  languageToggleText: {
    fontSize: 12,
    color: '#2E86AB',
    fontWeight: '600',
  },
  questionCount: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E86AB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionContent: {
    flex: 1,
    marginRight: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  questionTextEn: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  answerSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 8,
  },
  correctAnswer: {
    fontSize: 15,
    color: '#28a745',
    fontWeight: '600',
    lineHeight: 22,
  },
  correctAnswerEn: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 4,
    lineHeight: 20,
  },
  wrongAnswerItem: {
    marginBottom: 8,
  },
  wrongAnswer: {
    fontSize: 15,
    color: '#dc3545',
    lineHeight: 22,
  },
  wrongAnswerEn: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 2,
    lineHeight: 20,
  },
  rationale: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  rationaleEn: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
});

export default ListView;
