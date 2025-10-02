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
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import LocationManager from '../utils/locationManager';
import { t, getCurrentLanguage, setLanguage, getSupportedLanguages } from '../utils/i18n';
import LocationSettingsModal from '../components/LocationSettingsModal';

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

  useEffect(() => {
    loadUserLocation();
    setStates(LocationManager.getStates());
    loadLanguageSettings();
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

        {/* Location Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('resources.locationSettings')}</Text>
          <Text style={styles.sectionDescription}>
            {t('resources.locationDescription')}
          </Text>

          {userLocation ? (
            <View style={styles.locationInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('resources.selectedState')}:</Text>
                <Text style={styles.infoValue}>{userLocation.stateName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('resources.capital')}:</Text>
                <Text style={styles.infoValue}>{userLocation.capital}</Text>
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditField('governor', userLocation.governor)}
              >
                <Text style={styles.editLabel}>{t('resources.governor')}:</Text>
                <Text style={styles.editValue}>
                  {userLocation.governor || t('resources.setup')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditField('senator1', userLocation.senators?.[0])}
              >
                <Text style={styles.editLabel}>{t('resources.senator1')}:</Text>
                <Text style={styles.editValue}>
                  {userLocation.senators?.[0] || t('resources.setup')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditField('senator2', userLocation.senators?.[1])}
              >
                <Text style={styles.editLabel}>{t('resources.senator2')}:</Text>
                <Text style={styles.editValue}>
                  {userLocation.senators?.[1] || t('resources.setup')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
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
                <Text style={styles.editLabel}>{t('resources.representative')}:</Text>
                <Text style={styles.editValue}>
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
                <Ionicons name="chevron-forward" size={20} color="#666" />
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

        {/* Location-based Information Section */}
        {userLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('resources.configuredLocationInfo')}</Text>
            <Text style={styles.sectionDescription}>
              {t('resources.currentStateInfo', { stateName: userLocation.stateName })}
            </Text>
            
            <View style={styles.updatedInfoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>{t('resources.capital')}:</Text>
                <Text style={styles.infoItemValue}>{userLocation.capital}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>{t('resources.governor')}:</Text>
                <Text style={styles.infoItemValue}>
                  {userLocation.governor === 'auto' 
                    ? LocationManager.getStateGovernor(userLocation.state)
                    : userLocation.governor || t('resources.notSet')
                  }
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>{t('resources.senator1')}:</Text>
                <Text style={styles.infoItemValue}>
                  {userLocation.senators?.[0] || t('resources.notSet')}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>{t('resources.senator2')}:</Text>
                <Text style={styles.infoItemValue}>
                  {userLocation.senators?.[1] || t('resources.notSet')}
                </Text>
              </View>
              
              <View style={userLocation.zipCode ? styles.infoItem : [styles.infoItem, styles.lastInfoItem]}>
                <Text style={styles.infoItemLabel}>{t('resources.representative')}:</Text>
                <Text style={styles.infoItemValue}>
                  {(() => {
                    if (userLocation.representatives && userLocation.representatives.length > 0) {
                      return userLocation.representatives.map(rep => `${rep.name} (${rep.district})`).join(', ');
                    } else if (userLocation.representative) {
                      return userLocation.representative;
                    } else {
                      return t('resources.notSet');
                    }
                  })()}
                </Text>
              </View>
              
              {userLocation.zipCode && (
                <View style={[styles.infoItem, styles.lastInfoItem]}>
                  <Text style={styles.infoItemLabel}>{t('resources.zipCode')}:</Text>
                  <Text style={styles.infoItemValue}>{userLocation.zipCode}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('resources.usageGuide')}</Text>
          <Text style={styles.infoText}>
            {t('resources.usageGuideText')}
          </Text>
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
});

export default ResourcesScreen;
