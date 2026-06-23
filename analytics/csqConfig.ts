export const CSQ_ENVIRONMENT_ID = process.env.EXPO_PUBLIC_CSQ_ENVIRONMENT_ID ?? '';

export const CSQ_ENABLED = CSQ_ENVIRONMENT_ID.length > 0;
