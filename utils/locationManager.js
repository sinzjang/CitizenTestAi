import AsyncStorage from '@react-native-async-storage/async-storage';
import US_POLITICAL_DATA from '../data/us_political_data.json';
import US_REPRESENTATIVES from '../data/us_representatives.json';

const LOCATION_KEY = '@user_location_info';

class LocationManager {
  // 사용자 위치 정보 저장
  static async saveUserLocation(locationInfo) {
    try {
      await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(locationInfo));
      return true;
    } catch (error) {
      console.error('Error saving location info:', error);
      return false;
    }
  }

  // 사용자 위치 정보 가져오기
  static async getUserLocation() {
    try {
      const locationInfo = await AsyncStorage.getItem(LOCATION_KEY);
      return locationInfo ? JSON.parse(locationInfo) : null;
    } catch (error) {
      console.error('Error getting location info:', error);
      return null;
    }
  }

  // 주 목록 가져오기
  static getStates() {
    return US_POLITICAL_DATA.states;
  }

  // 특정 주의 정보 가져오기
  static getStateInfo(stateCode) {
    return US_POLITICAL_DATA.states[stateCode] || null;
  }

  // 주의 주도 가져오기
  static getStateCapital(stateCode) {
    const state = US_POLITICAL_DATA.states[stateCode];
    return state ? state.capital : 'Answers will vary';
  }

  // 주의 주지사 가져오기
  static getStateGovernor(stateCode) {
    const state = US_POLITICAL_DATA.states[stateCode];
    return state ? state.governor : 'Answers will vary';
  }

  // 주의 상원의원 가져오기
  static getStateSenators(stateCode) {
    const state = US_POLITICAL_DATA.states[stateCode];
    return state ? state.senators : [];
  }

  // 연방 정부 정보 가져오기
  static getPresident() {
    return US_POLITICAL_DATA.federal?.president || 'Answers will vary';
  }

  static getVicePresident() {
    return US_POLITICAL_DATA.federal?.vicePresident || 'Answers will vary';
  }

  static getSpeakerOfHouse() {
    return US_POLITICAL_DATA.federal?.speakerOfHouse || 'Answers will vary';
  }

  // ZIP 코드로 하원의원 찾기 (API 우선 방식)
  static async getRepresentativeFromZip(zipCode, stateCode = null) {
    console.log('\n🔍 === ZIP 코드 조회 시작 ===');
    console.log('입력 ZIP 코드:', zipCode);
    console.log('입력 State 코드:', stateCode);
    console.log('조회 시간:', new Date().toLocaleString());
    
    // 1단계: whoismyrepresentative.com API 우선 시도
    console.log('\n🌐 1단계: API 우선 조회 시도');
    try {
      const apiResult = await this.getRepresentativeFromAPI(zipCode);
      
      if (apiResult) {
        console.log('✅ API 조회 성공! 결과 반환');
        console.log('반환 데이터 소스:', apiResult.source);
        
        // stateCode가 제공되었으면 해당 주의 데이터만 필터링
        if (stateCode && apiResult.multiple) {
          const filteredReps = apiResult.representatives.filter(rep => 
            rep.district.startsWith(stateCode + '-')
          );
          if (filteredReps.length > 0) {
            apiResult.representatives = filteredReps;
            console.log(`${stateCode} 주로 필터링된 결과:`, filteredReps.length, '명');
          }
        }
        
        // API 결과를 캐시에 저장
        try {
          await AsyncStorage.setItem(`@zip_cache_${zipCode}`, JSON.stringify({
            data: apiResult,
            timestamp: Date.now()
          }));
          console.log('💾 캐시 저장 성공');
        } catch (cacheError) {
          console.log('⚠️ 캐시 저장 실패:', cacheError);
        }
        
        console.log('🎆 === 최종 결과: API 데이터 반환 ===\n');
        return apiResult;
      } else {
        console.log('❌ API에서 데이터를 찾지 못함');
      }
    } catch (apiError) {
      console.log('❌ API 조회 중 오류 발생:', apiError.message);
    }
    
    // 2단계: 캐시에서 찾기
    console.log('\n💾 2단계: 캐시 데이터 확인');
    try {
      const cached = await AsyncStorage.getItem(`@zip_cache_${zipCode}`);
      if (cached) {
        console.log('💾 캐시 데이터 발견');
        const cachedData = JSON.parse(cached);
        const cacheAge = Date.now() - cachedData.timestamp;
        const cacheAgeDays = Math.floor(cacheAge / (24 * 60 * 60 * 1000));
        console.log('캐시 데이터 나이:', cacheAgeDays, '일');
        
        // 30일 이내 데이터만 사용
        if (cacheAge < 30 * 24 * 60 * 60 * 1000) {
          console.log('✅ 캐시 데이터 유효! 반환');
          console.log('🎆 === 최종 결과: 캐시 데이터 반환 ===\n');
          return {
            ...cachedData.data,
            source: 'cache'
          };
        } else {
          console.log('❌ 캐시 데이터 만료 (30일 초과)');
        }
      } else {
        console.log('❌ 캐시 데이터 없음');
      }
    } catch (cacheError) {
      console.log('❌ 캐시 읽기 오류:', cacheError.message);
    }
    
    // 3단계: 로컴 데이터에서 찾기 (폴백)
    console.log('\n📚 3단계: 로컴 데이터 폴백 조회');
    const districtData = US_REPRESENTATIVES.zipToDistrict.mappings[zipCode];
    console.log('로컴 데이터 검색 결과:', districtData);
    
    if (districtData) {
      // 단일 선거구인 경우
      if (typeof districtData === 'string' && US_REPRESENTATIVES.representatives[districtData]) {
        // stateCode가 제공되었으면 해당 주의 선거구인지 확인
        if (stateCode && !districtData.startsWith(stateCode + '-')) {
          console.log(`❌ 선거구 ${districtData}는 ${stateCode} 주가 아님`);
        } else {
          console.log('✅ 로컴 데이터에서 단일 선거구 발견:', districtData);
          console.log('하원의원:', US_REPRESENTATIVES.representatives[districtData]);
          console.log('🎆 === 최종 결과: 로컴 데이터 반환 ===\n');
          return {
            district: districtData,
            name: US_REPRESENTATIVES.representatives[districtData],
            source: 'local'
          };
        }
      }
      
      // 다중 선거구인 경우
      if (Array.isArray(districtData)) {
        console.log('✅ 로컴 데이터에서 다중 선거구 발견:', districtData);
        let filteredDistricts = districtData;
        
        // stateCode가 제공되었으면 해당 주의 선거구만 필터링
        if (stateCode) {
          filteredDistricts = districtData.filter(district => district.startsWith(stateCode + '-'));
          console.log(`${stateCode} 주로 필터링된 선거구:`, filteredDistricts);
        }
        
        const representatives = filteredDistricts.map(district => ({
          district,
          name: US_REPRESENTATIVES.representatives[district]
        })).filter(rep => rep.name);
        
        console.log('다중 하원의원 매핑 결과:', representatives.length, '명');
        representatives.forEach((rep, index) => {
          console.log(`  ${index + 1}. ${rep.name} (${rep.district})`);
        });
        
        if (representatives.length > 0) {
          console.log('🎆 === 최종 결과: 로컴 다중 데이터 반환 ===\n');
          return {
            multiple: true,
            representatives: representatives,
            source: 'local'
          };
        } else {
          console.log('❌ 다중 선거구이지만 유효한 하원의원 데이터 없음');
        }
      }
    } else {
      console.log('❌ 로컴 데이터에서 ZIP 코드를 찾지 못함');
    }

    console.log('❌ === 모든 데이터 소스에서 결과 없음 ===\n');
    return null;
  }

  // whoismyrepresentative.com API로 하원의원 정보 조회
  static async getRepresentativeFromAPI(zipCode) {
    console.log('\n=== API 호출 시작 ===');
    console.log('호출 대상 ZIP 코드:', zipCode);
    console.log('호출 시간:', new Date().toISOString());
    
    try {
      const apiUrl = `https://whoismyrepresentative.com/getall_mems.php?zip=${zipCode}&output=json`;
      console.log('요청 URL:', apiUrl);
      console.log('요청 시작 시간:', new Date().toISOString());
      
      // 타임아웃 구현 (빠른 폴백을 위해 짧게 설정)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1초 타임아웃
      
      try {
        // getall_mems.php 사용 - 모든 의원 정보 반환
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CitizenTestAI/1.0'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('요청 완료 시간:', new Date().toISOString());
        
        console.log('HTTP 상태 코드:', response.status);
        console.log('HTTP 상태 메시지:', response.statusText);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('\n=== API 응답 데이터 ===');
        console.log('JSON 파싱 성공');
        console.log('전체 데이터:', JSON.stringify(data, null, 2));
        console.log('결과 개수:', data.results ? data.results.length : 0);
        
        if (data.results && data.results.length > 0) {
          console.log('\n=== API 데이터 처리 ===');
        console.log('전체 의원 데이터:');
        data.results.forEach((member, index) => {
          console.log(`  ${index + 1}. ${member.name} - ${member.office} - ${member.district || 'N/A'}`);
          console.log(`     전체 데이터:`, JSON.stringify(member, null, 2));
        });
        
        // 하원의원 필터링 로직 수정
        // API에서 office가 "Representative"인 경우를 하원의원으로 판단
        const representatives = data.results.filter(r => {
          // office 필드가 "Representative"이거나 district 필드가 있으면 하원의원
          return r.office === 'Representative' || (r.district && r.district !== '');
        });
        console.log('하원의원 필터링 결과 (office/district 기준):', representatives.length, '명');
        
        if (representatives.length === 0) {
          console.log('❌ 하원의원 데이터 없음');
          console.log('=== API 호출 종료 (null 반환) ===\n');
          return null;
        }
        
        if (representatives.length === 1) {
          // 단일 하원의원
          const rep = representatives[0];
          console.log('\n✅ 단일 하원의원 발견:');
          console.log('  이름:', rep.name);
          console.log('  선거구:', rep.district);
          console.log('  전화:', rep.phone);
          console.log('  사무실:', rep.office);
          console.log('  웹사이트:', rep.website);
          console.log('=== API 호출 성공 (API 데이터 반환) ===\n');
          
          // 선거구 형식을 NY-6 형태로 변환
          const formattedDistrict = rep.state ? `${rep.state}-${rep.district}` : rep.district;
          
          return {
            name: rep.name,
            district: formattedDistrict,
            phone: rep.phone,
            office: rep.office,
            website: rep.website,
            source: 'api'
          };
        } else {
          // 다중 하원의원 (드물지만 가능)
          console.log('\n✅ 다중 하원의원 발견:', representatives.length, '명');
          representatives.forEach((rep, index) => {
            const formattedDistrict = rep.state ? `${rep.state}-${rep.district}` : rep.district;
            console.log(`  ${index + 1}. ${rep.name} (${formattedDistrict})`);
          });
          console.log('=== API 호출 성공 (다중 API 데이터 반환) ===\n');
          
          return {
            multiple: true,
            representatives: representatives.map(rep => {
              const formattedDistrict = rep.state ? `${rep.state}-${rep.district}` : rep.district;
              return {
                name: rep.name,
                district: formattedDistrict,
                phone: rep.phone,
                office: rep.office,
                website: rep.website
              };
            }),
            source: 'api'
          };
        }
        } else {
          console.log('\n❌ API 결과 없음 - data.results가 비어있거나 없음');
          console.log('=== API 호출 종료 (null 반환) ===\n');
          return null;
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.log('\n❌ === Fetch 오류 발생 ===');
        console.error('Fetch 오류:', fetchError.message);
        throw fetchError;
      }
    } catch (error) {
      console.log('\n❌ === API 오류 발생 ===');
      console.error('API 오류 유형:', error.name);
      console.error('API 오류 메시지:', error.message);
      console.error('API 오류 스택:', error.stack);
      console.log('=== API 호출 실패 (null 반환) ===\n');
      return null;
    }
  }

  // 선거구별 하원의원 가져오기
  static getRepresentativeByDistrict(district) {
    return US_REPRESENTATIVES.representatives[district] || null;
  }

  // ZIP 코드로 주 찾기
  static getStateFromZipCode(zipCode) {
    // 1단계: 정확한 ZIP 코드 매핑 확인
    if (US_POLITICAL_DATA.zipToState.exactMappings[zipCode]) {
      return [US_POLITICAL_DATA.zipToState.exactMappings[zipCode]];
    }
    
    // 2단계: 범위로 찾기 (기존 방식)
    const firstDigit = zipCode.charAt(0);
    
    const zipToStateMap = {
      '0': ['CT', 'MA', 'ME', 'NH', 'NJ', 'RI', 'VT'],
      '1': ['DE', 'NY', 'PA'],
      '2': ['MD', 'NC', 'SC', 'VA', 'WV', 'DC'],
      '3': ['AL', 'FL', 'GA', 'MS', 'TN'],
      '4': ['IN', 'KY', 'MI', 'OH'],
      '5': ['IA', 'MN', 'MT', 'ND', 'SD', 'WI'],
      '6': ['IL', 'KS', 'MO', 'NE'],
      '7': ['AR', 'LA', 'OK', 'TX'],
      '8': ['AZ', 'CO', 'ID', 'NM', 'NV', 'UT', 'WY'],
      '9': ['AK', 'CA', 'HI', 'OR', 'WA']
    };
    
    const possibleStates = zipToStateMap[firstDigit];
    return possibleStates || [];
  }

  // ZIP 코드로 주 정보 자동 설정
  static async setLocationFromZipCode(zipCode, selectedStateCode = null) {
    let stateCode = selectedStateCode;
    
    // 주가 선택되지 않았으면 ZIP 코드로 추정
    if (!stateCode) {
      const possibleStates = this.getStateFromZipCode(zipCode);
      if (possibleStates.length === 1) {
        stateCode = possibleStates[0];
      } else {
        return { success: false, possibleStates };
      }
    }
    
    const stateInfo = this.getStateInfo(stateCode);
    if (!stateInfo) {
      return { success: false, error: '주 정보를 찾을 수 없습니다.' };
    }
    
    // 하원의원 정보 찾기
    const representativeInfo = await this.getRepresentativeFromZip(zipCode);
    console.log('setLocationFromZipCode에서 받은 하원의원 데이터:', representativeInfo);
  
    // 하원의원 정보 처리 (다중 선거구 지원)
    let representatives = [];
    
    if (representativeInfo) {
      if (representativeInfo.multiple) {
        // 다중 선거구인 경우 - 모든 하원의원 저장
        console.log('다중 선거구 감지, 모든 하원의원 저장');
        representatives = representativeInfo.representatives;
        console.log(`저장될 하원의원 목록:`, representatives);
      } else {
        // 단일 선거구인 경우
        representatives = [{
          name: representativeInfo.name || '',
          district: representativeInfo.district || ''
        }];
      }
    }
  
    // 자동으로 모든 정보 설정
    const locationInfo = {
      state: stateCode,
      stateName: stateInfo.name,
      capital: stateInfo.capital,
      governor: 'auto', // 자동 설정 표시
      senators: stateInfo.senators, // 자동으로 상원의원 설정
      representatives: representatives, // 하원의원 배열 (다중 지원)
      zipCode: zipCode
    };
    
    await this.saveUserLocation(locationInfo);
    return { success: true, locationInfo };
  }

  // 사용자 설정 기반으로 답변 생성
  static async getLocationBasedAnswer(questionType) {
    console.log('🔍 LocationManager.getLocationBasedAnswer 호출됨');
    console.log('요청된 질문 타입:', questionType);
    
    const userLocation = await this.getUserLocation();
    console.log('사용자 위치 정보:', userLocation);
    
    if (!userLocation) {
      console.log('❌ 사용자 위치 정보가 없음');
      return 'Answers will vary';
    }

    switch (questionType) {
      case 'state_capital':
        const capital = this.getStateCapital(userLocation.state);
        console.log('주도:', capital);
        return capital;
      
      case 'governor':
        // 사용자가 직접 설정한 주지사가 있으면 그것을 사용, 없으면 기본 주지사 정보 사용
        if (userLocation.governor && userLocation.governor !== 'auto') {
          console.log('사용자 설정 주지사:', userLocation.governor);
          return userLocation.governor;
        }
        // 자동으로 설정된 주지사 정보 사용
        const governor = this.getStateGovernor(userLocation.state);
        console.log('자동 주지사:', governor);
        return governor;
      
      case 'senator':
        if (userLocation.senators && userLocation.senators.length > 0) {
          // 상원의원이 2명인 경우 두 명 모두 표시
          if (userLocation.senators.length >= 2) {
            const bothSenators = `${userLocation.senators[0]} or ${userLocation.senators[1]}`;
            console.log('상원의원 (2명):', bothSenators);
            return bothSenators;
          } else {
            console.log('상원의원 (1명):', userLocation.senators[0]);
            return userLocation.senators[0];
          }
        }
        console.log('❌ 상원의원 정보 없음');
        return 'Answers will vary';
      
      case 'representative':
        // representatives 배열에서 첫 번째 하원의원 이름 가져오기
        if (userLocation.representatives && userLocation.representatives.length > 0) {
          const representative = userLocation.representatives[0].name;
          console.log('🏛️ 하원의원 정보:', representative);
          console.log('userLocation.representatives[0]:', userLocation.representatives[0]);
          return representative;
        }
        console.log('❌ 하원의원 정보 없음');
        return 'Answers will vary';
      
      case 'speaker':
        // 하원의장 정보
        const speaker = this.getSpeakerOfHouse();
        console.log('🏛️ 하원의장:', speaker);
        return speaker;
      
      case 'president':
        // 대통령 정보
        const president = this.getPresident();
        console.log('🇺🇸 대통령:', president);
        return president;
      
      case 'vice_president':
        // 부통령 정보
        const vicePresident = this.getVicePresident();
        console.log('🏛️ 부통령:', vicePresident);
        return vicePresident;
      
      default:
        console.log('❌ 알 수 없는 질문 타입:', questionType);
        return 'Answers will vary';
    }
  }

  // 위치 정보 삭제
  static async clearUserLocation() {
    try {
      await AsyncStorage.removeItem(LOCATION_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing location info:', error);
      return false;
    }
  }

  // 디버깅용: 사용자 위치 정보 상세 출력
  static async debugUserLocation() {
    console.log('\n🔍 === 사용자 위치 정보 디버깅 ===');
    try {
      const locationInfo = await AsyncStorage.getItem(LOCATION_KEY);
      console.log('저장된 원본 데이터:', locationInfo);
      
      if (locationInfo) {
        const parsed = JSON.parse(locationInfo);
        console.log('파싱된 데이터:', parsed);
        console.log('주:', parsed.state);
        console.log('하원의원:', parsed.representative);
        console.log('상원의원:', parsed.senators);
        console.log('주지사:', parsed.governor);
        return parsed;
      } else {
        console.log('❌ 저장된 위치 정보가 없습니다');
        return null;
      }
    } catch (error) {
      console.error('디버깅 중 오류:', error);
      return null;
    }
  }

  // 위치 정보 저장 (수정된 데이터용)
  static async saveLocationInfo(locationInfo) {
    try {
      await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(locationInfo));
      console.log('수정된 위치 정보 저장 성공:', locationInfo);
      return true;
    } catch (error) {
      console.error('Error saving modified location info:', error);
      return false;
    }
  }
}

export default LocationManager;
