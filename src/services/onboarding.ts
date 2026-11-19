import { authApi, usersApi } from './seek';
import { appendUpload, UploadFile } from './uploads';

export type AccountType = 'PF' | 'EMPRESA';
export type SessionUser = { id: string | number; tipo_usuario: AccountType; nome?: string; foto_perfil?: string | null };
export type FirstLoginState = { user: SessionUser; needsOnboarding: boolean };
export type ProfileData = { id: string | number; tipo_usuario: AccountType; perfil_pessoa_fisica: Record<string, any> | null; perfil_empresa: Record<string, any> | null };
export type WelcomeFields = Record<string, string>;
export const personFields = ['nome_usuario', 'sobre', 'linkedin', 'github'] as const;
export const companyFields = ['nome_fantasia', 'categoria_negocio', 'razao_social', 'numero_funcionarios', 'telefone_comercial', 'site', 'descricao'] as const;
const allPersonFields = [...personFields, 'telefone', 'cidade', 'estado', 'curriculo'];
const allCompanyFields = [...companyFields, 'endereco_completo'];

export function validateUser(user: any): asserts user is SessionUser {
  if (!Number.isSafeInteger(Number(user?.id)) || Number(user.id) <= 0 || !['PF', 'EMPRESA'].includes(user.tipo_usuario)) throw new Error('Não foi possível identificar o tipo da sua conta. Entre novamente.');
}

export async function loadFirstLoginState(): Promise<FirstLoginState> {
  const { data } = await authApi.me();
  validateUser(data?.usuario);
  const { data: status } = await usersApi.firstLogin();
  if (typeof status?.primeiro_login !== 'boolean') throw new Error('Não foi possível verificar se seu cadastro foi concluído. Tente novamente.');
  return { user: data.usuario, needsOnboarding: status.primeiro_login };
}

export function sessionDestination(state: FirstLoginState | null, route?: string): '/login' | '/principal' | '/completarCadastro' | null {
  const inAuth = ['login', 'cadastro', 'verificarConta'].includes(route || '');
  if (!state) return inAuth ? null : '/login';
  if (state.needsOnboarding) return route === 'completarCadastro' ? null : '/completarCadastro';
  return inAuth || route === 'completarCadastro' || !route ? '/principal' : null;
}

export function welcomeFields(profile: ProfileData): WelcomeFields {
  const source = profile.tipo_usuario === 'EMPRESA' ? profile.perfil_empresa : profile.perfil_pessoa_fisica;
  const keys = profile.tipo_usuario === 'EMPRESA' ? companyFields : personFields;
  return Object.fromEntries(keys.map(key => [key, source?.[key] == null ? '' : String(source[key])]));
}

export function validateWelcomeFields(type: AccountType, fields: WelcomeFields, curriculum?: UploadFile | null) {
  const urls = type === 'EMPRESA' ? ['site'] : ['linkedin', 'github'];
  for (const key of urls) {
    const value = fields[key]?.trim();
    if (value) {
      try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
      catch { throw new Error(`Informe um endereço válido com http:// ou https:// no campo ${key === 'site' ? 'Site' : key === 'linkedin' ? 'LinkedIn' : 'GitHub'}.`); }
    }
  }
  const employees = fields.numero_funcionarios?.trim();
  if (type === 'EMPRESA' && employees && (!/^\d+$/.test(employees) || !Number.isSafeInteger(Number(employees)))) throw new Error('Informe um número inteiro de funcionários igual ou maior que zero.');
  if (curriculum && (!/\.pdf$/i.test(curriculum.name) || curriculum.mimeType !== 'application/pdf')) throw new Error('Selecione um currículo em PDF.');
}

export async function completeFirstLogin({ profile, fields, photo, curriculum }: { profile: ProfileData; fields: WelcomeFields; photo?: UploadFile | null; curriculum?: UploadFile | null }) {
  if (!['PF', 'EMPRESA'].includes(profile.tipo_usuario)) throw new Error('Tipo de conta inválido.');
  validateWelcomeFields(profile.tipo_usuario, fields, curriculum);
  if (profile.tipo_usuario === 'EMPRESA') {
    const existing = profile.perfil_empresa;
    const payload = Object.fromEntries(allCompanyFields.map(key => [key, key in fields ? fields[key].trim() || null : existing?.[key] ?? null]));
    // This column is NOT NULL in the API schema; the website sends empty text.
    payload.razao_social ??= '';
    payload.numero_funcionarios = 'numero_funcionarios' in fields ? fields.numero_funcionarios.trim() ? Number(fields.numero_funcionarios) : 0 : existing?.numero_funcionarios ?? 0;
    await usersApi.updateCompany(payload);
  } else {
    const existing = profile.perfil_pessoa_fisica;
    const payload = Object.fromEntries(allPersonFields.map(key => [key, key in fields ? fields[key].trim() || null : existing?.[key] ?? null]));
    if (curriculum) {
      const form = new FormData();
      for (const [key, value] of Object.entries(payload)) if (key !== 'curriculo') form.append(key, value == null ? '' : String(value));
      await appendUpload(form, 'curriculo', curriculum);
      await usersApi.updatePerson(form);
    } else {
      await usersApi.updatePerson(payload);
    }
  }
  if (photo) {
    const form = new FormData();
    await appendUpload(form, 'foto', photo);
    await usersApi.updatePhoto(form);
  }
  // Commit the shared server flag only after every selected upload succeeds.
  await usersApi.completeRegistration();
}
