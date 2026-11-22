# SQL Quest

> **Status: em desenvolvimento progressivo.** O projeto cresce por etapas: novas lições, fases e recursos entram aos poucos, e partes ainda são protótipo. Veja a seção [Limitações atuais](#limitações-atuais) antes de confiar em algum recurso.

Plataforma gratuita para aprender SQL do zero, com teoria, esquema visual, editor com validação automática, simulado de certificação Oracle e um projeto prático (BiblioTech).

## Como usar

O SQL Quest é um site estático. Não precisa de servidor, Python ou instalação:

1. Baixe ou clone o repositório.
2. Dê duplo clique em `index.html` (ou abra o arquivo no navegador).
3. Precisa de conexão com a internet na primeira carga, porque o SQLite (sql.js), o editor (CodeMirror) e o JSZip são carregados de CDN.

### Instalar como app (PWA) e usar offline

Pelo endereço publicado (https://patciello.github.io/4_sql_quest/) ou por um servidor local (`python -m http.server`), o navegador oferece **instalar** o SQL Quest como app: botão "Instalar app" na barra lateral, ou o menu do Chrome/Edge em computador e Android ("Instalar app" / "Adicionar à tela inicial"); no iPhone, Compartilhar → Adicionar à Tela de Início. Depois da primeira visita online, o app abre e roda SQL **sem internet** (as bibliotecas do CDN ficam guardadas no cache). Só os vídeos do YouTube precisam de rede. Abrir `index.html` direto do disco (`file://`) continua funcionando, mas sem o modo offline.

## O que tem hoje

- **Roadmap em 5 fases**, cada uma com objetivo claro:
  1. **Fundamentos**: SELECT, WHERE, ORDER BY, limites.
  2. **Juntar e resumir**: JOINs, NULLs, GROUP BY e HAVING.
  3. **Alterar dados e estruturas**: INSERT, UPDATE, DELETE, CREATE, ALTER e DROP.
  4. **SQL avançado**: window functions, subqueries e operadores de conjunto.
  5. **Certificação Oracle + Projeto real**: domínios do exame Oracle SQL (1Z0-071) e o projeto BiblioTech.
- **Lab visual**: 10 lições (SELECT, WHERE, JOIN, GROUP BY, LEFT JOIN, ORDER BY, SUM e AVG, HAVING, UPDATE, DELETE) que mostram a consulta rodando etapa por etapa em tabelas pequenas, com botão para praticar o mesmo tema no editor. Funciona bem no celular e aceita as setas do teclado.
- **Treino extra (69 itens)**: 16 exercícios de consultas básicas, 18 de JOIN/NULL/agregações, 9 de INSERT/UPDATE/DELETE/DDL, 16 de subqueries/CASE/conjuntos/janelas e um quiz de 10 pegadinhas de lógica SQL, distribuídos nas fases 1 a 4.
- **Lições com conceito, esquema visual e amostra dos dados**, seguidas de um desafio no editor SQL.
- **Validação por resultado**: o app compara o resultado da sua consulta com o gabarito. Qualquer consulta equivalente é aceita, não só o texto idêntico. Há dica e solução para cada etapa.
- **Explicações passo a passo** recolhidas por padrão, para você tentar antes de ver a resposta.
- **Videoaulas** indicadas por tema, apontando o trecho certo de cada vídeo (conteúdo de canais externos em português ou inglês).
- **Simulado Oracle**: 20 questões sorteadas, 30 minutos, aprovação com 65% de acertos.
- **Projeto BiblioTech**: um banco de biblioteca construído etapa por etapa a partir das suas consultas aprovadas. Você pode baixar o pacote `.zip` com o esquema, as cargas de dados, as consultas e um script em Python.
- **Progresso e métricas no navegador**: o progresso fica no `localStorage`. Um histórico de tentativas, conclusões e simulados é guardado num SQLite local, consultável com `Store.query(...)` no console.

## Limitações atuais

- **Login é só demonstração.** O cadastro por e-mail não verifica senha, e o login com Google ainda não está ligado. Qualquer e-mail válido entra, e o progresso fica somente no navegador. Limpar os dados do site apaga tudo.
- **Sem sincronização entre dispositivos.** O backend ainda não existe.
- **Conteúdo em expansão.** Nem todas as fases têm o mesmo número de lições, e alguns temas (como PL/SQL e otimização de consultas) ainda não estão cobertos.
- **Banco de exercícios é SQLite.** Os exercícios seguem SQL padrão. Os temas específicos da Oracle aparecem no simulado e no projeto, não como execução em Oracle.

## Estrutura do projeto

```
SQL_Quest/
├── index.html          # ponto de entrada (abrir no navegador)
├── app.js              # interface, navegação, editor, validação, simulado
├── content.js          # lições e exercícios
├── content_sb.js       # trilha prática (SQL com o banco de exemplo)
├── content_extra.js    # treino extra: 59 exercícios + quiz de lógica
├── lab.js              # lab visual (consulta passo a passo)
├── pwa.js              # registro do service worker e botão de instalar
├── sw.js               # service worker (cache offline)
├── manifest.webmanifest # manifesto do PWA
├── icons/              # ícones do PWA (gerados por tools/gerar_icones.py)
├── tools/              # utilitários (gerador de ícones)
├── roadmap.js          # organização das 5 fases
├── explicacoes.js      # explicações passo a passo
├── videos_hc.js        # videoaulas e trechos indicados
├── dashboard.js        # roadmap e métricas
├── auth.js             # sessão (demonstração)
├── login.js            # tela de login e cartão da conta
├── storage.js          # histórico local em SQLite (sql.js)
├── icons.js            # ícones
├── styles.css          # estilos
├── db/
│   ├── schema.sql      # esquema do histórico (fonte única)
│   └── schema.js       # cópia do schema.sql em JS (gerada, não editar à mão)
├── assets/fonts/       # fontes locais (woff2)
├── sqlquest/           # versão anterior em Python/Streamlit (não é usada pelo index.html)
├── tests/              # testes da versão Python + run_gabaritos.mjs (confere todos os exercícios)
└── docs/
    ├── ARQUITETURA.md
    ├── GUIA_DE_ESTILO.md
    └── BANCO_E_LOGIN.md
```

Sobre `sqlquest/`, `app.py` e `tests/test_core.py`: são da primeira versão (Streamlit). Continuam no repositório como referência, mas a versão atual é a do site estático.

### Conferir os exercícios

`tests/run_gabaritos.mjs` executa o gabarito de todos os itens no SQLite (ids únicos, consultas que retornam linhas, constraints que precisam falhar, quizzes válidos). Rode depois de mexer em qualquer `content*.js`:

    npm install --no-save sql.js@1.8.0
    node tests/run_gabaritos.mjs

### Publicar uma nova versão do PWA

Quando mudar qualquer arquivo do app, aumente `VERSION` em `sw.js` para o cache antigo ser descartado. Online, o app já busca a versão mais nova dos arquivos; a mudança de versão garante a limpeza do cache e o aviso "App atualizado".

## Documentação

- [`docs/BANCO_E_LOGIN.md`](docs/BANCO_E_LOGIN.md): como o histórico e o login estão montados e como ligar um backend.
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md): decisões de stack e como adicionar lições.
- [`docs/GUIA_DE_ESTILO.md`](docs/GUIA_DE_ESTILO.md): paleta, tipografia e layout.

## Próximos passos

- Ligar um backend real para contas e sincronização de progresso.
- Ampliar as lições e incluir os temas que faltam (LAG/LEAD, PL/SQL e otimização de consultas).
- Melhorar a verificação das respostas com casos de teste ocultos.

## Licença

Ainda não definida. O repositório não traz arquivo de licença.
