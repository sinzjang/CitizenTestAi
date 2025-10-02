import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../styles/theme';
import { setLanguage } from '../utils/i18n';

const LoadingScreen = ({ navigation }) => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 저장된 언어 설정 및 언어 선택 완료 플래그 확인
        const savedLanguage = await AsyncStorage.getItem('@user_language');
        const languageSelected = await AsyncStorage.getItem('@language_selected');
        
        console.log('LoadingScreen - 저장된 언어:', savedLanguage);
        console.log('LoadingScreen - 언어 선택 완료:', languageSelected);
        
        if (savedLanguage && languageSelected) {
          // 이미 언어가 설정되어 있으면 바로 적용
          await setLanguage(savedLanguage);
          console.log('저장된 언어 로드:', savedLanguage);
        } else {
          // 언어가 설정되지 않은 경우 기본 언어(영어)로 설정
          await setLanguage('en');
          console.log('기본 언어(영어)로 설정');
        }
        
        // 3초 후 MainMenu로 이동
        setTimeout(() => {
          navigation.replace('MainMenu');
        }, 3000);
        
      } catch (error) {
        console.error('언어 설정 로드 오류:', error);
        // 오류가 발생해도 기본 언어로 설정하고 MainMenu로 이동
        try {
          await setLanguage('en');
        } catch (langError) {
          console.error('기본 언어 설정 오류:', langError);
        }
        setTimeout(() => {
          navigation.replace('MainMenu');
        }, 3000);
      }
    };

    initializeApp();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Pass US Citizen Interview with AI</Text>
      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      <Text style={styles.subtitle}>Loading...</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  loader: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
});

export default LoadingScreen;
