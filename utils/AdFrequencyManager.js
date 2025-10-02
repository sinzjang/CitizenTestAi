import AsyncStorage from '@react-native-async-storage/async-storage';

class AdFrequencyManager {
  constructor() {
    this.STORAGE_KEY = '@ad_frequency_data';
    this.MAX_ADS_PER_HOUR = 1;
    this.MAX_ADS_PER_SESSION = 2;
    this.MIN_INTERVAL_MINUTES = 10;
  }

  // 광고 표시 기록 저장
  async recordAdShown(adType = 'interstitial') {
    try {
      const now = Date.now();
      const data = await this.getAdData();
      
      if (!data.history) data.history = [];
      
      data.history.push({
        type: adType,
        timestamp: now,
        sessionId: data.currentSessionId
      });
      
      // 24시간 이전 기록 정리
      data.history = data.history.filter(
        record => now - record.timestamp < 24 * 60 * 60 * 1000
      );
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('[AdFrequencyManager] 광고 표시 기록됨:', adType);
    } catch (error) {
      console.error('[AdFrequencyManager] 기록 저장 실패:', error);
    }
  }

  // 광고 표시 가능 여부 확인
  async canShowAd(adType = 'interstitial') {
    try {
      const data = await this.getAdData();
      const now = Date.now();
      
      if (!data.history) return true;
      
      // 현재 세션에서 표시된 광고 수
      const sessionAds = data.history.filter(
        record => record.sessionId === data.currentSessionId
      );
      
      if (sessionAds.length >= this.MAX_ADS_PER_SESSION) {
        console.log('[AdFrequencyManager] 세션 한도 초과');
        return false;
      }
      
      // 지난 1시간 내 광고 수
      const hourAds = data.history.filter(
        record => now - record.timestamp < 60 * 60 * 1000
      );
      
      if (hourAds.length >= this.MAX_ADS_PER_HOUR) {
        console.log('[AdFrequencyManager] 시간당 한도 초과');
        return false;
      }
      
      // 최소 간격 확인
      const lastAd = data.history
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (lastAd && now - lastAd.timestamp < this.MIN_INTERVAL_MINUTES * 60 * 1000) {
        console.log('[AdFrequencyManager] 최소 간격 미달');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[AdFrequencyManager] 확인 실패:', error);
      return true; // 오류 시 광고 허용
    }
  }

  // 새 세션 시작
  async startNewSession() {
    try {
      const data = await this.getAdData();
      data.currentSessionId = Date.now().toString();
      data.sessionStartTime = Date.now();
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('[AdFrequencyManager] 새 세션 시작:', data.currentSessionId);
    } catch (error) {
      console.error('[AdFrequencyManager] 세션 시작 실패:', error);
    }
  }

  // 광고 데이터 가져오기
  async getAdData() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      
      // 초기 데이터 생성
      const initialData = {
        currentSessionId: Date.now().toString(),
        sessionStartTime: Date.now(),
        history: []
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    } catch (error) {
      console.error('[AdFrequencyManager] 데이터 로드 실패:', error);
      return {
        currentSessionId: Date.now().toString(),
        sessionStartTime: Date.now(),
        history: []
      };
    }
  }

  // 통계 조회
  async getStats() {
    try {
      const data = await this.getAdData();
      const now = Date.now();
      
      const sessionAds = data.history?.filter(
        record => record.sessionId === data.currentSessionId
      ) || [];
      
      const hourAds = data.history?.filter(
        record => now - record.timestamp < 60 * 60 * 1000
      ) || [];
      
      const lastAd = data.history?.sort((a, b) => b.timestamp - a.timestamp)[0];
      
      return {
        sessionCount: sessionAds.length,
        hourCount: hourAds.length,
        lastAdTime: lastAd?.timestamp,
        canShow: await this.canShowAd()
      };
    } catch (error) {
      console.error('[AdFrequencyManager] 통계 조회 실패:', error);
      return null;
    }
  }
}

export default new AdFrequencyManager();
