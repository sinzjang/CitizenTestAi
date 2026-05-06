import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, AppState } from 'react-native';
import { Audio } from 'expo-av';
import { theme } from './styles/theme';
import { NotificationManager } from './utils/notificationManager';
import LoadingScreen from './screens/LoadingScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import InterviewPracticeScreen from './screens/InterviewPracticeScreen';
import ListView from './screens/ListView';
import StoryMode from './screens/StoryMode';
import FlashcardMode from './screens/FlashcardMode';
import FlashcardModeSelection from './screens/FlashcardModeSelection';
import FlashcardSubjectiveMode from './screens/FlashcardSubjectiveMode';
import AllQuestionsScreen from './screens/AllQuestionsScreen';
import AIMockInterviewScreen from './screens/AIMockInterviewScreen';
import AIChatScreen from './screens/AIChatScreen';
import AIInterviewScreen from './screens/AIInterviewScreen';
import PracticeTestScreen from './screens/PracticeTestScreen';
import PracticeTestVoiceScreen from './screens/PracticeTestVoiceScreen';
import WeaknessTestScreen from './screens/WeaknessTestScreen';
import MyProgressScreen from './screens/MyProgressScreen';
import AudioMode from './screens/AudioMode';
import DeepDiveInterview from './screens/DeepDiveInterview';
import N400PracticeScreen from './screens/N400PracticeScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import StudyCalendarScreen from './screens/StudyCalendarScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import AdminScreen from './screens/AdminScreen';
import AnalyticsDashboardScreen from './screens/AnalyticsDashboardScreen';
import AboutSourcesScreen from './screens/AboutSourcesScreen';
import mobileAds from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';
import { SubscriptionManager } from './utils/subscriptionManager';
import AdBanner from './components/AdBanner';
import { useInterstitialAd } from './components/AdInterstitial';

const Stack = createStackNavigator();

export default function App() {
  const { showAd } = useInterstitialAd();

  useEffect(() => {
    // 전역 에러 핸들러 설정
    const errorHandler = (error, isFatal) => {
      console.error('[App] 전역 에러 발생:', error, 'isFatal:', isFatal);
      // 프로덕션에서는 에러 리포팅 서비스로 전송
    };
    
    // 마이크 권한 요청
    const requestMicrophonePermission = async () => {
      try {
        console.log('[App] 마이크 권한 요청 중...');
        const { status } = await Audio.requestPermissionsAsync();
        if (status === 'granted') {
          console.log('[App] 마이크 권한 승인됨');
        } else {
          console.log('[App] 마이크 권한 거부됨');
        }
      } catch (error) {
        console.error('[App] 마이크 권한 요청 실패:', error);
      }
    };

    // 알림 권한 요청
    const requestNotificationPermission = async () => {
      try {
        console.log('[App] 알림 권한 요청 중...');
        const granted = await NotificationManager.requestPermissions();
        if (granted) {
          console.log('[App] 알림 권한 승인됨');
        } else {
          console.log('[App] 알림 권한 거부됨 또는 사용 불가');
        }
      } catch (error) {
        console.error('[App] 알림 권한 요청 실패:', error);
      }
    };

    requestMicrophonePermission();
    requestNotificationPermission();

    // 환경변수 확인하여 광고 기능 제어
    const enableAds = Constants.expoConfig?.extra?.enableAds || process.env.ENABLE_ADS === 'true' || __DEV__;
    
    // RevenueCat 초기화 (안전하게)
    const initializeRevenueCat = async () => {
      try {
        await SubscriptionManager.initialize();
        console.log('[App] RevenueCat 초기화 완료');
      } catch (error) {
        console.error('[App] RevenueCat 초기화 실패:', error);
        // 초기화 실패해도 앱은 계속 실행
      }
    };
    
    initializeRevenueCat();
    
    // AdMob 초기화 (안전하게)
    if (enableAds) {
      console.log('[App] 광고 기능 활성화됨');
      const initializeAdMob = async () => {
        try {
          const adapterStatuses = await mobileAds().initialize();
          console.log('[App] AdMob 초기화 완료:', adapterStatuses);
        } catch (error) {
          console.error('[App] AdMob 초기화 실패:', error);
          // 초기화 실패해도 앱은 계속 실행
        }
      };
      initializeAdMob();
    } else {
      console.log('[App] 광고 기능 비활성화됨');
    }

    // 앱 상태 변경 리스너 (백그라운드 진입 시 광고 표시)
    const handleAppStateChange = async (nextAppState) => {
      try {
        if (nextAppState === 'background') {
          console.log('[App] 앱이 백그라운드로 이동 - 광고 표시 시도');
          await showAd('app_exit');
        }
      } catch (error) {
        console.error('[App] 앱 상태 변경 처리 중 에러:', error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      try {
        subscription?.remove();
      } catch (error) {
        console.error('[App] 리스너 제거 중 에러:', error);
      }
    };
  }, [showAd]);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor={theme.colors.background} />
          <Stack.Navigator 
            initialRouteName="Loading"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="MainMenu" component={MainMenuScreen} />
            <Stack.Screen name="Resources" component={ResourcesScreen} />
            <Stack.Screen name="AboutSources" component={AboutSourcesScreen} />
            <Stack.Screen name="StudyCalendar" component={StudyCalendarScreen} />
            <Stack.Screen name="InterviewPractice" component={InterviewPracticeScreen} />
            <Stack.Screen name="ListView" component={ListView} />
            <Stack.Screen name="StoryMode" component={StoryMode} />
            <Stack.Screen name="FlashcardMode" component={FlashcardMode} />
            <Stack.Screen name="FlashcardModeSelection" component={FlashcardModeSelection} />
            <Stack.Screen name="FlashcardSubjectiveMode" component={FlashcardSubjectiveMode} />
            <Stack.Screen name="AllQuestions" component={AllQuestionsScreen} />
            <Stack.Screen name="AIMockInterview" component={AIMockInterviewScreen} />
            <Stack.Screen name="AIChat" component={AIChatScreen} />
            <Stack.Screen name="AIInterview" component={AIInterviewScreen} />
            <Stack.Screen name="PracticeTest" component={PracticeTestScreen} />
            <Stack.Screen name="PracticeTestVoice" component={PracticeTestVoiceScreen} />
            <Stack.Screen name="WeaknessTest" component={WeaknessTestScreen} />
            <Stack.Screen name="MyProgress" component={MyProgressScreen} />
            <Stack.Screen name="AudioMode" component={AudioMode} />
            <Stack.Screen name="DeepInterview" component={DeepDiveInterview} />
            <Stack.Screen name="N400Practice" component={N400PracticeScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        
        {/* 하단 고정 광고 영역 */}
        <AdBanner />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
