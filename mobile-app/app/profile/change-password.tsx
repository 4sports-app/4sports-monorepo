import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSize, BorderRadius } from '@/constants/Layout';
import { useLanguage } from '@/services/LanguageContext';
import { changePassword, getAuthErrorMessage } from '@/services/auth';

export default function ChangePasswordScreen() {
  const { t } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        t('common.error') || 'Greška',
        t('auth.passwordRequired') || 'Sva polja su obavezna'
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        t('common.error') || 'Greška',
        t('auth.passwordMin') || 'Lozinka mora imati najmanje 6 karaktera'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t('common.error') || 'Greška',
        t('auth.passwordsNoMatch') || 'Lozinke se ne poklapaju'
      );
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(
        t('common.error') || 'Greška',
        t('profile.samePassword') || 'Nova lozinka mora biti različita od trenutne'
      );
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert(
        t('common.success') || 'Uspeh',
        t('profile.passwordChanged') || 'Lozinka je uspešno promenjena',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Change password error:', error);
      const message = getAuthErrorMessage(error.code) || error.message || 'Greška pri promeni lozinke';
      Alert.alert(t('common.error') || 'Greška', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.changePassword') || 'Promeni lozinku'}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="lock-reset" size={48} color={Colors.primary} />
        </View>
      </View>

      <Text style={styles.description}>
        {t('profile.changePasswordDescription') ||
          'Unesite trenutnu lozinku i izaberite novu lozinku za vaš nalog.'}
      </Text>

      <Text style={styles.label}>{t('profile.currentPassword') || 'Trenutna lozinka'}</Text>
      <TextInput
        mode="outlined"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry={!showCurrent}
        style={styles.input}
        outlineColor={Colors.border}
        activeOutlineColor={Colors.primary}
        right={
          <TextInput.Icon
            icon={showCurrent ? 'eye-off' : 'eye'}
            onPress={() => setShowCurrent(!showCurrent)}
          />
        }
      />

      <Text style={styles.label}>{t('profile.newPassword') || 'Nova lozinka'}</Text>
      <TextInput
        mode="outlined"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!showNew}
        style={styles.input}
        outlineColor={Colors.border}
        activeOutlineColor={Colors.primary}
        right={
          <TextInput.Icon
            icon={showNew ? 'eye-off' : 'eye'}
            onPress={() => setShowNew(!showNew)}
          />
        }
      />

      <Text style={styles.label}>{t('profile.confirmPassword') || 'Potvrdi novu lozinku'}</Text>
      <TextInput
        mode="outlined"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirm}
        style={styles.input}
        outlineColor={Colors.border}
        activeOutlineColor={Colors.primary}
        right={
          <TextInput.Icon
            icon={showConfirm ? 'eye-off' : 'eye'}
            onPress={() => setShowConfirm(!showConfirm)}
          />
        }
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
        buttonColor={Colors.primary}
      >
        {t('profile.changePassword') || 'Promeni lozinku'}
      </Button>

      <Button
        mode="outlined"
        onPress={() => router.back()}
        disabled={isLoading}
        style={styles.cancelButton}
        textColor={Colors.text}
      >
        {t('common.cancel') || 'Otkaži'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 140 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backButton: { padding: Spacing.xs },
  title: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.text },
  iconContainer: { alignItems: 'center', marginVertical: Spacing.lg },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: { backgroundColor: Colors.surface },
  submitButton: { marginTop: Spacing.xl, paddingVertical: Spacing.xs },
  cancelButton: { marginTop: Spacing.sm, borderColor: Colors.border },
});
