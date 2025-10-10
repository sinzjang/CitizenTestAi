import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaywallFooterView } from 'react-native-purchases-ui';

const RevenueCatPaywallScreen = ({ navigation }) => {
  const handlePurchaseCompleted = () => {
    // 구매 완료 후 이전 화면으로 돌아가기
    navigation.goBack();
  };

  const handleRestoreCompleted = () => {
    // 복원 완료 후 이전 화면으로 돌아가기
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PaywallFooterView
        onPurchaseCompleted={handlePurchaseCompleted}
        onRestoreCompleted={handleRestoreCompleted}
        onPurchaseError={(error) => {
          console.error('Purchase error:', error);
        }}
        onRestoreError={(error) => {
          console.error('Restore error:', error);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default RevenueCatPaywallScreen;
