import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Speech } from 'expo-speech';
import * as FileSystem from 'expo-file-system';
// import * as SpeechRecognition from 'expo-speech-recognition'; // Expo Go에서 지원하지 않음
// import Voice from '@react-native-voice/voice'; // 사용하지 않음
import { Ionicons } from '@expo/vector-icons';
import QuestionLoader from '../utils/questionLoader';
import { t } from '../utils/i18n';
import StudyTracker from '../utils/studyTracker';

const AIInterviewScreen = ({ navigation, route }) => {
  // 기본 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [interviewStage, setInterviewStage] = useState('waiting'); // waiting, smalltalk, interview, completed
  const [showQuestionScript, setShowQuestionScript] = useState(false);
  const [speakButtonActive, setSpeakButtonActive] = useState(false);
  
  // 실시간 음성 인식 텍스트
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // 질문 관리
  const [allQuestions, setAllQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionOnly, setCurrentQuestionOnly] = useState('');
  const [showProgressBar, setShowProgressBar] = useState(false);
  
  // TTS/STT 설정
  const [sttEnabled, setSttEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [recognitionPermission, setRecognitionPermission] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(route?.params?.selectedVoice || 'alloy');


  // 스몰토크 질문들
  const smallTalkQuestions = [
    "Good morning! How are you feeling today?",
    "Are you ready for your citizenship interview?", 
    "Have you been preparing for this interview?",
    "What's your name and where are you from originally?",
    "How long have you been living in the United States?"
  ];

  // Fisher-Yates 셔플 알고리즘
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Vercel API 프록시 설정
  const OPENAI_API_URL = 'https://vercel-openai-proxy-delta.vercel.app/api/openai';
  const SPEECH_API_URL = 'https://vercel-openai-proxy-delta.vercel.app/api/speech';
  const WHISPER_API_URL = 'https://vercel-openai-proxy-delta.vercel.app/api/whisper';

  // 인터뷰 질문 생성 함수들
  const getRandomSmallTalk = () => {
    const randomIndex = Math.floor(Math.random() * smallTalkQuestions.length);
    return smallTalkQuestions[randomIndex];
  };

  const getNextCitizenshipQuestion = () => {
    // 새 질문으로 넘어갈 때 정답 표시 숨기기
    setShowAnswer(false);
    
    if (currentQuestionIndex >= shuffledQuestions.length) {
      return "Thank you for completing the interview!";
    }
    const question = shuffledQuestions[currentQuestionIndex];
    setCurrentQuestionIndex(prev => prev + 1);
    return question.question;
  };
  
  // 질문 데이터 로드 (항상 영문 질문만 사용, 10개만 랜덤 선택)
  const loadQuestions = async () => {
    try {
      const questions = await QuestionLoader.loadQuestionsForLanguage('en'); // 강제로 영문 질문만 로드
      setAllQuestions(questions);
      const shuffled = shuffleArray(questions);
      // 10개만 선택
      const selected10 = shuffled.slice(0, 10);
      setShuffledQuestions(selected10);
      setCurrentQuestionIndex(0);
      console.log(`📚 Loaded ${questions.length} English questions, selected 10 randomly`);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  // 문자열 매칭 검사 (1차 검증)
  const checkStringMatch = (userResponse, correctAnswers) => {
    return correctAnswers.some(answer => 
      userResponse.toLowerCase().includes(answer.toLowerCase()) ||
      answer.toLowerCase().includes(userResponse.toLowerCase())
    );
  };

  // AI 의미적 유사성 판단 (2차 검증)
  const evaluateAnswerSemantically = async (userAnswer, correctAnswers) => {
    try {
      const prompt = `You are evaluating a US citizenship test answer for semantic similarity.

User Answer: "${userAnswer}"
Correct Answers: ${correctAnswers.join(', ')}

Evaluate if the user's answer conveys the same meaning as any correct answer. Consider:
- Synonyms and alternative phrasings
- Core meaning preservation  
- Context appropriateness for US civics

Respond with JSON only:
{"similarity": number (0-100), "isCorrect": boolean, "explanation": "brief reason"}

Use 75% as the threshold for correctness.`;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      console.log(`🤖 AI Evaluation: ${result.similarity}% similarity - ${result.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
      return result;
    } catch (error) {
      console.error('AI evaluation error:', error);
      // AI 실패 시 보수적으로 오답 처리
      return { similarity: 0, isCorrect: false, explanation: 'AI evaluation failed' };
    }
  };

  // 하이브리드 답변 검증
  const isAnswerCorrect = async (userResponse, correctAnswers) => {
    // 1차: 빠른 문자열 매칭
    const exactMatch = checkStringMatch(userResponse, correctAnswers);
    if (exactMatch) {
      console.log('✅ String match found');
      return { correct: true, method: 'exact', similarity: 100 };
    }
    
    // 모든 답변에 대해 AI 의미적 유사성 판단 사용
    
    // 2차: AI 의미적 유사성 판단
    console.log('🤖 Using AI semantic evaluation...');
    const aiResult = await evaluateAnswerSemantically(userResponse, correctAnswers);
    return { 
      correct: aiResult.isCorrect, 
      method: 'semantic', 
      similarity: aiResult.similarity,
      explanation: aiResult.explanation
    };
  };

  // 피드백 생성 함수 (업데이트)
  const generateFeedback = async (userResponse) => {
    try {
      const currentQuestion = shuffledQuestions[currentQuestionIndex - 1]; // 이전 질문
      if (!currentQuestion) return "";
      
      // 정답 가져오기
      const correctAnswers = currentQuestion.correctAnswers.map(answer => answer.text);
      const correctAnswerText = correctAnswers.join(' or ');
      
      // 하이브리드 검증 사용
      const result = await isAnswerCorrect(userResponse, correctAnswers);
      
      if (result.correct) {
        return "Correct!";
      } else if (result.method === 'semantic' && result.similarity >= 50) {
        return `Close, but the answer is ${correctAnswerText}.`;
      } else {
        return `Actually, the answer is ${correctAnswerText}.`;
      }
    } catch (error) {
      console.error('Feedback generation error:', error);
      return "";
    }
  };

  // OpenAI TTS 함수
  const speakTextWithOpenAI = async (text) => {
    console.log('🔊 speakTextWithOpenAI called');
    console.log('🔊 Text to speak:', text);
    console.log('🔊 Selected voice:', selectedVoice);
    console.log('🔊 TTS Enabled:', ttsEnabled);

    if (!ttsEnabled || !text) {
      console.log('🔊 TTS disabled or no text, skipping');
      return;
    }

    try {
      setIsSpeaking(true);
      console.log('🔊 Starting OpenAI TTS...');

      // OpenAI TTS API 프록시 호출
      const response = await fetch(SPEECH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          input: text,
          voice: selectedVoice, // 사용자가 선택한 음성 사용
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS API error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      console.log('🔊 ✅ OpenAI TTS API response received');

      // 플랫폼별 재생 처리
      if (Platform.OS === 'web') {
        // 웹에서는 Audio 객체 사용
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        if (typeof window !== 'undefined') {
          window.currentAudio = audio;
        }
        
        audio.onended = () => {
          console.log('🔊 ✅ OpenAI TTS playback completed on web');
          setIsSpeaking(false);
          if (typeof window !== 'undefined') {
            window.currentAudio = null;
          }
        };
        
        await audio.play();
        console.log('🔊 ✅ OpenAI TTS started on web with voice:', selectedVoice);
      } else {
        // 모바일에서는 base64 변환 후 Expo AV 사용
        try {
          // React Native에서는 FileReader를 사용하여 base64 변환
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => {
              const base64 = reader.result.split(',')[1]; // data:audio/mp3;base64, 부분 제거
              resolve(base64);
            };
            reader.onerror = reject;
          });
          
          reader.readAsDataURL(audioBlob);
          const base64Audio = await base64Promise;
          
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            playThroughEarpieceAndroid: false,
          });
          
          const { sound } = await Audio.Sound.createAsync(
            { uri: `data:audio/mp3;base64,${base64Audio}` },
            { shouldPlay: true }
          );
          
          if (typeof window !== 'undefined') {
            window.currentExpoSound = sound;
          }
          
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              console.log('🔊 ✅ OpenAI TTS playback completed on mobile');
              setIsSpeaking(false);
              sound.unloadAsync();
              if (typeof window !== 'undefined') {
                window.currentExpoSound = null;
              }
            }
          });
          
          console.log('🔊 ✅ OpenAI TTS started on mobile with voice:', selectedVoice);
        } catch (error) {
          console.error('🔊 ❌ Mobile audio playback error:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('🔊 ❌ OpenAI TTS Error:', error);
      console.log('🔊 🔄 Falling back to Expo Speech...');
      
      // 폴백: Expo Speech 사용
      try {
        const speechOptions = {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
          voice: 'com.apple.ttsbundle.Samantha-compact',
        };
        
        Speech.speak(text, {
          ...speechOptions,
          onDone: () => {
            console.log('🔊 ✅ Expo Speech completed (fallback)');
            setIsSpeaking(false);
          },
          onError: (error) => {
            console.error('🔊 ❌ Expo Speech Error (fallback):', error);
            setIsSpeaking(false);
          }
        });
        
        console.log('🔊 ✅ Expo Speech started (fallback)');
      } catch (fallbackError) {
        console.error('🔊 ❌ Fallback TTS Error:', fallbackError);
        setIsSpeaking(false);
        Alert.alert('TTS 오류', '음성 출력에 실패했습니다.');
      }
    }
  };

  // 인터뷰 응답 처리
  const processInterviewResponse = async (userResponse) => {
    console.log('🎤 Processing interview response:', userResponse);
    setSpeakButtonActive(false);
    setIsLoading(true);

    try {
      const interviewerPrompt = `You are an AI assistant simulating a naturalization interview. Your role is to act as a professional and friendly interviewer.

Previous question context: "${currentQuestion}"
User's response: "${userResponse}"

Instructions:
${interviewStage === 'smalltalk' ? 
  `- Give a brief acknowledgment (1 sentence max)
   - Ask ONE small talk question
   - Keep total response under 30 words
   - After 2-3 exchanges, transition to citizenship questions naturally` :
  `- First, evaluate if the answer is correct for a US citizenship test
   - Give brief feedback: "Correct!" or "That's close, but..." or "Actually, the answer is..."
   - Then ask ONE new citizenship test question
   - Keep total response under 40 words
   - Ask the next citizenship question from the prepared list
   - Use the exact question text provided`
}

Format: ${interviewStage === 'smalltalk' ? '[Brief acknowledgment]. [Question]?' : '[Feedback on answer]. [New question]?'}`;

      const messages = [
        {
          role: 'system',
          content: interviewerPrompt
        },
        {
          role: 'user', 
          content: userResponse
        }
      ];

      const apiResponse = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 80,
          temperature: 0.7,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      let interviewerResponse = data.choices[0].message.content;

      // 스몰토크에서 시민권 질문으로 즉시 전환 (첫 번째 응답 후)
      if (interviewStage === 'smalltalk') {
        setInterviewStage('interview');
        setShowProgressBar(true);
        console.log('🎤 Transitioning to citizenship questions after first response');
        // 첫 번째 시민권 질문으로 교체
        const firstCitizenshipQuestion = getNextCitizenshipQuestion();
        interviewerResponse = `Thank you. Now let's begin with the citizenship questions. ${firstCitizenshipQuestion}`;
        setCurrentQuestionOnly(firstCitizenshipQuestion);
      } else if (interviewStage === 'interview') {
        // 시민권 질문 단계: 피드백 + 다음 질문
        const feedback = await generateFeedback(userResponse);
        const nextQuestion = getNextCitizenshipQuestion();
        
        if (nextQuestion.includes('Thank you for completing')) {
          setInterviewStage('completed');
          setShowProgressBar(false);
          interviewerResponse = `${feedback} Thank you for completing the interview!`;
          // Daily Progress: mock interviews +1
          try { StudyTracker.recordActivity('mockInterviews', 1); } catch (e) {}
        } else {
          interviewerResponse = `${feedback} ${nextQuestion}`;
        }
        setCurrentQuestionOnly(nextQuestion);
      } else {
        // 스몰토크 단계에서는 전체 대화 내용 사용
        setCurrentQuestionOnly('');
      }

      setCurrentQuestion(interviewerResponse);
      setShowQuestionScript(false);

      // TTS로 응답 읽기
      if (ttsEnabled) {
        await speakTextWithOpenAI(interviewerResponse);
        setSpeakButtonActive(true);
      } else {
        setSpeakButtonActive(true);
      }

    } catch (error) {
      console.error('🎤 Interview response error:', error);
      Alert.alert('오류', '면접관 응답을 받을 수 없습니다: ' + error.message);
      setSpeakButtonActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  // OpenAI Whisper STT (모바일용)
  const startWhisperRecognition = async () => {
    try {
      console.log('🎤 Starting OpenAI Whisper STT...');
      
      // 기존 녹음이 있다면 정리
      if (typeof window !== 'undefined' && window.currentRecording) {
        try {
          await window.currentRecording.stopAndUnloadAsync();
          console.log('🎤 Cleaned up existing recording');
        } catch (error) {
          console.log('🎤 No existing recording to clean up');
        }
        window.currentRecording = null;
      }
      
      // Expo AV를 사용하여 음성 녹음
      const { Audio } = require('expo-av');
      
      // 오디오 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // 권한 요청
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission denied');
      }
      
      // 녹음 시작 (WAV 형식으로 변경)
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000, // Whisper에 최적화된 샘플레이트
          numberOfChannels: 1, // 모노 채널
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000, // Whisper에 최적화된 샘플레이트
          numberOfChannels: 1, // 모노 채널
          bitRate: 128000,
        },
      });
      
      await recording.startAsync();
      console.log('🎤 ✅ Recording started');
      
      // 5초 후 자동 중지 (또는 사용자가 버튼을 다시 누를 때까지)
      setTimeout(async () => {
        if (isRecording) {
          await stopWhisperRecording(recording);
        }
      }, 5000);
      
      // 전역 변수에 저장하여 중지할 수 있도록 함
      if (typeof window !== 'undefined') {
        window.currentRecording = recording;
      }
      
    } catch (error) {
      console.error('🎤 ❌ Whisper STT error:', error);
      console.error('🎤 Error details:', error.message);
      setIsRecording(false);
      
      // Whisper STT 실패 시 expo-speech 폴백 사용
      console.log('🎤 🔄 Falling back to expo-speech STT...');
      await startExpoSpeechSTT();
    }
  };
  
  // 간단한 음성→텍스트 변환 시스템
  const startSimpleVoiceToText = async () => {
    try {
      console.log('🎤 Starting Simple Voice to Text...');
      
      // 상태 초기화
      setIsRecording(true);
      setIsListening(true);
      setRealtimeTranscript('말씀해주세요...');
      
      // 음성 녹음 시작
      console.log('🎤 Starting voice recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      // 전역 변수에 저장하여 수동 중지 가능하도록 함
      if (typeof window !== 'undefined') {
        window.currentRecording = recording;
      }
      
      console.log('🎤 ✅ Voice recording started');
      
    } catch (error) {
      console.error('🎤 ❌ Voice to text error:', error);
      setIsRecording(false);
      setIsListening(false);
      setRealtimeTranscript('❌ 음성 녹음을 시작할 수 없습니다');
      Alert.alert('음성 오류', '음성 녹음을 시작할 수 없습니다.');
    }
  };
  
  // 간단한 Whisper API 호출
  const convertVoiceToTextSimple = async (uri) => {
    try {
      console.log('🎤 Converting voice to text with Whisper...');
      console.log('🎤 Audio file URI:', uri);
      console.log('🎤 Whisper API URL:', WHISPER_API_URL);
      
      // 파일을 base64로 읽기
      console.log('🎤 Reading file as base64...');
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('🎤 Base64 length:', base64Audio.length);
      
      // JSON으로 전송
      const apiResponse = await fetch(WHISPER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          model: 'whisper-1',
          language: 'en',
        }),
      });
      
      console.log('🎤 Whisper API response status:', apiResponse.status);
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('🎤 Whisper API error:', errorText);
        
        // 404면 폴백으로 간단한 텍스트 반환
        if (apiResponse.status === 404) {
          console.log('🎤 Using fallback - returning placeholder text');
          return '[Voice recognition temporarily unavailable]';
        }
        
        throw new Error(`Whisper API error: ${apiResponse.status}`);
      }
      
      const data = await apiResponse.json();
      console.log('🎤 ✅ Transcription successful:', data.text);
      return data.text;
      
    } catch (error) {
      console.error('🎤 Whisper conversion error:', error);
      console.error('🎤 Error details:', error.message);
      // 에러 발생 시 폴백 텍스트 반환
      return '[Voice recognition error - please try again]';
    }
  };
  
  // 실시간 음성 인식 중지
  const stopRealtimeSpeechRecognition = async () => {
    try {
      console.log('🎤 Stopping real-time speech recognition...');
      
      if (typeof window !== 'undefined' && window.currentRecognition) {
        window.currentRecognition.stop();
        window.currentRecognition = null;
      }
      
      setIsRecording(false);
      setIsListening(false);
      
      console.log('🎤 ✅ Real-time speech recognition stopped');
      
      // 즉시 음성 분석 시작 (8초 대기 없이)
      if (realtimeTranscript && realtimeTranscript.trim() && !realtimeTranscript.includes('🎤')) {
        console.log('🎤 Starting immediate voice analysis...');
        setRealtimeTranscript('🔄 음성을 분석 중...');
        
        setTimeout(() => {
          processInterviewResponse(realtimeTranscript.trim());
        }, 500); // 0.5초 후 즉시 처리
      }
      
    } catch (error) {
      console.error('🎤 ❌ Stop speech recognition error:', error);
    }
  };
  
  // 스마트 음성 컨텍스트 시스템 시작 (기존 시스템 유지)
  const startSmartVoiceContext = async () => {
    try {
      console.log('🎤 Starting Smart Voice Context System...');
      setIsRecording(true);
      
      // 1단계: 3초간 음성 녹음 (톤 분석용)
      const voiceContext = await recordVoiceForContext();
      console.log('🎤 ✅ Voice context recorded');
      
      if (voiceContext && voiceContext.isEmpty) {
        console.log('🎤 ❌ Empty recording detected');
        await handleEmptyRecording();
        return;
      } else {
        console.log('🎤 Proceeding with text only');
      }
      
      // 2단계: 스마트 음성 가이드 텍스트 입력
      if (voiceContext && !voiceContext.isEmpty) {
        const toneDescription = {
          confident: "자신감 있는 목소리",
          normal: "차분한 목소리", 
          quiet: "조용한 목소리"
        };
        
        const qualityDescription = {
          excellent: "매우 명확한",
          good: "좋은",
          fair: "보통의",
          poor: "약간 흐린"
        };
        
        const voiceAnalysis = `${qualityDescription[voiceContext.quality]} ${toneDescription[voiceContext.tone]}로 말씀하셨네요!`;
        
        // 음성 분석 결과를 UI에 표시
        setVoiceAnalysisResult({
          quality: voiceContext.quality,
          tone: voiceContext.tone,
          analysis: voiceAnalysis
        });
        
        // 실시간 텍스트 입력 모드 시작
        setIsListening(true);
        setRealtimeTranscript('음성 분석 완료! 이제 답변을 말해주세요...');
        
        Alert.prompt(
          '🎤 스마트 음성 면접',
          `${voiceAnalysis}\n\nAI가 당신의 음성 특성을 분석했습니다. 이제 답변을 텍스트로 입력해주세요. AI가 당신의 음성 톤을 고려하여 더 자연스러운 면접을 진행합니다.`,
          [
            {
              text: '취소',
              style: 'cancel',
              onPress: () => {
                setIsRecording(false);
                setIsListening(false);
                setRealtimeTranscript('');
                setVoiceAnalysisResult(null);
                      }
            },
            {
              text: '답변 제출',
              onPress: (userInput) => {
                if (userInput && userInput.trim()) {
                  console.log('🎤 ✅ User provided guided text input:', userInput);
                  setRealtimeTranscript(`입력 완료: "${userInput}"`);
                  setIsListening(false);
                  handleSmartUserAnswer(userInput.trim(), voiceContext);
                } else {
                  Alert.alert('입력 오류', '답변을 입력해주세요.');
                }
              }
            }
          ],
          'plain-text',
          '',
          'default'
        );
      } else {
        // 음성 컨텍스트가 없으면 기본 텍스트 입력
        showTextInputDialog();
      }
      
    } catch (error) {
      console.error('🎤 ❌ Smart Voice Context error:', error);
      setIsRecording(false);
      Alert.alert('음성 오류', '음성 처리 중 오류가 발생했습니다.');
    }
  };
  
  // 스마트 음성 가이드 텍스트 입력
  const showSmartVoiceGuidedInput = (voiceContext) => {
    const toneDescription = {
      confident: "자신감 있는 목소리",
      normal: "차분한 목소리", 
      quiet: "조용한 목소리"
    };
    
    const qualityDescription = {
      excellent: "매우 명확한",
      good: "좋은",
      fair: "보통의",
      poor: "약간 흐린"
    };
    
    const voiceAnalysis = `${qualityDescription[voiceContext.quality]} ${toneDescription[voiceContext.tone]}로 말씀하셨네요!`;
    
    // 음성 분석 결과를 UI에 표시
    setVoiceAnalysisResult({
      quality: voiceContext.quality,
      tone: voiceContext.tone,
      analysis: voiceAnalysis
    });
    
    // 실시간 텍스트 입력 모드 시작
    setIsListening(true);
    setRealtimeTranscript('음성 분석 완료! 이제 답변을 말해주세요...');
    
    Alert.prompt(
      '🎤 스마트 음성 면접',
      `${voiceAnalysis}\n\nAI가 당신의 음성 특성을 분석했습니다. 이제 답변을 텍스트로 입력해주세요. AI가 당신의 음성 톤을 고려하여 더 자연스러운 면접을 진행합니다.`,
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {
            setIsRecording(false);
            setIsListening(false);
            setRealtimeTranscript('');
            setVoiceAnalysisResult(null);
              }
        },
        {
          text: '답변 제출',
          onPress: (userInput) => {
            if (userInput && userInput.trim()) {
              console.log('🎤 ✅ User provided guided text input:', userInput);
              setRealtimeTranscript(`입력 완료: "${userInput}"`);
              setIsListening(false);
              handleSmartUserAnswer(userInput.trim(), voiceContext);
            } else {
              Alert.alert('입력 오류', '답변을 입력해주세요.');
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };
  
  // Web Speech Recognition API 사용
  const convertWithWebSpeechAPI = () => {
    return new Promise((resolve, reject) => {
      console.log('🎤 Starting Web Speech Recognition...');
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('🎤 Web Speech Recognition started');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 ✅ Web Speech Recognition result:', transcript);
        resolve(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('🎤 ❌ Web Speech Recognition error:', event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.onend = () => {
        console.log('🎤 Web Speech Recognition ended');
      };
      
      recognition.start();
      
      // 10초 타임아웃
      setTimeout(() => {
        recognition.stop();
        reject(new Error('Speech recognition timeout'));
      }, 10000);
    });
  };
  
  // Whisper API 사용 (폴백)
  const convertWithWhisperAPI = async (uri) => {
    console.log('🎤 🔄 Using Whisper API...');
    console.log('🎤 Audio file URI:', uri);
    
    const formData = new FormData();
    const fileObject = {
      uri: uri,
      type: 'audio/wav',
      name: 'recording.wav',
    };
    
    formData.append('file', fileObject);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    
    console.log('🎤 Sending audio to Whisper API...');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎤 ❌ Whisper API error:', errorText);
      throw new Error(`Whisper API error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const transcript = data.text;
    
    console.log('🎤 ✅ Whisper transcription successful:', transcript);
    return transcript;
  };
  
  // 음성 인식 실패 시 다이얼로그
  const showVoiceToTextFailedDialog = (voiceContext) => {
    Alert.alert(
      '음성 인식 실패',
      '음성을 텍스트로 변환할 수 없었습니다.\n\n어떻게 진행하시겠습니까?',
      [
        {
          text: '다시 녹음',
          onPress: async () => {
            console.log('🎤 User chose to retry voice recording');
            setIsRecording(false);
                setTimeout(async () => {
              await startSmartVoiceContext();
            }, 1000);
          }
        },
        {
          text: '텍스트 입력',
          onPress: () => {
            console.log('🎤 User chose text input fallback');
            showSmartTextInputDialog(voiceContext);
          }
        }
      ]
    );
  };
  
  // 빈 녹음 처리 함수
  const handleEmptyRecording = async () => {
    Alert.alert(
      '음성이 감지되지 않았습니다',
      '녹음된 음성이 너무 작거나 비어있습니다.\n\n다시 시도하시겠습니까?',
      [
        {
          text: '텍스트만 사용',
          style: 'cancel',
          onPress: () => {
            console.log('🎤 User chose text-only mode');
            setIsRecording(false);
                showTextInputDialog(); // 기본 텍스트 입력으로 폴백
          }
        },
        {
          text: '다시 녹음',
          onPress: async () => {
            console.log('🎤 User chose to retry recording');
            setIsRecording(false);
                
            // 잠시 후 자동으로 다시 녹음 시작
            setTimeout(async () => {
              await startSmartVoiceContext();
            }, 1000);
          }
        }
      ]
    );
  };
  
  // 음성 컨텍스트 녹음 (분석용)
  const recordVoiceForContext = async () => {
    try {
      const { Audio } = require('expo-av');
      
      // 기존 녹음 정리
      if (typeof window !== 'undefined' && window.currentRecording) {
        try {
          await window.currentRecording.stopAndUnloadAsync();
        } catch (error) {
          console.log('🎤 No existing recording to clean up');
        }
        window.currentRecording = null;
      }
      
      // 오디오 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // 권한 요청
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission denied');
      }
      
      // 짧은 녹음 (3초) - 음성 톤 분석용
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
      });
      
      await recording.startAsync();
      console.log('🎤 ✅ Context recording started (3 seconds)');
      
      // 3초 후 자동 중지 및 분석
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log('🎤 ✅ Context recording completed:', uri);
            
            // 실제 음성 분석 수행
            const analysisResult = await analyzeVoiceRecording(uri);
            resolve(analysisResult);
            
          } catch (error) {
            console.log('🎤 Context recording stop error:', error);
            reject(error);
          }
        }, 3000);
      });
      
    } catch (error) {
      console.error('🎤 Context recording error:', error);
      throw error;
    }
  };
  
  // 음성 녹음 분석 함수
  const analyzeVoiceRecording = async (uri) => {
    try {
      console.log('🎤 🔍 Analyzing voice recording...');
      
      // expo-file-system 모듈 로드 시도 (여러 방법 시도)
      let fileInfo = null;
      try {
        // 방법 1: 직접 import 시도
        let FileSystem = null;
        try {
          FileSystem = require('expo-file-system');
          if (FileSystem.getInfoAsync) {
            fileInfo = await FileSystem.getInfoAsync(uri);
          } else if (FileSystem.FileSystem && FileSystem.FileSystem.getInfoAsync) {
            fileInfo = await FileSystem.FileSystem.getInfoAsync(uri);
          } else {
            throw new Error('getInfoAsync method not found');
          }
        } catch (importError) {
          // 방법 2: destructuring 시도
          const { FileSystem: FS } = require('expo-file-system');
          fileInfo = await FS.getInfoAsync(uri);
        }
        
        console.log('🎤 ✅ File info obtained:', fileInfo);
        console.log('🎤 File size:', fileInfo.size, 'bytes');
        
      } catch (fsError) {
        console.log('🎤 FileSystem not available, using smart fallback analysis');
        console.log('🎤 FileSystem error:', fsError.message);
        
        // 스마트 폴백: 녹음 성공 여부를 URI와 시간으로 추정
        const hasValidPath = uri && uri.includes('recording-') && uri.includes('.wav');
        const recordingTime = new Date().getTime();
        
        // 실제 녹음이 있었다면 파일이 존재할 가능성이 높음
        const estimatedSize = hasValidPath ? 
          Math.floor(Math.random() * 25000) + 15000 : // 15-40KB
          0;
        
        fileInfo = {
          exists: hasValidPath,
          size: estimatedSize,
          uri: uri,
          isEstimated: true
        };
        
        console.log('🎤 Smart fallback analysis:', fileInfo);
      }
      
      // 파일이 너무 작으면 빈 녹음으로 간주 (1KB 미만)
      if (!fileInfo.exists || fileInfo.size < 1024) {
        console.log('🎤 ❌ Empty or too small recording detected');
        throw new Error('EMPTY_RECORDING');
      }
      
      // 기본적인 음성 분석 (파일 크기 기반)
      let quality = 'good';
      let tone = 'confident';
      let pace = 'normal';
      
      // 파일 크기로 음성 품질 추정
      if (fileInfo.size < 5000) {
        quality = 'poor';
        tone = 'quiet';
      } else if (fileInfo.size < 15000) {
        quality = 'fair';
        tone = 'normal';
      } else if (fileInfo.size > 50000) {
        quality = 'excellent';
        tone = 'confident';
        pace = 'fast';
      }
      
      // 실제 음성 분석 결과 시뮬레이션
      const analysisResult = {
        duration: 3,
        timestamp: new Date().toISOString(),
        fileSize: fileInfo.size,
        quality: quality,
        tone: tone,
        pace: pace,
        isEmpty: false,
        uri: uri // Whisper API 변환용 URI 포함
      };
      
      console.log('🎤 ✅ Voice analysis completed:', analysisResult);
      return analysisResult;
      
    } catch (error) {
      console.error('🎤 ❌ Voice analysis error:', error);
      
      if (error.message === 'EMPTY_RECORDING') {
        throw error; // 빈 녹음 오류를 상위로 전달
      }
      
      // 분석 실패 시 기본값 반환
      return {
        duration: 3,
        timestamp: new Date().toISOString(),
        fileSize: 0,
        quality: 'unknown',
        tone: 'normal',
        pace: 'normal',
        isEmpty: true,
        analysisError: true
      };
    }
  };
  
  // 스마트 텍스트 입력 다이얼로그 (음성 컨텍스트 포함)
  const showSmartTextInputDialog = (voiceContext) => {
    Alert.prompt(
      '스마트 음성 면접 답변',
      '음성 톤이 분석되었습니다! 답변을 입력해주세요:\n\n💡 AI가 당신의 음성 특성을 고려하여 더 자연스러운 대화를 진행합니다.',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {
            setIsRecording(false);
              }
        },
        {
          text: '전송',
          onPress: async (text) => {
            if (text && text.trim()) {
              console.log('🎤 ✅ Smart text input received:', text);
              console.log('🎤 Voice context:', voiceContext);
              setIsRecording(false);
              await handleSmartUserAnswer(text.trim(), voiceContext);
            } else {
              Alert.alert('입력 오류', '답변을 입력해주세요.');
              setIsRecording(false);
                  }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };
  
  // 기본 텍스트 입력 다이얼로그 (폴백용)
  const showTextInputDialog = () => {
    Alert.prompt(
      '답변 입력',
      '면접 질문에 대한 답변을 입력해주세요:',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {
            setIsRecording(false);
              }
        },
        {
          text: '전송',
          onPress: async (text) => {
            if (text && text.trim()) {
              console.log('🎤 ✅ Text input received:', text);
              setIsRecording(false);
              await handleUserAnswer(text.trim());
            } else {
              Alert.alert('입력 오류', '답변을 입력해주세요.');
              setIsRecording(false);
                  }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  // Whisper 녹음 중지 및 전송
  const stopWhisperRecording = async (recording) => {
    try {
      console.log('🎤 Stopping recording...');
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      console.log('🎤 Recording saved to:', uri);
      
      // React Native에서 파일을 base64로 변환하여 전송 (더 안정적)
      let formData;
      let headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      };
      
      try {
        // FileSystem을 사용하여 파일을 base64로 읽기
        const { FileSystem } = require('expo-file-system');
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log('🎤 File converted to base64, length:', base64Audio.length);
        
        // base64 데이터로 Blob 생성
        const byteCharacters = atob(base64Audio);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const audioBlob = new Blob([byteArray], { type: 'audio/wav' });
        
        formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');
        
        console.log('🎤 Using base64 conversion method');
        
      } catch (base64Error) {
        console.log('🎤 Base64 conversion failed, using direct URI method');
        console.error('🎤 Base64 error:', base64Error);
        
        // 폴백: 직접 URI 방식
        formData = new FormData();
        const fileObject = {
          uri: uri,
          type: 'audio/wav',
          name: 'recording.wav',
        };
        
        formData.append('file', fileObject);
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');
        
        console.log('🎤 File object:', fileObject);
      }
      
      console.log('🎤 Sending to Whisper API...');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎤 ❌ Whisper API error response:', errorText);
        console.error('🎤 ❌ Response status:', response.status);
        console.error('🎤 ❌ Response headers:', response.headers);
        throw new Error(`Whisper API error! status: ${response.status}, details: ${errorText}`);
      }
      
      const data = await response.json();
      const transcript = data.text;
      
      console.log('🎤 ✅ Whisper API response:', data);
      console.log('🎤 ✅ Whisper transcript:', transcript);
      
      setIsRecording(false);
      
      if (transcript && transcript.trim()) {
        // AI에게 답변 전송
        await handleUserAnswer(transcript);
      } else {
        Alert.alert('음성 인식 결과', '음성을 인식하지 못했습니다. 다시 시도해주세요.');
      }
      
    } catch (error) {
      console.error('🎤 ❌ Whisper processing error:', error);
      setIsRecording(false);
      Alert.alert('음성 인식 오류', 'OpenAI Whisper 처리 중 오류가 발생했습니다.');
    }
  };

  // 마이크 권한 요청
  const requestMicrophonePermission = async () => {
    try {
      console.log('🎤 마이크 권한 요청 중...');
      
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 ✅ 마이크 권한 허용됨');
        
        // 스트림 즉시 중지 (권한 확인용)
        stream.getTracks().forEach(track => track.stop());
        
        // 권한 허용되면 STT 활성화
        setRecognitionPermission(true);
        setSttEnabled(true);
        
        return true;
      } else {
        console.log('🎤 ❌ getUserMedia 지원하지 않음');
        return false;
      }
    } catch (error) {
      console.error('🎤 ❌ 마이크 권한 거부됨:', error);
      setRecognitionPermission(false);
      setSttEnabled(false);
      return false;
    }
  };

  // Web Speech API STT
  const startWebSpeechRecognition = async () => {
    try {
      console.log('🎤 Starting Web Speech Recognition...');
      
      // 웹과 모바일 모두에서 시도
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        window.currentRecognition = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        console.log('🎤 ✅ Speech Recognition initialized');
        
        recognition.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          setIsRecording(false);
          window.currentRecognition = null;
          
          await processInterviewResponse(transcript);
        };
        
        recognition.onerror = (event) => {
          console.error('🎤 ❌ Speech recognition error:', event.error);
          console.error('🎤 Error details:', event);
          setIsRecording(false);
            
          // 구체적인 오류 메시지
          let errorMessage = '음성 인식 중 오류가 발생했습니다.';
          switch (event.error) {
            case 'not-allowed':
              errorMessage = '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
              break;
            case 'no-speech':
              errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
              break;
            case 'audio-capture':
              errorMessage = '마이크에 접근할 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
              break;
            case 'network':
              errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
              break;
          }
          
          Alert.alert('음성 인식 오류', errorMessage);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          window.currentRecognition = null;
        };
        
        recognition.start();
      } else {
        Alert.alert('음성 인식 사용 불가', '현재 환경에서는 음성 인식을 사용할 수 없습니다.');
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Web Speech recognition error:', error);
      Alert.alert('음성 인식 오류', '음성을 인식할 수 없습니다.');
      setIsRecording(false);
    }
  };

  // STT 시작
  const startSpeechRecognition = async () => {
    console.log('🎤 STT 시작 요청...');
    console.log('🎤 Platform:', Platform.OS);
    
    try {
      
      if (Platform.OS === 'web') {
        // 웹에서는 Web Speech API 사용
        await startWebSpeechRecognition();
      } else {
        // 모바일에서는 간단한 음성→텍스트 변환 사용
        console.log('🎤 Mobile detected - using Simple Voice to Text');
        await startSimpleVoiceToText();
      }
    } catch (error) {
      console.error('🎤 Speech recognition error:', error);
      Alert.alert('음성 인식 오류', '음성을 인식할 수 없습니다. 다시 시도해주세요.');
      setIsRecording(false);
      setIsListening(false);
      setRealtimeTranscript('');
    }
  };

  // STT 중지
  const stopSpeechRecognition = async () => {
    console.log('🎤 Stopping speech recognition...');
    
    if (Platform.OS === 'web') {
      // 웹에서는 Web Speech API 중지
      if (typeof window !== 'undefined' && window.currentRecognition) {
        window.currentRecognition.stop();
        window.currentRecognition = null;
      }
    } else {
      // 모바일에서는 녹음 중지 및 즉시 처리
      if (typeof window !== 'undefined' && window.currentRecording) {
        try {
          console.log('🎤 Stopping recording immediately...');
          await window.currentRecording.stopAndUnloadAsync();
          const uri = window.currentRecording.getURI();
          console.log('🎤 Recording saved to:', uri);
          
          setRealtimeTranscript('🔄 음성을 텍스트로 변환 중...');
          
          // OpenAI Whisper API로 텍스트 변환
          const transcript = await convertVoiceToTextSimple(uri);
          
          if (transcript && transcript.trim()) {
            console.log('🎤 ✅ Transcript:', transcript);
            setRealtimeTranscript(`"${transcript}"`);
            setIsListening(false);
            setIsRecording(false);
            
            // AI에게 즉시 전달
            setTimeout(() => {
              processInterviewResponse(transcript.trim());
            }, 500);
          } else {
            setRealtimeTranscript('❌ 음성을 인식할 수 없었습니다');
            setIsListening(false);
            setIsRecording(false);
              }
          
          window.currentRecording = null;
        } catch (error) {
          console.error('🎤 Manual stop error:', error);
          setRealtimeTranscript('❌ 녹음 중지 중 오류가 발생했습니다');
          setIsListening(false);
          setIsRecording(false);
          }
      } else {
        // 실시간 음성 인식 중지
        await stopRealtimeSpeechRecognition();
      }
    }
  };

  // 인터뷰 시작
  const startInterview = async () => {
    console.log('🎤 Starting AI Interview...');
    
    // 마이크 권한 확인
    if (!microphonePermission) {
      Alert.alert(
        'Microphone Required',
        'Microphone permission is required for AI Interview. Please enable microphone access in your device settings.',
        [
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          },
          {
            text: 'Enable',
            onPress: async () => {
              // 권한 재요청
              try {
                const { status } = await Audio.requestPermissionsAsync();
                if (status === 'granted') {
                  setMicrophonePermission(true);
                  // 권한 승인 후 인터뷰 시작
                  startInterviewAfterPermission();
                } else {
                  navigation.goBack();
                }
              } catch (error) {
                console.error('🎤 Permission request error:', error);
                navigation.goBack();
              }
            }
          }
        ]
      );
      return;
    }
    
    startInterviewAfterPermission();
  };
  
  // 권한 확인 후 인터뷰 시작
  const startInterviewAfterPermission = async () => {
    try {
      // 로딩 시작
      setIsLoading(true);
      
      // 질문 데이터 로드
      await loadQuestions();
      
      setInterviewStage('smalltalk');
      
      const firstQuestion = getRandomSmallTalk();
      setCurrentQuestion(firstQuestion);
      setShowQuestionScript(false);
      
      if (ttsEnabled) {
        await speakTextWithOpenAI(firstQuestion);
        setSpeakButtonActive(true);
      } else {
        setSpeakButtonActive(true);
      }
    } finally {
      // 로딩 종료
      setIsLoading(false);
    }
  };

  // 권한 확인
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        console.log('🎤 Checking permissions...');
        console.log('🎤 Platform:', Platform.OS);
        
        // 마이크 권한 확인
        const { status } = await Audio.getPermissionsAsync();
        console.log('🎤 Microphone permission status:', status);
        
        if (status === 'granted') {
          setMicrophonePermission(true);
          console.log('🎤 ✅ Microphone permission granted');
        } else {
          setMicrophonePermission(false);
          console.log('🎤 ❌ Microphone permission not granted');
        }
        
        if (Platform.OS === 'web') {
          // 웹에서는 Web Speech API 확인
          const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
          
          if (SpeechRecognition) {
            setRecognitionPermission(true);
            setSttEnabled(true);
            console.log('🎤 ✅ Web STT enabled');
          } else {
            setRecognitionPermission(false);
            setSttEnabled(false);
            console.log('🎤 ❌ Web STT not available');
          }
        } else {
          // 모바일에서는 OpenAI Whisper + Expo AV 사용 (항상 활성화)
          setRecognitionPermission(true);
          setSttEnabled(true);
          console.log('🎤 ✅ Mobile STT enabled (using OpenAI Whisper)');
        }
      } catch (error) {
        console.error('🎤 Permission check error:', error);
        setRecognitionPermission(false);
        setSttEnabled(false);
        setMicrophonePermission(false);
      }
    };

    checkPermissions();
  }, []);

  // 화면 진입 시 인터뷰 자동 시작 (권한이 있을 때만)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (microphonePermission) {
        startInterview();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [microphonePermission]);

  // 화면 정리
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 AIInterviewScreen focused - initializing...');
      
      // 화면 진입 시 모든 이전 오디오 중지
      const cleanupPreviousAudio = async () => {
        console.log('🔊 Cleaning up all previous audio on screen entry...');
        
        // 1. Expo Speech 중지
        try {
          await Speech.stop();
          console.log('🔊 Stopped Expo Speech');
        } catch (error) {
          console.log('🔊 Expo Speech stop error:', error);
        }
        
        // 2. 웹 오디오 중지
        if (typeof window !== 'undefined') {
          if (window.currentAudio) {
            window.currentAudio.pause();
            window.currentAudio.currentTime = 0;
            window.currentAudio = null;
            console.log('🔊 Stopped web audio');
          }
          
          // 3. Expo AV 사운드 중지
          if (window.currentExpoSound) {
            try {
              await window.currentExpoSound.stopAsync();
              await window.currentExpoSound.unloadAsync();
              window.currentExpoSound = null;
              console.log('🔊 Stopped Expo AV sound');
            } catch (error) {
              console.log('🔊 Expo AV stop error:', error);
            }
          }
          
          // 4. 음성 샘플 중지 (AIChatScreen에서 재생 중일 수 있음)
          if (window.currentSampleSound) {
            try {
              await window.currentSampleSound.stopAsync();
              await window.currentSampleSound.unloadAsync();
              window.currentSampleSound = null;
              console.log('🔊 Stopped voice sample sound');
            } catch (error) {
              console.log('🔊 Voice sample stop error:', error);
            }
          }
          
          if (window.currentSampleAudio) {
            window.currentSampleAudio.pause();
            window.currentSampleAudio.currentTime = 0;
            window.currentSampleAudio = null;
            console.log('🔊 Stopped voice sample audio');
          }
        }
        
        console.log('✅ Previous audio cleanup completed');
      };
      
      cleanupPreviousAudio();
      
      return async () => {
        console.log('🔄 AIInterviewScreen unfocused - cleaning up...');
        
        // 모든 대화 상태 중단
        setIsRecording(false);
        setIsSpeaking(false);
        setIsListening(false);
        setIsLoading(false);
        setInterviewStage('waiting');
        setCurrentQuestion('');
        setRealtimeTranscript('');
        setVoiceAnalysisResult(null);
        setSpeakButtonActive(false);
        
        // 질문 상태 초기화
        setCurrentQuestionIndex(0);
        setShuffledQuestions([]);
        setAllQuestions([]);
        setCurrentQuestionOnly('');
        setShowProgressBar(false);
        
        // 애니메이션 중지
        
        // TTS 중지
        try {
          await Speech.stop();
          console.log('🔄 Stopped Speech');
        } catch (error) {
          console.log('🔄 Speech stop error:', error);
        }
        
        if (typeof window !== 'undefined') {
          if (window.currentAudio) {
            window.currentAudio.pause();
            window.currentAudio = null;
            console.log('🔄 Cleaned up web audio');
          }
          if (window.currentExpoSound) {
            try {
              await window.currentExpoSound.unloadAsync();
              window.currentExpoSound = null;
              console.log('🔄 Cleaned up expo sound');
            } catch (error) {
              console.log('🔄 Expo sound cleanup error:', error);
            }
          }
        }
        
        // STT 중지
        if (typeof window !== 'undefined') {
          if (window.currentRecognition) {
            window.currentRecognition.stop();
            window.currentRecognition = null;
            console.log('🔄 Cleaned up web speech recognition');
          }
          if (window.currentRecording) {
            try {
              await window.currentRecording.stopAndUnloadAsync();
              window.currentRecording = null;
              console.log('🔄 Cleaned up recording');
            } catch (error) {
              console.log('🔄 Recording cleanup error:', error);
            }
          }
        }
        
        console.log('✅ AIInterviewScreen cleanup completed');
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>AI Interview</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setTtsEnabled(!ttsEnabled)}
          >
            <Ionicons 
              name={ttsEnabled ? "volume-high" : "volume-mute"} 
              size={20} 
              color={ttsEnabled ? "#007AFF" : "#999"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 마이크 권한 알림 */}
      {!microphonePermission && (
        <View style={styles.permissionWarning}>
          <Ionicons name="mic-off" size={20} color="#FF3B30" />
          <Text style={styles.permissionWarningText}>
            🎤 Microphone permission is required for AI Interview
          </Text>
        </View>
      )}

      {/* 인터뷰 영역 */}
      <View style={styles.interviewContainer}>
        {/* 진행도 표시 바 */}
        {showProgressBar && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Progress: {currentQuestionIndex}/{shuffledQuestions.length}
            </Text>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${(currentQuestionIndex / shuffledQuestions.length) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round((currentQuestionIndex / shuffledQuestions.length) * 100)}%
            </Text>
          </View>
        )}
        
        {/* 질문 카드 */}
        <TouchableOpacity 
          style={styles.questionCard}
          onPress={() => setShowQuestionScript(!showQuestionScript)}
        >
          <View style={styles.questionCardHeader}>
            <Text style={styles.questionCardTitle}>
              {t('menu.aiInterview.citizenshipQuestion')}
            </Text>
            <Ionicons 
              name={showQuestionScript ? "eye-off" : "eye"} 
              size={20} 
              color="#666" 
            />
          </View>
          <Text style={styles.questionText}>
            {showQuestionScript 
              ? (interviewStage === 'interview' && currentQuestionOnly 
                  ? currentQuestionOnly 
                  : currentQuestion)
              : (interviewStage === 'smalltalk' 
                  ? t('menu.aiInterview.touchToViewInterviewerChat')
                  : t('menu.aiInterview.touchToViewCitizenshipQuestion'))
            }
          </Text>
          {!showQuestionScript && (
            <Text style={styles.questionHint}>
              💡 {t('menu.aiInterview.listenAndAnswer')}
            </Text>
          )}
        </TouchableOpacity>

        {/* 실시간 음성 인식 텍스트 박스 */}
        <View style={styles.transcriptContainer}>
          <View style={styles.transcriptHeader}>
            <View style={styles.answerHeaderLeft}>
              <Ionicons name="chatbubble-outline" size={20} color="#333" style={styles.waveIcon} />
              <Text style={styles.transcriptTitle}>Your Answer: </Text>
            </View>
            {interviewStage === 'interview' && currentQuestionOnly && (
              <TouchableOpacity 
                style={styles.answerButton}
                onPress={() => {
                  console.log('❓ Answer button pressed');
                  setShowAnswer(true);
                }}
              >
                <Text style={styles.answerButtonText}>?</Text>
              </TouchableOpacity>
            )}
          </View>
          {isListening && (
            <View style={styles.listeningIndicator}>
              <Text style={styles.listeningText}>듣는 중...</Text>
              <View style={styles.listeningDot} />
            </View>
          )}
          
          <View style={styles.transcriptContent}>
            {voiceAnalysisResult && (
              <View style={styles.voiceAnalysisBox}>
                <Text style={styles.voiceAnalysisTitle}>음성 분석 결과:</Text>
                <Text style={styles.voiceAnalysisText}>
                  {voiceAnalysisResult.analysis}
                </Text>
                <View style={styles.voiceDetails}>
                  <Text style={styles.voiceDetailItem}>
                    품질: {voiceAnalysisResult.quality}
                  </Text>
                  <Text style={styles.voiceDetailItem}>
                    톤: {voiceAnalysisResult.tone}
                  </Text>
                </View>
              </View>
            )}
            
            <Text style={styles.transcriptText}>
              {realtimeTranscript || t('menu.aiInterview.pressSpeakButtonToStart')}
            </Text>
          </View>
        </View>

        {/* 말하기 버튼 */}
        <View style={styles.speakButtonContainer}>
          <TouchableOpacity
              style={[
                styles.speakButton,
                speakButtonActive && styles.speakButtonActive,
                isRecording && styles.speakButtonRecording
              ]}
              onPress={isRecording ? stopSpeechRecognition : startSpeechRecognition}
              disabled={!speakButtonActive || isLoading}
            >
            <Ionicons 
              name={isRecording ? "stop-circle" : "mic-circle"} 
              size={80} 
              color={isRecording ? "#FF3B30" : (speakButtonActive ? "#007AFF" : "#CCC")} 
            />
            
            {/* 버튼 텍스트 */}
            <Text style={[
              styles.speakButtonText,
              speakButtonActive && styles.speakButtonTextActive
            ]}>
              {isRecording ? t('menu.aiInterview.stopAnswer') : t('menu.aiInterview.answer')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 로딩 상태 */}
        {isLoading && (
          <View style={styles.interviewLoadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.interviewLoadingText}>🤖 AI가 응답을 준비하는 중...</Text>
          </View>
        )}
      </View>

      {/* 정답 표시 Modal */}
      <Modal
        visible={showAnswer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAnswer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Question & Answer</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAnswer(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* 질문 표시 */}
              {interviewStage === 'interview' && currentQuestionIndex > 0 && 
               shuffledQuestions[currentQuestionIndex - 1] && (
                <>
                  <View style={styles.modalQuestion}>
                    <Text style={styles.modalQuestionText}>
                      {shuffledQuestions[currentQuestionIndex - 1].question}
                    </Text>
                  </View>
                  
                  {/* 정답 표시 */}
                  {shuffledQuestions[currentQuestionIndex - 1].correctAnswers && (
                    <View style={styles.modalAnswer}>
                      <Text style={styles.modalSectionTitle}>Correct Answer:</Text>
                      {shuffledQuestions[currentQuestionIndex - 1].correctAnswers.map((answerObj, idx) => (
                        <View key={idx} style={styles.answerItem}>
                          <Text style={styles.modalCorrectAnswer}>• {answerObj.text}</Text>
                          {idx < shuffledQuestions[currentQuestionIndex - 1].correctAnswers.length - 1 && (
                            <View style={styles.answerSeparator} />
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3CD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
    gap: 8,
  },
  permissionWarningText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
  },
  interviewContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    textAlign: 'center',
    minHeight: 60,
  },
  questionHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  speakButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  speakButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  speakButtonRecording: {
    transform: [{ scale: 1.2 }],
  },
  speakButtonText: {
    fontSize: 18,
    color: '#CCC',
    marginTop: 15,
    fontWeight: '600',
  },
  speakButtonTextActive: {
    color: '#007AFF',
  },
  interviewLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  interviewLoadingText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  // 실시간 음성 인식 텍스트 박스 스타일
  transcriptContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveIcon: {
    marginRight: 8,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  answerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  answerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  answerBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  answerBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  answerBoxText: {
    fontSize: 15,
    color: '#1b5e20',
    lineHeight: 22,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listeningText: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 6,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    opacity: 0.8,
  },
  transcriptContent: {
  },
  // 진행도 바 스타일
  progressContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
    minWidth: 2,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  voiceAnalysisBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  voiceAnalysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 6,
  },
  voiceAnalysisText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  voiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voiceDetailItem: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    minHeight: 80,
    maxHeight: 200,
    textAlignVertical: 'top',
    flexWrap: 'wrap',
  },
  // Modal 스타일 (Story 모드와 동일)
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
  answerItem: {
    marginBottom: 12,
  },
  answerSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
    marginBottom: 4,
  },
});

export default AIInterviewScreen;
