/**
 * Configuração do Contentsquare (CSQ — antigo Heap).
 *
 * O Environment ID vem da variável de ambiente `EXPO_PUBLIC_CSQ_ENVIRONMENT_ID`
 * (definida no arquivo `.env`, que NÃO é versionado — veja `.env.example`).
 *
 * ⚠️ Por ser usado em runtime no app, o ID é embutido no bundle (por isso o
 * prefixo obrigatório `EXPO_PUBLIC_`). Ele é um identificador, não um segredo —
 * tirá-lo do código é higiene/config, não criptografia.
 *
 * Sem o `.env` (ou rodando no Expo Go), o SDK fica desligado: nada é enviado,
 * mas o app continua funcionando e os eventos aparecem na aba Console.
 */
export const CSQ_ENVIRONMENT_ID = process.env.EXPO_PUBLIC_CSQ_ENVIRONMENT_ID ?? '';

/** true quando o Environment ID foi configurado via .env. */
export const CSQ_ENABLED = CSQ_ENVIRONMENT_ID.length > 0;
