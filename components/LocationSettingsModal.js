import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  FlatList,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import LocationManager from '../utils/locationManager';
import { t, getCurrentLanguage, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';

const LocationSettingsModal = ({ visible, onClose, onComplete }) => {
  const [step, setStep] = useState(1); // 1: ZIP, 2: State Selection, 3: Additional Info
  const [zipCode, setZipCode] = useState('');
  const [possibleStates, setPossibleStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [senators, setSenators] = useState(['', '']);
  const [representative, setRepresentative] = useState('');
  const [representativeDistrict, setRepresentativeDistrict] = useState('');

  const [useAutoGovernor, setUseAutoGovernor] = useState(true);
  const [customGovernor, setCustomGovernor] = useState('');
  const [isLoadingRepresentative, setIsLoadingRepresentative] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

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

  const handleZipCodeSubmit = async () => {
    if (!zipCode || zipCode.length !== 5) {
      Alert.alert(t('location.error'), t('location.zipCodeRequired'));
      return;
    }

    const possibleStates = LocationManager.getStateFromZipCode(zipCode);
    
    if (possibleStates.length === 0) {
      Alert.alert(t('location.error'), t('location.stateNotFound'));
      return;
    }

    // 하나의 주만 가능한 경우 자동 완성 옵션 제공
    if (possibleStates.length === 1) {
      const stateCode = possibleStates[0];
      const stateInfo = LocationManager.getStateInfo(stateCode);
      
      try {
        // 하원의원 정보 로딩
        setIsLoadingRepresentative(true);
        
        // 로딩 메시지 표시
        const loadingAlert = setTimeout(() => {
          Alert.alert(t('location.loadingInfo'), t('location.loadingRepresentative'), [], { cancelable: false });
        }, 1000);
        
        const representativeInfo = await LocationManager.getRepresentativeFromZip(zipCode);
        
        clearTimeout(loadingAlert);
        setIsLoadingRepresentative(false);
        
        let representativeText = '직접 입력 필요';
        let apiAttribution = '';
        
        if (representativeInfo) {
          if (representativeInfo.multiple) {
            // 다중 선거구인 경우 - 별도 처리
            clearTimeout(loadingAlert);
            setIsLoadingRepresentative(false);
            
            const representatives = representativeInfo.representatives;
            const repList = representatives.map(rep => `• ${rep.name} (${rep.district})`).join('\n');
            const apiAttribution = representativeInfo.source === 'api' ? '\n\n(Powered by whoismyrepresentative.com)' : '';
            
            Alert.alert(
              t('location.multipleRepsFound'),
              t('location.multipleRepsMessage', { stateName: stateInfo.name, zipCode, apiAttribution, repList }),
              [
                {
                  text: t('location.checkWithAddress'),
                  onPress: () => {
                    Alert.alert(
                      t('location.addressBasedSearch'),
                      t('location.addressSearchInstructions'),
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        {
                          text: t('location.openOfficialSite'),
                          onPress: () => {
                            const url = 'https://www.house.gov/representatives/find-your-representative';
                            Linking.openURL(url).catch(err => {
                              console.error('URL 열기 실패:', err);
                              Alert.alert(t('location.error'), t('location.cannotOpenBrowser'));
                            });
                          }
                        }
                      ]
                    );
                  }
                },
                ...representatives.map(rep => ({
                  text: `${rep.name} (${rep.district})`,
                  onPress: () => {
                    // 선택된 하원의원으로 전체 자동완성 실행
                    handleAutoCompleteWithSelectedRep(stateCode, rep);
                  }
                })),
                { text: '취소', style: 'cancel' }
              ]
            );
            return; // 여기서 종료
          } else {
            // 단일 선거구인 경우
            representativeText = `${representativeInfo.name} (${representativeInfo.district})${representativeInfo.source === 'api' ? ' ✨ 실시간 조회' : ''}`;
          }
          
          // API 데이터인 경우 출처 표시
          if (representativeInfo.source === 'api') {
            apiAttribution = '\n\n(Powered by whoismyrepresentative.com)';
          }
        }
        
        Alert.alert(
          t('location.autoComplete'),
          t('location.autoCompleteMessage', { 
            stateName: stateInfo.name, 
            apiAttribution, 
            capital: stateInfo.capital, 
            governor: stateInfo.governor, 
            senators: stateInfo.senators.join(', '), 
            representative: representativeText 
          }),
          [
            { text: t('location.manualInput'), onPress: () => showStateSelection(possibleStates) },
            { text: t('location.autoComplete'), onPress: () => handleAutoComplete(stateCode) }
          ]
        );
      } catch (error) {
        setIsLoadingRepresentative(false);
        console.log('Representative lookup error:', error);
        
        Alert.alert(
          t('location.autoComplete'),
          t('location.autoCompleteMessageNoRep', { 
            stateName: stateInfo.name, 
            capital: stateInfo.capital, 
            governor: stateInfo.governor, 
            senators: stateInfo.senators.join(', ') 
          }),
          [
            { text: t('location.manualInput'), onPress: () => showStateSelection(possibleStates) },
            { text: t('location.autoComplete'), onPress: () => handleAutoComplete(stateCode) }
          ]
        );
      }
      return;
    }

    // 여러 주가 가능한 경우 선택 화면으로
    showStateSelection(possibleStates);
  };

  const showStateSelection = (possibleStates) => {
    // 가능한 주들의 상세 정보 가져오기
    setPossibleStates(possibleStates.map(code => ({
      code,
      ...LocationManager.getStateInfo(code)
    })));
    setStep(2);
  };

  const handleAutoComplete = async (stateCode) => {
    try {
      const result = await LocationManager.setLocationFromZipCode(zipCode, stateCode);
      
      if (result.success) {
        const { locationInfo } = result;
        const hasRepresentatives = locationInfo.representatives && locationInfo.representatives.length > 0;
        
        let representativeText = '';
        if (hasRepresentatives) {
          if (locationInfo.representatives.length === 1) {
            const rep = locationInfo.representatives[0];
            representativeText = `• ${t('location.representative')}: ${rep.name} (${rep.district})`;
          } else {
            representativeText = `• ${t('location.representative')}: ${locationInfo.representatives.map(rep => `${rep.name} (${rep.district})`).join(', ')}`;
          }
        }
        
        const successMessage = hasRepresentatives 
          ? `${t('location.stateInfoSet', { stateName: locationInfo.stateName })}\n\n• ${t('location.capital')}: ${locationInfo.capital}\n• ${t('location.governor')}: ${locationInfo.governor === 'auto' ? t('location.autoSet') : locationInfo.governor}\n• ${t('location.senators')}: ${locationInfo.senators.join(', ')}\n${representativeText}${locationInfo.representatives.length > 1 ? '\n\n' + t('location.multipleDistrictsInfo') : ''}`
          : `${t('location.stateInfoSet', { stateName: locationInfo.stateName })}\n\n• ${t('location.capital')}: ${locationInfo.capital}\n• ${t('location.governor')}: ${locationInfo.governor === 'auto' ? t('location.autoSet') : locationInfo.governor}\n• ${t('location.senators')}: ${locationInfo.senators.join(', ')}\n\n${t('location.addRepresentativeInfo')}`;
        
        Alert.alert(
          t('location.setupComplete'),
          successMessage,
          [{ text: t('common.confirm'), onPress: () => {
            onComplete();
            onClose();
            resetModal();
          }}]
        );
      } else {
        Alert.alert(t('location.error'), result.error || t('location.setupError'));
      }
    } catch (error) {
      Alert.alert(t('location.error'), t('location.setupError'));
    }
  };

  // 선택된 하원의원과 함께 전체 자동완성 실행
  const handleAutoCompleteWithSelectedRep = async (stateCode, selectedRep) => {
    try {
      console.log('하원의원 선택 자동완성 시작');
      console.log('stateCode:', stateCode);
      console.log('selectedRep:', selectedRep);
      console.log('zipCode:', zipCode);
      
      const result = await LocationManager.setLocationFromZipCode(zipCode, stateCode);
      console.log('setLocationFromZipCode 결과:', result);
      
      if (result.success) {
        const { locationInfo } = result;
        console.log('기본 locationInfo:', locationInfo);
        
        // 선택된 하원의원만 사용하도록 수정
        const modifiedLocationInfo = {
          ...locationInfo,
          representatives: [selectedRep]
        };
        console.log('수정된 locationInfo:', modifiedLocationInfo);
        
        // 수정된 정보로 다시 저장
        const saveResult = await LocationManager.saveLocationInfo(modifiedLocationInfo);
        console.log('저장 결과:', saveResult);
        
        if (!saveResult) {
          throw new Error('위치 정보 저장 실패');
        }
        
        const representativeText = `• ${t('location.representative')}: ${selectedRep.name} (${selectedRep.district})`;
        
        const successMessage = `${t('location.stateInfoSet', { stateName: locationInfo.stateName })}\n\n• ${t('location.capital')}: ${locationInfo.capital}\n• ${t('location.governor')}: ${locationInfo.governor === 'auto' ? t('location.autoSet') : locationInfo.governor}\n• ${t('location.senators')}: ${locationInfo.senators.join(', ')}\n${representativeText}`;
        
        console.log('성공 메시지 표시 준비');
        Alert.alert(
          t('location.setupComplete'),
          successMessage,
          [{ text: t('common.confirm'), onPress: () => {
            console.log('완료 버튼 클릭');
            onComplete();
            onClose();
            resetModal();
          }}]
        );
      } else {
        console.error('setLocationFromZipCode 실패:', result.error);
        Alert.alert(t('location.error'), result.error || t('location.setupError'));
      }
    } catch (error) {
      console.error('하원의원 선택 자동완성 오류:', error);
      console.error('오류 스택:', error.stack);
      Alert.alert(t('location.error'), `${t('location.setupError')}: ${error.message}`);
    }
  };

  const handleStateSelect = (stateInfo) => {
    setSelectedState(stateInfo);
    
    // 상원의원 정보 자동 설정
    if (stateInfo.senators && stateInfo.senators.length === 2) {
      setSenators([stateInfo.senators[0], stateInfo.senators[1]]);
    }
    
    setStep(3);
  };

  const handleComplete = async () => {
    if (!selectedState) return;

    // 상원의원 확인
    if (!senators[0].trim() || !senators[1].trim()) {
      Alert.alert(
        '정보 부족',
        '두 명의 상원의원 이름을 모두 입력해주세요.\n\nsenate.gov에서 확인할 수 있습니다.',
        [
          { text: '나중에 설정', onPress: () => proceedWithIncompleteInfo() },
          { text: '계속 입력', style: 'cancel' }
        ]
      );
      return;
    }



    await saveLocationInfo();
  };

  const proceedWithIncompleteInfo = async () => {
    await saveLocationInfo();
  };

  const handleSenatorsAutoFill = async () => {
    if (!zipCode || zipCode.length !== 5) {
      Alert.alert(t('location.error'), t('location.zipCodeError'));
      return;
    }

    const possibleStates = LocationManager.getStateFromZipCode(zipCode);
    
    if (possibleStates.length === 0) {
      Alert.alert(t('location.error'), t('location.stateNotFound'));
      return;
    }

    if (possibleStates.length > 1) {
      Alert.alert(
        t('location.multipleStatesTitle'),
        t('location.multipleStatesFound', { zipCode, states: possibleStates.join(', ') })
      );
      return;
    }

    const stateCode = possibleStates[0];
    const stateInfo = LocationManager.getStateInfo(stateCode);
    
    if (stateInfo && stateInfo.senators) {
      setSenators([stateInfo.senators[0], stateInfo.senators[1]]);
      
      Alert.alert(
        '자동 조회 성공',
        `${stateInfo.name} 주의 상원의원 정보를 찾았습니다!

• 첫 번째: ${stateInfo.senators[0]}
• 두 번째: ${stateInfo.senators[1]}`
      );
    } else {
      Alert.alert(
        '조회 결과 없음',
        `${stateCode} 주의 상원의원 정보를 찾을 수 없습니다.

수동으로 입력해주세요.`
      );
    }
  };

  // 테스트 함수 추가
  const testLocationManager = async () => {
    console.log('=== LocationManager 테스트 시작 ===');
    try {
      const result = await LocationManager.setLocationFromZipCode('11361', 'NY');
      console.log('테스트 결과:', JSON.stringify(result, null, 2));
      Alert.alert('테스트 결과', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('테스트 에러:', error);
      Alert.alert('테스트 에러', error.message);
    }
  };

  const handleRepresentativeAutoFill = async () => {
    if (!zipCode || zipCode.length !== 5) {
      Alert.alert(t('location.error'), t('location.zipCodeError'));
      return;
    }

    try {
      setIsLoadingRepresentative(true);
      
      console.log('LocationManager 호출 전, zipCode:', zipCode);
      const representativeInfo = await LocationManager.getRepresentativeFromZip(zipCode);
      console.log('LocationManager 호출 후');
      
      console.log('LocationSettingsModal에서 받은 데이터:', representativeInfo);
      console.log('representativeInfo type:', typeof representativeInfo);
      console.log('representativeInfo null check:', representativeInfo === null);
      
      setIsLoadingRepresentative(false);
      
      if (representativeInfo) {
        // 여러 하원의원이 있는 경우
        if (representativeInfo.multiple) {
          console.log('다중 하원의원 처리 시작');
          const representatives = representativeInfo.representatives;
          console.log('하원의원 목록:', representatives);
          const repList = representatives.map(rep => {
            console.log(`맵핑: ${rep.name} (${rep.district})`);
            return `• ${rep.name} (${rep.district})`;
          }).join('\n');
          console.log('최종 리스트:', repList);
          
          const apiAttribution = representativeInfo.source === 'api' ? '\n\n(Powered by whoismyrepresentative.com)' : '';
          
          Alert.alert(
            '여러 하원의원 발견',
            `ZIP 코드 ${zipCode}에는 여러 선거구가 걸쳐 있습니다:${apiAttribution}\n\n${repList}\n\n정확한 주소로 확인하시겠습니까?`,
            [
              {
                text: '정확한 주소로 확인하기',
                onPress: () => {
                  Alert.alert(
                    '주소 기반 검색',
                    '정확한 하원의원을 찾기 위해 공식 사이트에서 주소를 입력해주세요.\n\n검색 후 다시 돌아와서 아래에서 선택해주세요.',
                    [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '공식 사이트 열기',
                        onPress: () => {
                          // house.gov 사이트 열기
                          const url = 'https://www.house.gov/representatives/find-your-representative';
                          Linking.openURL(url).catch(err => {
                            console.error('URL 열기 실패:', err);
                            Alert.alert(t('location.error'), t('location.cannotOpenBrowser'));
                          });
                        }
                      }
                    ]
                  );
                }
              },
              ...representatives.map(rep => ({
                text: `${rep.name} (${rep.district})`,
                onPress: () => {
                  setRepresentative(rep.name);
                  setRepresentativeDistrict(rep.district);
                }
              })),
              { text: '취소', style: 'cancel' }
            ]
          );
        } else {
          // 단일 하원의원인 경우
          setRepresentative(representativeInfo.name);
          setRepresentativeDistrict(representativeInfo.district);
          
          const sourceText = representativeInfo.source === 'api' ? ' ✨ 실시간 조회' : '';
          const apiAttribution = representativeInfo.source === 'api' ? '\n\n(Powered by whoismyrepresentative.com)' : '';
          
          Alert.alert(
            '자동 조회 성공',
            `하원의원 정보를 찾았습니다!${apiAttribution}\n\n• 이름: ${representativeInfo.name}\n• 선거구: ${representativeInfo.district}${sourceText}`
          );
        }
      } else {
        Alert.alert(
          '조회 결과 없음',
          `ZIP 코드 ${zipCode}에 대한 하원의원 정보를 찾을 수 없습니다.

수동으로 입력해주세요.`
        );
      }
    } catch (error) {
      setIsLoadingRepresentative(false);
      console.error('Representative lookup error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      Alert.alert(
        '조회 오류',
        `하원의원 정보 조회 중 오류가 발생했습니다:\n\n${error.message}\n\n수동으로 입력해주세요.`
      );
    }
  };

  const saveLocationInfo = async () => {
    const locationInfo = {
      state: selectedState.code,
      stateName: selectedState.name,
      capital: selectedState.capital,
      governor: useAutoGovernor ? 'auto' : customGovernor.trim(),
      senators: [senators[0].trim(), senators[1].trim()],
      representative: representative,
      representativeDistrict: representativeDistrict,
      zipCode: zipCode
    };

    await LocationManager.saveUserLocation(locationInfo);
    
    Alert.alert(
      '설정 완료',
      `${selectedState.name} 주 정보가 저장되었습니다.\n\n이제 지역별 문제에서 설정한 정보가 사용됩니다.`,
      [{ text: '확인', onPress: () => {
        onComplete();
        onClose();
        resetModal();
      }}]
    );
  };

  const resetModal = () => {
    setStep(1);
    setZipCode('');
    setPossibleStates([]);
    setSelectedState(null);
    setSenators(['', '']);
    setRepresentative('');
    setRepresentativeDistrict('');
    setUseAutoGovernor(true);
    setCustomGovernor('');
  };

  const renderStateItem = ({ item }) => (
    <TouchableOpacity
      style={styles.stateItem}
      onPress={() => handleStateSelect(item)}
    >
      <Text style={styles.stateText}>{item.name}</Text>
      <Text style={styles.stateDetails}>
        {t('location.capitalGovernor', { capital: item.capital, governor: item.governor })}
      </Text>
      <Text style={styles.senatorsPreview}>
        {t('location.senatorsPreview', { senators: item.senators.join(', ') })}
      </Text>
    </TouchableOpacity>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('location.zipCodeInput')}</Text>
      <Text style={styles.stepDescription}>
        {t('location.zipCodeDescription')}
      </Text>
      
      <TextInput
        style={styles.zipInput}
        value={zipCode}
        onChangeText={setZipCode}
        placeholder={t('location.zipCodePlaceholder')}
        keyboardType="numeric"
        maxLength={5}
        autoFocus={true}
      />
      
      <TouchableOpacity
        style={[styles.nextButton, !zipCode && styles.nextButtonDisabled]}
        onPress={handleZipCodeSubmit}
        disabled={!zipCode}
      >
        <Text style={styles.nextButtonText}>{t('location.next')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('location.stateSelection')}</Text>
      <Text style={styles.stepDescription}>
        {t('location.stateSelectionDescription', { zipCode })}
      </Text>
      
      <FlatList
        data={possibleStates}
        renderItem={renderStateItem}
        keyExtractor={(item) => item.code}
        style={styles.stateList}
      />
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('location.additionalInfo')}</Text>
      <Text style={styles.stepDescription}>
        {t('location.enterPoliticianInfo', { stateName: selectedState?.name })}
      </Text>

      {/* 주지사 설정 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t('location.governor')}</Text>
        
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setUseAutoGovernor(true)}
        >
          <Ionicons 
            name={useAutoGovernor ? "radio-button-on" : "radio-button-off"} 
            size={20} 
            color="#2E86AB" 
          />
          <Text style={styles.radioText}>
            {t('location.autoSetGovernor', { governor: selectedState?.governor })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setUseAutoGovernor(false)}
        >
          <Ionicons 
            name={!useAutoGovernor ? "radio-button-on" : "radio-button-off"} 
            size={20} 
            color="#2E86AB" 
          />
          <Text style={styles.radioText}>{t('location.manualInputGovernor')}</Text>
        </TouchableOpacity>

        {!useAutoGovernor && (
          <TextInput
            style={styles.textInput}
            value={customGovernor}
            onChangeText={setCustomGovernor}
            placeholder={t('location.governorPlaceholder')}
          />
        )}
      </View>

      {/* 상원의원 정보 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t('location.senatorsLabel')}</Text>
        
        {/* ZIP 코드 기반 자동 조회 버튼 */}
        <TouchableOpacity
          style={styles.autoFillButton}
          onPress={handleSenatorsAutoFill}
          disabled={!zipCode || zipCode.length !== 5}
        >
          <Ionicons name="search" size={16} color="white" />
          <Text style={styles.autoFillButtonText}>
            {t('location.autoLookupByZip', { zipCode: zipCode || '00000' })}
          </Text>
        </TouchableOpacity>
        
        {/* 수동 입력 필드 */}
        <TextInput
          style={styles.textInput}
          value={senators[0]}
          onChangeText={(text) => setSenators([text, senators[1]])}
          placeholder="첫 번째 상원의원 (예: Chuck Schumer)"
        />
        <TextInput
          style={styles.textInput}
          value={senators[1]}
          onChangeText={(text) => setSenators([senators[0], text])}
          placeholder="두 번째 상원의원 (예: Kirsten Gillibrand)"
        />
        
        <Text style={styles.helpText}>
          {t('location.senateGovInfo')}
        </Text>
      </View>

      {/* 하원의원 정보 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t('location.representative')}</Text>
        
        {/* ZIP 코드 기반 자동 조회 버튼 */}
        <TouchableOpacity
          style={styles.autoFillButton}
          onPress={handleRepresentativeAutoFill}
          disabled={!zipCode || zipCode.length !== 5}
        >
          <Ionicons name="search" size={16} color="white" />
          <Text style={styles.autoFillButtonText}>
            {t('location.autoLookupByZip', { zipCode: zipCode || '00000' })}
          </Text>
        </TouchableOpacity>
        
        {/* 수동 입력 필드 */}
        <TextInput
          style={styles.textInput}
          value={representative}
          onChangeText={setRepresentative}
          placeholder="하원의원 이름 (예: Grace Meng)"
        />
        <TextInput
          style={styles.textInput}
          value={representativeDistrict}
          onChangeText={setRepresentativeDistrict}
          placeholder="선거구 (예: NY-6)"
        />
        
        <Text style={styles.helpText}>
          {t('location.houseGovInfo')}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(2)}
        >
          <Text style={styles.backButtonText}>뒤로</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>{t('common.complete')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('location.locationSetupModal')}</Text>
          <Text style={styles.stepIndicator}>{step}/3</Text>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cancelText: {
    fontSize: theme.typography.sizes.md,
    color: '#2E86AB',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  stepIndicator: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  stepContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  stepDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  zipInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.lg,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  nextButton: {
    backgroundColor: '#2E86AB',
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  stateList: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  stateItem: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  stateText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  stateDetails: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  senatorsPreview: {
    fontSize: theme.typography.sizes.sm,
    color: '#2E86AB',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputSection: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  radioText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  autoCompleteNote: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    backgroundColor: '#f8f9fa',
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#2E86AB',
    lineHeight: 20,
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E86AB',
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    justifyContent: 'center',
  },
  autoFillButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    marginLeft: theme.spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
  },
  backButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    backgroundColor: '#f8f9fa',
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
  },
  completeButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    backgroundColor: '#2E86AB',
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});

export default LocationSettingsModal;
