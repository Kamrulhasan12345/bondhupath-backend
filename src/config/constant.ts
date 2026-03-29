export const ACCESS_TOKEN_EXP = '7d'
export const REFRESH_TOKEN_EXP = '30d'
export const WS_TOKEN_EXP = '30m'

export const WS_GRACE_PERIOD = '30s' // after expiry, how long to still accept WS token while sending warning
export const WS_TOKEN_WARN_BEFORE_MS = '30s'; // warn 30s before WS token expiry

export const BUET_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@([a-zA-Z0-9\-]+\.)*buet\.ac\.bd$/;
