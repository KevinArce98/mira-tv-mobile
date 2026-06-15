import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChannelRow } from '@/components/media/channel-row';
import { ThemedView } from '@/components/themed-view';
import { CategoryPicker } from '@/components/ui/category-picker';
import { Empty, Loading } from '@/components/ui/empty';
import { ScreenTitle } from '@/components/ui/screen-title';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAccount } from '@/hooks/data/use-account';
import { useCatalog, useCategories } from '@/hooks/data/use-catalog';
import { openContent } from '@/lib/navigation';

export default function LiveScreen() {
  const { data: account } = useAccount();
  const accountId = account?.id;

  const [categoriaId, setCategoriaId] = useState<string | undefined>(undefined);
  const categories = useCategories(accountId, 'live');
  const channels = useCatalog(accountId, 'live', categoriaId);

  const options = [
    { id: undefined as string | undefined, label: 'Todos' },
    ...(categories.data ?? []).map((c) => ({ id: c.categoria_id ?? undefined, label: c.categoria ?? 'Sin categoría' })),
  ];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenTitle title="TV en vivo" />

        <View style={styles.pickerWrap}>
          <CategoryPicker options={options} selectedId={categoriaId} onSelect={setCategoriaId} />
        </View>

        {channels.isLoading ? (
          <Loading />
        ) : (
          <FlatList
            data={channels.data ?? []}
            keyExtractor={(c) => c.id}
            initialNumToRender={12}
            windowSize={7}
            removeClippedSubviews
            contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
            renderItem={({ item }) => <ChannelRow channel={item} onPress={() => openContent(item)} />}
            ListEmptyComponent={
              channels.isError ? (
                <Empty icon="cloud-offline-outline" title="No se pudo cargar" subtitle="Revisa tu conexión e inténtalo de nuevo." />
              ) : (
                <Empty icon="tv-outline" title="Sin canales" subtitle="Sincroniza el catálogo desde Inicio." />
              )
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  pickerWrap: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
});
