/* SQL Quest — telas de conta: cartão na barra lateral e tela de login (ESQUELETO).
   Usa Auth (auth.js). Depende de $, esc, showPanel, renderDash (app.js / dashboard.js), chamados só em tempo de execução. */

const AUTH_MSG = {
  EMAIL_INVALID: 'Informe um e-mail válido, como nome@exemplo.com.',
  PASSWORD_SHORT: 'A senha precisa ter pelo menos 8 caracteres.',
  GOOGLE_NOT_CONFIGURED: 'Login com Google ainda não configurado: defina googleClientId em auth.js.',
  GOOGLE_NOT_IMPLEMENTED: 'Login com Google ainda não implementado: falta o backend que valida o token.',
  REMOTE_NOT_IMPLEMENTED: 'Servidor de contas ainda não implementado: use AUTH_CONFIG.mode = "local".'
};

function renderAccount() {
  const u = Auth.current(), guest = Auth.isGuest();
  const initial = (guest ? '?' : (u.name || u.email || '?').charAt(0)).toUpperCase();
  $('acct').innerHTML = `<div class="av" aria-hidden="true">${esc(initial)}</div>
    <div class="who"><b title="${esc(u.name)}">${esc(u.name)}</b><small title="${esc(u.email || '')}">${guest ? 'Progresso só neste navegador' : esc(u.email || 'Conta Google')}</small></div>
    <button class="b sm" id="acctBtn" type="button">${guest ? 'Entrar' : 'Sair'}</button>`;
  $('acctBtn').onclick = guest ? () => renderLogin() : () => Auth.signOut();
}

function renderLogin() {
  showPanel(`<div class="auth">
    <header><div><h2>Entrar no <mark class="mk">SQL Quest</mark></h2></div></header>
    <p class="hint">Com uma conta, o progresso e o histórico de métricas ficam ligados a você. <b>Modo demonstração:</b> ainda não há servidor, então a conta vale só neste navegador e a senha não é verificada.</p>
    <button class="b g" id="gBtn" type="button">Continuar com Google</button>
    <div class="or"><span>ou</span></div>
    <form id="emailForm" novalidate>
      <label for="lgEmail">E-mail</label>
      <input class="f" id="lgEmail" name="email" type="email" inputmode="email" autocomplete="email" spellcheck="false" placeholder="nome@exemplo.com…">
      <label for="lgPass">Senha</label>
      <input class="f" id="lgPass" name="password" type="password" autocomplete="current-password" minlength="8" placeholder="Mínimo de 8 caracteres…">
      <div class="ferr" id="lgErr" role="alert" aria-live="polite"></div>
      <div class="row"><button class="b p" id="lgSubmit" type="submit">Entrar com e-mail</button><button class="b" id="lgCreate" type="button">Criar conta</button></div>
    </form>
    <button class="b ghost" id="lgGuest" type="button">Continuar sem conta</button>
  </div>`);

  const err = msg => { $('lgErr').textContent = msg || ''; };
  const busy = (on, label) => { ['gBtn', 'lgSubmit', 'lgCreate', 'lgGuest'].forEach(id => { $(id).disabled = on; }); if (label) $('lgSubmit').textContent = on ? label : 'Entrar com e-mail'; };
  const run = async (fn, label) => {
    err(''); busy(true, label);
    try { await fn(); }                       // sucesso: Auth.onChange recarrega o app já com o usuário novo
    catch (e) { busy(false, label); err(AUTH_MSG[e.message] || 'Não foi possível entrar. Tente de novo.'); }
  };
  const emailLogin = create => run(() => Auth.signInWithEmail($('lgEmail').value, $('lgPass').value, {create}), 'Entrando…');

  $('emailForm').onsubmit = e => { e.preventDefault(); emailLogin(false); };
  $('lgCreate').onclick = () => emailLogin(true);
  $('gBtn').onclick = () => run(() => Auth.signInWithGoogle());
  $('lgGuest').onclick = () => { if (Auth.isGuest()) renderDash(); else Auth.signOut(); };
  $('lgEmail').focus();
}
