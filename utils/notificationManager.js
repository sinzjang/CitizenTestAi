// 로컬 알림 관리 시스템
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// expo-notifications 동적 로드
let Notifications = null;
let NOTIFICATIONS_AVAILABLE = false;

try {
  Notifications = require('expo-notifications');
  NOTIFICATIONS_AVAILABLE = true;
  
  // 알림 핸들러 설정
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      try {
        const data = notification?.request?.content?.data || {};
        const scheduledAt = typeof data.scheduledAt === 'number' ? data.scheduledAt : 0;
        const isReminder = data?.type === 'daily_reminder';
        const elapsed = Date.now() - scheduledAt;
        // 예약 직후(예: 15초) 튀어나오는 즉시 발송을 UX상 숨김 처리
        const withinSuppression = isReminder && scheduledAt > 0 && elapsed >= 0 && elapsed < 15000;
        return {
          shouldShowBanner: !withinSuppression,
          shouldShowList: !withinSuppression,
          shouldPlaySound: !withinSuppression,
          shouldSetBadge: false,
        };
      } catch (e) {
        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        };
      }
    },
  });
} catch (error) {
  console.log('Notifications not available - will be enabled after native build');
}

export class NotificationManager {
  // 알림 권한 요청 (조용히, Alert 없이)
  static async requestPermissions(showAlert = false) {
    if (!NOTIFICATIONS_AVAILABLE) {
      // 네이티브 빌드가 아닐 때는 조용히 실패 (팝업 없음)
      console.log('⚠️ Notifications not available in this environment');
      return false;
    }
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        if (showAlert) {
          Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
        }
        return false;
      }
      
      // Android 채널 설정
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('study-reminders', {
          name: 'Study Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2E86AB',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  // 가까운 1회성 알림 발생 시각 계산 (로컬 시간 기준)
  static _computeNextOneOff(reminders) {
    try {
      const now = new Date();
      let best = null; // { date: Date, reminder }
      for (const reminder of reminders) {
        if (reminder.days && reminder.days.length > 0) {
          for (const dayId of reminder.days) {
            const candidate = NotificationManager._nextDateForWeekday(dayId, reminder.hour, reminder.minute, 0);
            if ((!best || candidate.getTime() < best.date.getTime()) && candidate.getTime() > now.getTime()) {
              best = { date: candidate, reminder };
            }
          }
        } else {
          // 매일 반복인 경우: 오늘 기준으로 계산 (이미 지났으면 보정 처리)
          const candidate = NotificationManager._nextDateForWeekday(now.getDay(), reminder.hour, reminder.minute, 0, true);
          if ((!best || candidate.getTime() < best.date.getTime()) && candidate.getTime() > now.getTime()) {
            best = { date: candidate, reminder };
          }
        }
      }
      return best;
    } catch (_) {
      return null;
    }
  }

  // dayId: 0=Sun..6=Sat
  static _nextDateForWeekday(dayId, hour, minute, second = 0, daily = false) {
    const now = new Date();
    const target = new Date(now);
    // daily=true이면 오늘 기준으로만 계산, 아니면 다음 해당 요일까지 이동
    let deltaDays = daily ? 0 : ((dayId - now.getDay() + 7) % 7);
    target.setDate(now.getDate() + deltaDays);
    target.setHours(hour, minute, second, 0);
    // 이미 지났다면 보정: 같은 시/분 내 60초 이내면 지금으로부터 5초 뒤, 아니면 다음 날/주로 이동
    if (target.getTime() <= now.getTime()) {
      const sameHour = now.getHours() === hour;
      const sameMinute = now.getMinutes() === minute;
      const ref = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second, 0);
      const secondsPast = (now.getTime() - ref.getTime()) / 1000;
      if (sameHour && sameMinute && secondsPast >= 0 && secondsPast < 60) {
        return new Date(now.getTime() + 5000); // 5초 뒤 즉시 알림 보정
      }
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  // 매일 반복 알림 설정
  static async scheduleDailyReminder(hour, minute) {
    if (!NOTIFICATIONS_AVAILABLE) {
      // 설정만 저장 (네이티브 빌드 후 작동)
      await AsyncStorage.setItem('@notification_settings', JSON.stringify({
        enabled: true,
        hour,
        minute,
      }));
      return false;
    }
    
    try {
      // 기존 알림 취소
      await this.cancelAllReminders();
      
      // 매일 반복 알림 예약
      const trigger = {
        hour: hour,
        minute: minute,
        second: 0,
        repeats: true, // 매일 반복
      };
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🇺🇸 Citizenship Test Reminder',
          body: 'Time to practice! Keep studying for your citizenship interview.',
          data: { type: 'daily_reminder' },
          sound: true,
        },
        trigger,
      });
      
      // 설정 저장
      await AsyncStorage.setItem('@notification_settings', JSON.stringify({
        enabled: true,
        hour,
        minute,
        notificationId,
      }));
      
      console.log('✅ Daily reminder scheduled:', { hour, minute, notificationId });
      return true;
    } catch (error) {
      console.error('Schedule error:', error);
      return false;
    }
  }

