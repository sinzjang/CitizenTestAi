// LocationSettingsModal.js에서 다중언어 적용 예시

import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { t } from '../utils/i18n'; // i18n 유틸 import

const LocationSettingsModal = () => {
  // 기존 코드...

  const handleRepresentativeAutoFill = async () => {
    if (!zipCode || zipCode.length !== 5) {
      Alert.alert(t('common.error'), t('location.enterZipCode'));
      return;
    }

    try {
      setIsLoadingRepresentative(true);
      const representativeInfo = await LocationManager.getRepresentativeFromZip(zipCode);
      setIsLoadingRepresentative(false);
      
      if (representativeInfo) {
        if (representativeInfo.multiple) {
          const representatives = representativeInfo.representatives;
          const repList = representatives.map(rep => `• ${rep.name} (${rep.district})`).join('\n');
          const apiAttribution = representativeInfo.source === 'api' ? `\n\n${t('location.poweredBy')}` : '';
          
          Alert.alert(
            t('location.multipleRepresentatives'),
            `ZIP ${t('common.code')} ${zipCode}${t('location.multipleDistrictsMessage')}:${apiAttribution}\n\n${repList}\n\n${t('location.selectRepresentative')}`,
            [
              {
                text: t('location.checkWithAddress'),
                onPress: () => {
                  Alert.alert(
                    t('location.addressBasedSearch'),
                    t('location.officialSiteGuide'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('location.openOfficialSite'),
                        onPress: () => {
                          const url = 'https://www.house.gov/representatives/find-your-representative';
                          Linking.openURL(url).catch(err => {
                            Alert.alert(t('common.error'), t('common.browserError'));
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
              { text: t('common.cancel'), style: 'cancel' }
            ]
          );
        } else {
          // 단일 하원의원
          setRepresentative(representativeInfo.name);
          setRepresentativeDistrict(representativeInfo.district);
          
          const sourceText = representativeInfo.source === 'api' ? ' ✨ 실시간 조회' : '';
          const apiAttribution = representativeInfo.source === 'api' ? `\n\n${t('location.poweredBy')}` : '';
          
          Alert.alert(
            t('location.autoSearchSuccess'),
            `${t('location.representativeFound')}${apiAttribution}\n\n• ${t('location.name')}: ${representativeInfo.name}\n• ${t('location.district')}: ${representativeInfo.district}${sourceText}`
          );
        }
      } else {
        Alert.alert(
          t('location.noResults'),
          t('location.noRepresentativeFound', { zipCode })
        );
      }
    } catch (error) {
      setIsLoadingRepresentative(false);
      Alert.alert(
        t('location.searchError'),
        t('location.searchErrorMessage', { error: error.message })
      );
    }
  };

  // 기존 코드...
};

export default LocationSettingsModal;
