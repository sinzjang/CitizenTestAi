import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import i18n from '../utils/i18n';
import { useNavigation } from '@react-navigation/native';

const USCIS_URL = 'https://www.uscis.gov/citizenship';
const USCIS_BASE = 'https://www.uscis.gov';

const AboutSourcesScreen = () => {
  const navigation = useNavigation();
  const openLink = async () => {
    try {
      await Linking.openURL(USCIS_URL);
    } catch (e) {
      // no-op
    }
  };

  const topicLinks = [
    { key: 'learn', url: `${USCIS_BASE}/citizenship/learn-about-citizenship` },
    { key: 'apply', url: `${USCIS_BASE}/citizenship/apply-for-naturalization` },
    { key: 'study', url: `${USCIS_BASE}/citizenship/find-study-materials-and-resources/study-for-the-test` },
    { key: 'education', url: `${USCIS_BASE}/citizenship/resources-for-educational-programs` },
    { key: 'outreach', url: `${USCIS_BASE}/citizenship/outreach-tools` },
  ];

  const openTopic = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      // no-op
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>{i18n.t('common.back')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{i18n.t('about.title')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('about.disclaimerTitle')}</Text>
          <Text style={styles.paragraph}>{i18n.t('disclaimer.text')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('about.sourcesTitle')}</Text>
          <Text style={styles.paragraph}>{i18n.t('about.sourcesDescription')}</Text>

          <TouchableOpacity style={styles.linkCard} onPress={openLink} activeOpacity={0.8}>
            <Text style={styles.linkTitle}>{i18n.t('about.uscisTitle')}</Text>
            <Text style={styles.linkUrl}>{USCIS_URL}</Text>
          </TouchableOpacity>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>{i18n.t('about.whatYouFindTitle')}</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>{`• ${i18n.t('about.forImmigrants')}`}</Text>
              <Text style={styles.bulletItem}>{`• ${i18n.t('about.forEducators')}`}</Text>
              <Text style={styles.bulletItem}>{`• ${i18n.t('about.forOrganizations')}`}</Text>
            </View>
            <Text style={[styles.paragraph, { marginTop: 6 }]}>{i18n.t('about.officeOfCitizenshipNote')}</Text>
          </View>

          <View style={styles.subSection}>
            {topicLinks.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.linkCard}
                onPress={() => openTopic(item.url)}
                activeOpacity={0.8}
              >
                <Text style={styles.linkTitle}>{i18n.t(`about.links.${item.key}.title`)}</Text>
                <Text style={styles.paragraph}>{i18n.t(`about.links.${item.key}.desc`)}</Text>
                <Text style={styles.linkUrl}>{item.url}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border || '#ddd',
    backgroundColor: theme.colors.background,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'left',
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  paragraph: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  linkCard: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  linkTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  linkUrl: {
    marginTop: 4,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.link || theme.colors.primary,
  },
  subSection: {
    marginTop: theme.spacing.md,
  },
  subSectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  bulletList: {
    marginTop: theme.spacing.xs,
  },
  bulletItem: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginTop: 2,
  },
});

export default AboutSourcesScreen;
