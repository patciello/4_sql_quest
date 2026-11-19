'use strict';
/* SQL Quest — autenticação (ESQUELETO).
   Hoje: modo "local" de demonstração, sem servidor. Nada aqui é seguro de verdade:
   a senha NÃO é verificada nem guardada, e o Google ainda não está ligado.
   A interface (Auth.*) já devolve Promises, então ligar um backend real não muda o resto do app. */

const AUTH_CONFIG = {
  mode: 'local',          // 'local' = demonstração no navegador | 'remote' = usa apiBase (TODO)
  apiBase: '',            // TODO: URL da API, ex.: 'https://api.seudominio.com'
  googleClientId: ''      // TODO: ID do cliente OAuth 2.0 (Google Identity Services)
};

const AUTH_KEY = 'sqlquest_session';
const AUTH_GUEST = Object.freeze({id: 'guest', provider: 'guest', name: 'Convidado', email: null});

const Auth = (() => {
  const listeners = new Set();
  const read = () => {
    try { const s = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); if (s && s.id && s.provider) return s; } catch (e) { /* sem storage */ }
    return {...AUTH_GUEST};
  };
  let session = read();

  const fnv = str => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function set(next) {
    session = next;
    try { next.provider === 'guest' ? localStorage.removeItem(AUTH_KEY) : localStorage.setItem(AUTH_KEY, JSON.stringify(next)); } catch (e) { /* sem storage */ }
    listeners.forEach(fn => { try { fn(session); } catch (e) { /* ouvinte com erro não derruba os outros */ } });
  }

  return {
    current: () => session,
    isGuest: () => session.provider === 'guest',
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /* E-mail + senha. create=true cria a conta. Erros: Error('EMAIL_INVALID' | 'PASSWORD_SHORT' | 'REMOTE_NOT_IMPLEMENTED') */
    async signInWithEmail(email, password, {create = false} = {}) {
      email = String(email || '').trim().toLowerCase();
      if (!EMAIL_RE.test(email)) throw new Error('EMAIL_INVALID');
      if (String(password || '').length < 8) throw new Error('PASSWORD_SHORT');
      if (AUTH_CONFIG.mode === 'remote') {
        // TODO: POST `${AUTH_CONFIG.apiBase}/auth/${create ? 'signup' : 'login'}` com {email, password} (HTTPS),
        //       receber {id, name} + cookie de sessão HttpOnly e chamar set({id, provider: 'email', email, name}).
        throw new Error('REMOTE_NOT_IMPLEMENTED');
      }
      // Demonstração: perfil local identificado pelo e-mail. Sem verificação de senha.
      set({id: 'e_' + fnv(email), provider: 'email', email, name: email.split('@')[0]});
    },

    /* Google. Erros: Error('GOOGLE_NOT_CONFIGURED' | 'GOOGLE_NOT_IMPLEMENTED') */
    async signInWithGoogle() {
      if (!AUTH_CONFIG.googleClientId) throw new Error('GOOGLE_NOT_CONFIGURED');
      // TODO: carregar https://accounts.google.com/gsi/client, chamar google.accounts.id.initialize({client_id, callback}),
      //       enviar o `credential` (ID token) ao backend para VALIDAR a assinatura, e então
      //       set({id: 'g_' + sub, provider: 'google', email, name}). Nunca confie no token só no navegador.
      throw new Error('GOOGLE_NOT_IMPLEMENTED');
    },

    signOut() { set({...AUTH_GUEST}); }
  };
})();
