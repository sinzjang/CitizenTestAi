import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Platform,
  Alert,
  Switch,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import StudyCalendar from '../components/StudyCalendar';
import { t, getCurrentLanguage, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationManager } from '../utils/notificationManager';

console.warn('🔴🔴🔴 StudyCalendarScreen.js FILE LOADED 🔴🔴🔴');

// ReminderCard 컴포넌트
const ReminderCard = ({ 
  reminder, 
  index, 
  reminders, 
  removeReminder, 
  toggleShowDays, 
  toggleReminderDay, 
  DAYS,
  editingTime,
  handleTimePress,
  handleTimeChange,
  setEditingTime,
  addReminder,
  editingTitle,
  setEditingTitle,
  updateReminderTitle,
  toggleAmPm
}) => {
  const animatedHeight = useRef(new Animated.Value(reminder.showDays ? 1 : 0)).current;
  
  // 12시간 형식으로 변환
  const getDisplayHour = () => {
    if (reminder.hour === 0) return 12;
    if (reminder.hour > 12) return reminder.hour - 12;
    return reminder.hour;
  };
  
  const getAmPm = () => {
    return reminder.hour >= 12 ? 'PM' : 'AM';
  };
  
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: reminder.showDays ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [reminder.showDays]);

  const daysHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  return (
    <View style={styles.reminderCard}>
      {/* Header */}
      <View style={styles.reminderHeader}>
        <View style={styles.titleContainer}>
          {editingTitle === reminder.id ? (
            <TextInput
              style={styles.titleInput}
              value={reminder.title}
              onChangeText={(text) => updateReminderTitle(reminder.id, text)}
              onBlur={() => setEditingTitle(null)}
              autoFocus
              selectTextOnFocus
              maxLength={20}
            />
          ) : (
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
          )}
          <TouchableOpacity 
            style={styles.editTitleButton}
            onPress={() => setEditingTitle(reminder.id)}
          >
            <Ionicons name="pencil-outline" size={16} color="#2E86AB" />
          </TouchableOpacity>
        </View>
        <View style={styles.reminderActions}>
          {reminders.length > 1 && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => removeReminder(reminder.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Time Display with Repeat Button */}
      <View style={styles.timeRow}>
        <View style={styles.timeDisplay}>
          <TouchableOpacity onPress={() => handleTimePress(reminder.id, 'hour')}>
            {editingTime?.reminderId === reminder.id && editingTime?.field === 'hour' ? (
              <TextInput
                style={styles.timeInput}
                value={getDisplayHour().toString()}
                onChangeText={handleTimeChange}
                keyboardType="number-pad"
                maxLength={2}
                autoFocus
                onBlur={() => setEditingTime(null)}
                selectTextOnFocus
                allowFontScaling={false}
                numberOfLines={1}
                maxFontSizeMultiplier={1}
              />
            ) : (
              <Text style={styles.timeText}>{getDisplayHour().toString().padStart(2, '0')}</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.timeColon}>:</Text>
          
          <TouchableOpacity onPress={() => handleTimePress(reminder.id, 'minute')}>
            {editingTime?.reminderId === reminder.id && editingTime?.field === 'minute' ? (
              <TextInput
                style={styles.timeInput}
                value={reminder.minute.toString()}
                onChangeText={handleTimeChange}
                keyboardType="number-pad"
                maxLength={2}
                autoFocus
                onBlur={() => setEditingTime(null)}
                selectTextOnFocus
                allowFontScaling={false}
                numberOfLines={1}
                maxFontSizeMultiplier={1}
              />
            ) : (
              <Text style={styles.timeText}>{reminder.minute.toString().padStart(2, '0')}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.amPmButton}
            onPress={() => toggleAmPm(reminder.id)}
          >
            <Text style={styles.amPmText}>{getAmPm()}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.repeatButton,
            reminder.showDays && styles.repeatButtonActive
          ]}
          onPress={() => toggleShowDays(reminder.id)}
        >
          <Ionicons 
            name={reminder.showDays ? "repeat" : "repeat-outline"} 
            size={16} 
            color={reminder.showDays ? "#fff" : "#666"} 
          />
        </TouchableOpacity>
      </View>

      {/* Days Selector - Animated */}
      <Animated.View style={[styles.daysAnimatedContainer, { height: daysHeight, opacity: animatedHeight }]}>
        <View style={styles.daysContainer}>
          {DAYS.map(day => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                reminder.days.includes(day.id) && styles.dayButtonActive
              ]}
              onPress={() => toggleReminderDay(reminder.id, day.id)}
            >
              <Text style={[
                styles.dayButtonText,
                reminder.days.includes(day.id) && styles.dayButtonTextActive
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const StudyCalendarScreen = ({ navigation }) => {
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [reminders, setReminders] = useState([
    { id: 1, hour: 9, minute: 0, days: [1, 2, 3, 4, 5], showDays: false, title: 'Morning' } // 기본: 평일 9:00
  ]);
  const [editingTime, setEditingTime] = useState(null); // { reminderId, field: 'hour' | 'minute' }
  const [editingTitle, setEditingTitle] = useState(null); // reminderId
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const insets = useSafeAreaInsets();
  
  const DAYS = [
    { id: 0, label: 'S', name: 'Sun' },
    { id: 1, label: 'M', name: 'Mon' },
    { id: 2, label: 'T', name: 'Tue' },
    { id: 3, label: 'W', name: 'Wed' },
    { id: 4, label: 'T', name: 'Thu' },
    { id: 5, label: 'F', name: 'Fri' },
    { id: 6, label: 'S', name: 'Sat' }
  ];

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

  

  // 알림 설정 로드
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    console.warn('🔴🔴🔴 LOADING NOTIFICATION SETTINGS 🔴🔴🔴');
    const settings = await NotificationManager.getSettings();
    console.warn('🔴 Settings loaded:', settings);
    setNotificationEnabled(settings.enabled);
    if (settings.reminders && settings.reminders.length > 0) {
      setReminders(settings.reminders);
      console.warn('🔴 Reminders set:', settings.reminders);
    }
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      // 권한 요청 (Alert 표시)
      const hasPermission = await NotificationManager.requestPermissions(true);
      if (!hasPermission) {
        return;
      }
      setNotificationEnabled(true);
    } else {
      // 알림 비활성화
      await NotificationManager.disableReminders();
      setNotificationEnabled(false);
      Alert.alert('Reminders Disabled', 'Daily reminders have been turned off.');
    }
  };

  const addReminder = () => {
    const newId = Math.max(...reminders.map(r => r.id), 0) + 1;
    const defaultTitles = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const title = defaultTitles[(newId - 1) % defaultTitles.length];
    setReminders([...reminders, { id: newId, hour: 9, minute: 0, days: [1, 2, 3, 4, 5], showDays: false, title }]);
  };
  
  const removeReminder = (id) => {
    if (reminders.length > 1) {
      setReminders(reminders.filter(r => r.id !== id));
    }
  };
  
  const updateReminderTime = (id, hour, minute) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, hour, minute } : r
    ));
  };
  
  const toggleReminderDay = (id, dayId) => {
    setReminders(reminders.map(r => {
      if (r.id === id) {
        const days = r.days.includes(dayId)
          ? r.days.filter(d => d !== dayId)
          : [...r.days, dayId].sort();
        return { ...r, days };
      }
      return r;
    }));
  };
  
  const toggleShowDays = (id) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, showDays: !r.showDays } : r
    ));
  };
  
  const handleTimePress = (reminderId, field) => {
    setEditingTime({ reminderId, field });
  };
  
  const handleTimeChange = (value) => {
    if (!editingTime) return;
    
    const numValue = parseInt(value) || 0;
    const { reminderId, field } = editingTime;
    
    setReminders(reminders.map(r => {
      if (r.id === reminderId) {
        if (field === 'hour') {
          // 12시간 형식 입력을 24시간으로 변환
          let hour = Math.min(12, Math.max(1, numValue));
          const isPM = r.hour >= 12;
          if (hour === 12) {
            hour = isPM ? 12 : 0;
          } else {
            hour = isPM ? hour + 12 : hour;
          }
          return { ...r, hour };
        } else {
          return { ...r, minute: Math.min(59, Math.max(0, numValue)) };
        }
      }
      return r;
    }));
  };
  
  const toggleAmPm = (id) => {
    setReminders(reminders.map(r => {
      if (r.id === id) {
        let newHour = r.hour;
        if (r.hour >= 12) {
          // PM -> AM
          newHour = r.hour - 12;
        } else {
          // AM -> PM
          newHour = r.hour + 12;
        }
        return { ...r, hour: newHour };
      }
      return r;
    }));
  };
  
  const updateReminderTitle = (id, title) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, title } : r
    ));
  };
  
  const saveReminders = async () => {
    if (!notificationEnabled) return;
    
    try {
      console.warn('🔴🔴🔴🔴🔴 SAVE REMINDERS BUTTON CLICKED 🔴🔴🔴🔴🔴');
      console.warn('🔴 Number of reminders:', reminders.length);
      console.warn('🔴 Reminder details:', reminders);
      
      // 모든 알림 저장
      const result = await NotificationManager.saveReminders(reminders);
      
      console.log('='.repeat(60));
      console.log('✅ SAVE COMPLETED');
      console.log('='.repeat(60));
      
      Alert.alert(
        'Saved! ⏰',
        `${reminders.length} reminder(s) have been set.`
      );
      setShowNotificationModal(false);
    } catch (error) {
      console.log('='.repeat(60));
      console.error('❌ SAVE ERROR:', error);
      console.log('='.repeat(60));
      Alert.alert('Error', 'Failed to save reminders');
    }
  };

  const handleTestNotification = async () => {
    console.warn('🔴🔴🔴 TEST NOTIFICATION BUTTON CLICKED 🔴🔴🔴');
    const success = await NotificationManager.sendTestNotification();
    if (success) {
      Alert.alert('Test Sent!', 'You should receive a test notification in 2 seconds.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('studyCalendar.title')}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowGoalsModal(true)}
          >
            <Ionicons name="help-circle-outline" size={28} color="#2E86AB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setShowNotificationModal(true)}
          >
            <Ionicons 
              name={notificationEnabled ? "notifications" : "notifications-outline"} 
              size={26} 
              color={notificationEnabled ? "#FF9800" : "#2E86AB"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Resources')}
          >
            <Ionicons name="settings-outline" size={26} color="#2E86AB" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 달력 */}
        <StudyCalendar />

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Daily Goals Modal */}
      <Modal
        visible={showGoalsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowGoalsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGoalsModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('studyCalendar.dailyGoals.title')}</Text>
              <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              {t('studyCalendar.dailyGoals.description')}
            </Text>

            <View style={styles.goalsList}>
              <View style={styles.goalItem}>
                <Ionicons name="book" size={28} color="#2E86AB" />
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalTitle}>{t('studyCalendar.dailyGoals.learn')}</Text>
                  <Text style={styles.goalRequirement}>{t('studyCalendar.dailyGoals.learnRequirement')}</Text>
                </View>
              </View>

              <View style={styles.goalItem}>
                <Ionicons name="albums" size={28} color="#28a745" />
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalTitle}>{t('studyCalendar.dailyGoals.reviewFlashcard')}</Text>
                  <Text style={styles.goalRequirement}>{t('studyCalendar.dailyGoals.reviewRequirement')}</Text>
                </View>
              </View>

              <View style={styles.goalItem}>
                <Ionicons name="chatbubbles" size={28} color="#ff9800" />
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalTitle}>{t('studyCalendar.dailyGoals.aiTutor')}</Text>
                  <Text style={styles.goalRequirement}>{t('studyCalendar.dailyGoals.aiTutorRequirement')}</Text>
                </View>
              </View>

              <View style={styles.goalItem}>
                <Ionicons name="mic" size={28} color="#e91e63" />
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalTitle}>{t('studyCalendar.dailyGoals.mockInterview')}</Text>
                  <Text style={styles.goalRequirement}>{t('studyCalendar.dailyGoals.mockInterviewRequirement')}</Text>
                </View>
              </View>

              
            </View>

            <View style={styles.modalInfoSection}>
              <View style={styles.modalNote}>
                <Ionicons name="flame" size={20} color="#ff6b35" />
                <Text style={styles.modalNoteText}>
                  {t('studyCalendar.dailyGoals.fireInfo')}
                </Text>
              </View>

              <View style={styles.modalNote}>
                <Ionicons name="calendar" size={20} color="#2E86AB" />
                <Text style={styles.modalNoteText}>
                  {t('studyCalendar.dailyGoals.tapDateInfo')}
                </Text>
              </View>

              <View style={styles.modalNote}>
                <Ionicons name="settings" size={20} color="#666" />
                <Text style={styles.modalNoteText}>
                  {t('studyCalendar.dailyGoals.settingsInfo')}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowGoalsModal(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationModal(false)}
        >
          <View style={styles.notificationModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⏰ Study Reminders</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Enable/Disable Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleLeft}>
                <Ionicons name="notifications" size={20} color="#2E86AB" />
                <Text style={styles.toggleLabel}>Daily Reminders</Text>
              </View>
              <Switch
                value={notificationEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#ccc', true: '#2E86AB' }}
                thumbColor={notificationEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            {/* Reminders List - Scrollable */}
            {notificationEnabled && (
              <>
                <ScrollView 
                  style={styles.remindersScrollView} 
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {reminders.map((reminder, index) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      index={index}
                      reminders={reminders}
                      removeReminder={removeReminder}
                      toggleShowDays={toggleShowDays}
                      toggleReminderDay={toggleReminderDay}
                      DAYS={DAYS}
                      editingTime={editingTime}
                      handleTimePress={handleTimePress}
                      handleTimeChange={handleTimeChange}
                      setEditingTime={setEditingTime}
                      addReminder={addReminder}
                      editingTitle={editingTitle}
                      setEditingTitle={setEditingTitle}
                      updateReminderTitle={updateReminderTitle}
                      toggleAmPm={toggleAmPm}
                    />
                  ))}
                  
                  {/* Add Reminder Button - At the bottom */}
                  <TouchableOpacity style={styles.addReminderButtonBottom} onPress={addReminder}>
                    <Ionicons name="add-circle" size={32} color="#2E86AB" />
                    <Text style={styles.addReminderText}>Add Reminder</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Save Button */}
                <View style={styles.saveButtonContainer}>
                  <TouchableOpacity style={styles.saveButton} onPress={saveReminders}>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Reminders</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Test Button - Only in dev mode */}
            {notificationEnabled && __DEV__ && (
              <TouchableOpacity 
                style={styles.testButton}
                onPress={handleTestNotification}
              >
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.testButtonText}>Send Test Notification (Dev Only)</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: theme.spacing.lg,
  },
  descriptionSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  descriptionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: '#2E86AB',
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  modalDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  goalsList: {
    marginBottom: theme.spacing.lg,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  goalTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  goalTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  goalRequirement: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  modalInfoSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  modalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#2E86AB',
  },
  modalNoteText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  // Analytics styles
  analyticsCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  analyticsTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  analyticsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  analyticsStatusText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  analyticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  analyticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyticsLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  analyticsValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
  closeButton: {
    backgroundColor: '#2E86AB',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: '#FFFFFF',
  },
  // Notification Modal Styles
  notificationModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    height: '75%',
    marginTop: 'auto',
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  timePickerLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  timePicker: {
    alignItems: 'center',
    gap: 8,
  },
  timeButton: {
    padding: 8,
  },
  timeText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2E86AB',
    minWidth: 60,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2E86AB',
    marginHorizontal: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    gap: 8,
  },
  testButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: '#FFFFFF',
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: 12,
  },
  notificationInfoText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: '#1565c0',
    lineHeight: 20,
  },
  // New Reminder Styles
  remindersScrollView: {
    maxHeight: 400,
    flex: 1,
  },
  reminderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  reminderTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  titleInput: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#2E86AB',
    paddingVertical: 2,
    paddingHorizontal: 4,
    minWidth: 100,
  },
  editTitleButton: {
    padding: 4,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E86AB',
    minWidth: 44,
    textAlign: 'center',
  },
  timeColon: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E86AB',
    marginHorizontal: 2,
  },
  timeInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E86AB',
    minWidth: 50,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2E86AB',
    height: 42,
    lineHeight: 38,
    paddingTop: 2,
    paddingBottom: 2,
    textAlignVertical: 'center',
  },
  amPmButton: {
    marginLeft: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#2E86AB',
    borderRadius: 6,
  },
  amPmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  repeatButton: {
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginLeft: theme.spacing.sm,
  },
  repeatButtonActive: {
    backgroundColor: '#2E86AB',
    borderColor: '#2E86AB',
  },
  daysAnimatedContainer: {
    overflow: 'hidden',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    paddingTop: 2,
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#2E86AB',
    borderColor: '#2E86AB',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  addReminderButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: '#2E86AB',
    borderStyle: 'dashed',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    gap: 8,
  },
  addReminderText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: '#2E86AB',
  },
  saveButtonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 50,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: '#fff',
    marginLeft: 8,
  },
});

export default StudyCalendarScreen;
