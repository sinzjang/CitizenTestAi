import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { t } from '../utils/i18n';
// import * as SpeechRecognition from 'expo-speech-recognition';

const AIChatScreen = ({ navigation }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sttEnabled, setSttEnabled] = useState(true);
  const [recognitionPermission, setRecognitionPermission] = useState(null);
  const [aiMode, setAiMode] = useState(true); // true: GPT 온라인 모드, false: 로컬 환경 모드
  const [selectedVoice, setSelectedVoice] = useState('alloy'); // OpenAI 음성 선택
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  
  const scrollViewRef = useRef();

  // OpenAI TTS 음성 옵션 (실제 사람 이름으로 변경)
  const openaiVoices = [
    { id: 'alloy', name: 'Michael', descriptionKey: 'michael' },
    { id: 'echo', name: 'David', descriptionKey: 'david' },
    { id: 'fable', name: 'James', descriptionKey: 'james' },
    { id: 'nova', name: 'Sarah', descriptionKey: 'sarah' },
    { id: 'onyx', name: 'Robert', descriptionKey: 'robert' },
    { id: 'shimmer', name: 'Emma', descriptionKey: 'emma' }
  ];



  // ChatGPT API 설정
  const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-api-key-here';
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';





  // AI 모드 변경 알림 함수
  const announceAiModeChange = async (newAiMode) => {
    if (!ttsEnabled) return;
    
    try {
      const message = newAiMode ? 'AI Interview' : 'Regular Interview';
      await Speech.speak(message, {
        language: 'en-US',
        rate: 0.75,
        onStart: () => console.log(`🔊 AI mode changed to: ${message}`),
        onDone: () => console.log('🔊 AI mode announcement completed'),
        onError: (error) => console.error('🔊 AI mode announcement error:', error)
      });
    } catch (error) {
      console.error('🔊 AI mode announcement failed:', error);
    }
  };

  // 현재 재생 중인 샘플 중지 함수
  const stopCurrentSample = async () => {
    try {
      // 모바일 환경: Expo AV Sound 중지
      if (typeof window !== 'undefined' && window.currentSampleSound) {
        console.log('🔊 Stopping current sample sound (mobile)');
        try {
          if (window.currentSampleSound && typeof window.currentSampleSound.stopAsync === 'function') {
            await window.currentSampleSound.stopAsync();
          }
          if (window.currentSampleSound && typeof window.currentSampleSound.unloadAsync === 'function') {
            await window.currentSampleSound.unloadAsync();
          }
        } catch (soundError) {
          console.log('🔊 Sample sound cleanup error:', soundError);
        } finally {
          window.currentSampleSound = null;
        }
      }
      
      // 웹 환경: HTML Audio 중지
      if (typeof window !== 'undefined' && window.currentSampleAudio) {
        console.log('🔊 Stopping current sample audio (web)');
        try {
          if (window.currentSampleAudio && typeof window.currentSampleAudio.pause === 'function') {
            window.currentSampleAudio.pause();
            window.currentSampleAudio.currentTime = 0;
          }
        } catch (audioError) {
          console.log('🔊 Sample audio cleanup error:', audioError);
        } finally {
          window.currentSampleAudio = null;
        }
      }
      
      // Expo Speech 중지 (폴백용)
      try {
        await Speech.stop();
      } catch (speechError) {
        console.log('🔊 Speech stop error:', speechError);
      }
    } catch (error) {
      console.error('🔊 Error stopping current sample:', error);
    }
  };

  // 음성 샘플 재생 함수 (speakTextWithOpenAI와 동일한 방식 사용)
  const playVoiceSample = async (voiceId) => {
    if (!ttsEnabled) {
      Alert.alert('TTS 비활성화', 'TTS를 활성화해야 음성 샘플을 들을 수 있습니다.');
      return;
    }

    try {
      console.log(`🔊 Playing voice sample for: ${voiceId}`);
      
      // 진행 중인 음성 중지
      await stopCurrentSample();
      
      const sampleText = "Hello, I'm your interview assistant. How are you today?";
      
      // AI 모드일 때 OpenAI TTS 사용
      if (aiMode && typeof fetch !== 'undefined') {
        console.log('🔊 Attempting OpenAI TTS for voice sample with voice:', voiceId);
        
        try {
          const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'tts-1-hd',
              input: sampleText,
              voice: voiceId,
              response_format: 'mp3',
              speed: 1.0
            }),
          });

          if (!response.ok) {
            throw new Error(`TTS API error! status: ${response.status}`);
          }

          const audioBlob = await response.blob();
          
          // React Native에서 Blob을 base64로 변환하여 재생
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            console.log('🔊 Converting OpenAI audio for mobile sample playback');
            
            // FileReader를 사용하여 Blob을 base64로 변환
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const base64Audio = reader.result.split(',')[1]; // data:audio/mp3;base64, 제거
                
                // Expo AV를 사용하여 base64 오디오 재생
                const { Audio } = require('expo-av');
                await Audio.setAudioModeAsync({
                  allowsRecordingIOS: false,
                  staysActiveInBackground: false,
                  playsInSilentModeIOS: true,
                  shouldDuckAndroid: true,
                  playThroughEarpieceAndroid: false,
                });
                
                const { sound } = await Audio.Sound.createAsync(
                  { uri: `data:audio/mp3;base64,${base64Audio}` },
                  { shouldPlay: true }
                );
                
                // 전역 변수에 저장하여 중지할 수 있도록 함
                if (typeof window !== 'undefined') {
                  window.currentSampleSound = sound;
                }
                
                sound.setOnPlaybackStatusUpdate((status) => {
                  if (status.didJustFinish) {
                    console.log('🔊 ✅ Voice sample playback completed on mobile');
                    sound.unloadAsync();
                    if (typeof window !== 'undefined') {
                      window.currentSampleSound = null;
                    }
                  }
                });
                
                console.log('🔊 ✅ Voice sample started on mobile with voice:', voiceId);
              } catch (error) {
                console.error('🔊 ❌ Mobile sample playback error:', error);
                throw error; // 폴백으로 이동
              }
            };
            
            reader.readAsDataURL(audioBlob);
            return; // 성공적으로 OpenAI TTS 사용
          } else {
            // 웹 환경에서는 기존 방식 사용
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            // 전역 변수에 저장하여 중지할 수 있도록 함
            window.currentSampleAudio = audio;
            
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              window.currentSampleAudio = null;
              console.log('🔊 Voice sample playback completed on web');
            };
            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              window.currentSampleAudio = null;
            };
            
            await audio.play();
            console.log('🔊 ✅ Voice sample started on web with voice:', voiceId);
            return; // 성공적으로 OpenAI TTS 사용
          }
        } catch (error) {
          console.error('🔊 ❌ OpenAI TTS sample failed, falling back to Expo Speech:', error);
          // 폴백으로 계속 진행
        }
      }
      
      // 폴백: Expo Speech 사용 (로컬 모드이거나 OpenAI TTS 실패 시)
      console.log('🔊 Using Expo Speech fallback for voice sample');
      await Speech.speak(sampleText, {
        language: 'en-US',
        rate: 0.75,
        onStart: () => console.log('🔊 Voice sample started with Expo Speech'),
        onDone: () => console.log('🔊 Voice sample completed with Expo Speech'),
        onError: (error) => console.error('🔊 Voice sample error:', error)
      });
      
    } catch (error) {
      console.error('🔊 Voice sample playback failed:', error);
      Alert.alert('음성 샘플 오류', '음성 샘플을 재생할 수 없습니다.');
    }
  };

  // AI 모드에 따른 TTS 함수
  const speakTextWithOpenAI = async (text) => {
    console.log('🔊 speakTextWithOpenAI called');
    console.log('🔊 TTS Enabled:', ttsEnabled);
    console.log('🔊 AI Mode:', aiMode);
    console.log('🔊 Platform:', Platform.OS);
    console.log('🔊 Text to speak:', text);
    
    if (!ttsEnabled) {
      console.log('🔊 TTS is disabled, skipping speech');
      return;
    }
    
    try {
      console.log('🔊 Setting isSpeaking to true');
      setIsSpeaking(true);
      
      // GPT 모드일 때는 모든 플랫폼에서 OpenAI TTS 시도
      if (aiMode && typeof fetch !== 'undefined') {
        console.log('🔊 Attempting OpenAI TTS API for mobile with voice:', selectedVoice);
        
        try {
          const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'tts-1-hd',
              input: text,
              voice: selectedVoice,
              response_format: 'mp3',
              speed: 1.0
            }),
          });

          if (!response.ok) {
            throw new Error(`TTS API error! status: ${response.status}`);
          }

          const audioBlob = await response.blob();
          
          // React Native에서 Blob을 base64로 변환하여 재생
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            console.log('🔊 Converting OpenAI audio for mobile playback');
            
            // FileReader를 사용하여 Blob을 base64로 변환
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const base64Audio = reader.result.split(',')[1]; // data:audio/mp3;base64, 제거
                
                // Expo AV를 사용하여 base64 오디오 재생
                const { Audio } = require('expo-av');
                await Audio.setAudioModeAsync({
                  allowsRecordingIOS: false,
                  staysActiveInBackground: false,
                  playsInSilentModeIOS: true,
                  shouldDuckAndroid: true,
                  playThroughEarpieceAndroid: false,
                });
                
                const { sound } = await Audio.Sound.createAsync(
                  { uri: `data:audio/mp3;base64,${base64Audio}` },
                  { shouldPlay: true }
                );
                
                // 전역 변수에 저장하여 cleanup에서 중지할 수 있도록 함
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
                throw error; // 폴백으로 이동
              }
            };
            
            reader.readAsDataURL(audioBlob);
            return; // 성공적으로 OpenAI TTS 사용
          } else {
            // 웹 환경에서는 기존 방식 사용
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            window.currentAudio = audio;
            
            audio.onended = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              window.currentAudio = null;
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              window.currentAudio = null;
            };
            
            await audio.play();
            console.log('🔊 ✅ OpenAI TTS started on web with voice:', selectedVoice);
            return; // 성공적으로 OpenAI TTS 사용
          }
        } catch (error) {
          console.error('🔊 ❌ OpenAI TTS failed, falling back to Expo Speech:', error);
          // 폴백으로 계속 진행
        }
      }
      
      // 폴백: Expo Speech 사용 (로컬 모드이거나 OpenAI TTS 실패 시)
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        console.log('🔊 Using Expo Speech fallback for React Native environment');
        console.log('🔊 Text to speak:', text);
        
        try {
          console.log('🔊 Stopping any current speech...');
          // 먼저 현재 재생 중인 음성 중지
          await Speech.stop();
          
          console.log('🔊 Getting available voices...');
          // 사용 가능한 음성 목록 가져오기
          const voices = await Speech.getAvailableVoicesAsync();
          let selectedVoice = undefined;
          
          console.log('🔊 Total voices available:', voices.length);
          
          // 영어 음성 중에서 AI 모드에 따라 다른 음성 선택
          const englishVoices = voices.filter(voice => 
            voice.language.includes('en-US') || voice.language.includes('en_US')
          );
          
          console.log('🔊 English voices found:', englishVoices.length);
          
          if (englishVoices.length > 0) {
            if (aiMode) {
              // GPT 온라인 모드: 고급 여성 음성 (자연스럽고 전문적)
              selectedVoice = englishVoices.find(voice => 
                voice.name.toLowerCase().includes('samantha') ||
                voice.name.toLowerCase().includes('karen') ||
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman') ||
                voice.quality === 'Enhanced'
              ) || englishVoices[0];
              console.log('🔊 GPT Mode - Selected premium voice:', selectedVoice.name);
            } else {
              // 로컬 환경 모드: 기본 남성 음성 (단순하고 로봇틱)
              selectedVoice = englishVoices.find(voice => 
                voice.name.toLowerCase().includes('male') ||
                voice.name.toLowerCase().includes('man') ||
                voice.name.toLowerCase().includes('alex') ||
                voice.name.toLowerCase().includes('daniel') ||
                voice.quality === 'Default'
              ) || englishVoices[englishVoices.length - 1]; // 마지막 음성 (보통 기본 음성)
              console.log('🔊 Local Mode - Selected basic voice:', selectedVoice.name);
            }
          }
          
          console.log('🔊 Starting Speech.speak...');
          
          // AI 모드에 따른 다른 음성 설정
          const speechOptions = aiMode ? {
            // GPT 온라인 모드: 자연스럽고 표현력 있는 설정
            language: 'en-US',
            pitch: 1.1, // 약간 높은 음조 (친근함)
            rate: 0.8, // 적당한 속도 (이해하기 쉽게)
            quality: Speech.VoiceQuality.Enhanced,
            voice: selectedVoice?.identifier
          } : {
            // 로컬 환경 모드: 단조롭고 기계적인 설정
            language: 'en-US',
            pitch: 0.9, // 낮은 음조 (로봇틱)
            rate: 0.6, // 느린 속도 (기계적)
            quality: Speech.VoiceQuality.Default,
            voice: selectedVoice?.identifier
          };
          
          console.log('🔊 Speech options:', speechOptions);
          
          // 콜백 함수 추가
          speechOptions.onStart = () => {
            console.log('🔊 ✅ Speech STARTED with voice:', selectedVoice?.name || 'default');
            setIsSpeaking(true);
          };
          speechOptions.onDone = () => {
            console.log('🔊 ✅ Speech COMPLETED');
            setIsSpeaking(false);
          };
          speechOptions.onStopped = () => {
            console.log('🔊 ⏹️ Speech STOPPED');
            setIsSpeaking(false);
          };
          speechOptions.onError = (error) => {
            console.error('🔊 ❌ Speech ERROR:', error);
            setIsSpeaking(false);
          };
          
          await Speech.speak(text, speechOptions);
          console.log('🔊 Speech.speak call completed');
        } catch (error) {
          console.error('🔊 ❌ Expo Speech error:', error);
          setIsSpeaking(false);
        }
        return;
      }
    } catch (error) {
      console.error('OpenAI TTS Error:', error);
      setIsSpeaking(false);
      // Fallback to expo-speech
      try {
        console.log('Falling back to Expo Speech');
        await Speech.speak(text, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.8,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false)
        });
      } catch (fallbackError) {
        console.error('Fallback TTS Error:', fallbackError);
        setIsSpeaking(false);
      }
    }
  };

  const stopSpeaking = async () => {
    try {
      console.log('Stopping speech...');
      
      // Stop both OpenAI TTS and expo-speech
      if (typeof window !== 'undefined' && window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }
      
      // Expo Speech 중지
      await Speech.stop();
      setIsSpeaking(false);
      console.log('Speech stopped successfully');
    } catch (error) {
      console.error('Error stopping speech:', error);
      setIsSpeaking(false);
    }
  };



  // 로컬 AI 응답 함수 (오프라인 모드)
  const getLocalAIResponse = async (userMessage) => {
    // 시민권 관련 키워드 기반 응답
    const message = userMessage.toLowerCase();
    
    if (message.includes('constitution') || message.includes('헌법')) {
      return "헌법(Constitution)은 미국의 최고법입니다. 1787년에 제정되었으며, 정부의 구조와 국민의 권리를 정의합니다.";
    }
    
    if (message.includes('president') || message.includes('대통령')) {
      return "현재 미국 대통령은 조 바이든(Joe Biden)입니다. 대통령은 행정부의 수장이며 4년 임기로 선출됩니다.";
    }
    
    if (message.includes('bill of rights') || message.includes('권리장전')) {
      return "권리장전(Bill of Rights)은 헌법의 첫 10개 수정조항입니다. 언론의 자유, 종교의 자유 등 기본권을 보장합니다.";
    }
    
    if (message.includes('independence') || message.includes('독립')) {
      return "미국은 1776년 7월 4일에 독립선언서를 채택하여 영국으로부터 독립했습니다.";
    }
    
    if (message.includes('hello') || message.includes('안녕') || message.includes('hi')) {
      return "안녕하세요! 저는 로컬 AI 어시스턴트입니다. 미국 시민권 면접 준비를 도와드릴 수 있습니다. 헌법, 역사, 정부에 대해 질문해보세요!";
    }
    
    // 기본 응답
    return "죄송합니다. 로컬 환경에서는 제한된 정보만 제공할 수 있습니다. 더 자세한 답변을 원하시면 상단의 AI 토글을 켜서 GPT 온라인 모드를 사용해주세요.";
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
    checkSpeechRecognitionAvailability();
    checkTTSAvailability();
  }, []);

  // TTS 사용 가능성 확인
  const checkTTSAvailability = async () => {
    try {
      // 사용 가능한 음성 목록 확인
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', voices.length);
      
      // 영어 음성 찾기
      const englishVoices = voices.filter(voice => 
        voice.language.startsWith('en') || voice.language.includes('US')
      );
      console.log('English voices found:', englishVoices.length);
      
      if (englishVoices.length > 0) {
        console.log('First English voice:', englishVoices[0]);
      }
      
      // TTS 테스트 - AI 모드에 따라 메시지 변경
      console.log('Testing TTS...');
      const testMessage = aiMode ? 'AI Interview' : 'Regular Interview';
      await Speech.speak(testMessage, {
        language: 'en-US',
        rate: 0.75,
        onStart: () => console.log('TTS test started'),
        onDone: () => console.log('TTS test completed'),
        onError: (error) => console.error('TTS test error:', error)
      });
      
    } catch (error) {
      console.error('TTS availability check error:', error);
    }
  };

  // STT 사용 가능성 확인
  const checkSpeechRecognitionAvailability = async () => {
    try {
      // Web Speech API 확인 (웹 환경에서)
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        setRecognitionPermission(true);
        setSttEnabled(true);
      } else {
        // 네이티브 환경에서는 일단 비활성화
        setRecognitionPermission(false);
        setSttEnabled(false);
        console.log('Speech recognition not available in this environment');
      }
    } catch (error) {
      console.error('Speech recognition check error:', error);
      setRecognitionPermission(false);
      setSttEnabled(false);
    }
  };

  // OpenAI Whisper STT API 함수 (React Native 호환)
  const startSpeechRecognitionWithOpenAI = async () => {
    if (!sttEnabled) {
      Alert.alert('음성 인식 비활성화', '음성 인식이 비활성화되어 있습니다.');
      return;
    }

    try {
      setIsRecording(true);
      
      // React Native 환경에서는 바로 Web Speech API 사용
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        console.log('Using Web Speech API fallback for React Native environment');
        startWebSpeechRecognition();
        return;
      }
      
      // 웹 환경에서만 MediaRecorder + OpenAI Whisper API 시도
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        window.currentMediaRecorder = mediaRecorder;
        const audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          
          try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.wav');
            formData.append('model', 'whisper-1');
            formData.append('language', 'en');
            
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
              },
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`Whisper API error! status: ${response.status}`);
            }

            const data = await response.json();
            setInputText(data.text);
            
          } catch (error) {
            console.error('OpenAI Whisper Error:', error);
            Alert.alert('음성 인식 오류', 'OpenAI 음성 인식에 실패했습니다. Web Speech API로 재시도합니다.');
            startWebSpeechRecognition();
          } finally {
            setIsRecording(false);
            stream.getTracks().forEach(track => track.stop());
            window.currentMediaRecorder = null;
          }
        };
        
        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 5000);
      } else {
        throw new Error('MediaRecorder not available');
      }
      
    } catch (error) {
      console.error('Media recording error:', error);
      console.log('Falling back to Web Speech API');
      setIsRecording(false);
      startWebSpeechRecognition();
    }
  };

  // Web Speech API 폴백 함수
  const startWebSpeechRecognition = async () => {
    try {
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        window.currentRecognition = recognition; // 전역 저장으로 중지 가능하게
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          setIsRecording(false);
          window.currentRecognition = null;
          setInputText(transcript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          Alert.alert('음성 인식 오류', '음성을 인식할 수 없습니다. 다시 시도해주세요.');
          setIsRecording(false);
          window.currentRecognition = null;
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

  // 메인 STT 함수 (OpenAI 우선, Web Speech API 폴백)
  const startSpeechRecognition = async () => {
    startSpeechRecognitionWithOpenAI();
  };

  // STT 중지
  const stopSpeechRecognition = async () => {
    try {
      setIsRecording(false);
      // MediaRecorder 중지 (OpenAI Whisper용)
      if (window.currentMediaRecorder && window.currentMediaRecorder.state === 'recording') {
        window.currentMediaRecorder.stop();
      }
      // Web Speech API 중지 (폴백용)
      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
    } catch (error) {
      console.error('Stop speech recognition error:', error);
      setIsRecording(false);
    }
  };



  const testChatGPTConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('ChatGPT API에 연결 중...');
    
    try {
      const testMessages = [
        {
          role: 'user',
          content: 'Hello, can you respond with "API connection successful"?'
        }
      ];
      
      const text = await callChatGPT(testMessages);
      
      if (text) {
        setIsConnected(true);
        setConnectionStatus('');
        console.log('ChatGPT API Response:', text);
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('❌ ChatGPT API 연결 실패');
      console.error('Connection test failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const startChat = async () => {
    if (!isConnected) {
      Alert.alert('연결 오류', 'ChatGPT API에 먼저 연결해주세요.');
      return;
    }

    setChatStarted(true);
    setIsLoading(true);
    
    // 시스템 메시지와 초기 메시지 설정
    const initialMessages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant for U.S. citizenship interview preparation. You can help with civics questions, interview practice, and general citizenship information. Be professional but friendly. You can conduct mock interviews or answer specific questions about the citizenship process.'
      },
      {
        role: 'user',
        content: 'Hello! I need help preparing for my U.S. citizenship interview. Can you help me?'
      }
    ];

    try {
      let text;
      
      if (aiMode) {
        // GPT 온라인 모드
        console.log('🤖 Using GPT Online Mode');
        text = await callChatGPT(initialMessages);
        
        // 대화 기록에 추가
        const newHistory = [
          ...initialMessages,
          {
            role: 'assistant',
            content: text
          }
        ];
        setConversationHistory(newHistory);
      } else {
        // 로컬 환경 모드
        console.log('💻 Using Local Environment Mode');
        text = await getLocalAIResponse('Hello! I need help preparing for my U.S. citizenship interview. Can you help me?');
        
        // 로컬 모드에서는 간단한 대화 기록만 유지
        setConversationHistory([
          {
            role: 'user',
            content: 'Hello! I need help preparing for my U.S. citizenship interview. Can you help me?'
          },
          {
            role: 'assistant',
            content: text
          }
        ]);
      }
      
      // 채팅 메시지에 추가 (UI용)
      const welcomeMessage = {
        id: Date.now(),
        text: text,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      
      // OpenAI TTS로 응답 읽기
      console.log('📢 About to call TTS for welcome message');
      console.log('📢 TTS Enabled:', ttsEnabled);
      console.log('📢 Welcome text length:', text.length);
      if (ttsEnabled) {
        console.log('📢 Calling speakTextWithOpenAI for welcome message');
        await speakTextWithOpenAI(text);
      } else {
        console.log('📢 TTS is disabled, skipping welcome message speech');
      }
    } catch (error) {
      Alert.alert('오류', t('menu.aiChat.errors.cannotStartChat') + ': ' + error.message);
      setChatStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    // 사용자 메시지를 채팅에 추가
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      let text;
      
      if (aiMode) {
        // GPT 온라인 모드
        console.log('🤖 Using GPT Online Mode for user message');
        
        // 기존 대화 기록에 사용자 메시지 추가
        const updatedHistory = [
          ...conversationHistory,
          {
            role: 'user',
            content: currentInput
          }
        ];
        
        text = await callChatGPT(updatedHistory);
        
        // 대화 기록에 AI 응답 추가
        const finalHistory = [
          ...updatedHistory,
          {
            role: 'assistant',
            content: text
          }
        ];
        setConversationHistory(finalHistory);
      } else {
        // 로컬 환경 모드
        console.log('💻 Using Local Environment Mode for user message');
        text = await getLocalAIResponse(currentInput);
        
        // 로컬 모드에서는 간단한 대화 기록만 유지
        const updatedHistory = [
          ...conversationHistory,
          {
            role: 'user',
            content: currentInput
          },
          {
            role: 'assistant',
            content: text
          }
        ];
        setConversationHistory(updatedHistory);
      }
      
      // AI 응답을 채팅에 추가
      const aiMessage = {
        id: Date.now() + 1,
        text: text,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // OpenAI TTS로 응답 읽기
      console.log('📢 About to call TTS for user message response');
      console.log('📢 TTS Enabled:', ttsEnabled);
      console.log('📢 Response text length:', text.length);
      if (ttsEnabled) {
        console.log('📢 Calling speakTextWithOpenAI for user message response');
        await speakTextWithOpenAI(text);
      } else {
        console.log('📢 TTS is disabled, skipping user message response speech');
      }
    } catch (error) {
      Alert.alert('오류', 'AI 응답을 받을 수 없습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  // 화면 포커스 관리 - 화면을 벗어날 때 모든 음성 작동 중지 및 초기화
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 AIChatScreen focused - initializing...');
      
      // 화면을 벗어날 때 실행되는 cleanup 함수
      return () => {
        console.log('🔄 AIChatScreen unfocused - cleaning up all audio...');
        
        // 1. 모든 TTS 중지
        if (isSpeaking) {
          console.log('🔊 Stopping all TTS due to screen navigation...');
          
          // Expo Speech 중지
          Speech.stop();
          
          // Expo AV 오디오 중지 (OpenAI TTS 모바일 재생)
          if (typeof window !== 'undefined' && window.currentExpoSound) {
            console.log('🔊 Stopping Expo AV sound...');
            window.currentExpoSound.unloadAsync().catch(console.error);
            window.currentExpoSound = null;
          }
          
          setIsSpeaking(false);
        }
        
        // 2. 모든 STT 중지
        if (isRecording) {
          console.log('🎤 Stopping STT due to screen navigation...');
          if (typeof window !== 'undefined' && window.currentRecognition) {
            window.currentRecognition.stop();
            window.currentRecognition = null;
          }
          if (window.mediaRecorder && window.mediaRecorder.state === 'recording') {
            window.mediaRecorder.stop();
            window.mediaRecorder = null;
          }
          setIsRecording(false);
        }
        
        // 3. 전역 오디오 객체 정리 (웹 OpenAI TTS)
        if (typeof window !== 'undefined') {
          if (window.currentAudio) {
            console.log('🔊 Stopping web audio due to screen navigation...');
            window.currentAudio.pause();
            window.currentAudio.currentTime = 0;
            window.currentAudio = null;
          }
        }
        
        // 4. 음성 샘플 재생 중지
        console.log('🔊 Stopping voice samples due to screen navigation...');
        stopCurrentSample();
        
        // 4. 로딩 상태 초기화
        setIsLoading(false);
        
        console.log('✅ Audio cleanup completed');
      };
    }, [isSpeaking, isRecording])
  );

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.aiText
          ]}
        >
          {message.text}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('menu.aiChat.title')}</Text>
        
        <View style={styles.headerButtons}>
          {/* AI 모드 토글 */}
          <View style={styles.aiModeContainer}>
            <Text style={styles.aiModeLabel}>AI</Text>
            <TouchableOpacity
              style={[
                styles.aiModeToggle,
                aiMode ? styles.aiModeToggleOn : styles.aiModeToggleOff
              ]}
              onPress={() => {
                const newMode = !aiMode;
                setAiMode(newMode);
                announceAiModeChange(newMode);
              }}
            >
              <View style={[
                styles.aiModeIndicator,
                aiMode ? styles.aiModeIndicatorOn : styles.aiModeIndicatorOff
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerButton}>
            <Ionicons 
              name="mic" 
              size={20} 
              color="#007AFF" 
            />
          </View>
          
          <View style={styles.headerButton}>
            <Ionicons 
              name="volume-high" 
              size={20} 
              color="#007AFF" 
            />
          </View>
          

        </View>
      </View>

      {/* 메인 컨텐츠 영역 - 비율 기반 레이아웃 */}
      {!chatStarted && (
        <View style={styles.mainContentContainer}>
          {/* 연결 상태 */}
          <View style={styles.connectionStatusContainer}>
            <Text style={styles.statusText}>{connectionStatus}</Text>
            {isConnecting && <ActivityIndicator size="small" color="#007AFF" />}
          </View>
          
          {/* Instructions 영역 - 상단 3/5 */}
          <View style={styles.instructionSection}>
            <View style={styles.instructionContainer}>
              <View style={styles.instructionHeader}>
                <Ionicons name="information-circle" size={20} color="#666" />
                <Text style={styles.instructionTitle}>{t('menu.aiChat.instructions.title')}</Text>
              </View>
              
              <ScrollView 
                style={styles.instructionScrollView}
                contentContainerStyle={styles.instructionScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.instructionContent}>
                  {/* AI Interview 모드 설명 */}
                  <View style={styles.modeSection}>
                    <Text style={styles.modeSectionTitle}>{t('menu.aiChat.instructions.aiModeTitle')}</Text>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.aiModeDesc1')}</Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.aiModeDesc2')}</Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.aiModeDesc3')}</Text>
                    </View>
                  </View>

                  {/* Regular Interview 모드 설명 */}
                  <View style={styles.modeSection}>
                    <Text style={styles.modeSectionTitle}>{t('menu.aiChat.instructions.regularModeTitle')}</Text>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.regularModeDesc1')}</Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.regularModeDesc2')}</Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.regularModeDesc3')}</Text>
                    </View>
                  </View>

                  {/* 공통 사용법 */}
                  <View style={styles.modeSection}>
                    <Text style={styles.modeSectionTitle}>{t('menu.aiChat.instructions.howToUseTitle')}</Text>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.howToUseDesc1')}</Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.howToUseDesc2')}</Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Text style={styles.instructionBullet}>•</Text>
                      <Text style={styles.instructionText}>{t('menu.aiChat.instructions.howToUseDesc3')}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Voice Selection 영역 - 고정 높이 */}
          <View style={styles.voiceSection}>
            <View style={styles.voiceSelectionContainer}>
              <View style={styles.voiceSelectionHeader}>
                <Ionicons name="mic" size={20} color="#666" />
                <Text style={styles.voiceSelectionTitle}>{t('menu.aiChat.voiceSelection.title')}</Text>
              </View>
              
              <ScrollView 
                horizontal 
                style={styles.voiceOptionsScrollView}
                contentContainerStyle={styles.voiceOptionsContainer}
                showsHorizontalScrollIndicator={false}
              >
                {openaiVoices.map((voice) => (
                  <TouchableOpacity
                    key={voice.id}
                    style={[
                      styles.voiceCard,
                      styles.voiceOption,
                      selectedVoice === voice.id && styles.voiceOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedVoice(voice.id);
                      playVoiceSample(voice.id); // 자동 샘플 재생
                    }}
                  >
                    <View style={styles.voiceInfo}>
                      <Text style={[
                        styles.voiceName,
                        selectedVoice === voice.id && styles.voiceNameSelected
                      ]}>
                        {voice.name}
                      </Text>
                      <Text style={[
                        styles.voiceDescription,
                        selectedVoice === voice.id && styles.voiceDescriptionSelected
                      ]}>
                        {t(`menu.aiChat.voiceSelection.voices.${voice.descriptionKey}`)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {/* 버튼 영역 - 항상 표시 */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={aiMode ? () => {
            // 음성 샘플 재생 중지
            stopCurrentSample();
            // 선택된 음성과 함께 AI Interview로 이동
            navigation.navigate('AIInterview', { selectedVoice: selectedVoice });
          } : startChat}
          disabled={isLoading || chatStarted || (aiMode && !isConnected)}
        >
          <Text style={styles.startButtonText}>
            {aiMode ? t('menu.aiChat.buttons.startAiInterview') : t('menu.aiChat.buttons.startLocalChat')}
          </Text>
        </TouchableOpacity>
      </View>



      {/* 채팅 영역 */}
      {chatStarted && (
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>ChatGPT가 응답하는 중...</Text>
                <Text style={styles.loadingSubtext}>GPT-3.5-turbo 모델 사용</Text>
              </View>
            )}
          </ScrollView>

          {/* 입력 영역 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="메시지를 입력하거나 음성 버튼을 누르세요..."
              multiline
              maxLength={500}
              editable={!isLoading && !isRecording}
            />
            
            {/* 음성 입력 버튼 */}
            {sttEnabled && recognitionPermission && (
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isRecording && styles.micButtonRecording
                ]}
                onPress={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                disabled={isLoading}
              >
                <Ionicons 
                  name={isRecording ? "stop" : "mic"} 
                  size={20} 
                  color={isRecording ? "#FF3B30" : "#007AFF"} 
                />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={(!inputText.trim() || isLoading) ? "#999" : "#007AFF"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* TTS 상태 표시 */}
      {isSpeaking && (
        <View style={styles.speakingIndicator}>
          <Ionicons name="volume-high" size={16} color="#007AFF" />
          <Text style={styles.speakingText}>
            {Platform.OS === 'web' ? 'OpenAI TTS로 음성 재생 중...' : 'Expo Speech로 음성 재생 중...'}
          </Text>
          <TouchableOpacity onPress={stopSpeaking}>
            <Text style={styles.stopText}>중지</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STT 상태 표시 */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>
            {Platform.OS === 'web' ? 'OpenAI Whisper로 음성 인식 중...' : 'Web Speech API로 음성 인식 중...'}
          </Text>
          <TouchableOpacity onPress={stopSpeechRecognition}>
            <Text style={styles.stopText}>중지</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 음성 선택 모달 */}
      <Modal
        visible={showVoiceSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVoiceSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voiceSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎤 OpenAI 음성 선택</Text>
              <TouchableOpacity
                onPress={() => setShowVoiceSelector(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              chat.openai.com과 동일한 고품질 AI 음성을 선택하세요
            </Text>
            
            <ScrollView style={styles.voiceList}>
              {openaiVoices.map((voice) => (
                <TouchableOpacity
                  key={voice.id}
                  style={[
                    styles.voiceOption,
                    selectedVoice === voice.id && styles.voiceOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedVoice(voice.id);
                    setShowVoiceSelector(false);
                  }}
                >
                  <View style={styles.voiceInfo}>
                    <Text style={[
                      styles.voiceName,
                      selectedVoice === voice.id && styles.voiceNameSelected
                    ]}>
                      {voice.name}
                    </Text>
                    <Text style={[
                      styles.voiceDescription,
                      selectedVoice === voice.id && styles.voiceDescriptionSelected
                    ]}>
                      {voice.description}
                    </Text>
                  </View>
                  {selectedVoice === voice.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Text style={styles.modalNote}>
                💡 음성 변경은 다음 메시지부터 적용됩니다
              </Text>
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
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    padding: 5,
  },
  aiModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiModeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  aiModeToggle: {
    width: 40,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  aiModeToggleOn: {
    backgroundColor: '#34C759', // 초록색 - GPT 온라인 모드
  },
  aiModeToggleOff: {
    backgroundColor: '#8E8E93', // 회색 - 로컬 환경 모드
  },
  aiModeIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  aiModeIndicatorOn: {
    alignSelf: 'flex-end', // 오른쪽으로 이동
  },
  aiModeIndicatorOff: {
    alignSelf: 'flex-start', // 왼쪽으로 이동
  },
  statusScrollContainer: {
    flex: 1,
    maxHeight: 400, // 최대 높이 제한으로 스크롤 가능하게
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    minHeight: 100,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  techStackContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '90%',
    maxWidth: 350,
  },
  techStackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  techLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 5,
  },
  techValue: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    flexWrap: 'wrap',
  },
  onlineStatus: {
    color: '#34C759', // 초록색 - 온라인
    fontWeight: 'bold',
  },
  offlineStatus: {
    color: '#FF9500', // 주황색 - 오프라인
    fontWeight: 'bold',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40, // 좌우 패딩 증가
    paddingVertical: 12, // 상하 패딩 감소
    borderRadius: 25,
    alignSelf: 'center', // 중앙 정렬
    minWidth: 200, // 최소 너비 설정
    maxWidth: 280, // 최대 너비 제한
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 5,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  micButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  micButtonRecording: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF3B30',
  },
  speakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#e3f2fd',
    gap: 10,
  },
  speakingText: {
    fontSize: 14,
    color: '#007AFF',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFE5E5',
    gap: 10,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  stopText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceSelectorModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  voiceList: {
    maxHeight: 300,
  },
  voiceOption: {
    flex: 1, // 부모 컨테이너의 크기에 맞춤
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    justifyContent: 'center', // 세로 가운데 정렬
    alignItems: 'center', // 가로 가운데 정렬
  },
  voiceOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 15, // 크기 증가
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center', // 가운데 정렬
    marginBottom: 4,
  },
  voiceNameSelected: {
    color: '#007AFF',
  },
  voiceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center', // 가운데 정렬
    lineHeight: 16,
  },
  voiceDescriptionSelected: {
    color: '#0056b3',
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // 메인 컨텐츠 컨테이너 - 고정 하단 버튼 레이아웃
  mainContentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  voiceOptionsContainer: {
    paddingHorizontal: 20, // 좌우 패딩 증가
    paddingVertical: 10,
    gap: 12, // 간격 증가
  },
  connectionStatusContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  
  // Instructions 영역 - 나머지 공간 모두 사용
  instructionSection: {
    flex: 1, // 나머지 공간 모두 사용
    paddingHorizontal: 0, // Full width
  },
  instructionContainer: {
    backgroundColor: '#fff',
    borderRadius: 0, // Full width
    marginHorizontal: 0, // Full width
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionScrollView: {
    flex: 1,
  },
  instructionScrollContent: {
    padding: 15,
  },
  instructionContent: {
    gap: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  instructionBullet: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  instructionText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  
  // 모드 섹션 스타일
  modeSection: {
    marginBottom: 20,
  },
  modeSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  
  // 버튼 영역 - 하단 고정
  buttonSection: {
    height: 130, // 높이 증가 (100 → 130)
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20, // 상하 패딩 추가
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  
  // Voice Selection 영역 - 고정 높이
  voiceSection: {
    height: 160, // 높이 증가 (120 → 160)
    paddingHorizontal: 0, // Full width
  },
  voiceSelectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 0, // Full width
    marginHorizontal: 0, // Full width
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
  },
  voiceSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  voiceSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  voiceOptions: {
    gap: 10,
  },
  voiceOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  // Radial 버튼 및 Sample 버튼 제거 - 더 이상 사용하지 않음
  voiceInfo: {
    alignItems: 'center', // 가운데 정렬
    justifyContent: 'center',
  },
});

export default AIChatScreen;
