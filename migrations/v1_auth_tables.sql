CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT NOT NULL,
  email            TEXT UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  gender           TEXT NOT NULL CHECK (gender IN ('male','female')),
  role             TEXT NOT NULL CHECK (role IN ('student','teacher','staff')),
  buet_id          TEXT,
  department       TEXT,
  account_status   TEXT NOT NULL DEFAULT 'pending_verification'
                   CHECK (account_status IN ('pending_verification','verified','suspended')),
  consent_log      JSONB,
  push_token       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  jti         UUID PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);

CREATE TABLE otp_tokens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL,
  token_hash     TEXT NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  used           BOOLEAN NOT NULL DEFAULT false,
  attempt_count  SMALLINT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX otp_tokens_email_idx ON otp_tokens(email);


