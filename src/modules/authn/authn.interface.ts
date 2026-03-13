export interface User {
  id: string;

  full_name: string;
  email: string;

  passwordHash: string;

  gender: 'male' | 'female';
  role: 'student' | 'teacher' | 'staff';

  buet_id: string;
  department?: string;

  account_status: 'pending_verification' | 'verified' | 'suspended';

  id_card_url?: string;
  consent_log?: Record<string, string>;

  push_token?: string;

  created_at: Date
  updated_at: Date

}

export interface AuthContext {
  user: Omit<User, 'passwordHash' | 'refreshTokenHash'>
}
