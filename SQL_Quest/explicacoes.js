/* ═══════════ Explicações detalhadas + videoaulas por tema ═══════════
   EXPLAIN[id]  → passo a passo em linguagem simples (aparece recolhido, para não "entregar" a resposta)
   Vídeos: cada um foi CONFERIDO no YouTube em 17/11/2026 — postado depois de 17/11/2024,
   público e com incorporação permitida. Canais variados; português ou inglês.            */

/* id → [título, canal, data de postagem, minutos] */
const VMETA = {
  '81ygAvm16ic': ['SQL SELECT Statement Basics', 'Learn 2 Excel', '2025-01-13', 7],
  'BC4W6nGyOJM': ['WHERE Clause in SQL Explained', 'Concept Zone', '2026-02-18', 16],
  'IrovoxmHGMc': ['SQL ORDER BY and LIMIT Tutorial for Beginners', 'PYAI HUB', '2026-02-23', 13],
  'QuNjZky4aJU': ['SQL LIMIT Clause Explained', 'DATA NEST', '2026-02-28', 11],
  'PRY-vP8bgWA': ['SQL Joins Explained: INNER JOIN vs LEFT JOIN for Beginners', 'StarCode Kh', '2026-10-22', 12],
  'yKHgIvphM74': ['SQL INNER JOIN Explained with Student & Course Example', 'OpenBoxAiPro', '2026-02-21', 2],
  'Urch8D9Czeg': ['SQL LEFT JOIN Explained for Beginners', 'CodeLucky', '2025-03-21', 5],
  '7H7P2GFfxTM': ['SQL Group By Explained in Under 7 Minutes!', 'The Code Samples', '2025-02-16', 7],
  'sJECAtWB05k': ['SQL GROUP BY, HAVING & SUBQUERY Tutorial (For Beginners)', 'Data Guru', '2026-01-03', 74],
  'cHIb_XoF_T8': ['SQL in 5: Ranking Window Functions', 'Microsoft SQL', '2025-04-16', 7],
  'GmkQ4dUKBi0': ['SQL Window Functions Explained | OVER, PARTITION BY', 'Sam Whitby Coding', '2026-08-10', 4],
  'FZgCvBlqon8': ['SQL Queries for Beginners: Aliasing, DISTINCT, and Views', 'DataCamp', '2025-01-08', 4],
  'lO8Oc-WqW8k': ['Get Unique Values in SQL Using DISTINCT', 'MyLearnNest', '2026-07-05', 9],
  'M7ipyP4kNxY': ['SQL Server String Functions Explained with Examples', 'Computer Tutor', '2025-04-07', 5],
  'lkj06O-qle0': ['SQL Filters: LIKE, IN, BETWEEN & IS NULL', 'Vinod Verma', '2025-05-24', 8],
  'K9ECSrzwTLY': ['SQL COALESCE Function Explained in 60 Seconds', 'Talk 2 Data', '2025-09-16', 1],
  'XGzZwts0stk': ['SQL CASE statement. SQL IF solution. Fully explained.', 'Accessible IT', '2026-07-12', 9],
  '3v6IdOg_MK4': ['Case When Statement - T-SQL Full Tutorial For Beginners', 'Turtle Code', '2024-12-22', 2],
  'cCoPMXd7uAI': ['How to Use strftime() in SQLite to Extract Year', 'vlogize', '2025-10-07', 2],
  'AsuPVZ_EjEw': ['SQL Aggregate Functions | COUNT, SUM, AVG, MIN, MAX', 'Data with Baraa', '2025-03-21', 7],
  '5IuU8mxC3iE': ['SQL Aggregate Functions & GROUP BY', 'Nakya Sherre', '2025-05-17', 14],
  'Z0RIhEEqr0Q': ['The Hardest SQL Join Explained in 5 Minutes — Self Joins', 'Data with Baraa', '2026-01-01', 6],
  'BvW99VpBPSI': ['SQL Self Join Explained: Hierarchical Data & Relationships', 'CodeLucky', '2025-03-21', 6],
  'WRh6HAZZ-yo': ['Learn SQL Subqueries with Practical Example', 'DataMites', '2026-04-20', 5],
  'HwUPurpgs2k': ['Correlated and non-correlated subqueries', 'Data Engineering', '2025-03-04', 6],
  'LKzA_ojBLpk': ['SQL Exists Operator Explained Using Simple Examples!', 'The Code Samples', '2025-09-01', 5],
  'OzOEWYquyTk': ['SQL Set Operators Explained', 'Tech With Avnish', '2026-09-26', 5],
  '9vPnvLoS_Uc': ['Master SQL Set Operations: UNION, INTERSECT, EXCEPT', 'Hamed Fathi', '2025-06-28', 15],
  'D4y59zRfWU0': ['Essential SQL: Data Manipulation Language — Insert, Update and Delete', 'Databased', '2025-09-14', 20],
  'tFXFS9u7ueI': ['SQL Data Manipulation Language (DML): SELECT, INSERT, UPDATE, DELETE', 'Jacob Schrum', '2026-06-19', 14],
  'GIybgVK5eBs': ['Master SQL Constraints (PRIMARY KEY, FOREIGN KEY, CHECK, DEFAULT…)', 'Dinesh Gudur', '2025-03-16', 35],
  'gw9xeuhFVak': ['Learn How to Add a Column in SQL: ALTER TABLE Step by Step', 'Data by Mous', '2026-08-27', 9],
  'yk6R82z3CLQ': ['Create View in PostgreSQL', 'Arvind Rai', '2025-01-26', 13],
  'MlZLLRTlAEM': ['Database Indexes Explained – Speeding Up Your Queries', 'Software Interviews', '2025-02-21', 6],
  'wT3mxdmfU90': ['Common Table Expressions (SQL) (CTEs)', 'Cody Baldwin', '2024-12-22', 4],
  'oPSbokLCvjU': ['Relational Database Keys Explained: Primary, Foreign, Candidate & Super Keys', 'CodeLucky', '2025-05-19', 6],
  'a9DVIZtpMxI': ['Relational Databases Explained for Beginners', 'Destin Learning', '2026-09-12', 6]
};

