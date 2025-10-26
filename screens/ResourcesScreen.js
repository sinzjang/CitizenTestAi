import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import LocationManager from '../utils/locationManager';
import { t, getCurrentLanguage, setLanguage, getSupportedLanguages } from '../utils/i18n';
import LocationSettingsModal from '../components/LocationSettingsModal';
import InterviewDateModal from '../components/InterviewDateModal';
import PromoCodeModal from '../components/PromoCodeModal';
import { SubscriptionManager } from '../utils/subscriptionManager';
import { PromoCodeManager } from '../utils/promoCodeManager';

const ResourcesScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [states, setStates] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState(null);
  const [studyStartDate, setStudyStartDate] = useState(null);
  const [showInterviewDateEdit, setShowInterviewDateEdit] = useState(false);
  const [showStudyStartDateEdit, setShowStudyStartDateEdit] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false);
  const [showUsageGuideModal, setShowUsageGuideModal] = useState(false);

  useEffect(() => {
    loadUserLocation();
    setStates(LocationManager.getStates());
    loadLanguageSettings();
    loadInterviewDate();
    loadSubscriptionDetails();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      const current = getCurrentLanguage();
      const supported = getSupportedLanguages();
      setCurrentLanguage(current);
      setSupportedLanguages(supported);
    } catch (error) {
      console.error('언어 설정 로드 오류:', error);
    }
  };

  const loadUserLocation = async () => {
    const location = await LocationManager.getUserLocation();
    setUserLocation(location);
  };

  const loadInterviewDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem('@interview_date');
      const savedStartDate = await AsyncStorage.getItem('@study_start_date');
      setInterviewDate(savedDate);
      setStudyStartDate(savedStartDate);
    } catch (error) {
      console.error('인터뷰 날짜 로드 오류:', error);
    }
  };

  const loadSubscriptionDetails = async () => {
    try {
      const details = await SubscriptionManager.getSubscriptionDetails();
      setSubscriptionDetails(details);
    } catch (error) {
      console.error('구독 상태 로드 오류:', error);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      Alert.alert(
        t('subscription.restoring'),
        t('subscription.restoringMessage'),
        [{ text: 'OK', style: 'cancel' }]
      );

      const result = await SubscriptionManager.restorePurchases();
      
      if (result.success) {
        await loadSubscriptionDetails();
        Alert.alert(
          t('subscription.success'),
          result.isPremium 
            ? t('subscription.restoreSuccess') 
            : t('subscription.noActivePurchases')
        );
      } else {
        Alert.alert(
          t('subscription.error'),
          result.error || t('subscription.restoreError')
        );
      }
    } catch (error) {
      console.error('구매 복원 오류:', error);
      Alert.alert(
        t('subscription.error'),
        t('subscription.restoreError')
      );
    }
  };

  const handleRedeemPromoCode = async (code) => {
    try {
      // 사용자 이메일 가져오기 (없으면 기본값 생성)
      let userEmail = await SubscriptionManager.getUserEmail();
      if (!userEmail) {
        userEmail = `user_${Date.now()}@citizentest.app`;
        await SubscriptionManager.setUserEmail(userEmail);
      }

      const result = await PromoCodeManager.redeemPromoCode(code, userEmail);
      
      if (result.success) {
        Alert.alert(
          t('subscription.success'),
          result.message
        );
        setShowPromoCodeModal(false);
        
        // Admin 모드 활성화인 경우 프리미엄 상태 즉시 업데이트
        if (result.type === 'admin') {
          setIsPremium(true);
        }
        
        // 구독 상태 새로고침
        await loadSubscriptionDetails();
      } else {
        Alert.alert(
          t('subscription.error'),
          result.message
        );
      }
    } catch (error) {
      console.error('프로모 코드 처리 오류:', error);
      Alert.alert(
        t('subscription.error'),
        t('subscription.redeemError')
      );
    }
  };

  // 주 선택 대신 안내 팝업(Interview i18n) 띄우고 설정 모달 열기
  const openLocationSetupAlert = () => {
    Alert.alert(
      t('interview.locationSetupTitle'),
      t('interview.locationSetupMessage'),
      [
        { text: t('common.later'), style: 'cancel' },
        { text: t('common.setup'), onPress: () => setShowLocationModal(true) }
      ]
    );
  };

  const handleStateSelect = async (stateCode) => {
    const stateInfo = LocationManager.getStateInfo(stateCode);
    // 기존 하원의원 데이터 보존 (새로운 구조 지원)
    let representatives = [];
    if (userLocation?.representatives && userLocation.representatives.length > 0) {
      representatives = userLocation.representatives;
    } else if (userLocation?.representative) {
      // 기존 단일 구조를 배열로 변환
      representatives = [{
        name: userLocation.representative,
        district: userLocation.district || ''
      }];
    }
    
    const newLocation = {
      state: stateCode,
      stateName: stateInfo.name,
      capital: stateInfo.capital,
      governor: userLocation?.governor || '',
      senators: userLocation?.senators || ['', ''],
      representatives: representatives
    };

    await LocationManager.saveUserLocation(newLocation);
    setUserLocation(newLocation);
    setShowStateModal(false);
    
    Alert.alert(
      t('resources.stateSetupComplete'),
      t('resources.stateSetupMessage', { stateName: stateInfo.name, capital: stateInfo.capital })
    );
  };

  const handleEditField = (field, currentValue) => {
    setEditField(field);
    setEditValue(currentValue || '');
    setShowEditModal(true);
  };

  const saveEditedField = async () => {
    if (!userLocation) return;

    const updatedLocation = { ...userLocation };
    
    if (editField === 'senator1') {
      updatedLocation.senators[0] = editValue;
    } else if (editField === 'senator2') {
      updatedLocation.senators[1] = editValue;
    } else {
      updatedLocation[editField] = editValue;
    }

    await LocationManager.saveUserLocation(updatedLocation);
    setUserLocation(updatedLocation);
    setShowEditModal(false);
    setEditValue('');
  };

  const clearAllData = () => {
    Alert.alert(
      t('resources.resetSettings'),
      t('resources.confirmDelete'),
      [
        { text: t('resources.cancel'), style: 'cancel' },
        {
          text: t('resources.delete'),
          style: 'destructive',
          onPress: async () => {
            await LocationManager.clearUserLocation();
            setUserLocation(null);
            // Interview 날짜와 학습 시작 날짜도 삭제
            await AsyncStorage.removeItem('@interview_date');
            await AsyncStorage.removeItem('@study_start_date');
            // 상태 업데이트
            setInterviewDate(null);
            setStudyStartDate(null);
            Alert.alert(t('resources.complete'), t('resources.allSettingsDeleted'));
          }
        }
      ]
    );
  };

  const handleLanguageChange = async (languageCode) => {
    try {
      const success = await setLanguage(languageCode);
      if (success) {
        setCurrentLanguage(languageCode);
        setShowLanguageModal(false);
        Alert.alert(
          t('resources.complete'),
          t('resources.languageChanged')
        );
      }
    } catch (error) {
      console.error('언어 변경 오류:', error);
      Alert.alert(
        t('resources.error'),
        t('resources.languageChangeError')
      );
    }
  };

  const renderStateItem = ({ item }) => {
    const [stateCode, stateInfo] = item;
    return (
      <TouchableOpacity
        style={styles.stateItem}
        onPress={() => handleStateSelect(stateCode)}
      >
        <Text style={styles.stateText}>{stateInfo.name}</Text>
        <Text style={styles.capitalText}>{t('resources.capital')}: {stateInfo.capital}</Text>
      </TouchableOpacity>
    );
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'governor': return t('resources.governor');
      case 'senator1': return t('resources.senator1');
      case 'senator2': return t('resources.senator2');
      case 'representative': return t('resources.representative');
      default: return field;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('resources.title')}</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setShowUsageGuideModal(true)}
        >
          <Ionicons name="help-circle-outline" size={28} color="#2E86AB" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('resources.languageSettings')}</Text>
          <Text style={styles.sectionDescription}>
            {t('resources.languageDescription')}
          </Text>
          
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.languageButtonContent}>
              <Ionicons name="language" size={24} color="#2E86AB" />
              <View style={styles.languageInfo}>
                <Text style={styles.languageLabel}>{t('resources.currentLanguage')}:</Text>
                <Text style={styles.languageValue}>
                  {supportedLanguages.find(lang => lang.code === currentLanguage)?.name || currentLanguage}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Interview Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('interviewDate.sectionTitle')}</Text>
          <Text style={styles.sectionDescription}>
            {t('interviewDate.sectionDescription')}
          </Text>
          
          {/* Study Start Date */}
          <TouchableOpacity
            style={[styles.languageButton, { marginBottom: theme.spacing.sm }]}
            onPress={() => setShowStudyStartDateEdit(true)}
          >
            <View style={styles.languageButtonContent}>
              <Ionicons name="play-circle" size={24} color="#28a745" />
              <View style={styles.languageInfo}>
                <Text style={styles.languageLabel}>{t('interviewDate.studyStartDate')}:</Text>
                <Text style={styles.languageValue}>
                  {studyStartDate || t('interviewDate.notSet')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Interview Date */}
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowInterviewDateEdit(true)}
          >
            <View style={styles.languageButtonContent}>
              <Ionicons name="calendar" size={24} color="#2E86AB" />
              <View style={styles.languageInfo}>
                <Text style={styles.languageLabel}>{t('interviewDate.currentDate')}:</Text>
                <Text style={styles.languageValue}>
                  {interviewDate || t('interviewDate.notSet')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Location Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('resources.locationSettings')}</Text>
          <Text style={styles.sectionDescription}>
            {t('resources.locationDescription')}
          </Text>

          {userLocation ? (
            <View style={styles.updatedInfoContainer}>
              <TouchableOpacity
                style={styles.infoItem}
                onPress={() => handleEditField('zipCode', userLocation.zipCode)}
              >
                <Text style={styles.infoItemLabel}>{t('resources.zipCode')}:</Text>
                <Text style={styles.infoItemValue}>
                  {userLocation.zipCode || t('resources.setup')}
                </Text>
                <Ionicons name="pencil" size={18} color="#2E86AB" style={styles.chevronIcon} />
              </TouchableOpacity>

              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>{t('resources.selectedState')}:</Text>
                <Text style={styles.infoItemValue}>{userLocation.stateName}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>{t('resources.capital')}:</Text>
                <Text style={styles.infoItemValue}>{userLocation.capital}</Text>
              </View>

              <TouchableOpacity
                style={styles.infoItem}
                onPress={() => handleEditField('governor', userLocation.governor)}
              >
                <Text style={styles.infoItemLabel}>{t('resources.governor')}:</Text>
                <Text style={styles.infoItemValue}>
                  {userLocation.governor === 'auto' 
                    ? LocationManager.getStateGovernor(userLocation.state)
                    : userLocation.governor || t('resources.setup')
                  }
                </Text>
                <Ionicons name="pencil" size={18} color="#2E86AB" style={styles.chevronIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.infoItem}
                onPress={() => handleEditField('senator1', userLocation.senators?.[0])}
              >
                <Text style={styles.infoItemLabel}>{t('resources.senator1')}:</Text>
                <Text style={styles.infoItemValue}>
                  {userLocation.senators?.[0] || t('resources.setup')}
                </Text>
                <Ionicons name="pencil" size={18} color="#2E86AB" style={styles.chevronIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.infoItem}
                onPress={() => handleEditField('senator2', userLocation.senators?.[1])}
              >
                <Text style={styles.infoItemLabel}>{t('resources.senator2')}:</Text>
                <Text style={styles.infoItemValue}>
                  {userLocation.senators?.[1] || t('resources.setup')}
                </Text>
                <Ionicons name="pencil" size={18} color="#2E86AB" style={styles.chevronIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.infoItem, styles.lastInfoItem]}
                onPress={() => {
                  // 새로운 구조 지원
                  let currentRep = '';
                  if (userLocation.representatives && userLocation.representatives.length > 0) {
                    currentRep = userLocation.representatives[0].name;
                  } else if (userLocation.representative) {
                    currentRep = userLocation.representative;
                  }
                  handleEditField('representative', currentRep);
                }}
              >
                <Text style={styles.infoItemLabel}>{t('resources.representative')}:</Text>
                <Text style={styles.infoItemValue}>
                  {(() => {
                    if (userLocation.representatives && userLocation.representatives.length > 0) {
                      if (userLocation.representatives.length === 1) {
                        return `${userLocation.representatives[0].name} (${userLocation.representatives[0].district})`;
                      } else {
                        return `${userLocation.representatives.map(rep => `${rep.name} (${rep.district})`).join(', ')}`;
                      }
                    } else if (userLocation.representative) {
                      return userLocation.representative;
                    } else {
                      return t('resources.setup');
                    }
                  })()}
                </Text>
                <Ionicons name="pencil" size={18} color="#2E86AB" style={styles.chevronIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeStateButton}
                onPress={openLocationSetupAlert}
              >
                <Text style={styles.changeStateText}>{t('resources.selectState')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectStateButton}
              onPress={openLocationSetupAlert}
            >
              <Ionicons name="location-outline" size={24} color="#2E86AB" />
              <Text style={styles.selectStateText}>{t('resources.selectStateDescription')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Updated Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('resources.updatedInfo2025')}</Text>
          <Text style={styles.sectionDescription}>
            {t('resources.yearlyChangingInfo')}
          </Text>
          
          <View style={styles.updatedInfoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>{t('resources.currentPresident')}:</Text>
              <Text style={styles.infoItemValue}>Donald J. Trump</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>{t('resources.currentVicePresident')}:</Text>
              <Text style={styles.infoItemValue}>JD Vance</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>{t('resources.currentSpeaker')}:</Text>
              <Text style={styles.infoItemValue}>Mike Johnson</Text>
            </View>
            
            <View style={[styles.infoItem, styles.lastInfoItem]}>
              <Text style={styles.infoItemLabel}>{t('resources.updateCycle')}:</Text>
              <Text style={styles.infoItemValue}>{t('resources.autoUpdateByElection')}</Text>
            </View>
          </View>
        </View>


        {/* Premium Subscription Section - Modern Design */}
        <View style={styles.premiumSection}>
          {/* Hero Image */}
          <View style={styles.heroImageContainer}>
            <Image 
              source={require('../assets/imgs/Amarica_want_you_with_bg.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTextAmerica}>AMERICA</Text>
              <View style={styles.heroTextRow}>
                <Text style={styles.heroTextWants}>WANTS </Text>
                <Text style={styles.heroTextYou}>YOU</Text>
              </View>
            </View>
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>"We support your success in Citizenship Interview"</Text>

          {/* Premium Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Premium Features</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Effective Memorization</Text>
                <Text style={styles.featureDescription}>Random flashcards for better retention</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Driving Mode</Text>
                <Text style={styles.featureDescription}>Hands-free learning while commuting</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>AI Interview Practice</Text>
                <Text style={styles.featureDescription}>Real-time conversation with AI interviewer</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Weakness Quiz Management</Text>
                <Text style={styles.featureDescription}>Focus on questions you struggle with</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Ad-Free Experience</Text>
                <Text style={styles.featureDescription}>Uninterrupted learning sessions</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Story Mode</Text>
                <Text style={styles.featureDescription}>Learn through engaging narratives</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Progress Tracking</Text>
                <Text style={styles.featureDescription}>Monitor your preparation journey</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Offline Access</Text>
                <Text style={styles.featureDescription}>Study anytime, anywhere</Text>
              </View>
            </View>
          </View>

          {/* AI Cost Notice */}
          <View style={styles.aiCostNotice}>
            <Ionicons name="information-circle" size={20} color="#2E86AB" />
            <Text style={styles.aiCostText}>
              💡 The developer covers all AI usage costs (OpenAI API) for premium members. Your support helps maintain this service.
            </Text>
          </View>

          {/* Current Status */}
          {subscriptionDetails && (
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Current Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: subscriptionDetails.statusColor }]}>
                  <Text style={styles.statusBadgeText}>{subscriptionDetails.status}</Text>
                </View>
              </View>
              
              {subscriptionDetails.expiryDate && (
                <View style={styles.statusDetails}>
                  <Text style={styles.statusDetailText}>Expires: {subscriptionDetails.expiryDate}</Text>
                  <Text style={styles.statusDetailText}>Days remaining: {subscriptionDetails.daysRemaining}</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.promoCodeButton}
            onPress={() => setShowPromoCodeModal(true)}
          >
            <Ionicons name="ticket" size={24} color="#fff" />
            <Text style={styles.promoCodeButtonText}>Enter Promo Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
          >
            <Ionicons name="refresh" size={20} color="#2E86AB" />
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Clear Data Button */}
        {userLocation && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllData}
          >
            <Text style={styles.clearButtonText}>{t('resources.resetSettings')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* State Selection Modal (미사용: 주 선택은 안내 팝업으로 대체) */}
      {/* 유지하되 트리거를 제거했으므로 열리지 않음 */}
      <Modal
        visible={false}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity>
              <Text style={styles.modalCancelText}>{t('resources.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('resources.selectState')}</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          <FlatList
            data={Object.entries(states)}
            renderItem={renderStateItem}
            keyExtractor={([code]) => code}
            style={styles.stateList}
          />
        </SafeAreaView>
      </Modal>

      {/* Edit Field Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.editModalTitle}>
              {t('resources.editField', { field: getFieldLabel(editField) })}
            </Text>
            
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={t('resources.enterNamePlaceholder')}
              autoFocus={true}
            />
            
            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={styles.editModalCancel}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.editModalCancelText}>{t('resources.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editModalSave}
                onPress={saveEditedField}
              >
                <Text style={styles.editModalSaveText}>{t('resources.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.modalCancelText}>{t('resources.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('resources.selectLanguage')}</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <ScrollView style={styles.languageList}>
            {supportedLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.selectedLanguageOption
                ]}
                onPress={() => handleLanguageChange(language.code)}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={[
                    styles.languageOptionText,
                    currentLanguage === language.code && styles.selectedLanguageText
                  ]}>
                    {language.name}
                  </Text>
                  {currentLanguage === language.code && (
                    <Ionicons name="checkmark" size={20} color="#2E86AB" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Location Settings Modal (ZIP→주 선택→추가정보) */}
      <LocationSettingsModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onComplete={() => {
          loadUserLocation();
          setShowLocationModal(false);
        }}
      />

      {/* Study Start Date Modal */}
      <InterviewDateModal
        visible={showStudyStartDateEdit}
        title="Study Start Date"
        storageKey="@study_start_date"
        onDateSet={async (dateString) => {
          try {
            await AsyncStorage.setItem('@study_start_date', dateString);
            setStudyStartDate(dateString);
            setShowStudyStartDateEdit(false);
          } catch (error) {
            console.error('공부 시작 날짜 저장 오류:', error);
          }
        }}
        onSkip={() => setShowStudyStartDateEdit(false)}
      />

      {/* Interview Date Modal */}
      <InterviewDateModal
        visible={showInterviewDateEdit}
        onDateSet={async (dateString) => {
          try {
            await AsyncStorage.setItem('@interview_date', dateString);
            setInterviewDate(dateString);
            setShowInterviewDateEdit(false);
          } catch (error) {
            console.error('인터뷰 날짜 저장 오류:', error);
          }
        }}
        onSkip={() => setShowInterviewDateEdit(false)}
      />

      {/* Promo Code Modal */}
      <PromoCodeModal
        visible={showPromoCodeModal}
        onClose={() => setShowPromoCodeModal(false)}
        onSuccess={handleRedeemPromoCode}
      />

      {/* Usage Guide Modal */}
      <Modal
        visible={showUsageGuideModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUsageGuideModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('resources.usageGuide')}</Text>
            <TouchableOpacity onPress={() => setShowUsageGuideModal(false)}>
              <Ionicons name="close" size={28} color="#2E86AB" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              {t('resources.usageGuideText')}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    flex: 1,
  },
  helpButton: {
    marginLeft: theme.spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  sectionDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  selectStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: '#f8f9fa',
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: '#2E86AB',
    borderStyle: 'dashed',
  },
  selectStateText: {
    fontSize: theme.typography.sizes.md,
    color: '#2E86AB',
    fontWeight: theme.typography.weights.semibold,
    marginLeft: theme.spacing.sm,
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    width: 80,
  },
  infoValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    width: 100,
  },
  editValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  changeStateButton: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: '#2E86AB',
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  changeStateText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  updatedInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoItemLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  infoItemValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    flex: 2,
    textAlign: 'right',
  },
  lastInfoItem: {
    borderBottomWidth: 0,
  },
  clearButton: {
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: '#dc3545',
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalCancelText: {
    fontSize: theme.typography.sizes.md,
    color: '#2E86AB',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  modalPlaceholder: {
    width: 50,
  },
  stateList: {
    flex: 1,
  },
  stateItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  stateText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  capitalText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  // Edit Modal Styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    backgroundColor: 'white',
    borderRadius: theme.spacing.md,
    padding: theme.spacing.xl,
    width: '80%',
    maxWidth: 300,
  },
  editModalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  editInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.lg,
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editModalCancel: {
    flex: 1,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    backgroundColor: '#f8f9fa',
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  editModalCancelText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
  },
  editModalSave: {
    flex: 1,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    backgroundColor: '#2E86AB',
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  editModalSaveText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  // Language Settings Styles
  languageButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  languageLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  languageValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  // Language Modal Styles
  languageList: {
    flex: 1,
  },
  languageOption: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedLanguageOption: {
    backgroundColor: '#f0f8ff',
  },
  languageOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageOptionText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  selectedLanguageText: {
    fontWeight: theme.typography.weights.semibold,
    color: '#2E86AB',
  },
  // Subscription Status Styles
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: '#fff',
  },
  promoCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86AB',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#2E86AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  promoCodeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  editableValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  // Premium Section Styles
  premiumSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heroTextAmerica: {
    fontSize: 36,
    fontWeight: '900',
    color: '#001f3f',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroTextRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  heroTextWants: {
    fontSize: 36,
    fontWeight: '900',
    color: '#001f3f',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroTextYou: {
    fontSize: 36,
    fontWeight: '900',
    color: '#dc143c',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#001f3f',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  aiCostNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86AB',
  },
  aiCostText: {
    flex: 1,
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
    marginLeft: 10,
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  statusDetails: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E86AB',
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E86AB',
    marginLeft: 8,
  },
});

export default ResourcesScreen;
