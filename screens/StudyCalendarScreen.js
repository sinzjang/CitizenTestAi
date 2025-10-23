import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import StudyCalendar from '../components/StudyCalendar';
import { t, getCurrentLanguage, addLanguageChangeListener, removeLanguageChangeListener } from '../utils/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StudyCalendarScreen = ({ navigation }) => {
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const insets = useSafeAreaInsets();

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
              <Text style={styles.closeButtonText}>{t('studyCalendar.dailyGoals.gotIt')}</Text>
            </TouchableOpacity>
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
});

export default StudyCalendarScreen;