/* vídeo(s) padrão do domínio (usados por itens sem vídeo próprio, como as questões de teoria) */
const TRACK_VIDEO = {
  basico: ['81ygAvm16ic', 'BC4W6nGyOJM'], intermediario: ['PRY-vP8bgWA'], avancado: ['cHIb_XoF_T8'],
  d1: ['FZgCvBlqon8'], d2: ['lkj06O-qle0'], d3: ['M7ipyP4kNxY'], d4: ['7H7P2GFfxTM'], d5: ['PRY-vP8bgWA'],
  d6: ['WRh6HAZZ-yo'], d7: ['OzOEWYquyTk'], d8: ['D4y59zRfWU0'], d9: ['GIybgVK5eBs'], proj: ['a9DVIZtpMxI']
};
/* vídeo(s) específicos por exercício/questão (até 2: o principal e um complemento) */
const ITEM_VIDEO = {
  'select-where': ['81ygAvm16ic', 'BC4W6nGyOJM'], 'order-limit': ['IrovoxmHGMc'],
  'inner-join': ['PRY-vP8bgWA', 'yKHgIvphM74'], 'group-by': ['7H7P2GFfxTM', 'sJECAtWB05k'],
  'window-rank': ['cHIb_XoF_T8', 'GmkQ4dUKBi0'],
  d1q1: ['M7ipyP4kNxY'], d1q2: ['K9ECSrzwTLY'], d1q3: ['lO8Oc-WqW8k'],
  d1p1: ['FZgCvBlqon8'], d1p2: ['lO8Oc-WqW8k', 'FZgCvBlqon8'], d1p3: ['M7ipyP4kNxY'],
  d2q1: ['lkj06O-qle0'], d2q2: ['BC4W6nGyOJM'], d2q3: ['lkj06O-qle0'], d2q4: ['81ygAvm16ic'],
  d2p1: ['lkj06O-qle0', 'IrovoxmHGMc'], d2p2: ['lkj06O-qle0'], d2p3: ['lkj06O-qle0', 'BC4W6nGyOJM'], d2p4: ['IrovoxmHGMc', 'QuNjZky4aJU'],
  d3q2: ['K9ECSrzwTLY'], d3q3: ['K9ECSrzwTLY'],
  d3p1: ['M7ipyP4kNxY'], d3p2: ['K9ECSrzwTLY'], d3p3: ['XGzZwts0stk', '3v6IdOg_MK4'], d3p4: ['cCoPMXd7uAI'],
  d4q1: ['AsuPVZ_EjEw'], d4q2: ['7H7P2GFfxTM', 'sJECAtWB05k'], d4q4: ['AsuPVZ_EjEw'],
  d4p1: ['AsuPVZ_EjEw'], d4p2: ['7H7P2GFfxTM', 'sJECAtWB05k'], d4p3: ['AsuPVZ_EjEw'], d4p4: ['7H7P2GFfxTM', '5IuU8mxC3iE'],
  d5q1: ['Urch8D9Czeg'], d5q3: ['Urch8D9Czeg'],
  d5p1: ['PRY-vP8bgWA'], d5p2: ['Urch8D9Czeg'], d5p3: ['Z0RIhEEqr0Q', 'BvW99VpBPSI'], d5p4: ['Urch8D9Czeg'],
  d6q3: ['LKzA_ojBLpk'], d6q4: ['HwUPurpgs2k'],
  d6p3: ['HwUPurpgs2k'], d6p4: ['LKzA_ojBLpk'],
  d7p1: ['OzOEWYquyTk', '9vPnvLoS_Uc'], d7p2: ['OzOEWYquyTk', '9vPnvLoS_Uc'], d7p3: ['OzOEWYquyTk', '9vPnvLoS_Uc'],
  d8s1: ['D4y59zRfWU0', 'tFXFS9u7ueI'], d8s2: ['D4y59zRfWU0', 'tFXFS9u7ueI'], d8s3: ['D4y59zRfWU0', 'tFXFS9u7ueI'],
  d8s4: ['D4y59zRfWU0', 'tFXFS9u7ueI'], d8s5: ['D4y59zRfWU0', 'GIybgVK5eBs'],
  d9q2: ['oPSbokLCvjU'], d9q3: ['oPSbokLCvjU'], d9q5: ['yk6R82z3CLQ'],
  d9s1: ['GIybgVK5eBs', 'oPSbokLCvjU'], d9s2: ['gw9xeuhFVak'], d9s3: ['yk6R82z3CLQ', 'FZgCvBlqon8'], d9s4: ['MlZLLRTlAEM'], d9s5: ['GIybgVK5eBs'],
  p01: ['GIybgVK5eBs', 'oPSbokLCvjU'], p02: ['GIybgVK5eBs', 'oPSbokLCvjU'], p03: ['GIybgVK5eBs'], p04: ['GIybgVK5eBs', 'oPSbokLCvjU'],
  p05: ['D4y59zRfWU0'], p06: ['D4y59zRfWU0'], p07: ['D4y59zRfWU0'], p08: ['D4y59zRfWU0'],
  p09: ['PRY-vP8bgWA'], p10: ['PRY-vP8bgWA', 'BC4W6nGyOJM'], p11: ['7H7P2GFfxTM'], p12: ['cCoPMXd7uAI'],
  p13: ['D4y59zRfWU0'], p14: ['D4y59zRfWU0', 'GIybgVK5eBs'], p15: ['yk6R82z3CLQ'], p16: ['MlZLLRTlAEM'],
  p17: ['wT3mxdmfU90', 'cHIb_XoF_T8'], p18: ['a9DVIZtpMxI']
};

