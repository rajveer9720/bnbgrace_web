import type { AuthUser, UserRole } from '../auth/authContext';
export interface CredentialsDto { email: string; password: string }
export interface TokenResponse { accessToken: string }
export interface SessionDto { token: string; role: UserRole }
export interface SessionResponse { user: AuthUser }
export interface GenerateReplyDto { question: string }
export interface GenerateReplyResponse { reply: string; fallback: boolean }
export interface AddQaDto { question: string; answer: string }
export interface AddUrlDto { url: string }
export interface KnowledgeSource {
  id: number; type: 'pdf' | 'url' | 'qa'; title: string; originalRef: string; createdAt: string;
}
