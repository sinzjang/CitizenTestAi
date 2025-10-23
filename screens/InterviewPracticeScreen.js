import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { PremiumManager, PREMIUM_FEATURES } from '../utils/premiumManager';
import { SubscriptionManager } from '../utils/subscriptionManager';
import { PremiumGate } from '../components/PremiumGate';
import LocationManager from '../utils/locationManager';
import LocationSettingsModal from '../components/LocationSettingsModal';
import { t, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';

const InterviewPracticeScreen = ({ navigation }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    checkPremiumStatus();
    checkLocationSettings();
  }, []);

  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setCurrentLanguage(newLanguage);
    };
    
    addLanguageChangeListener(handleLanguageChange);
    
    return () => {
      removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  const checkLocationSettings = async () => {
    const userLocation = await LocationManager.getUserLocation();
    setLocationInfo(userLocation);
    
    // 지역 정보가 없거나 불완전한 경우 설정 권유
    if (!userLocation) {
      setTimeout(() => {
        Alert.alert(
          t('interview.locationSetupTitle'),
          t('interview.locationSetupMessage'),
          [
            { text: t('common.later'), style: 'cancel' },
            { text: t('common.setup'), onPress: () => setShowLocationModal(true) }
          ]
        );
      }, 1000);
    } else {
      // 불완전한 정보 확인
      const missingInfo = [];
      if (!userLocation.senators || !userLocation.senators[0] || !userLocation.senators[1]) {
        missingInfo.push(t('location.senators'));
      }
      // 하원의원 체크 (새로운 배열 구조 지원)
      const hasRepresentatives = userLocation.representatives && userLocation.representatives.length > 0;
      const hasOldRepresentative = userLocation.representative; // 기존 구조 호환성
      
      if (!hasRepresentatives && !hasOldRepresentative) {
        missingInfo.push(t('location.representative'));
      }
      
      if (missingInfo.length > 0) {
        setTimeout(() => {
          Alert.alert(
            t('interview.additionalInfoTitle'),
            t('interview.additionalInfoMessage', { missingInfo: missingInfo.join(', ') }),
            [
              { text: t('common.later'), style: 'cancel' },
              { text: t('common.setup'), onPress: () => navigation.navigate('Resources') }
            ]
          );
        }, 1500);
      }
    }
  };

  const checkPremiumStatus = async () => {
    // RevenueCat을 통한 실제 구독 상태 확인
    const premiumStatus = await SubscriptionManager.checkSubscriptionStatus();
    setIsPremium(premiumStatus);
  };

  const menuItems = [
    {
      id: 1,
      title: t('menu.learn.title'),
      subtitle: t('menu.learn.subtitle'),
      icon: 'book-outline',
      color: '#4CAF50',
      subItems: [
        { id: '1-1', title: t('menu.learn.allQuestions'), subtitle: t('menu.learn.allQuestionsSubtitle'), screen: 'AllQuestions', isPremium: false },
        { id: '1-2', title: t('menu.learn.storyMode'), subtitle: t('menu.learn.storyModeSubtitle'), screen: 'StoryMode', isPremium: true },
        { id: '1-3', title: t('menu.learn.audioLearning'), subtitle: t('menu.learn.audioLearningSubtitle'), screen: 'AudioMode', isPremium: true }
      ]
    },
    {
      id: 2,
      title: t('menu.practiceTests.title'),
      subtitle: t('menu.practiceTests.subtitle'),
      icon: 'layers-outline',
      color: '#FF9800',
      subItems: [
        { id: '2-1', title: t('menu.practiceTests.flashcardMode'), subtitle: t('menu.practiceTests.flashcardModeSubtitle'), screen: 'FlashcardModeSelection', isPremium: false }
      ]
    },
    {
      id: 3,
      title: t('menu.test.title'),
      subtitle: t('menu.test.subtitle'),
      icon: 'clipboard-outline',
      color: '#E91E63',
      subItems: [
        { id: '3-1', title: t('menu.practiceTests.practiceTest'), subtitle: t('menu.practiceTests.practiceTestSubtitle'), screen: 'PracticeTest', isPremium: true },
        { id: '3-2', title: t('menu.practiceTests.weaknessTest'), subtitle: t('menu.practiceTests.weaknessTestSubtitle'), screen: 'WeaknessTest', isPremium: true }
      ]
    },
    {
      id: 4,
      title: t('menu.aiMockInterview.title'),
      subtitle: t('menu.aiMockInterview.subtitle'),
      icon: 'mic-outline',
      color: '#2196F3',
      subItems: [
        { id: '4-1', title: t('menu.aiMockInterview.aiInterview'), subtitle: t('menu.aiMockInterview.aiInterviewSubtitle'), screen: 'AIChat', isPremium: true },
        { id: '4-2', title: t('menu.aiMockInterview.deepDiveInterview'), subtitle: t('menu.aiMockInterview.deepDiveInterviewSubtitle'), screen: 'DeepInterview', isPremium: true }
      ]
    },
    {
      id: 5,
      title: t('menu.myProgress.title'),
      subtitle: t('menu.myProgress.subtitle'),
      icon: 'analytics-outline',
      color: '#9C27B0',
      subItems: [
        { id: '5-1', title: t('menu.myProgress.progressDashboard'), subtitle: t('menu.myProgress.progressDashboardSubtitle'), screen: 'MyProgress', isPremium: false },
        { id: '5-2', title: t('menu.myProgress.aiTutorAdvice'), subtitle: t('menu.myProgress.aiTutorAdviceSubtitle'), screen: 'AITutorAdvice', isPremium: true }
      ]
    }
  ];

  const [expandedSection, setExpandedSection] = React.useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleSubItemPress = (subItem) => {
    // 구현된 화면들로 네비게이션
    const implementedScreens = ['ListView', 'StoryMode', 'FlashcardMode', 'FlashcardModeSelection', 'FlashcardSubjectiveMode', 'AllQuestions', 'AIMockInterview', 'AIChat', 'PracticeTest', 'PracticeTestVoice', 'WeaknessTest', 'MyProgress', 'AudioMode', 'DeepInterview'];
    
    // 프리미엄 기능 체크
    if (subItem.isPremium && !isPremium) {
      PremiumGate.checkAccess(
        subItem.screen,
        () => {
          // 프리미엄 사용자인 경우 실행
          if (implementedScreens.includes(subItem.screen)) {
            navigation.navigate(subItem.screen);
          } else {
            console.log(`Navigate to ${subItem.screen} (Not implemented yet)`);
          }
        },
        navigation
      );
      return;
    }
    
    // 무료 기능 또는 프리미엄 사용자인 경우
    if (implementedScreens.includes(subItem.screen)) {
      navigation.navigate(subItem.screen);
    } else {
      console.log(`Navigate to ${subItem.screen} (Not implemented yet)`);
    }
  };

  const renderMenuItem = (item) => (
    <View key={item.id} style={styles.menuSection}>
      <TouchableOpacity
        style={[styles.menuHeader, { borderLeftColor: item.color }]}
        onPress={() => toggleSection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.menuHeaderLeft}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.menuHeaderText}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <Ionicons
          name={expandedSection === item.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {expandedSection === item.id && (
        <View style={styles.subMenuContainer}>
          {item.subItems.map((subItem) => (
            <TouchableOpacity
              key={subItem.id}
              style={[
                styles.subMenuItem,
                subItem.isPremium && !isPremium && styles.premiumSubMenuItem
              ]}
              onPress={() => handleSubItemPress(subItem)}
              activeOpacity={0.7}
            >
              <View style={styles.subMenuContent}>
                <View style={styles.subMenuTitleContainer}>
                  <Text style={[
                    styles.subMenuTitle,
                    subItem.isPremium && !isPremium && styles.premiumText
                  ]}>
                    {subItem.title}
                  </Text>
                  {subItem.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>Premium</Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.subMenuSubtitle,
                  subItem.isPremium && !isPremium && styles.premiumSubtitle
                ]}>
                  {subItem.subtitle}
                </Text>
              </View>
              <Ionicons 
                name={subItem.isPremium && !isPremium ? "lock-closed" : "chevron-forward"} 
                size={16} 
                color={subItem.isPremium && !isPremium ? "#FF9800" : "#999"} 
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interview Practice</Text>
        
        {/* 프리미엄 구독 버튼 */}
        <TouchableOpacity
          style={[
            styles.premiumToggle,
            isPremium && styles.premiumToggleActive
          ]}
          onPress={() => {
            if (isPremium) {
              // 이미 프리미엄 사용자인 경우 구독 관리 화면으로
              navigation.navigate('Subscription');
            } else {
              // 무료 사용자인 경우 구독 화면으로
              navigation.navigate('Subscription');
            }
          }}
        >
          <Ionicons 
            name={isPremium ? "star" : "star-outline"} 
            size={14} 
            color={isPremium ? "#FFFFFF" : "#FF9800"} 
            style={{ marginRight: 4 }}
          />
          <Text style={[
            styles.premiumToggleText,
            isPremium && styles.premiumToggleTextActive
          ]}>
            {isPremium ? 'Premium' : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>{t('interview.welcomeTitle')}</Text>
          <Text style={styles.welcomeSubtitle}>
            {t('interview.welcomeSubtitle')}
          </Text>
        </View>

        {menuItems.map(renderMenuItem)}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <LocationSettingsModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onComplete={() => {
          checkLocationSettings();
          setShowLocationModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    flex: 1, // 제목이 남은 공간을 차지하여 프리미엄 토글을 오른쪽 끝으로 밀어냄
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.sm,
  },
  welcomeTitle: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  menuSection: {
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  menuHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuHeaderText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  subMenuContainer: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundSecondary,
  },
  subMenuContent: {
    flex: 1,
  },
  subMenuTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  subMenuSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  bottomPadding: {
    height: theme.spacing.xxl,
  },
  // Premium Styles
  premiumToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumToggleActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
    shadowOpacity: 0.3,
  },
  premiumToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  premiumToggleTextActive: {
    color: '#FFFFFF',
  },
  premiumSubMenuItem: {
    opacity: 0.6,
  },
  premiumText: {
    color: '#9E9E9E',
  },
  premiumSubtitle: {
    color: '#BDBDBD',
  },
  subMenuTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  premiumBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default InterviewPracticeScreen;
