import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { eventLog } from '@/analytics/AnalyticsContext';
import { AnalyticsEvent } from '@/analytics/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

/**
 * Tela de Console: visualiza os eventos que o nosso provider capturou.
 *
 * Num app real esses eventos iriam pra um servidor e você os veria num
 * dashboard (Amplitude, GA4...). Aqui mostramos na própria tela pra você
 * acompanhar, ao vivo, o que cada ação dispara.
 */
export default function ConsoleScreen() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(eventLog.getEvents());

  useEffect(() => {
    // Inscreve-se nas atualizações do provider e cancela ao desmontar.
    return eventLog.subscribe(setEvents);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Console</ThemedText>
        <Pressable onPress={() => eventLog.clear()} style={styles.clearBtn}>
          <ThemedText style={styles.clearText}>Limpar</ThemedText>
        </Pressable>
      </View>

      <ThemedText style={styles.subtitle}>
        {events.length} evento(s) capturado(s) — mais recente no topo
      </ThemedText>

      <ScrollView contentContainerStyle={styles.list}>
        {events.length === 0 && (
          <ThemedText style={styles.empty}>
            Nenhum evento ainda. Vá na aba Demo e toque nos botões.
          </ThemedText>
        )}

        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const TYPE_COLOR: Record<AnalyticsEvent['type'], string> = {
  track: '#0a7ea4',
  screen: '#8a5cf6',
  identify: '#d97706',
};

function EventRow({ event }: { event: AnalyticsEvent }) {
  const time = new Date(event.timestamp).toLocaleTimeString();
  // Só mostramos propriedades com valor (evita poluir com undefined/null).
  const props = Object.entries(event.properties ?? {}).filter(
    ([, v]) => v !== undefined && v !== null,
  );

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={[styles.badge, { backgroundColor: TYPE_COLOR[event.type] }]}>
          <ThemedText style={styles.badgeText}>{event.type}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {event.name}
        </ThemedText>
        <ThemedText style={styles.time}>{time}</ThemedText>
      </View>

      {props.map(([key, value]) => (
        <ThemedText key={key} style={styles.prop}>
          {key}: <ThemedText style={styles.propValue}>{String(value)}</ThemedText>
        </ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 64, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clearBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#ef4444' },
  clearText: { color: '#fff', fontWeight: '600' },
  subtitle: { opacity: 0.6, marginTop: 4, marginBottom: 12 },
  list: { gap: 10, paddingBottom: 32 },
  empty: { opacity: 0.5, textAlign: 'center', marginTop: 40 },
  row: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#8884', borderRadius: 10, padding: 12, gap: 4 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  name: { flex: 1 },
  time: { fontSize: 12, opacity: 0.5 },
  prop: { fontSize: 13, opacity: 0.8, fontFamily: 'monospace' },
  propValue: { fontWeight: '600' },
});
