// App.js에서 i18n 초기화 예시

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import i18n from './utils/i18n';

export default function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('ko');

  useEffect(() => {
    initializeI18n();
  }, []);

  const initializeI18n = async () => {
    try {
      await i18n.initialize();
      setCurrentLanguage(i18n.getCurrentLanguage());
      setIsI18nInitialized(true);
      console.log('i18n 초기화 완료');
    } catch (error) {
      console.error('i18n 초기화 실패:', error);
      setIsI18nInitialized(true); // 실패해도 앱은 실행
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    // 필요시 앱 전체 리렌더링 로직
  };

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* 기존 네비게이션 구조 */}
      <Stack.Navigator>
        {/* 스크린들... */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
