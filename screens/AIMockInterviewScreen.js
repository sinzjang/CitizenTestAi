import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import StudyTracker from '../utils/studyTracker';

const AIMockInterviewScreen = ({ navigation }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (title, message, buttons) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons && buttons.length ? buttons : [{ text: '확인' }],
    });
  };

  const handleAlertClose = (onPress) => {
    if (typeof onPress === 'function') {
      onPress();
    }
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // ChatGPT API 설정
  const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-api-key-here';
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  // TTS 함수들
  const speakText = async (text) => {
    if (!ttsEnabled) return;
    
    try {
      setIsSpeaking(true);
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
        voice: 'com.apple.ttsbundle.Samantha-compact', // iOS용 음성
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const toggleTTS = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setTtsEnabled(!ttsEnabled);
  };

  // ChatGPT API 호출 함수
  const callChatGPT = async (messages) => {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('ChatGPT API Error:', error);
      throw error;
    }
  };

  useEffect(() => {
    testChatGPTConnection();
  }, []);

  const testChatGPTConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('ChatGPT API에 연결 중...');
    
    try {
      const messages = [
        {
          role: 'user',
          content: 'Hello, can you respond with "API connection successful"?'
        }
      ];
      
      const text = await callChatGPT(messages);
      
      if (text) {
        setIsConnected(true);
        setConnectionStatus('✅ ChatGPT API 연결 성공!');
        console.log('ChatGPT API Response:', text);
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('❌ ChatGPT API 연결 실패: ' + error.message);
      console.error('ChatGPT API Error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const startInterview = async () => {
    if (!isConnected) {
      showAlert('연결 오류', 'ChatGPT API에 먼저 연결해주세요.');
      return;
    }

    setIsLoading(true);
    setInterviewStarted(true);
    setQuestionCount(1);
    
    // 대화 기록 초기화
    const initialMessages = [
      {
        role: 'system',
        content: 'You are an AI assistant simulating a U.S. citizenship interview. Your role is to act as a friendly and professional interviewer. Ask civics questions based on the official study guide. Ask only one question at a time. Remember previous questions and answers to avoid repetition.'
      },
      {
        role: 'user',
        content: 'Please start the citizenship interview. Begin with a welcome message and ask the first civics question.'
      }
    ];

    try {
      const text = await callChatGPT(initialMessages);
      
      // 대화 기록에 추가
      const newHistory = [
        ...initialMessages,
        {
          role: 'assistant',
          content: text
        }
      ];
      setConversationHistory(newHistory);
      
      setCurrentQuestion(text);
      
      // TTS로 질문 읽기
      if (ttsEnabled) {
        await speakText(text);
      }
    } catch (error) {
      showAlert('오류', 'AI 인터뷰를 시작할 수 없습니다: ' + error.message);
      setInterviewStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      showAlert('답변 입력', '답변을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 기존 대화 기록에 사용자 답변 추가
      const updatedHistory = [
        ...conversationHistory,
        {
          role: 'user',
          content: userAnswer
        }
      ];
      
      const text = await callChatGPT(updatedHistory);
      
      // 대화 기록에 AI 응답 추가
      const finalHistory = [
        ...updatedHistory,
        {
          role: 'assistant',
          content: text
        }
      ];
      setConversationHistory(finalHistory);
      
      setAiResponse(text);
      setUserAnswer('');
      setQuestionCount(prev => prev + 1);
      
      // TTS로 AI 응답 읽기
      if (ttsEnabled) {
        await speakText(text);
      }
    } catch (error) {
      showAlert('오류', 'AI 응답을 받을 수 없습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    stopSpeaking(); // TTS 정지
    setInterviewStarted(false);
    setCurrentQuestion('');
    setUserAnswer('');
    setAiResponse('');
    setQuestionCount(0);
    setConversationHistory([]); // 대화 기록 초기화
    // Daily Progress: mock interviews +1 (count when user ends session)
    try { StudyTracker.recordActivity('mockInterviews', 1); } catch (e) {}
  };

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
        <Text style={styles.headerTitle}>AI Mock Interview</Text>
        <View style={styles.headerRight}>
          {/* TTS 제어 버튼들 */}
          <TouchableOpacity 
            style={styles.ttsButton}
            onPress={toggleTTS}
          >
            <Ionicons 
              name={ttsEnabled ? "volume-high" : "volume-mute"} 
              size={20} 
              color={ttsEnabled ? "#2E86AB" : "#ccc"} 
            />
          </TouchableOpacity>
          
          {isSpeaking && (
            <TouchableOpacity 
              style={styles.stopButton}
              onPress={stopSpeaking}
            >
              <Ionicons name="stop" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetInterview}
            disabled={!interviewStarted}
          >
            <Ionicons name="refresh" size={20} color={interviewStarted ? "#2E86AB" : "#ccc"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={isConnected ? "checkmark-circle" : "alert-circle"} 
              size={24} 
              color={isConnected ? "#28a745" : "#dc3545"} 
            />
            <Text style={styles.statusTitle}>ChatGPT AI Status</Text>
          </View>
          
          {isConnecting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2E86AB" />
              <Text style={styles.statusText}>{connectionStatus}</Text>
            </View>
          ) : (
            <Text style={[
              styles.statusText,
              { color: isConnected ? "#28a745" : "#dc3545" }
            ]}>
              {connectionStatus}
            </Text>
          )}

          {!isConnecting && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={testChatGPTConnection}
            >
              <Text style={styles.retryButtonText}>다시 연결</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TTS Status */}
        <View style={styles.ttsStatusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={ttsEnabled ? "volume-high" : "volume-mute"} 
              size={24} 
              color={ttsEnabled ? "#2E86AB" : "#6c757d"} 
            />
            <Text style={styles.statusTitle}>Text-to-Speech</Text>
          </View>
          
          <Text style={[
            styles.statusText,
            { color: ttsEnabled ? "#2E86AB" : "#6c757d" }
          ]}>
            {ttsEnabled ? 
              (isSpeaking ? "🔊 음성 재생 중..." : "✅ TTS 활성화됨") : 
              "🔇 TTS 비활성화됨"
            }
          </Text>
          
          {isSpeaking && (
            <View style={styles.speakingIndicator}>
              <ActivityIndicator size="small" color="#2E86AB" />
              <Text style={styles.speakingText}>음성 재생 중...</Text>
            </View>
          )}
        </View>

        {/* Interview Section */}
        {!interviewStarted ? (
          <View style={styles.startSection}>
            <Ionicons name="mic" size={64} color="#2E86AB" />
            <Text style={styles.startTitle}>AI Mock Interview</Text>
            <Text style={styles.startDescription}>
              AI가 실제 시민권 인터뷰처럼 질문을 하고 답변을 평가해드립니다.
              {'\n\n'}준비되시면 시작 버튼을 눌러주세요.
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.startButton,
                !isConnected && styles.disabledButton
              ]}
              onPress={startInterview}
              disabled={!isConnected || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.startButtonText}>인터뷰 시작</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.interviewSection}>
            {/* Question Counter */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>Question {questionCount}</Text>
            </View>

            {/* Current Question */}
            {currentQuestion ? (
              <View style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Ionicons name="person" size={20} color="#2E86AB" />
                  <Text style={styles.questionLabel}>Interviewer</Text>
                </View>
                <Text style={styles.questionText}>{currentQuestion}</Text>
              </View>
            ) : null}

            {/* AI Response */}
            {aiResponse ? (
              <View style={styles.responseCard}>
                <View style={styles.responseHeader}>
                  <Ionicons name="sparkles" size={20} color="#28a745" />
                  <Text style={styles.responseLabel}>AI Feedback</Text>
                </View>
                <Text style={styles.responseText}>{aiResponse}</Text>
              </View>
            ) : null}

            {/* Answer Input */}
            <View style={styles.answerSection}>
              <Text style={styles.answerLabel}>Your Answer:</Text>
              <TextInput
                style={styles.answerInput}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="답변을 입력하세요..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!userAnswer.trim() || isLoading) && styles.disabledButton
                ]}
                onPress={submitAnswer}
                disabled={!userAnswer.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text style={styles.submitButtonText}>답변 제출</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={alertConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() => handleAlertClose()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertContainer}>
            {alertConfig.title ? (
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            ) : null}
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <View style={styles.alertButtonsRow}>
              {alertConfig.buttons.map((button, index) => (
                <TouchableOpacity
                  key={`${button.text}-${index}`}
                  style={[styles.alertButton, index > 0 && styles.alertButtonSpacing]}
                  onPress={() => handleAlertClose(button.onPress)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={
                      button.style === 'cancel'
                        ? styles.alertButtonTextCancel
                        : styles.alertButtonText
                    }
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 8,
  },
  ttsButton: {
    padding: 8,
  },
  stopButton: {
    padding: 8,
  },
  resetButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ttsStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  speakingText: {
    fontSize: 14,
    color: '#2E86AB',
    marginLeft: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#2E86AB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  startSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  startDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#2E86AB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  interviewSection: {
    flex: 1,
  },
  counterContainer: {
    backgroundColor: '#2E86AB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginLeft: 8,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  responseCard: {
    backgroundColor: '#f8fff8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginLeft: 8,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  answerSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2E86AB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  alertButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#2E86AB',
  },
  alertButtonSpacing: {
    marginLeft: 12,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  alertButtonTextCancel: {
    color: '#2E86AB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIMockInterviewScreen;
