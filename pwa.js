'use strict';
/* SQL Quest — PWA: registra o service worker (modo offline), oferece "Instalar app" e avisa sobre rede/atualização.
   Só roda em http(s): abrindo index.html direto do disco (file://) o app continua funcionando, sem offline. */
(function () {
  if (!/^https?:$/.test(location.protocol)) return;

  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const btn = document.getElementById('installBtn');
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  let deferred = null;

  if (btn && !standalone) {
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; btn.classList.remove('hidden'); });
    if (ios) btn.classList.remove('hidden');     // o iOS não dispara o evento: mostramos o passo a passo
    btn.onclick = async () => {
      if (deferred) {
        deferred.prompt();
        await deferred.userChoice.catch(() => {});
        deferred = null; btn.classList.add('hidden');
      } else if (ios) {
        alert('No iPhone/iPad: toque em Compartilhar e depois em "Adicionar à Tela de Início".');
      }
    };
    window.addEventListener('appinstalled', () => { btn.classList.add('hidden'); if (window.toast) toast('App instalado'); });
  }

  window.addEventListener('offline', () => { if (window.toast) toast('Sem internet: o app continua funcionando offline'); });
  window.addEventListener('online', () => { if (window.toast) toast('De volta online'); });

  if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker não registrado:', e));
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // primeira instalação não avisa; só atualizações (não recarregamos sozinhos para não perder o rascunho do editor)
      if (hadController && window.toast) toast('App atualizado: recarregue a página para ver as novidades');
    });
  }
})();
