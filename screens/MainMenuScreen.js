import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../styles/theme';
import LanguageSelectionModal from '../components/LanguageSelectionModal';
import InterviewDateModal from '../components/InterviewDateModal';
import AdBanner from '../components/AdBanner';
import { useInterstitialAd } from '../components/AdInterstitial';
import AdFrequencyManager from '../utils/AdFrequencyManager';
import i18n, { t, getCurrentLanguage, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';
// import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const MainMenuScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showInterviewDateModal, setShowInterviewDateModal] = useState(false);
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  // Interstitial 광고 훅
  const { showAd } = useInterstitialAd();

  useEffect(() => {
    initializeApp();
  }, []);

  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      console.log('MainMenuScreen 언어 변경 감지:', newLanguage);
      setCurrentLanguage(newLanguage);
    };
    
    addLanguageChangeListener(handleLanguageChange);
    
    return () => {
      removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  // 현재 언어 상태 로깅
  useEffect(() => {
    console.log('MainMenuScreen currentLanguage 상태 변경:', currentLanguage);
  }, [currentLanguage]);

  const initializeApp = async () => {
    try {
      // 새 세션 시작
      await AdFrequencyManager.startNewSession();
      
      // i18n 초기화
      await i18n.initialize();
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
      setIsI18nReady(true);

      // AdMob 초기화
      try {
        await mobileAds().initialize();
        // 개발 중에는 테스트 기기 등록(선택)
        // await mobileAds().setRequestConfiguration({ testDeviceIdentifiers: ['EMULATOR'] });
      } catch (adsErr) {
        console.warn('AdMob 초기화 경고:', adsErr);
      }
      
      // 첫 실행 시 언어 선택 모달 표시
      // 실제로는 AsyncStorage에서 '언어 선택 완료' 플래그를 확인해야 함
      checkFirstLaunch();
    } catch (error) {
      console.error('앱 초기화 오류:', error);
      setIsI18nReady(true); // 오류가 있어도 앱은 실행
    }
  };

  const checkFirstLaunch = async () => {
    try {
      // AsyncStorage에서 언어 선택 완료 플래그 확인
      const languageSelected = await AsyncStorage.getItem('@language_selected');
      const savedLanguage = await AsyncStorage.getItem('@user_language');
      
      console.log('언어 선택 완료 플래그:', languageSelected);
      console.log('저장된 언어:', savedLanguage);
      
      // 언어가 선택되지 않았거나 저장된 언어가 없으면 모달 표시
      if (!languageSelected || !savedLanguage) {
        console.log('첫 실행 - 언어 선택 모달 표시');
        setShowLanguageModal(true);
      } else {
        console.log('이미 언어 선택 완료 - 모달 표시하지 않음');
      }
    } catch (error) {
      console.error('첫 실행 확인 오류:', error);
      // 오류 발생 시 안전하게 모달 표시
      setShowLanguageModal(true);
    }
  };

  const handleLanguageSelected = async (languageCode) => {
    try {
      setCurrentLanguage(languageCode);
      setShowLanguageModal(false);
      
      // 언어 선택 완료 플래그 저장
      await AsyncStorage.setItem('@language_selected', 'true');
      await AsyncStorage.setItem('@user_language', languageCode);
      
      console.log('언어 선택 완료 및 저장:', languageCode);
      
      // 인터뷰 날짜 설정 여부 확인
      const interviewDateSet = await AsyncStorage.getItem('@interview_date_set');
      if (!interviewDateSet) {
        // 인터뷰 날짜 모달 표시
        setTimeout(() => {
          setShowInterviewDateModal(true);
        }, 300);
      }
    } catch (error) {
      console.error('언어 설정 저장 오류:', error);
      setShowLanguageModal(false); // 오류가 있어도 모달은 닫기
    }
  };

  const handleInterviewDateSet = async (dateString) => {
    try {
      await AsyncStorage.setItem('@interview_date', dateString);
      await AsyncStorage.setItem('@interview_date_set', 'true');
      setShowInterviewDateModal(false);
    } catch (error) {
      console.error('인터뷰 날짜 저장 오류:', error);
    }
  };

  const handleInterviewDateSkip = async () => {
    try {
      await AsyncStorage.setItem('@interview_date_set', 'true');
      setShowInterviewDateModal(false);
      console.log('인터뷰 날짜 건너뛰기');
    } catch (error) {
      console.error('인터뷰 날짜 건너뛰기 오류:', error);
      setShowInterviewDateModal(false);
    }
  };

  const handleResources = () => {
    console.log('Resources pressed');
    navigation.navigate('Resources');
  };

  const handleInterviewPractice = async () => {
    console.log('Interview Practice pressed');
    
    // Interstitial 광고 표시 시도
    const adShown = await showAd('interview_practice');
    if (adShown) {
      console.log('Interview Practice 광고 표시됨');
      // 광고가 닫힌 후 네비게이션은 AdInterstitial의 CLOSED 이벤트에서 처리
      setTimeout(() => {
        navigation.navigate('InterviewPractice');
      }, 500);
    } else {
      // 광고가 표시되지 않으면 바로 이동
      navigation.navigate('InterviewPractice');
    }
  };

  // i18n이 준비되지 않았으면 로딩 화면
  if (!isI18nReady) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{i18n.t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']} key={currentLanguage}>
      <StatusBar barStyle="dark-content" />
      {/* Top Section with Image and Title */}
      <View style={styles.titleContainer}>
        <Image
          source={require('../assets/imgs/Front_Img.png')}
          style={styles.mainImage}
          resizeMode="contain"
        />
        <Text style={styles.appTitle}>{i18n.t('app.title')}</Text>
        <Text style={styles.appSubtitle}>{i18n.t('app.subtitle')}</Text>
        {__DEV__ && (
          <Text style={styles.devBadge}>(Dev Mode)</Text>
        )}
      </View>

      {/* Bottom 1/4 Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleResources}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{i18n.t('menu.settings')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleInterviewPractice}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{i18n.t('menu.interviewPractice')}</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer Section */}
      <View style={[styles.disclaimerContainer, { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) }]}>
        <Text style={styles.disclaimerText}>
          {i18n.t('disclaimer.text')}
        </Text>
      </View>


      {/* 언어 선택 모달 */}
      <LanguageSelectionModal
        visible={showLanguageModal}
        onLanguageSelected={handleLanguageSelected}
      />

      {/* 인터뷰 날짜 선택 모달 */}
      <InterviewDateModal
        visible={showInterviewDateModal}
        onDateSet={handleInterviewDateSet}
        onSkip={handleInterviewDateSkip}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  titleContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    width: '100%',
  },
  mainImage: {
    width: '90%',
    height: '70%',
    marginBottom: theme.spacing.md,
  },
  appTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 28,
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  appSubtitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    lineHeight: 20,
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 50,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.md,
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  disclaimerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    marginTop: 'auto',
  },
  disclaimerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.sm,
  },
  devBadge: {
    marginTop: 4,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default MainMenuScreen;