  // 모든 알림 취소
  static async cancelAllReminders() {
    if (!NOTIFICATIONS_AVAILABLE) {
      return;
    }
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All reminders cancelled');
    } catch (error) {
      console.error('Cancel error:', error);
    }
  }

  // 알림 설정 가져오기
  static async getSettings() {
    try {
      const settings = await AsyncStorage.getItem('@notification_settings');
      if (settings) {
        return JSON.parse(settings);
      }
      return {
        enabled: false,
        reminders: [{ id: 1, hour: 9, minute: 0, days: [1, 2, 3, 4, 5] }],
      };
    } catch (error) {
      console.error('알림 설정 로드 오류:', error);
      return {
        enabled: false,
        reminders: [{ id: 1, hour: 9, minute: 0, days: [1, 2, 3, 4, 5] }],
      };
    }
  }

  // 여러 알림 저장
  static async saveReminders(reminders) {
    if (!NOTIFICATIONS_AVAILABLE) {
      // 설정만 저장
      await AsyncStorage.setItem('@notification_settings', JSON.stringify({
        enabled: true,
        reminders,
      }));
      return false;
    }

    try {
      // 기존 알림 모두 취소
      await this.cancelAllReminders();
      console.log('🗑️ All previous notifications cancelled');
      console.log(`[Diag] NOTIFICATIONS_AVAILABLE=${NOTIFICATIONS_AVAILABLE}`);

      let scheduledCount = 0;

      // 각 리마인더마다 요일/시간 기준으로 반복 알림 생성
      for (const reminder of reminders) {
        console.log(`📝 Processing reminder ${reminder.id}: ${reminder.title}, days:`, reminder.days);
        
        // 요일이 선택되어 있으면 해당 요일에만, 없으면 매일
        if (reminder.days && reminder.days.length > 0) {
          // 모든 요일(0..6)이 선택된 경우: 주간 7개 대신 매일 반복 1개로 단순화
          const isAllDays = reminder.days.length === 7 && [0,1,2,3,4,5,6].every(d => reminder.days.includes(d));
          if (isAllDays) {
            const trigger = {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: reminder.hour,
              minute: reminder.minute,
              repeats: true,
            };
            const notifId = await Notifications.scheduleNotificationAsync({
              content: {
                title: `🇺🇸 ${reminder.title || 'Study Reminder'}`,
                body: 'Time to practice! Keep studying for your citizenship interview.',
                data: { type: 'daily_reminder', reminderId: reminder.id, scheduledAt: Date.now() },
                sound: true,
                android: Platform.OS === 'android' ? { channelId: 'study-reminders' } : undefined,
              },
              trigger,
            });
            scheduledCount++;
            console.log(`  ✅ Scheduled daily (all days) at ${reminder.hour}:${reminder.minute.toString().padStart(2,'0')} - ID: ${notifId}`);
            continue; // 다음 리마인더로
          }
          // 선택된 각 요일마다 주간 반복 알림 생성
          for (const dayId of reminder.days) {
            // Expo의 주간 반복 트리거 사용 (weekday: 1=Sun ... 7=Sat)
            const expoWeekday = dayId + 1; // 0~6(우리 기준) -> 1~7(Expo 기준)
            const trigger = {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: expoWeekday,
              hour: reminder.hour,
              minute: reminder.minute,
              repeats: true,
            };

            console.log(`  🔔 Creating weekly trigger:`, {
              dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayId],
              hour: reminder.hour,
              minute: reminder.minute,
              expoWeekday,
            });

            const notifId = await Notifications.scheduleNotificationAsync({
              content: {
                title: `🇺🇸 ${reminder.title || 'Study Reminder'}`,
                body: 'Time to practice! Keep studying for your citizenship interview.',
                data: { 
                  type: 'daily_reminder', 
                  reminderId: reminder.id,
                  dayId: dayId,
                  scheduledAt: Date.now(),
                },
                sound: true,
                android: Platform.OS === 'android' ? { channelId: 'study-reminders' } : undefined,
              },
              trigger,
            });
            scheduledCount++;
            console.log(`  ✅ Scheduled weekly for ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayId]} at ${reminder.hour}:${reminder.minute.toString().padStart(2,'0')} - ID: ${notifId}`);
          }
        } else {
          // 요일 선택 없으면 매일 반복
          const trigger = {
            hour: reminder.hour,
            minute: reminder.minute,
            second: 0,
            repeats: true,
          };

          const notifId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `🇺🇸 ${reminder.title || 'Study Reminder'}`,
              body: 'Time to practice! Keep studying for your citizenship interview.',
              data: { type: 'daily_reminder', reminderId: reminder.id, scheduledAt: Date.now() },
              sound: true,
              android: Platform.OS === 'android' ? { channelId: 'study-reminders' } : undefined,
            },
            trigger,
          });
          scheduledCount++;
          console.log(`  ✅ Scheduled daily at ${reminder.hour}:${reminder.minute.toString().padStart(2,'0')} - ID: ${notifId}`);
        }
      }

      // 설정 저장
      await AsyncStorage.setItem('@notification_settings', JSON.stringify({
        enabled: true,
        reminders,
      }));

      console.log(`✅ TOTAL: ${scheduledCount} notifications scheduled for ${reminders.length} reminders`);

      // 직후 테스트용 1회성 알림과 fallback은 비활성화 (요청에 따라 더미 푸시 제거)

      // 예약된 알림 확인 (타이밍 이슈 방지를 위한 짧은 대기 후 조회)
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (e) {}
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📋 Currently scheduled notifications: ${scheduled.length}`);
      try {
        scheduled.forEach((it, idx) => {
          const trg = it?.trigger || {};
          console.log(`  #${idx + 1} -> type=${trg.type || 'unknown'} hour=${trg.hour ?? '-'} minute=${trg.minute ?? '-'} weekday=${trg.weekday ?? '-'} date=${trg.date ? new Date(trg.date).toString() : '-'}`);
        });
      } catch (e) {}
      
      return true;
    } catch (error) {
      console.error('Save reminders error:', error);
      return false;
    }
  }

  // 알림 비활성화
  static async disableReminders() {
    try {
      await this.cancelAllReminders();
      await AsyncStorage.setItem('@notification_settings', JSON.stringify({
        enabled: false,
        hour: 9,
        minute: 0,
      }));
      console.log('✅ Reminders disabled');
      return true;
    } catch (error) {
      console.error('알림 비활성화 오류:', error);
      return false;
    }
  }

  // 예약된 알림 목록 확인 (디버깅용)
  static async getScheduledNotifications() {
    return [];
  }

  // 테스트 알림 (즉시 발송)
  static async sendTestNotification() {
    if (!NOTIFICATIONS_AVAILABLE) {
      // 팝업 없이 조용히 실패
      console.log('⚠️ Test notification not available in this environment');
      return false;
    }
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🇺🇸 Test Notification',
          body: 'This is a test notification. Your reminders are working!',
          data: { type: 'test' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2, // 2초 후 발송
        },
      });
      console.log('✅ Test notification scheduled');
      return true;
    } catch (error) {
      console.error('Test notification error:', error);
      return false;
    }
  }
}
