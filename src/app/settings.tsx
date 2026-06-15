import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { useAccount, useAccountStatus, useDeleteAccount } from '@/hooks/data/use-account';
import { useSyncCatalog } from '@/hooks/data/use-sync';
import { useTheme } from '@/hooks/use-theme';

function formatExpiry(exp: string | null | undefined): string {
  if (!exp || exp === '0') return 'Sin vencimiento';
  const ms = Number(exp) * 1000;
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const dateStr = new Date(ms).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  const days = Math.ceil((ms - Date.now()) / 86400000);
  if (days < 0) return `${dateStr} (vencida)`;
  if (days === 0) return `${dateStr} (hoy)`;
  return `${dateStr} (en ${days} ${days === 1 ? 'día' : 'días'})`;
}

function statusLabel(s: string | undefined): string {
  if (!s) return '—';
  return s.toLowerCase() === 'active' ? 'Activa' : s;
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { data: account } = useAccount();
  const { data: status, isLoading: statusLoading } = useAccountStatus();
  const sync = useSyncCatalog();
  const del = useDeleteAccount();

  const lastSync = account?.ultima_sincronizacion
    ? new Date(account.ultima_sincronizacion).toLocaleString()
    : 'Nunca';

  const pending = statusLoading ? 'Cargando…' : '—';
  const estado = status ? statusLabel(status.status) : pending;
  const expira = status ? formatExpiry(status.exp_date) : pending;
  const conexiones = status ? `${status.active_cons ?? '0'} / ${status.max_connections ?? '—'}` : pending;
  const isTrial = status?.is_trial === '1';

  const confirmDelete = () => {
    Alert.alert(
      'Cerrar sesión',
      'Se eliminará la cuenta y el catálogo descargado de este dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (account) del.mutate(account.id, { onSuccess: () => router.replace('/setup') });
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Row label="Servidor" value={account?.servidor ?? '—'} />
          <Row label="Usuario" value={account?.usuario ?? '—'} />
          <Row label="Estado" value={estado} />
          <Row label="Expira" value={expira} />
          <Row label="Conexiones" value={conexiones} />
          {isTrial ? <Row label="Cuenta de prueba" value="Sí" /> : null}
          <Row label="Última sincronización" value={lastSync} last />
        </View>

        <Pressable
          onPress={() => account && sync.mutate(account)}
          disabled={sync.isPending}
          style={[styles.button, { backgroundColor: theme.tint, opacity: sync.isPending ? 0.6 : 1 }]}>
          <Ionicons name="refresh" size={18} color={theme.onTint} />
          <ThemedText themeColor="onTint" style={styles.buttonText}>
            {sync.isPending
              ? `Sincronizando… (${sync.progress?.written ?? 0})`
              : 'Sincronizar catálogo ahora'}
          </ThemedText>
        </Pressable>

        <Pressable onPress={confirmDelete} style={[styles.button, styles.outline, { borderColor: theme.danger }]}>
          <Ionicons name="log-out-outline" size={18} color={theme.danger} />
          <ThemedText style={[styles.buttonText, { color: theme.danger }]}>Cerrar sesión</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" numberOfLines={1} style={styles.value}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three },
  card: { borderRadius: Spacing.two, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  value: { flexShrink: 1, fontFamily: Fonts.semibold },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  buttonText: { fontFamily: Fonts.bold, fontSize: 16 },
  outline: { backgroundColor: 'transparent', borderWidth: StyleSheet.hairlineWidth },
});
