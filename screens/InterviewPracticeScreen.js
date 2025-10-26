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
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { PremiumManager, PREMIUM_FEATURES } from '../utils/premiumManager';
import { SubscriptionManager } from '../utils/subscriptionManager';
import { PremiumGate } from '../components/PremiumGate';
import LocationManager from '../utils/locationManager';
import LocationSettingsModal from '../components/LocationSettingsModal';
import { t, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';
import StudyCalendar from '../components/StudyCalendar';

const InterviewPracticeScreen = ({ navigation }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [interviewDate, setInterviewDate] = useState(null);
  const [studyStartDate, setStudyStartDate] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const scrollViewRef = React.useRef(null);
  const sectionRefs = React.useRef({});

  useEffect(() => {
    checkPremiumStatus();
    checkLocationSettings();
    loadInterviewDate();
  }, []);

  // 화면 포커스 시 인터뷰 날짜 새로고침
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        await loadInterviewDate();
      };
      refreshData();
    }, [])
  );

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

  const loadInterviewDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem('@interview_date');
      const savedStartDate = await AsyncStorage.getItem('@study_start_date');
      
      if (savedDate) {
        setInterviewDate(savedDate);
        
        // 시작 날짜가 없으면 오늘 날짜를 기본값으로 저장
        let startDate = savedStartDate;
        if (!savedStartDate) {
          const today = new Date();
          const todayString = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
          await AsyncStorage.setItem('@study_start_date', todayString);
          startDate = todayString;
        }
        
        setStudyStartDate(startDate);
        
        // 프로그레스 계산
        calculateProgress(startDate, savedDate);
      } else {
        // 날짜가 없으면 상태를 null로 설정
        setInterviewDate(null);
        setStudyStartDate(null);
        setProgressPercentage(0);
      }
    } catch (error) {
      console.error('인터뷰 날짜 로드 오류:', error);
    }
  };

  const calculateProgress = (startDateString, interviewDateString) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // MM/DD/YYYY 형식 파싱
      const startParts = startDateString.split('/');
      const start = new Date(parseInt(startParts[2]), parseInt(startParts[0]) - 1, parseInt(startParts[1]));
      start.setHours(0, 0, 0, 0);
      
      const interviewParts = interviewDateString.split('/');
      const interview = new Date(parseInt(interviewParts[2]), parseInt(interviewParts[0]) - 1, parseInt(interviewParts[1]));
      interview.setHours(0, 0, 0, 0);
      
      // 총 일수와 경과 일수 계산
      const totalDays = Math.ceil((interview - start) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
      
      // 진행률 계산 (0-100%)
      let progress = 0;
      if (totalDays > 0) {
        progress = (daysPassed / totalDays) * 100;
      }
      
      // 0-100 범위로 제한
      progress = Math.min(Math.max(progress, 0), 100);
      
      setProgressPercentage(progress);
      
      console.log('Progress calculation:', {
        start: start.toDateString(),
        today: today.toDateString(),
        interview: interview.toDateString(),
        totalDays,
        daysPassed,
        progress: progress.toFixed(1) + '%'
      });
    } catch (error) {
      console.error('프로그레스 계산 오류:', error);
      setProgressPercentage(0);
    }
  };

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
        { id: '3-2', title: t('menu.practiceTests.weaknessTest'), subtitle: t('menu.practiceTests.weaknessTestSubtitle'), screen: 'WeaknessTest', isPremium: true },
        { id: '3-3', title: t('menu.test.testAnalytics'), subtitle: t('menu.test.testAnalyticsSubtitle'), screen: 'MyProgress', isPremium: false }
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
      title: 'Analytics',
      subtitle: 'Study progress dashboard',
      icon: 'stats-chart-outline',
      color: '#6C5CE7',
      subItems: [
        { id: '5-1', title: 'Analytics', subtitle: 'View today\'s progress', screen: 'AnalyticsDashboard', isPremium: false }
      ]
    },
  ];

  const [expandedSection, setExpandedSection] = React.useState(null);

  const toggleSection = (sectionId) => {
    const isExpanding = expandedSection !== sectionId;
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
    
    // 섹션이 확장될 때 해당 섹션으로 스크롤
    if (isExpanding) {
      setTimeout(() => {
        const sectionRef = sectionRefs.current[sectionId];
        if (sectionRef && scrollViewRef.current) {
          sectionRef.measureLayout(
            scrollViewRef.current,
            (x, y) => {
              scrollViewRef.current.scrollTo({
                y: y - 20, // 약간의 여백
                animated: true
              });
            },
            () => {}
          );
        }
      }, 100); // 애니메이션이 시작된 후 스크롤
    }
  };

  const handleSubItemPress = (subItem) => {
    // 구현된 화면들로 네비게이션
    const implementedScreens = ['ListView', 'StoryMode', 'FlashcardMode', 'FlashcardModeSelection', 'FlashcardSubjectiveMode', 'AllQuestions', 'AIMockInterview', 'AIChat', 'PracticeTest', 'PracticeTestVoice', 'WeaknessTest', 'MyProgress', 'AudioMode', 'DeepInterview', 'AnalyticsDashboard'];
    
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
    <View 
      key={item.id} 
      style={styles.menuSection}
      ref={(ref) => (sectionRefs.current[item.id] = ref)}
      collapsable={false}
    >
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

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>{t('interview.welcomeTitle')}</Text>
          <Text style={styles.welcomeSubtitle}>
            {t('interview.welcomeSubtitle')}
          </Text>
        </View>

        {/* Interview Timeline Banner or Set Date Prompt */}
        <TouchableOpacity 
          style={[styles.timelineBanner, !interviewDate && styles.setDateBanner]}
          onPress={() => {
            if (interviewDate) {
              navigation.navigate('StudyCalendar');
            } else {
              navigation.navigate('Resources');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color="#2E86AB" 
            style={styles.calendarIcon}
          />
          {interviewDate ? (
            <View style={styles.timelineContent}>
              <View style={styles.timelineLabels}>
                <Text style={styles.timelineLabel}>Start</Text>
                <Text style={styles.timelineDays}>
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // MM/DD/YYYY 형식 파싱
                    const parts = interviewDate.split('/');
                    const interview = new Date(parts[2], parts[0] - 1, parts[1]);
                    interview.setHours(0, 0, 0, 0);
                    
                    const diffTime = interview - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays > 0) return `D - ${diffDays} days`;
                    if (diffDays === 0) return 'D-Day!';
                    return `D + ${Math.abs(diffDays)} days`;
                  })()}
                </Text>
                <Text style={styles.timelineLabel}>Interview</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercentage}%` }
                    ]}
                  />
                  <View style={styles.progressDot} />
                </View>
              </View>
              <Text style={styles.motivationalQuote}>
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  // MM/DD/YYYY 형식 파싱
                  const parts = interviewDate.split('/');
                  const interview = new Date(parts[2], parts[0] - 1, parts[1]);
                  interview.setHours(0, 0, 0, 0);
                  
                  const diffTime = interview - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays === 0) return "Today is the day! You've got this! 🎉";
                  if (diffDays < 0) return "Keep practicing for future opportunities!";
                  if (diffDays <= 7) return "Final stretch! Stay confident!";
                  if (diffDays <= 14) return "Almost there! Review your weak areas.";
                  if (diffDays <= 30) return "The big day is approaching. Keep it up!";
                  return "Every practice brings you closer to success!";
                })()}
              </Text>
            </View>
          ) : (
            <View style={styles.setDateContent}>
              <Text style={styles.setDateTitle}>📅 Set Your Interview Date</Text>
              <Text style={styles.setDateSubtitle}>
                Track your progress and stay motivated!
              </Text>
              <View style={styles.setDateArrow}>
                <Ionicons name="chevron-forward" size={20} color="#2E86AB" />
              </View>
            </View>
          )}
        </TouchableOpacity>

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
  timelineBanner: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    backgroundColor: '#f8f9fa',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#e9ecef',
    ...theme.shadows.sm,
    position: 'relative',
  },
  calendarIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  timelineContent: {
    alignItems: 'center',
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2E86AB',
    borderRadius: 4,
    position: 'relative',
  },
  progressDot: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E86AB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timelineLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  timelineDays: {
    fontSize: theme.typography.sizes.md,
    color: '#2E86AB',
    fontWeight: theme.typography.weights.bold,
  },
  motivationalQuote: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
    lineHeight: 20,
  },
  setDateBanner: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2E86AB',
    borderWidth: 2,
  },
  setDateContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  setDateTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: '#2E86AB',
    marginBottom: theme.spacing.xs,
  },
  setDateSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  setDateArrow: {
    marginTop: theme.spacing.xs,
  },
});

export default InterviewPracticeScreen;
