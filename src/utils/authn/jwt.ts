export interface JWTTokenPayload {
  sub: string;
  email: string;
  full_name: string;
  buet_id: string;
  role: string;
  gender: string;
  exp: number;
}
