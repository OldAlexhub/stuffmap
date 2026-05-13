import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, Image, TouchableOpacity, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { APP_NAME, APP_VERSION, APP_TAGLINE, APP_DESCRIPTION } from '../constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useStorage();
  const dark = state.settings.darkMode;
  const bg = dark ? Colors.backgroundDark : Colors.background;
  const cardBg = dark ? Colors.surfaceDark : Colors.surface;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.section, { backgroundColor: cardBg }, Shadows.sm]}>
      <Text style={[styles.sectionTitle, dark && styles.sectionTitleDark]}>{title}</Text>
      {children}
    </View>
  );

  const PrivacyRow = ({ icon, text }: { icon: string; text: string }) => (
    <View style={styles.privacyRow}>
      <Text style={styles.privacyIcon}>{icon}</Text>
      <Text style={[styles.privacyText, dark && styles.privacyTextDark]}>{text}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Brand */}
        <View style={[styles.brandCard, { backgroundColor: cardBg }, Shadows.card]}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.appName, dark && styles.appNameDark]}>
            Stuff<Text style={styles.appNameAccent}>Map</Text>
          </Text>
          <Text style={[styles.tagline, dark && styles.taglineDark]}>{APP_TAGLINE}</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
          <Text style={[styles.description, dark && styles.descriptionDark]}>{APP_DESCRIPTION}</Text>
        </View>

        {/* Privacy Policy */}
        <Section title="🔒 Privacy & Data">
          <PrivacyRow icon="✅" text="No account required — ever." />
          <PrivacyRow icon="✅" text="No cloud sync or external servers." />
          <PrivacyRow icon="✅" text="No ads, no tracking, no analytics." />
          <PrivacyRow icon="✅" text="All your data stays on this device." />
          <PrivacyRow icon="✅" text="Photos are stored locally on device." />
          <PrivacyRow icon="✅" text="No internet connection needed." />
          <PrivacyRow icon="⚠️" text="If you uninstall the app, your data may be deleted unless you exported a backup first." />
        </Section>

        {/* How it Works */}
        <Section title="📖 How It Works">
          <View style={styles.howRow}>
            <View style={styles.howStep}>
              <Text style={styles.howNum}>1</Text>
            </View>
            <View style={styles.howContent}>
              <Text style={[styles.howTitle, dark && styles.howTitleDark]}>Create Locations</Text>
              <Text style={[styles.howDesc, dark && styles.howDescDark]}>Garage, closet, office — anywhere you store things.</Text>
            </View>
          </View>
          <View style={styles.howRow}>
            <View style={styles.howStep}>
              <Text style={styles.howNum}>2</Text>
            </View>
            <View style={styles.howContent}>
              <Text style={[styles.howTitle, dark && styles.howTitleDark]}>Add Containers</Text>
              <Text style={[styles.howDesc, dark && styles.howDescDark]}>Bins, shelves, boxes, drawers inside each location.</Text>
            </View>
          </View>
          <View style={styles.howRow}>
            <View style={styles.howStep}>
              <Text style={styles.howNum}>3</Text>
            </View>
            <View style={styles.howContent}>
              <Text style={[styles.howTitle, dark && styles.howTitleDark]}>Log Your Items</Text>
              <Text style={[styles.howDesc, dark && styles.howDescDark]}>Name, photo, category, quantity, and notes for each item.</Text>
            </View>
          </View>
          <View style={styles.howRow}>
            <View style={styles.howStep}>
              <Text style={styles.howNum}>4</Text>
            </View>
            <View style={styles.howContent}>
              <Text style={[styles.howTitle, dark && styles.howTitleDark]}>Search & Find</Text>
              <Text style={[styles.howDesc, dark && styles.howDescDark]}>Instantly find any item with the full path: Location → Container → Item.</Text>
            </View>
          </View>
        </Section>

        {/* Data note */}
        <Section title="💡 Data Storage Note">
          <Text style={[styles.dataNote, dark && styles.dataNoteTextDark]}>
            {APP_NAME} stores all data locally using Android's secure app storage.
            Your data is private to this device and this app.{'\n\n'}
            To protect your inventory, export a backup regularly from the Reports screen.
            Backups are saved as JSON files that can be shared or stored anywhere.{'\n\n'}
            If you uninstall {APP_NAME}, your data will be deleted by Android as part of
            the app uninstall process — unless you have exported a backup.
          </Text>
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, dark && styles.footerTextDark]}>
            {APP_NAME} · Built for Android · One-time purchase
          </Text>
          <Text style={[styles.footerSub, dark && styles.footerSubDark]}>
            No subscriptions · No ads · No cloud
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.white, lineHeight: 28 },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.md },
  brandCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logo: { width: 96, height: 96, marginBottom: Spacing.lg },
  appName: {
    fontSize: Typography.fontSize3XL,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  appNameDark: { color: Colors.textPrimaryDark },
  appNameAccent: { color: Colors.accent },
  tagline: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  taglineDark: { color: Colors.textSecondaryDark },
  versionBadge: {
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  versionText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },
  description: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  descriptionDark: { color: Colors.textMutedDark },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionTitleDark: { color: Colors.textPrimaryDark },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  privacyIcon: { fontSize: 16, marginRight: Spacing.sm, marginTop: 1 },
  privacyText: { flex: 1, fontSize: Typography.fontSizeMD, color: Colors.textSecondary, lineHeight: 22 },
  privacyTextDark: { color: Colors.textSecondaryDark },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  howStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  howNum: { color: Colors.white, fontWeight: Typography.fontWeightBold, fontSize: 13 },
  howContent: { flex: 1 },
  howTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  howTitleDark: { color: Colors.textPrimaryDark },
  howDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, lineHeight: 20 },
  howDescDark: { color: Colors.textMutedDark },
  dataNote: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  dataNoteTextDark: { color: Colors.textSecondaryDark },
  footer: { alignItems: 'center', paddingVertical: Spacing.xl },
  footerText: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textMuted,
  },
  footerTextDark: { color: Colors.textMutedDark },
  footerSub: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 4 },
  footerSubDark: { color: Colors.textMutedDark },
});

export default AboutScreen;
