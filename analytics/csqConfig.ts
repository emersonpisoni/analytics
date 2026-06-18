/**
 * Configuração do Contentsquare (CSQ — antigo Heap).
 *
 * 👉 Cole aqui o Environment ID do seu projeto no Contentsquare.
 *    (No painel: Settings → Environments.)
 *
 * Enquanto estiver com o placeholder (ou rodando no Expo Go), o SDK fica
 * desligado — nada é enviado, mas o app continua funcionando e os eventos
 * aparecem na aba Console normalmente.
 */
export const CSQ_ENVIRONMENT_ID: string = '1757607503';

/** true quando o Environment ID real já foi configurado. */
export const CSQ_ENABLED = CSQ_ENVIRONMENT_ID !== 'YOUR_ENVIRONMENT_ID';
