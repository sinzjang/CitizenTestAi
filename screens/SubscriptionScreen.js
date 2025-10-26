import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { SubscriptionManager } from '../utils/subscriptionManager';

const SubscriptionScreen = ({ navigation }) => {
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  useEffect(() => {
    loadOfferings();
    loadSubscriptionDetails();
  }, []);

  const loadOfferings = async () => {
    try {
      const currentOffering = await SubscriptionManager.getOfferings();
      setOfferings(currentOffering);
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionDetails = async () => {
    try {
      const details = await SubscriptionManager.getSubscriptionDetails();
      setSubscriptionDetails(details);
    } catch (error) {
      console.error('구독 상태 로드 오류:', error);
    }
  };

  const handlePurchase = async (packageItem) => {
    setPurchasing(true);
    
    try {
      const result = await SubscriptionManager.purchaseSubscription(packageItem);
      
      if (result.success) {
        Alert.alert(
          'Welcome to Premium! 🎉',
          'You now have access to all premium features!',
          [
            {
              text: 'Start Learning',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Purchase Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    
    try {
      const result = await SubscriptionManager.restorePurchases();
      
      if (result.success && result.isPremium) {
        Alert.alert(
          'Purchases Restored! 🎉',
          'Your premium subscription has been restored.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        await loadSubscriptionDetails();
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading subscription options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image 
            source={require('../assets/imgs/Amarica_want_you_with_bg.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTextAmerica}>AMERICA</Text>
            <View style={styles.heroTextRow}>
              <Text style={styles.heroTextWants}>WANTS </Text>
              <Text style={styles.heroTextYou}>YOU</Text>
            </View>
          </View>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>"We support your success in Citizenship Interview"</Text>

        {/* Premium Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Effective Memorization</Text>
              <Text style={styles.featureDescription}>Random flashcards for better retention</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Driving Mode</Text>
              <Text style={styles.featureDescription}>Hands-free learning while commuting</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>AI Interview Practice</Text>
              <Text style={styles.featureDescription}>Real-time conversation with AI interviewer</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Weakness Quiz Management</Text>
              <Text style={styles.featureDescription}>Focus on questions you struggle with</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Ad-Free Experience</Text>
              <Text style={styles.featureDescription}>Uninterrupted learning sessions</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Story Mode</Text>
              <Text style={styles.featureDescription}>Learn through engaging narratives</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Progress Tracking</Text>
              <Text style={styles.featureDescription}>Monitor your preparation journey</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Offline Access</Text>
              <Text style={styles.featureDescription}>Study anytime, anywhere</Text>
            </View>
          </View>
        </View>

        {/* AI Cost Notice */}
        <View style={styles.aiCostNotice}>
          <Ionicons name="information-circle" size={20} color="#2E86AB" />
          <Text style={styles.aiCostText}>
            💡 The developer covers all AI usage costs (OpenAI API) for premium members. Your support helps maintain this service.
          </Text>
        </View>

        {/* Current Status */}
        {subscriptionDetails && (
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Current Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: subscriptionDetails.statusColor }]}>
                <Text style={styles.statusBadgeText}>{subscriptionDetails.status}</Text>
              </View>
            </View>
            
            {subscriptionDetails.expiryDate && (
              <View style={styles.statusDetails}>
                <Text style={styles.statusDetailText}>Expires: {subscriptionDetails.expiryDate}</Text>
                <View style={styles.daysRemainingRow}>
                  <Text style={styles.statusDetailText}>Days remaining: {subscriptionDetails.daysRemaining}</Text>
                  <TouchableOpacity onPress={handleRestore}>
                    <Text style={styles.restoreLinkText}>Restore Purchase</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Subscription Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {offerings?.availablePackages?.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.planCard,
                pkg.identifier === '$rc_three_month' && styles.popularPlan
              ]}
              onPress={() => handlePurchase(pkg)}
              disabled={purchasing}
            >
              {pkg.identifier === '$rc_three_month' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>
                  {pkg.identifier === '$rc_three_month' ? '3-Month' : 'Monthly'}
                </Text>
                <Text style={styles.planPrice}>
                  {pkg.product.priceString}
                  <Text style={styles.planPeriod}>
                    /{pkg.identifier === '$rc_three_month' ? '3 months' : 'month'}
                  </Text>
                </Text>
              </View>
              
              {pkg.identifier === '$rc_three_month' && (
                <Text style={styles.savingsText}>Save 23% compared to monthly</Text>
              )}
              
              <Text style={styles.planDescription}>
                {pkg.identifier === '$rc_three_month'
                  ? 'Most popular choice'
                  : 'Perfect for getting started'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Free Trial Info */}
        <View style={styles.trialSection}>
          <Ionicons name="gift-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.trialText}>
            Start with a 7-day free trial. Cancel anytime.
          </Text>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
          </Text>
          <View style={styles.termsLinks}>
            <TouchableOpacity>
              <Text style={styles.linkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> • </Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {purchasing && (
        <View style={styles.purchasingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.purchasingText}>Processing purchase...</Text>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginRight: 32, // Offset for close button
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  premiumIcon: {
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  benefitText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  plansSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  planCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  popularPlan: {
    borderColor: theme.colors.primary,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  popularText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  planTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  planPeriod: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.normal,
    color: theme.colors.text.secondary,
  },
  savingsText: {
    fontSize: theme.typography.sizes.sm,
    color: '#4CAF50',
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  planDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  trialSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  trialText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  restoreText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  termsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  termsText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  termsLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  separator: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
  },
  purchasingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchasingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: '#FFFFFF',
  },
  // Modern Premium Section Styles
  heroImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heroTextAmerica: {
    fontSize: 36,
    fontWeight: '900',
    color: '#001f3f',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroTextRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  heroTextWants: {
    fontSize: 36,
    fontWeight: '900',
    color: '#001f3f',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroTextYou: {
    fontSize: 36,
    fontWeight: '900',
    color: '#dc143c',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#001f3f',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  aiCostNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86AB',
  },
  aiCostText: {
    flex: 1,
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
    marginLeft: 10,
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  statusDetails: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  daysRemainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restoreLinkText: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  promoCodeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  promoCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86AB',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#2E86AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  promoCodeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  promoCodeInputContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  promoCodeInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  redeemButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButtonAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E86AB',
  },
  restoreTextAlt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E86AB',
    marginLeft: 8,
  },
});

export default SubscriptionScreen;
