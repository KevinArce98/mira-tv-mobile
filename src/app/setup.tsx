import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { useSaveAccount } from '@/hooks/data/use-account';
import { useTheme } from '@/hooks/use-theme';

export default function SetupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const save = useSaveAccount();

  const [servidor, setServidor] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = servidor.trim() && usuario.trim() && password.trim() && !save.isPending;

  const onSubmit = () => {
    save.mutate(
      { servidor: servidor.trim(), usuario: usuario.trim(), password },
      { onSuccess: () => router.replace('/(tabs)/home') },
    );
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Ionicons name="tv-outline" size={48} color={theme.accent} style={styles.logo} />
            <ThemedText style={styles.brand}>
              Mira<Text style={{ color: theme.accent }}> TV</Text>
            </ThemedText>
            <ThemedText type="subtitle" style={styles.heading}>
              Conecta tu cuenta
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sub}>
              Introduce los datos de tu proveedor Xtream Codes.
            </ThemedText>

            <ThemedText type="small" style={styles.label}>
              Servidor
            </ThemedText>
            <TextInput
              style={inputStyle}
              placeholder="http://host:puerto"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              inputMode="url"
              value={servidor}
              onChangeText={setServidor}
            />

            <ThemedText type="small" style={styles.label}>
              Usuario
            </ThemedText>
            <TextInput
              style={inputStyle}
              placeholder="usuario"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={usuario}
              onChangeText={setUsuario}
            />

            <ThemedText type="small" style={styles.label}>
              Contraseña
            </ThemedText>
            <ThemedView style={styles.passwordWrap}>
              <TextInput
                style={[inputStyle, styles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={12}
                style={styles.eye}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textSecondary} />
              </Pressable>
            </ThemedView>

            {save.isError ? (
              <ThemedText type="small" themeColor="danger" style={styles.error}>
                {save.error instanceof Error ? save.error.message : 'No se pudo conectar.'}
              </ThemedText>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              style={[styles.button, { backgroundColor: theme.tint, opacity: canSubmit ? 1 : 0.5 }]}>
              {save.isPending ? (
                <ActivityIndicator color={theme.onTint} />
              ) : (
                <ThemedText themeColor="onTint" style={styles.buttonText}>
                  Conectar
                </ThemedText>
              )}
            </Pressable>

            <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
              Tu contraseña se guarda cifrada en el dispositivo.
            </ThemedText>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.two, flexGrow: 1, justifyContent: 'center' },
  logo: { alignSelf: 'center' },
  brand: {
    textAlign: 'center',
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: 0.5,
    marginTop: Spacing.two,
  },
  heading: { textAlign: 'center' },
  sub: { textAlign: 'center', marginBottom: Spacing.three },
  label: { fontFamily: Fonts.semibold, marginTop: Spacing.two },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  passwordWrap: { justifyContent: 'center' },
  passwordInput: { paddingRight: Spacing.six },
  eye: { position: 'absolute', right: Spacing.three, top: 0, bottom: 0, justifyContent: 'center' },
  error: { marginTop: Spacing.two },
  button: {
    marginTop: Spacing.four,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonText: { fontFamily: Fonts.bold, fontSize: 16 },
  note: { textAlign: 'center', marginTop: Spacing.three },
});
