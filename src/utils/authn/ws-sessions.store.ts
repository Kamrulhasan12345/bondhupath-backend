export interface WsSession {
  userId: string;
  fullName: string;
  buetId: string;
  gender: string;
  role: string;
  exp: number;           // WS JWT expiry (unix timestamp)
  warningSent: boolean;  // whether we sent token_expiring
  authenticated: boolean;
  refreshDeadline: number; // hard deadline: exp + GRACE_PERIOD
}

const sessions = new Map<string, WsSession>();
export { sessions };
