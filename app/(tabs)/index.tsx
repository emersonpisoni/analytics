import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useAnalytics } from '@/analytics/AnalyticsContext';
import { Events } from '@/analytics/events';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function DemoScreen() {
  const analytics = useAnalytics();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Analytics 101</ThemedText>
        <ThemedText style={styles.intro}>
          Tap the buttons and watch the events in the Console tab.
        </ThemedText>

        <Section
          title="1. Simple event (track)"
          description="The basic unit: something happened. Here, a click with no extra context.">
          <Button
            label="Fire Button Clicked"
            onPress={() => analytics.track(Events.ButtonClicked)}
          />
        </Section>

        <Section
          title="2. Event with properties"
          description="Properties add context: which product, which price. That's what makes the data useful.">
          <Button
            label="View product (T-shirt, R$79)"
            onPress={() =>
              analytics.track(Events.ProductViewed, {
                product_id: 'SKU-123',
                name: 'T-shirt',
                price: 79.0,
                currency: 'BRL',
              })
            }
          />
          <Button
            label="Add to cart"
            onPress={() =>
              analytics.track(Events.ProductAddedToCart, {
                product_id: 'SKU-123',
                quantity: 1,
              })
            }
          />
        </Section>

        <Section
          title="3. Identity (identify)"
          description="Before login the user is anonymous. After login, we associate events with them.">
          <Button
            label="Log in (identify)"
            onPress={() =>
              analytics.identify('user-42', { plan: 'free', language: 'pt-BR' })
            }
          />
        </Section>

        <Section
          title="4. Conversion funnel"
          description="A sequence of events that measures where the user advances or drops off.">
          <Button
            label="Start checkout"
            onPress={() => analytics.track(Events.CheckoutStarted, { items: 1, total: 79.0 })}
          />
          <Button
            label="Complete order"
            onPress={() =>
              analytics.track(Events.OrderCompleted, { order_id: 'ORD-001', total: 79.0 })
            }
          />
        </Section>
      </ScrollView>
    </ThemedView>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
      <View style={styles.buttons}>{children}</View>
    </View>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <ThemedText style={styles.buttonText}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 64, gap: 24 },
  intro: { opacity: 0.7 },
  section: { gap: 6 },
  description: { opacity: 0.6, fontSize: 14 },
  buttons: { gap: 8, marginTop: 6 },
  button: { backgroundColor: '#0a7ea4', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  pressed: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});
