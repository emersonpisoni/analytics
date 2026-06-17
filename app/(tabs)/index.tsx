import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useAnalytics } from '@/analytics/AnalyticsContext';
import { Events } from '@/analytics/events';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

/**
 * Tela Demo: cada botão dispara um evento. Toque e depois veja o resultado
 * na aba Console. A ideia é conectar "ação no app" -> "evento de analytics".
 */
export default function DemoScreen() {
  // Pegamos o SDK via hook — o mesmo padrão de um app real.
  const analytics = useAnalytics();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Analytics 101</ThemedText>
        <ThemedText style={styles.intro}>
          Toque nos botões e acompanhe os eventos na aba Console.
        </ThemedText>

        {/* 1. track simples */}
        <Section
          title="1. Evento simples (track)"
          description="A unidade básica: algo aconteceu. Aqui, um clique sem contexto extra.">
          <Button
            label="Disparar Button Clicked"
            onPress={() => analytics.track(Events.ButtonClicked)}
          />
        </Section>

        {/* 2. track com propriedades */}
        <Section
          title="2. Evento com propriedades"
          description="As propriedades dão contexto: qual produto, qual preço. É o que torna o dado útil.">
          <Button
            label="Ver produto (camiseta R$ 79)"
            onPress={() =>
              analytics.track(Events.ProductViewed, {
                product_id: 'SKU-123',
                name: 'Camiseta',
                price: 79.0,
                currency: 'BRL',
              })
            }
          />
          <Button
            label="Adicionar ao carrinho"
            onPress={() =>
              analytics.track(Events.ProductAddedToCart, {
                product_id: 'SKU-123',
                quantity: 1,
              })
            }
          />
        </Section>

        {/* 3. identify */}
        <Section
          title="3. Identidade (identify)"
          description="Antes do login o usuário é anônimo. Após o login, associamos os eventos a ele.">
          <Button
            label="Fazer login (identify)"
            onPress={() =>
              analytics.identify('user-42', { plan: 'free', language: 'pt-BR' })
            }
          />
        </Section>

        {/* 4. funil */}
        <Section
          title="4. Funil de conversão"
          description="Uma sequência de eventos que mede onde o usuário avança ou desiste.">
          <Button
            label="Iniciar checkout"
            onPress={() => analytics.track(Events.CheckoutStarted, { items: 1, total: 79.0 })}
          />
          <Button
            label="Finalizar compra"
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