const E = (steps, trap) =>
  '<ol>' + steps.map(s => `<li>${s}</li>`).join('') + '</ol>' + (trap ? `<p class="trap">⚠️ <b>Cuidado:</b> ${trap}</p>` : '');

const EXPLAIN = {
/* ── Fundamentos ── */
'select-where': E([
  'Pense na tabela como uma planilha. <code>FROM clientes</code> diz <b>qual planilha</b> abrir.',
  '<code>SELECT nome, cidade</code> escolhe <b>quais colunas</b> mostrar (as outras ficam escondidas).',
  "<code>WHERE estado = 'PE'</code> é o <b>filtro de linhas</b>: só entram os clientes cujo estado é PE.",
  'Leia na ordem em que o banco pensa: <i>de onde</i> (FROM) → <i>quais linhas</i> (WHERE) → <i>quais colunas</i> (SELECT).'
], "texto sempre entre aspas simples ('PE'). Sem aspas, o banco acha que PE é o nome de uma coluna."),
'order-limit': E([
  'Primeiro ordenamos: <code>ORDER BY preco DESC</code> coloca os mais caros no topo (DESC = do maior para o menor).',
  '<code>LIMIT 3</code> corta a lista e fica só com as 3 primeiras linhas.',
  'Como o corte acontece <b>depois</b> da ordenação, as 3 primeiras são exatamente as mais caras.'
], 'sem o ORDER BY, o LIMIT devolve 3 linhas quaisquer — a ordem de uma tabela nunca é garantida.'),
'inner-join': E([
  'Os dados estão separados: o pedido guarda só o <code>cliente_id</code>, e o nome está em outra tabela.',
  '<code>JOIN clientes c ON c.id = p.cliente_id</code> é o "encaixe": para cada pedido, o banco procura o cliente com o mesmo id.',
  'Os apelidos (<code>p</code> e <code>c</code>) abreviam os nomes e dizem de qual tabela vem cada coluna.',
  'Depois do encaixe, o WHERE filtra apenas os pedidos \'entregue\'. Os aliases <code>AS pedido_id</code> e <code>AS cliente</code> dão os nomes pedidos às colunas.'
], 'esquecer o ON gera um "produto cartesiano": cada pedido combinado com cada cliente.'),
'group-by': E([
  'Primeiro junte clientes e pedidos para ter uma linha por pedido já com o nome do cliente.',
  '<code>GROUP BY c.id, c.nome</code> agrupa as linhas: todos os pedidos do mesmo cliente viram um grupo.',
  '<code>COUNT(*)</code> conta quantas linhas há em cada grupo — o total de pedidos daquele cliente.',
  '<code>HAVING COUNT(*) &gt;= 2</code> filtra os <b>grupos</b> já contados. Se usasse WHERE, ele rodaria antes de existir contagem.'
], 'WHERE filtra linhas antes do agrupamento; HAVING filtra grupos depois.'),
'window-rank': E([
  'Queremos o mais caro <b>de cada categoria</b>, sem perder as linhas (por isso GROUP BY não serve).',
  '<code>RANK() OVER (PARTITION BY categoria ORDER BY preco DESC)</code> numera os produtos dentro de cada categoria: 1 = o mais caro.',
  'Não dá para usar o resultado de RANK diretamente no WHERE; então colocamos tudo em uma <b>subconsulta</b> e filtramos <code>WHERE r = 1</code> por fora.'
], 'em caso de empate no preço, o RANK dá posição 1 para os dois — ambos aparecem.'),

/* ── D1 ── */
d1p1: E(['Em <code>salario * 12</code> o banco calcula a conta linha a linha.', '<code>AS salario_anual</code> dá um nome (alias) à coluna calculada; sem ele o título seria a própria fórmula.'], 'se o salário fosse NULL, o resultado também seria NULL.'),
d1p2: E(['<code>DISTINCT</code> remove as repetições: cargos iguais aparecem uma vez só.', '<code>ORDER BY cargo</code> coloca em ordem alfabética (A→Z).'], 'DISTINCT vem logo após o SELECT e vale para a linha inteira.'),
d1p3: E(["O operador <code>||</code> cola textos: <code>nome || ' - ' || cargo</code>.", 'O texto fixo (o traço com espaços) vai entre aspas simples.', 'O <code>WHERE departamento_id = 20</code> restringe ao departamento pedido.'], 'se qualquer pedaço for NULL, o resultado inteiro vira NULL.'),

/* ── D2 ── */
d2p1: E(['<code>BETWEEN 4000 AND 7000</code> aceita 4000 e 7000 também (limites incluídos).', '<code>ORDER BY salario DESC, nome</code>: primeiro o maior salário; se empatar, ordem alfabética do nome.'], 'duas pessoas com o mesmo salário só têm ordem garantida se você der um critério de desempate.'),
d2p2: E(['NULL significa "valor desconhecido/ausente", não é zero nem texto vazio.', 'Por isso a comparação é <code>IS NULL</code>. O <code>= NULL</code> nunca dá verdadeiro.'], 'o oposto é <code>IS NOT NULL</code>.'),
d2p3: E(['O departamento: <code>departamento_id IN (10, 20)</code> é um jeito curto de escrever "= 10 OU = 20".', "O nome: <code>nome LIKE 'M%'</code> (começa com M) <b>OU</b> <code>nome LIKE '%a'</code> (termina com a). O <code>%</code> significa \"qualquer coisa\".", 'Junte as duas partes com AND, e coloque o grupo do OR entre <b>parênteses</b>.'], 'sem parênteses, o AND é avaliado antes do OR e o resultado muda completamente.'),
d2p4: E(['Ordene por salário do maior para o menor.', '<code>LIMIT 3</code> mantém só as 3 primeiras (no Oracle seria <code>FETCH FIRST 3 ROWS ONLY</code>).'], 'LIMIT sempre depois do ORDER BY.'),

/* ── D3 ── */
d3p1: E(['<code>UPPER(nome)</code> devolve o nome em maiúsculas; <code>LENGTH(nome)</code> conta os caracteres (espaços também contam).', 'Funções de linha única rodam uma vez para cada linha e devolvem um valor por linha.'], null),
d3p2: E(['<code>COALESCE(comissao, 0)</code> olha o primeiro valor: se não for nulo, usa ele; se for nulo, usa o próximo (0).', 'É o equivalente ao <code>NVL</code> do Oracle e evita que contas com NULL deem NULL.'], null),
d3p3: E(['<code>CASE</code> funciona como um "se/senão": o banco testa os <code>WHEN</code> de cima para baixo.', 'O primeiro verdadeiro vence — por isso testamos ≥ 7000 antes de ≥ 4000.', '<code>ELSE</code> cobre o que sobrou. Termine sempre com <code>END</code>.'], 'inverter a ordem dos WHEN faria todo mundo cair em "Média".'),
d3p4: E(["As datas estão como texto no formato <code>AAAA-MM-DD</code>.", "<code>strftime('%Y', admissao)</code> extrai só o ano (como texto); <code>CAST(... AS INTEGER)</code> transforma em número.", "O filtro <code>admissao &gt;= '2022-01-01'</code> funciona porque o formato ISO ordena certo como texto."], 'em outros formatos (DD/MM/AAAA) essa comparação não funcionaria.'),

/* ── D4 ── */
d4p1: E(['Funções de agregação transformam muitas linhas em uma só: <code>COUNT(*)</code> conta linhas, <code>AVG</code> faz a média, <code>MAX</code> pega o maior.', '<code>ROUND(AVG(salario), 2)</code> arredonda a média para 2 casas.', 'Sem GROUP BY, toda a tabela é um único grupo.'], null),
d4p2: E(['<code>GROUP BY departamento_id</code> separa os funcionários por departamento.', '<code>COUNT(*)</code> conta cada grupo.', '<code>HAVING COUNT(*) &gt; 2</code> mantém só os grupos grandes.'], 'não use WHERE para filtrar contagens.'),
d4p3: E(['<code>COUNT(*)</code> conta todas as linhas.', '<code>COUNT(comissao)</code> conta só as linhas em que comissao <b>não é nula</b>.', 'Esse contraste cai muito em prova.'], null),
d4p4: E(['<code>SUM(salario)</code> soma por grupo; <code>ORDER BY soma_salarios DESC</code> ordena pelo alias.', 'Quem não tem departamento (NULL) forma um grupo próprio — não é descartado.'], null),

/* ── D5 ── */
d5p1: E(['Funcionário guarda só o número do departamento; o nome está na outra tabela.', '<code>JOIN departamentos d ON d.id = f.departamento_id</code> liga os dois.', 'Quem não tem departamento some do resultado (INNER JOIN só mantém quem encaixa).'], null),
d5p2: E(['<code>LEFT JOIN</code> mantém <b>todos</b> os departamentos, mesmo sem funcionários (as colunas de f ficam NULL).', '<code>COUNT(f.id)</code> conta só os ids que existem — dá 0 para o departamento vazio. Com <code>COUNT(*)</code> daria 1.', 'Agrupe por departamento para ter uma linha por departamento.'], 'COUNT(*) conta a linha "vazia" do LEFT JOIN como 1.'),
d5p3: E(['A tabela de funcionários tem o <code>gerente_id</code>, que aponta para outro funcionário da <b>mesma tabela</b>.', 'Use a tabela duas vezes com apelidos diferentes: <code>f</code> (funcionário) e <code>g</code> (gerente).', 'A ligação é <code>g.id = f.gerente_id</code>. Isso se chama <i>self join</i>.'], null),
d5p4: E(['Faça LEFT JOIN de departamentos com funcionários.', 'Departamentos sem funcionários ficam com <code>f.id</code> NULL.', 'O <code>WHERE f.id IS NULL</code> deixa só esses — é o "anti-join".'], 'o filtro IS NULL precisa ficar no WHERE (depois do JOIN), não no ON.'),

/* ── D6 ── */
d6p1: E(['A subconsulta <code>(SELECT AVG(salario) FROM funcionarios)</code> roda primeiro e vira um único número.', 'A consulta de fora compara cada salário com esse número.'], 'a subconsulta com = ou &gt; deve devolver uma única linha e coluna.'),
d6p2: E(['A subconsulta devolve a lista de departamentos que têm alguém ganhando &gt; 8000.', '<code>id IN (lista)</code> pega os departamentos cujo id está nessa lista.'], null),
d6p3: E(['Para cada funcionário <code>f</code>, a subconsulta calcula o <b>maior salário do departamento dele</b> (note o <code>f.departamento_id</code> vindo de fora).', 'Se o salário da pessoa é igual a esse máximo, ela entra.', 'Isso é uma subconsulta <i>correlacionada</i>: depende da linha de fora.'], 'quem não tem departamento não aparece, pois NULL = NULL não é verdadeiro.'),
d6p4: E(['<code>EXISTS</code> pergunta: "existe pelo menos uma linha nessa subconsulta?".', 'Para cada pessoa <code>g</code>, procuramos alguém cujo <code>gerente_id</code> seja o id dela. Se achar, ela é gerente.', 'O que vai no SELECT da subconsulta não importa (usamos <code>1</code>).'], null),

/* ── D7 ── */
d7p1: E(['<code>UNION</code> empilha os resultados de duas consultas e remove repetidos.', 'As duas precisam ter o mesmo número de colunas; o nome da coluna vem da primeira (<code>AS ref</code>).', 'O <code>ORDER BY</code> vem só uma vez, no fim.'], null),
d7p2: E(['<code>INTERSECT</code> devolve só o que aparece nas <b>duas</b> consultas.', 'Consulta 1: departamentos com alguém com comissão. Consulta 2: departamentos com alguém ganhando ≥ 8500. O resultado é o que há em comum.'], null),
d7p3: E(['<code>EXCEPT</code> (MINUS no Oracle) devolve o que está na primeira consulta e <b>não</b> está na segunda.', 'Todos os ids de departamentos menos os ids que aparecem em funcionários = departamentos vazios.'], null),

/* ── D8 ── */
d8s1: E(['Para inserir: <code>INSERT INTO tabela VALUES (...)</code>, com os valores na <b>mesma ordem das colunas</b> da tabela.', 'Textos entre aspas simples; <code>NULL</code> sem aspas para "sem valor".', 'Dica: listar as colunas (<code>INSERT INTO t (col1, col2) VALUES ...</code>) evita erro de ordem.'], 'o departamento 30 e o gerente 9 precisam existir (chave estrangeira).'),
d8s2: E(['<code>UPDATE tabela SET coluna = novo_valor WHERE ...</code> altera linhas existentes.', '<code>salario = salario * 1.10</code> usa o valor atual para calcular o novo (+10%).', "O WHERE restringe a quem é do departamento 20 <b>e</b> tem cargo parecido com 'Desenvolvedor'."], 'UPDATE sem WHERE muda a tabela inteira!'),
d8s3: E(['<code>DELETE FROM tabela WHERE condição</code> apaga só as linhas que casam com a condição.', "Aqui a condição é <code>cargo = 'Estagiária'</code>."], 'DELETE sem WHERE apaga tudo.'),
d8s4: E(['Queremos mudar só quem está no departamento 10 e ainda <b>não tem</b> comissão.', 'Verifique "não tem" com <code>comissao IS NULL</code> — e não com = NULL.'], null),
d8s5: E(['Escreva dois comandos DELETE separados por <code>;</code>.', 'As chaves estrangeiras protegem os dados: só dá para apagar um registro se ninguém depender dele.', 'O departamento 50 e o funcionário 12 não são referenciados por ninguém, então podem ser removidos.'], 'se tentar apagar alguém que é gerente de outra pessoa, o banco recusa.'),

/* ── D9 ── */
d9s1: E(['<code>CREATE TABLE nome ( coluna tipo restrições, ... )</code> cria a estrutura.', '<code>PRIMARY KEY</code> identifica cada linha; <code>NOT NULL</code> obriga ter valor.', '<code>REFERENCES departamentos(id)</code> cria a chave estrangeira: só aceita departamentos que existam.', 'O sistema testa se você realmente protegeu a tabela (tenta inserir dados inválidos).'], 'sempre informe a coluna referenciada: REFERENCES tabela(coluna).'),
d9s2: E(['<code>ALTER TABLE tabela ADD COLUMN coluna tipo</code> acrescenta uma coluna sem perder os dados.', 'As linhas existentes ficam com NULL na nova coluna.'], null),
d9s3: E(['Uma <b>view</b> é uma consulta salva com nome — uma "tabela virtual".', 'A consulta dentro dela é o LEFT JOIN + COUNT dos exercícios de junção.', 'Os dados não são copiados: a view sempre mostra o estado atual das tabelas.'], null),
d9s4: E(['Um <b>índice</b> funciona como o índice de um livro: ajuda o banco a achar linhas por aquela coluna sem ler a tabela inteira.', 'Sintaxe: <code>CREATE INDEX nome ON tabela (coluna);</code>'], 'índices aceleram leituras, mas deixam inserções um pouco mais lentas.'),
d9s5: E(['<code>DEFAULT 3</code> preenche a nota com 3 quando você não informar.', '<code>CHECK (nota BETWEEN 1 AND 5)</code> rejeita qualquer valor fora do intervalo.', 'Junte com <code>NOT NULL</code> e a chave estrangeira para funcionario_id.'], null),

/* ── Projeto BiblioTech ── */
p01: E(['Comece pelas tabelas que não dependem de ninguém: autores.', '<code>id INTEGER PRIMARY KEY</code>; nome é obrigatório (<code>NOT NULL</code>); país é opcional.'], null),
p02: E(['Livros depende de autores: <code>autor_id</code> usa <code>REFERENCES autores(id)</code>.', '<code>isbn TEXT UNIQUE</code> impede dois livros com o mesmo ISBN.', '<code>exemplares</code> tem <code>DEFAULT 1</code> e <code>CHECK (exemplares &gt;= 0)</code> para nunca ficar negativo.', 'Mantenha a <b>ordem das colunas</b> do enunciado: a carga de dados (etapa 6) depende dela.'], null),
p03: E(['<code>email TEXT NOT NULL UNIQUE</code>: obrigatório e sem repetição — duas pessoas não podem ter o mesmo e-mail.'], null),
p04: E(['Empréstimos liga um livro a um membro: duas chaves estrangeiras.', '<code>data_devolucao</code> fica sem NOT NULL de propósito: enquanto o livro não volta, o valor é NULL.', 'Por isso criamos as tabelas-pai (autores, livros, membros) antes desta.'], null),
p05: E(['Um único <code>INSERT INTO autores VALUES (...), (...), ...;</code> pode inserir várias linhas.', 'Confira que os valores seguem a ordem das colunas: id, nome, país.'], null),
p06: E(['Os autores já existem, então as chaves estrangeiras de livros são aceitas.', 'Valores na ordem: id, título, autor_id, ano, gênero, isbn, exemplares.', 'Títulos com acento funcionam normalmente entre aspas simples.'], null),
p07: E(['Mesma ideia: id, nome, e-mail e data de cadastro (texto <code>AAAA-MM-DD</code>).', 'E-mails repetidos seriam recusados pela restrição UNIQUE.'], null),
p08: E(['Empréstimos exige livros e membros já cadastrados (por isso a carga vem depois).', 'Escreva <code>NULL</code> (sem aspas) na devolução dos livros que ainda não voltaram.'], null),
p09: E(['Junte livros com autores: <code>autores a ON a.id = l.autor_id</code>.', 'Dê o alias <code>AS autor</code> ao nome do autor e ordene por título.'], null),
p10: E(['Junte empréstimos com livros e com membros (dois JOINs).', 'Livro em aberto = <code>data_devolucao IS NULL</code>.', 'Ordene pela data do empréstimo.'], null),
p11: E(['Junte membros com empréstimos e agrupe por membro.', '<code>COUNT(*)</code> dá o total de empréstimos de cada um.', 'Ordene do maior para o menor e, no empate, por nome.'], null),
p12: E(['<code>julianday(data)</code> transforma uma data em número de dias; subtrair dois julianday dá a diferença em dias.', 'Dias desde o empréstimo menos 14 de prazo = dias de atraso.', 'Filtre os não devolvidos com atraso positivo e ordene do maior atraso para o menor.', "Usamos a data fixa '2025-06-30' como \"hoje\" para o resultado não mudar com o tempo."], null),
p13: E(['<code>UPDATE emprestimos SET data_devolucao = \'2025-06-28\' WHERE id = 2;</code>', 'O WHERE garante que só o empréstimo 2 muda.'], 'sem WHERE, todos os empréstimos seriam marcados como devolvidos.'),
p14: E(['As chaves estrangeiras impedem apagar um membro que ainda tem empréstimos.', 'Ordem correta: primeiro apague os <b>filhos</b> (empréstimos do membro 4) e só depois o <b>pai</b> (o membro 4).'], 'inverter a ordem gera erro de chave estrangeira.'),
p15: E(['A view guarda a consulta dos empréstimos em aberto para reutilizar.', 'Use os aliases pedidos: <code>emprestimo_id</code>, <code>titulo</code>, <code>membro</code>, <code>data_emprestimo</code>.'], null),
p16: E(['Os índices nas chaves estrangeiras (livro_id, membro_id) aceleram os JOINs e buscas por empréstimos.', 'Dois comandos <code>CREATE INDEX</code>, um para cada coluna.'], null),
p17: E(['Na CTE (<code>WITH t AS (...)</code>), conte empréstimos por gênero.', 'Na consulta de fora, <code>RANK() OVER (ORDER BY emprestimos DESC)</code> numera os gêneros do mais emprestado ao menos emprestado.', 'Ordene por ranking e gênero.'], 'a CTE é só um "rascunho nomeado" da consulta, que deixa tudo mais legível.')
};
