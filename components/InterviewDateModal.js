import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { t } from '../utils/i18n';

const { width, height } = Dimensions.get('window');

const InterviewDateModal = ({ visible, onDateSet, onSkip, title = 'Interview Date', storageKey = '@interview_date' }) => {
  // 오늘 날짜를 기본값으로 설정
  const today = new Date();
  const [month, setMonth] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [day, setDay] = useState(today.getDate().toString().padStart(2, '0'));
  const [year, setYear] = useState(today.getFullYear().toString());

  // 모달이 열릴 때 저장된 날짜 로드
  useEffect(() => {
    if (visible) {
      loadSavedDate();
    }
  }, [visible]);

  const loadSavedDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem(storageKey);
      if (savedDate) {
        // MM/DD/YYYY 형식 파싱
        const parts = savedDate.split('/');
        if (parts.length === 3) {
          setMonth(parts[0]);
          setDay(parts[1]);
          setYear(parts[2]);
        }
      } else {
        // 저장된 날짜가 없으면 오늘 날짜로 리셋
        const today = new Date();
        setMonth((today.getMonth() + 1).toString().padStart(2, '0'));
        setDay(today.getDate().toString().padStart(2, '0'));
        setYear(today.getFullYear().toString());
      }
    } catch (error) {
      console.error('날짜 로드 오류:', error);
    }
  };

  const handleSave = () => {
    // 날짜 유효성 검사
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);

    if (month && day && year) {
      if (monthNum < 1 || monthNum > 12) {
        return;
      }
      if (dayNum < 1 || dayNum > 31) {
        return;
      }
      if (yearNum < 2024 || yearNum > 2030) {
        return;
      }
      
      const dateString = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
      onDateSet(dateString);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Ionicons name="calendar" size={32} color={theme.colors.primary} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              {title === 'Study Start Date' ? 'When did you start studying?' : t('interviewDate.subtitle')}
            </Text>
          </View>

          {/* 날짜 입력 */}
          <View style={styles.dateInputContainer}>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.inputLabel}>{t('interviewDate.month')}</Text>
              <TextInput
                style={styles.dateInput}
                value={month}
                onChangeText={setMonth}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <Text style={styles.dateSeparator}>/</Text>

            <View style={styles.dateInputWrapper}>
              <Text style={styles.inputLabel}>{t('interviewDate.day')}</Text>
              <TextInput
                style={styles.dateInput}
                value={day}
                onChangeText={setDay}
                placeholder="DD"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <Text style={styles.dateSeparator}>/</Text>

            <View style={styles.dateInputWrapper}>
              <Text style={styles.inputLabel}>{t('interviewDate.year')}</Text>
              <TextInput
                style={styles.dateInput}
                value={year}
                onChangeText={setYear}
                placeholder="YYYY"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* 설명 텍스트 */}
          <Text style={styles.description}>{t('interviewDate.canUpdateLater')}</Text>

          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>{t('interviewDate.skip')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!month || !day || !year) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={!month || !day || !year}
            >
              <Text style={styles.saveButtonText}>{t('interviewDate.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  dateInputWrapper: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  dateInput: {
    width: 70,
    height: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dateSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default InterviewDateModal;
