/* ═══════════════════ SQL Quest — conteúdo ═══════════════════
   Para adicionar exercícios: acrescente itens em TRACKS (no fim deste arquivo).
   Tipos de item:
     query  → o aluno escreve UM SELECT; compara resultado com o do gabarito (padrão)
     script → o aluno escreve DDL/DML (vários comandos); compara o resultado da consulta `check`
              e, opcionalmente, exige que `mustFail` (comandos de teste) sejam REJEITADOS (constraints)
     quiz   → múltipla escolha
     export → etapa final do projeto (download do pacote)
*/

/* ───────── Bancos de exemplo ───────── */
const SEED_LOJA = `
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cidade TEXT NOT NULL, estado TEXT NOT NULL);
CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, categoria TEXT NOT NULL, preco REAL NOT NULL);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER NOT NULL REFERENCES clientes(id), data TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE itens_pedido (id INTEGER PRIMARY KEY, pedido_id INTEGER NOT NULL REFERENCES pedidos(id), produto_id INTEGER NOT NULL REFERENCES produtos(id), quantidade INTEGER NOT NULL);
INSERT INTO clientes VALUES (1,'Ana Souza','Recife','PE'),(2,'Bruno Lima','São Paulo','SP'),(3,'Carla Dias','Olinda','PE'),(4,'Diego Alves','Campinas','SP'),(5,'Elisa Rocha','Salvador','BA'),(6,'Fábio Costa','Recife','PE');
INSERT INTO produtos VALUES (1,'Notebook','Eletrônicos',3500.00),(2,'Mouse','Periféricos',80.00),(3,'Teclado','Periféricos',150.00),(4,'Monitor','Eletrônicos',1200.00),(5,'Cadeira Gamer','Móveis',950.00),(6,'Mesa de Escritório','Móveis',700.00),(7,'Webcam','Periféricos',220.00);
INSERT INTO pedidos VALUES (1,1,'2025-01-10','entregue'),(2,2,'2025-01-15','entregue'),(3,1,'2025-02-02','cancelado'),(4,3,'2025-02-10','entregue'),(5,4,'2025-03-05','pendente'),(6,2,'2025-03-12','entregue'),(7,5,'2025-03-20','entregue'),(8,1,'2025-04-01','pendente');
INSERT INTO itens_pedido VALUES (1,1,1,1),(2,1,2,2),(3,2,4,2),(4,2,3,1),(5,3,5,1),(6,4,2,3),(7,4,7,1),(8,5,6,1),(9,6,1,1),(10,6,3,2),(11,7,5,2),(12,8,4,1);`;

/* Esquema de RH (estilo EMPLOYEES/DEPARTMENTS, clássico de provas de certificação) */
const SEED_RH = `
CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cidade TEXT NOT NULL);
CREATE TABLE funcionarios (
  id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL, salario REAL NOT NULL, comissao REAL,
  departamento_id INTEGER REFERENCES departamentos(id), gerente_id INTEGER REFERENCES funcionarios(id), admissao TEXT NOT NULL);
INSERT INTO departamentos VALUES (10,'Vendas','Recife'),(20,'TI','São Paulo'),(30,'RH','Recife'),(40,'Financeiro','Salvador'),(50,'Jurídico','Olinda');
INSERT INTO funcionarios VALUES
 (1,'Marta Reis','Diretora',15000,NULL,20,NULL,'2015-03-01'),
 (2,'João Pires','Gerente de TI',9000,NULL,20,1,'2016-07-15'),
 (3,'Lúcia Neves','Desenvolvedora',6500,NULL,20,2,'2019-02-10'),
 (4,'Pedro Matos','Desenvolvedor',6000,NULL,20,2,'2020-09-21'),
 (5,'Sara Lopes','Gerente de Vendas',8500,0.10,10,1,'2016-01-20'),
 (6,'Caio Ramos','Vendedor',3500,0.15,10,5,'2018-05-03'),
 (7,'Bia Torres','Vendedora',3600,0.12,10,5,'2021-11-30'),
 (8,'Rui Gomes','Vendedor',3200,NULL,10,5,'2022-04-18'),
 (9,'Nina Paiva','Analista de RH',4800,NULL,30,1,'2017-08-08'),
 (10,'Otávio Cruz','Analista de RH',4500,NULL,30,9,'2023-01-09'),
 (11,'Vera Dantas','Contadora',7200,NULL,40,1,'2014-06-12'),
 (12,'Hugo Assis','Auxiliar Financeiro',2800,NULL,40,11,'2023-06-26'),
 (13,'Iara Melo','Estagiária',1800,NULL,NULL,2,'2024-02-05'),
 (14,'Téo Barros','Desenvolvedor',6000,NULL,20,2,'2024-03-11');`;

const SEEDS = {loja: SEED_LOJA, rh: SEED_RH, vazio: ''};

/* Consulta de verificação estrutural (colunas, FKs, índices únicos) usada em exercícios de DDL */
const STRUCT = t => `SELECT 'col' AS k, name AS a, upper(type) AS b, "notnull" AS c, pk AS d, dflt_value AS e FROM pragma_table_info('${t}') UNION ALL SELECT 'fk', "from", "table", "to", 0, NULL FROM pragma_foreign_key_list('${t}') UNION ALL SELECT 'uq', name, origin, "unique", 0, NULL FROM pragma_index_list('${t}') WHERE "unique" = 1 ORDER BY 1, 2`;

const Q = (id, title, q, options, answer, explain) => ({id, title, kind:'quiz', q, options, answer, explain});
const P = o => ({kind:'query', dataset:'rh', ...o});
const S = o => ({kind:'script', dataset:'rh', ordered:true, ...o});

/* ═══════════ FUNDAMENTOS (tutorial guiado) ═══════════ */
const T_BASICO = {id:'basico', group:'Fundamentos', icon:'🌱', title:'Básico', items:[
 {id:'select-where', title:'SELECT e WHERE', kind:'query', dataset:'loja', tables:['clientes'],
  theory:`<p><code>SELECT</code> escolhe <em>quais colunas</em> ver; <code>FROM</code> diz <em>de qual tabela</em>; <code>WHERE</code> filtra <em>quais linhas</em> entram no resultado.</p>
<pre>SELECT nome, preco
FROM produtos
WHERE categoria = 'Móveis';</pre>
<ul><li>Textos vão entre aspas simples: <code>'Recife'</code>.</li><li>Operadores: <code>=</code> <code>&lt;&gt;</code> <code>&gt;</code> <code>&lt;</code> <code>AND</code> <code>OR</code> <code>IN (...)</code> <code>LIKE 'A%'</code>.</li><li><code>SELECT *</code> traz todas as colunas.</li></ul>`,
  challenge:'Liste o <b>nome</b> e a <b>cidade</b> dos clientes do estado de <b>PE</b>.',
  solution:"SELECT nome, cidade FROM clientes WHERE estado = 'PE'",
  starter:"SELECT \nFROM clientes\nWHERE ",
  hints:['Você precisa de duas colunas: nome e cidade.',"O filtro é sobre a coluna estado: WHERE estado = '...'."]},
 {id:'order-limit', title:'ORDER BY e LIMIT', kind:'query', dataset:'loja', tables:['produtos'], ordered:true,
  theory:`<p><code>ORDER BY</code> ordena o resultado (<code>ASC</code> crescente — padrão; <code>DESC</code> decrescente). <code>LIMIT n</code> mantém só as <code>n</code> primeiras linhas. Juntos criam rankings.</p>
<pre>SELECT nome, preco
FROM produtos
ORDER BY preco DESC
LIMIT 3;</pre><p>Ordem das cláusulas: <code>SELECT → FROM → WHERE → ORDER BY → LIMIT</code>.</p>`,
  challenge:'Mostre <b>nome</b> e <b>preco</b> dos <b>3 produtos mais caros</b>, do mais caro ao mais barato.',
  solution:'SELECT nome, preco FROM produtos ORDER BY preco DESC LIMIT 3',
  starter:'SELECT \nFROM produtos\n', hints:['Ordene pela coluna preco em ordem decrescente.']}
]};

const T_INTER = {id:'intermediario', group:'Fundamentos', icon:'🚀', title:'Intermediário', items:[
 {id:'inner-join', title:'INNER JOIN', kind:'query', dataset:'loja', tables:['clientes','pedidos'],
  theory:`<p><code>JOIN</code> combina linhas de duas tabelas por uma <strong>chave</strong> em comum (geralmente <code>chave_estrangeira = chave_primária</code>).</p>
<pre>SELECT p.id, c.nome
FROM pedidos AS p
INNER JOIN clientes AS c ON c.id = p.cliente_id;</pre>
<ul><li><code>INNER JOIN</code> mantém só linhas com correspondência nas duas tabelas.</li><li>Use <strong>alias</strong> (<code>AS p</code>) para abreviar e evitar ambiguidade.</li></ul>`,
  challenge:"Liste o <b>id do pedido</b> (<code>pedido_id</code>) e o <b>nome do cliente</b> (<code>cliente</code>) de todos os pedidos com status <b>'entregue'</b>.",
  solution:"SELECT p.id AS pedido_id, c.nome AS cliente FROM pedidos p JOIN clientes c ON c.id = p.cliente_id WHERE p.status = 'entregue'",
  starter:"SELECT p.id AS pedido_id, \nFROM pedidos AS p\nJOIN clientes AS c ON \nWHERE ",
  hints:['A ligação é pedidos.cliente_id = clientes.id.',"Depois do JOIN, filtre com WHERE p.status = 'entregue'."]},
 {id:'group-by', title:'GROUP BY e agregações', kind:'query', dataset:'loja', tables:['clientes','pedidos'],
  theory:`<p><strong>Agregações</strong> (<code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>) resumem várias linhas em um valor. <code>GROUP BY</code> resume <em>por grupo</em>; <code>HAVING</code> filtra grupos.</p>
<pre>SELECT categoria, COUNT(*) AS qtd
FROM produtos
GROUP BY categoria
HAVING COUNT(*) > 1;</pre><p>Toda coluna do <code>SELECT</code> que não é agregada deve estar no <code>GROUP BY</code>.</p>`,
  challenge:'Para cada <b>cliente</b> (<code>cliente</code>), mostre quantos pedidos fez (<code>total_pedidos</code>), apenas clientes com <b>2 ou mais</b> pedidos.',
  solution:'SELECT c.nome AS cliente, COUNT(*) AS total_pedidos FROM clientes c JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id, c.nome HAVING COUNT(*) >= 2',
  starter:'SELECT c.nome AS cliente, \nFROM clientes AS c\nJOIN pedidos AS p ON \nGROUP BY \nHAVING ',
  hints:['Junte clientes e pedidos e agrupe por cliente.','Filtre os grupos com HAVING COUNT(*) >= 2 (WHERE não enxerga agregados).']}
]};

const T_AVANC = {id:'avancado', group:'Fundamentos', icon:'🔥', title:'Avançado', items:[
 {id:'window-rank', title:'Window Functions: RANK', kind:'query', dataset:'loja', tables:['produtos'],
  theory:`<p><strong>Window functions</strong> calculam valores sobre um conjunto de linhas <em>sem colapsá-las</em> (diferente do <code>GROUP BY</code>). A cláusula <code>OVER</code> define a janela.</p>
<pre>SELECT nome, categoria, preco,
  RANK() OVER (PARTITION BY categoria ORDER BY preco DESC) AS posicao
FROM produtos;</pre>
<ul><li><code>PARTITION BY</code> reinicia o cálculo a cada grupo.</li><li>Para filtrar pelo ranking, use uma <strong>subquery</strong> ou CTE (<code>WITH</code>).</li></ul>`,
  challenge:'Mostre o <b>produto mais caro de cada categoria</b>: colunas <code>categoria</code>, <code>nome</code>, <code>preco</code>.',
  solution:'SELECT categoria, nome, preco FROM (SELECT categoria, nome, preco, RANK() OVER (PARTITION BY categoria ORDER BY preco DESC) AS r FROM produtos) WHERE r = 1',
  starter:'SELECT categoria, nome, preco\nFROM (\n  SELECT categoria, nome, preco,\n         RANK() OVER (...) AS r\n  FROM produtos\n)\nWHERE ',
  hints:['Calcule RANK() particionando por categoria, ordenando por preço decrescente.','Envolva em subquery e filtre WHERE r = 1.']}
]};

/* ═══════════ CERTIFICAÇÃO — Oracle Database SQL (1Z0-071) ═══════════
   Domínios inspirados na lista pública de objetivos do exame; confira os objetivos
   vigentes no site da Oracle. O sandbox é SQLite (núcleo ANSI): cada domínio traz
   a tradução dos recursos Oracle (NVL→COALESCE, MINUS→EXCEPT, FETCH FIRST→LIMIT...). */
const RH_TABLES = ['funcionarios','departamentos'];

const D1 = {id:'d1', group:'Certificação', icon:'1️⃣', title:'Recuperando dados (SELECT)', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> Projeção de colunas, <em>aliases</em> (<code>AS</code>), expressões aritméticas, concatenação com <code>||</code> e <code>DISTINCT</code>.</p>
<ul><li>Qualquer operação aritmética com <code>NULL</code> resulta em <code>NULL</code>.</li><li><code>DISTINCT</code> considera a <strong>combinação</strong> de todas as colunas selecionadas.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> Oracle exige <code>FROM DUAL</code> para <code>SELECT 1+1</code>; no SQLite basta <code>SELECT 1+1</code>.`,
 items:[
 Q('d1q1','Concatenação','Qual operador concatena strings no SQL padrão (e no Oracle)?',['+','||','&','.'],1,'<code>||</code> é o operador de concatenação do padrão ANSI e do Oracle. <code>+</code> é aritmético (no SQL Server concatena, mas não no Oracle).'),
 Q('d1q2','NULL em expressões','Qual o resultado de <code>SELECT 10 + NULL</code>?',['10','0','NULL','Erro de sintaxe'],2,'Qualquer expressão aritmética com NULL resulta em NULL. Use <code>COALESCE(x,0)</code> (Oracle: <code>NVL</code>) para tratar.'),
 Q('d1q3','DISTINCT','<code>SELECT DISTINCT cargo, departamento_id FROM funcionarios</code> elimina duplicatas de…',['Apenas cargo','Apenas departamento_id','A combinação (cargo, departamento_id)','Nada: DISTINCT só funciona com uma coluna'],2,'DISTINCT age sobre a linha inteira do resultado, isto é, sobre a combinação de todas as colunas listadas.'),
 P({id:'d1p1',title:'Alias e aritmética',tables:RH_TABLES,challenge:'Mostre <code>nome</code> e <code>salario_anual</code> (salário × 12) de todos os funcionários.',
  solution:'SELECT nome, salario * 12 AS salario_anual FROM funcionarios',starter:'SELECT nome, \nFROM funcionarios',hints:['Use salario * 12 e dê o alias com AS.']}),
 P({id:'d1p2',title:'DISTINCT',tables:RH_TABLES,ordered:true,challenge:'Liste os <code>cargo</code>s distintos, em ordem alfabética.',
  solution:'SELECT DISTINCT cargo FROM funcionarios ORDER BY cargo',starter:'SELECT \nFROM funcionarios\n',hints:['SELECT DISTINCT cargo … ORDER BY cargo.']}),
 P({id:'d1p3',title:'Concatenação',tables:RH_TABLES,challenge:"Para os funcionários do departamento <b>20</b>, mostre uma coluna <code>resumo</code> no formato <code>Nome - Cargo</code> (ex.: <i>Marta Reis - Diretora</i>).",
  solution:"SELECT nome || ' - ' || cargo AS resumo FROM funcionarios WHERE departamento_id = 20",starter:"SELECT  AS resumo\nFROM funcionarios\nWHERE ",hints:["Use nome || ' - ' || cargo."]})
]};

const D2 = {id:'d2', group:'Certificação', icon:'2️⃣', title:'Restringindo e ordenando', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> <code>WHERE</code> com <code>=, &lt;&gt;, BETWEEN, IN, LIKE, IS NULL</code>, operadores lógicos e precedência (<code>NOT</code> &gt; <code>AND</code> &gt; <code>OR</code>), <code>ORDER BY</code> (asc/desc, várias colunas).</p>
<ul><li><code>BETWEEN a AND b</code> inclui os limites.</li><li>Comparar com <code>NULL</code> usando <code>=</code> nunca é verdadeiro: use <code>IS NULL</code>.</li><li>Ordem lógica: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> <code>FETCH FIRST n ROWS ONLY</code> / <code>ROWNUM</code> → <code>LIMIT n</code>. <code>LIKE</code> no SQLite ignora maiúsculas/minúsculas (ASCII); no Oracle diferencia.`,
 items:[
 Q('d2q1','Comparando com NULL','<code>WHERE comissao = NULL</code> retorna…',['As linhas com comissão nula','Nenhuma linha','Todas as linhas','Erro de sintaxe'],1,'<code>= NULL</code> resulta em UNKNOWN, que o WHERE trata como falso. O correto é <code>IS NULL</code>.'),
 Q('d2q2','Precedência','Em <code>WHERE a = 1 OR b = 2 AND c = 3</code>, qual operador é avaliado primeiro?',['OR','AND','Da esquerda para a direita','Depende do otimizador'],1,'AND tem precedência sobre OR. A condição equivale a <code>a = 1 OR (b = 2 AND c = 3)</code>. Use parênteses para deixar explícito.'),
 Q('d2q3','BETWEEN','<code>salario BETWEEN 1000 AND 2000</code> é equivalente a…',['salario &gt; 1000 AND salario &lt; 2000','salario &gt;= 1000 AND salario &lt;= 2000','salario &gt;= 1000 OR salario &lt;= 2000','salario IN (1000, 2000)'],1,'BETWEEN é inclusivo nos dois extremos.'),
 Q('d2q4','Ordem de execução','Qual cláusula é processada logicamente por último?',['WHERE','GROUP BY','SELECT','ORDER BY'],3,'ORDER BY é a última etapa lógica (por isso pode usar aliases do SELECT no Oracle).'),
 P({id:'d2p1',title:'BETWEEN e ordenação',tables:RH_TABLES,ordered:true,challenge:'Liste <code>nome</code> e <code>salario</code> de quem ganha entre <b>4000 e 7000</b> (inclusive), do maior para o menor salário; desempate por <code>nome</code>.',
  solution:'SELECT nome, salario FROM funcionarios WHERE salario BETWEEN 4000 AND 7000 ORDER BY salario DESC, nome',starter:'SELECT nome, salario\nFROM funcionarios\nWHERE \nORDER BY ',hints:['BETWEEN 4000 AND 7000.','ORDER BY salario DESC, nome.']}),
 P({id:'d2p2',title:'IS NULL',tables:RH_TABLES,challenge:'Liste o <code>nome</code> dos funcionários que <b>não têm departamento</b>.',
  solution:'SELECT nome FROM funcionarios WHERE departamento_id IS NULL',starter:'SELECT nome\nFROM funcionarios\nWHERE ',hints:['Não use = NULL.']}),
 P({id:'d2p3',title:'LIKE, IN e parênteses',tables:RH_TABLES,challenge:"Liste <code>nome</code> e <code>cargo</code> de quem pertence aos departamentos <b>10 ou 20</b> <u>e</u> cujo nome <b>começa com 'M' ou termina com 'a'</b>.",
  solution:"SELECT nome, cargo FROM funcionarios WHERE departamento_id IN (10, 20) AND (nome LIKE 'M%' OR nome LIKE '%a')",starter:"SELECT nome, cargo\nFROM funcionarios\nWHERE departamento_id IN (...)\n  AND (",hints:['O OR do nome precisa estar entre parênteses por causa da precedência.']}),
 P({id:'d2p4',title:'Top-N (FETCH FIRST → LIMIT)',tables:RH_TABLES,ordered:true,challenge:'Mostre <code>nome</code> e <code>salario</code> dos <b>3 funcionários mais bem pagos</b>, do maior para o menor.',
  solution:'SELECT nome, salario FROM funcionarios ORDER BY salario DESC LIMIT 3',starter:'SELECT nome, salario\nFROM funcionarios\n',hints:['ORDER BY salario DESC LIMIT 3.']})
]};

const D3 = {id:'d3', group:'Certificação', icon:'3️⃣', title:'Funções de linha única', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> Funções que retornam um resultado <em>por linha</em>.</p>
<ul><li><b>Texto:</b> <code>UPPER, LOWER, LENGTH, SUBSTR(s, início, tam), INSTR(s, sub), REPLACE, TRIM</code>.</li>
<li><b>Número:</b> <code>ROUND(x, casas), ABS, x % y</code>.</li>
<li><b>NULL:</b> <code>COALESCE(a,b,…)</code> (primeiro não nulo), <code>NULLIF(a,b)</code> (NULL se iguais).</li>
<li><b>Condicional:</b> <code>CASE WHEN … THEN … ELSE … END</code>.</li>
<li><b>Datas:</b> <code>date('now')</code>, <code>strftime('%Y', data)</code>, <code>julianday(data)</code>.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> <code>NVL</code>/<code>NVL2</code> → <code>COALESCE</code>/<code>CASE</code>; <code>DECODE</code> → <code>CASE</code>; <code>TO_CHAR(data,'YYYY')</code> → <code>strftime('%Y', data)</code>; <code>SYSDATE</code> → <code>date('now')</code>; <code>MOD(a,b)</code> → <code>a % b</code>.`,
 items:[
 Q('d3q1','SUBSTR','<code>SUBSTR(\'SQLEXAM\', 4, 3)</code> retorna…',["'LEX'","'EXA'","'EXAM'","'QLE'"],1,'A posição 4 é a letra E; 3 caracteres a partir dela: <b>EXA</b>.'),
 Q('d3q2','COALESCE','<code>COALESCE(NULL, NULL, 7, 9)</code> retorna…',['NULL','7','9','16'],1,'COALESCE devolve o primeiro argumento não nulo.'),
 Q('d3q3','NULLIF','<code>NULLIF(5, 5)</code> retorna…',['5','0','NULL','1'],2,'NULLIF devolve NULL quando os dois valores são iguais — útil para evitar divisão por zero: <code>x / NULLIF(y,0)</code>.'),
 Q('d3q4','INSTR',"<code>INSTR('banana', 'an')</code> retorna…",['1','2','3','4'],1,"Retorna a posição da <b>primeira</b> ocorrência de 'an': posição 2."),
 Q('d3q5','ROUND','<code>ROUND(45.926, 2)</code> retorna…',['45.92','45.93','46','45.9'],1,'Arredonda para 2 casas decimais: 45.93.'),
 P({id:'d3p1',title:'Funções de texto',tables:RH_TABLES,challenge:'Para o departamento <b>30</b>, mostre <code>nome_maiusc</code> (nome em maiúsculas) e <code>tamanho</code> (quantidade de caracteres do nome).',
  solution:'SELECT UPPER(nome) AS nome_maiusc, LENGTH(nome) AS tamanho FROM funcionarios WHERE departamento_id = 30',starter:'SELECT  AS nome_maiusc,  AS tamanho\nFROM funcionarios\nWHERE ',hints:['UPPER(nome) e LENGTH(nome).']}),
 P({id:'d3p2',title:'COALESCE (NVL)',tables:RH_TABLES,challenge:'Para o departamento <b>10</b>, mostre <code>nome</code> e <code>comissao_efetiva</code> (a comissão, ou 0 quando nula).',
  solution:'SELECT nome, COALESCE(comissao, 0) AS comissao_efetiva FROM funcionarios WHERE departamento_id = 10',starter:'SELECT nome, \nFROM funcionarios\nWHERE ',hints:['COALESCE(comissao, 0).']}),
 P({id:'d3p3',title:'CASE',tables:RH_TABLES,challenge:"Mostre <code>nome</code> e <code>faixa</code>: <b>'Alta'</b> se salário ≥ 7000, <b>'Média'</b> se ≥ 4000, senão <b>'Baixa'</b>.",
  solution:"SELECT nome, CASE WHEN salario >= 7000 THEN 'Alta' WHEN salario >= 4000 THEN 'Média' ELSE 'Baixa' END AS faixa FROM funcionarios",starter:"SELECT nome,\n  CASE WHEN  THEN \n       WHEN  THEN \n       ELSE  END AS faixa\nFROM funcionarios",hints:['Os WHEN são avaliados em ordem; o primeiro verdadeiro vence.']}),
 P({id:'d3p4',title:'Datas (TO_CHAR → strftime)',tables:RH_TABLES,challenge:"Mostre <code>nome</code> e <code>ano_admissao</code> (número inteiro, via <code>strftime('%Y', admissao)</code>) de quem foi admitido a partir de <b>2022-01-01</b>.",
  solution:"SELECT nome, CAST(strftime('%Y', admissao) AS INTEGER) AS ano_admissao FROM funcionarios WHERE admissao >= '2022-01-01'",starter:"SELECT nome, CAST( AS INTEGER) AS ano_admissao\nFROM funcionarios\nWHERE ",hints:["strftime devolve texto; use CAST(... AS INTEGER).","Datas ISO (AAAA-MM-DD) comparam corretamente como texto."]})
]};

const D4 = {id:'d4', group:'Certificação', icon:'4️⃣', title:'Funções de grupo', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> <code>COUNT, SUM, AVG, MIN, MAX</code>, <code>GROUP BY</code> e <code>HAVING</code>.</p>
<ul><li>Funções de grupo <strong>ignoram NULL</strong>, exceto <code>COUNT(*)</code>.</li><li>Colunas não agregadas do SELECT devem estar no GROUP BY (regra do padrão e do Oracle).</li><li><code>WHERE</code> filtra linhas <em>antes</em> de agrupar; <code>HAVING</code> filtra grupos <em>depois</em>.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> o SQLite aceita colunas fora do GROUP BY sem erro (resultado arbitrário) — numa prova isso é <b>erro</b> (ORA-00979). Não pratique esse atalho.`,
 items:[
 Q('d4q1','COUNT(coluna)','<code>COUNT(comissao)</code> conta…',['Todas as linhas','Apenas linhas com comissao não nula','Apenas linhas com comissao nula','Valores distintos de comissao'],1,'COUNT(coluna) ignora NULLs; COUNT(*) conta todas as linhas.'),
 Q('d4q2','HAVING','Qual cláusula filtra <em>grupos</em> com base em uma função de agregação?',['WHERE','HAVING','ORDER BY','LIMIT'],1,'WHERE não pode usar agregações; HAVING filtra após o GROUP BY.'),
 Q('d4q3','GROUP BY (regra)','<code>SELECT departamento_id, nome, COUNT(*) FROM funcionarios GROUP BY departamento_id</code> gera erro no padrão/Oracle porque…',['COUNT(*) não pode ser usado com GROUP BY','nome não está no GROUP BY nem é agregada','departamento_id é chave estrangeira','Falta o HAVING'],1,'Toda expressão do SELECT que não é função de grupo deve aparecer no GROUP BY (ORA-00979).'),
 Q('d4q4','AVG e NULL','Se 3 de 14 funcionários têm comissão, <code>AVG(comissao)</code> divide a soma por…',['14','3','13','11'],1,'AVG ignora NULLs: divide pela quantidade de valores não nulos (3). Para tratar nulos como 0 use <code>AVG(COALESCE(comissao,0))</code>.'),
 P({id:'d4p1',title:'Agregações gerais',tables:RH_TABLES,challenge:'Em uma única linha, mostre <code>qtd</code> (total de funcionários), <code>media_salarial</code> (média arredondada a 2 casas) e <code>maior_salario</code>.',
  solution:'SELECT COUNT(*) AS qtd, ROUND(AVG(salario), 2) AS media_salarial, MAX(salario) AS maior_salario FROM funcionarios',starter:'SELECT \nFROM funcionarios',hints:['ROUND(AVG(salario), 2).']}),
 P({id:'d4p2',title:'GROUP BY + HAVING',tables:RH_TABLES,challenge:'Mostre <code>departamento_id</code> e <code>qtd</code> de funcionários, somente departamentos com <b>mais de 2</b> funcionários.',
  solution:'SELECT departamento_id, COUNT(*) AS qtd FROM funcionarios GROUP BY departamento_id HAVING COUNT(*) > 2',starter:'SELECT departamento_id, \nFROM funcionarios\nGROUP BY \nHAVING ',hints:['HAVING COUNT(*) > 2.']}),
 P({id:'d4p3',title:'COUNT(*) × COUNT(coluna)',tables:RH_TABLES,challenge:'Mostre <code>total_func</code> (COUNT(*)) e <code>com_comissao</code> (quantos têm comissão).',
  solution:'SELECT COUNT(*) AS total_func, COUNT(comissao) AS com_comissao FROM funcionarios',starter:'SELECT  AS total_func,  AS com_comissao\nFROM funcionarios',hints:['COUNT(comissao) ignora nulos.']}),
 P({id:'d4p4',title:'SUM por grupo (inclui NULL)',tables:RH_TABLES,ordered:true,challenge:'Para cada <code>departamento_id</code> (inclusive o nulo), mostre <code>soma_salarios</code>, da maior soma para a menor.',
  solution:'SELECT departamento_id, SUM(salario) AS soma_salarios FROM funcionarios GROUP BY departamento_id ORDER BY soma_salarios DESC',starter:'SELECT departamento_id, \nFROM funcionarios\nGROUP BY \nORDER BY ',hints:['O GROUP BY trata NULL como um grupo próprio.']})
]};

const D5 = {id:'d5', group:'Certificação', icon:'5️⃣', title:'Junções (JOIN)', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> <code>INNER JOIN</code>, <code>LEFT JOIN</code> (e RIGHT/FULL), <em>self join</em>, <code>CROSS JOIN</code>, <code>NATURAL JOIN</code>/<code>USING</code>.</p>
<ul><li>Em <code>LEFT JOIN</code>, filtros sobre a tabela da direita devem ficar no <code>ON</code>; no <code>WHERE</code> eles descartam as linhas sem correspondência.</li><li>Anti-join: <code>LEFT JOIN … WHERE direita.chave IS NULL</code>.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> a sintaxe antiga <code>FROM a, b WHERE a.x = b.x</code> e o operador <code>(+)</code> do Oracle não existem no SQLite — use <code>JOIN … ON</code>.`,
 items:[
 Q('d5q1','LEFT JOIN','Qual junção retorna <b>todas</b> as linhas da tabela da esquerda, com ou sem correspondência?',['INNER JOIN','LEFT JOIN','CROSS JOIN','NATURAL JOIN'],1,'LEFT (OUTER) JOIN preserva a esquerda e preenche NULL à direita.'),
 Q('d5q2','CROSS JOIN','Um CROSS JOIN entre tabelas com 5 e 7 linhas retorna quantas linhas?',['12','35','7','5'],1,'Produto cartesiano: 5 × 7 = 35.'),
 Q('d5q3','Filtro no WHERE','Em <code>A LEFT JOIN B ON … WHERE B.coluna = 1</code>, o que acontece com as linhas de A sem correspondência em B?',['São mantidas com NULL','São descartadas (comporta-se como INNER JOIN)','Geram erro','São duplicadas'],1,'Para elas B.coluna é NULL, e NULL = 1 não é verdadeiro — o WHERE as remove. Coloque o filtro no ON para preservá-las.'),
 Q('d5q4','NATURAL JOIN','NATURAL JOIN junta as tabelas usando…',['A chave primária','Todas as colunas de mesmo nome nas duas tabelas','Apenas a primeira coluna','As chaves estrangeiras declaradas'],1,'É implícito e frágil (renomear/adicionar coluna muda o resultado). Prefira ON ou USING.'),
 P({id:'d5p1',title:'INNER JOIN',tables:RH_TABLES,challenge:'Mostre <code>nome</code> do funcionário e <code>departamento</code> (nome do departamento) de quem tem departamento.',
  solution:'SELECT f.nome, d.nome AS departamento FROM funcionarios f JOIN departamentos d ON d.id = f.departamento_id',starter:'SELECT f.nome, \nFROM funcionarios f\nJOIN departamentos d ON ',hints:['funcionarios.departamento_id = departamentos.id.']}),
 P({id:'d5p2',title:'LEFT JOIN + COUNT',tables:RH_TABLES,challenge:'Mostre <code>departamento</code> e <code>qtd</code> de funcionários, <b>incluindo</b> departamentos sem funcionários (qtd = 0).',
  solution:'SELECT d.nome AS departamento, COUNT(f.id) AS qtd FROM departamentos d LEFT JOIN funcionarios f ON f.departamento_id = d.id GROUP BY d.id, d.nome',starter:'SELECT d.nome AS departamento, \nFROM departamentos d\nLEFT JOIN funcionarios f ON \nGROUP BY ',hints:['Use COUNT(f.id), não COUNT(*): contar a coluna da direita dá 0 para quem não casa.']}),
 P({id:'d5p3',title:'Self join',tables:RH_TABLES,challenge:'Mostre <code>funcionario</code> e <code>gerente</code> (nomes) para quem possui gerente.',
  solution:'SELECT f.nome AS funcionario, g.nome AS gerente FROM funcionarios f JOIN funcionarios g ON g.id = f.gerente_id',starter:'SELECT f.nome AS funcionario, \nFROM funcionarios f\nJOIN funcionarios g ON ',hints:['A mesma tabela duas vezes, com aliases diferentes.']}),
 P({id:'d5p4',title:'Anti-join',tables:RH_TABLES,challenge:'Liste o <code>nome</code> dos departamentos <b>sem nenhum funcionário</b>, usando LEFT JOIN + IS NULL.',
  solution:'SELECT d.nome FROM departamentos d LEFT JOIN funcionarios f ON f.departamento_id = d.id WHERE f.id IS NULL',starter:'SELECT d.nome\nFROM departamentos d\nLEFT JOIN funcionarios f ON \nWHERE ',hints:['Quem não casa tem f.id NULL.']})
]};

const D6 = {id:'d6', group:'Certificação', icon:'6️⃣', title:'Subconsultas', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> Subconsultas escalares, de várias linhas (<code>IN, ANY, ALL</code>), correlacionadas e <code>EXISTS</code>.</p>
<ul><li>Subconsulta escalar: no máximo 1 linha e 1 coluna.</li><li><code>NOT IN</code> com NULL na lista nunca é verdadeiro — prefira <code>NOT EXISTS</code>.</li><li>Correlacionada: referencia a consulta externa e é avaliada logicamente por linha.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> <code>ANY/ALL</code> e subconsultas multicoluna têm suporte limitado no SQLite; os exercícios usam <code>IN</code>, <code>EXISTS</code> e escalares.`,
 items:[
 Q('d6q1','NOT IN e NULL','Se a subconsulta de <code>x NOT IN (subconsulta)</code> retorna algum NULL, o resultado é…',['Todas as linhas','Nenhuma linha','Apenas as linhas com x nulo','Erro de execução'],1,'NOT IN equivale a uma cadeia de &lt;&gt; ligada por AND; com NULL ela vira UNKNOWN. Use NOT EXISTS.'),
 Q('d6q2','Subconsulta escalar','Uma subconsulta usada com o operador <code>=</code> deve retornar…',['Qualquer quantidade de linhas','No máximo uma linha e uma coluna','Pelo menos duas linhas','Uma tabela inteira'],1,'Mais de uma linha provoca erro no Oracle (ORA-01427).'),
 Q('d6q3','EXISTS','<code>EXISTS (subconsulta)</code> é verdadeiro quando…',['A subconsulta retorna ao menos uma linha','A subconsulta retorna o valor 1','A subconsulta retorna NULL','A subconsulta não tem WHERE'],0,'EXISTS só testa a existência de linhas; o conteúdo do SELECT é irrelevante.'),
 Q('d6q4','Correlacionada','Uma subconsulta correlacionada é executada…',['Uma única vez antes da consulta externa','Logicamente uma vez para cada linha da consulta externa','Somente se a externa tiver GROUP BY','Nunca em UPDATE'],1,'Ela depende de colunas da consulta externa, então é reavaliada para cada linha candidata (o otimizador pode reescrevê-la).'),
 P({id:'d6p1',title:'Subconsulta escalar',tables:RH_TABLES,challenge:'Liste <code>nome</code> e <code>salario</code> de quem ganha <b>mais que a média geral</b>.',
  solution:'SELECT nome, salario FROM funcionarios WHERE salario > (SELECT AVG(salario) FROM funcionarios)',starter:'SELECT nome, salario\nFROM funcionarios\nWHERE salario > (',hints:['(SELECT AVG(salario) FROM funcionarios).']}),
 P({id:'d6p2',title:'IN',tables:RH_TABLES,challenge:'Liste o <code>nome</code> dos departamentos que têm <b>ao menos um funcionário com salário &gt; 8000</b> (use IN).',
  solution:'SELECT nome FROM departamentos WHERE id IN (SELECT departamento_id FROM funcionarios WHERE salario > 8000)',starter:'SELECT nome\nFROM departamentos\nWHERE id IN (',hints:['A subconsulta devolve departamento_id.']}),
 P({id:'d6p3',title:'Correlacionada',tables:RH_TABLES,challenge:'Liste <code>nome</code>, <code>salario</code> e <code>departamento_id</code> de quem ganha o <b>maior salário do seu departamento</b>.',
  solution:'SELECT nome, salario, departamento_id FROM funcionarios f WHERE salario = (SELECT MAX(salario) FROM funcionarios WHERE departamento_id = f.departamento_id)',starter:'SELECT nome, salario, departamento_id\nFROM funcionarios f\nWHERE salario = (\n  SELECT MAX(salario) FROM funcionarios WHERE departamento_id = \n)',hints:['Compare o departamento interno com f.departamento_id (externo).','Quem não tem departamento fica de fora: NULL = NULL não é verdadeiro.']}),
 P({id:'d6p4',title:'EXISTS',tables:RH_TABLES,challenge:'Liste o <code>nome</code> dos funcionários que <b>são gerentes</b> de alguém (use EXISTS).',
  solution:'SELECT nome FROM funcionarios g WHERE EXISTS (SELECT 1 FROM funcionarios f WHERE f.gerente_id = g.id)',starter:'SELECT nome\nFROM funcionarios g\nWHERE EXISTS (',hints:['Existe alguém cujo gerente_id = g.id.']})
]};

const D7 = {id:'d7', group:'Certificação', icon:'7️⃣', title:'Operadores de conjunto', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> <code>UNION</code> (sem duplicatas), <code>UNION ALL</code> (com duplicatas), <code>INTERSECT</code> (comuns) e <code>EXCEPT</code> (diferença).</p>
<ul><li>As consultas precisam ter o mesmo número de colunas, com tipos compatíveis.</li><li>Os nomes das colunas vêm da <strong>primeira</strong> consulta.</li><li><code>ORDER BY</code> só aparece no final da consulta composta.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> <code>MINUS</code> do Oracle = <code>EXCEPT</code> (padrão ANSI).`,
 items:[
 Q('d7q1','UNION × UNION ALL','Qual é a diferença entre UNION e UNION ALL?',['UNION ALL é mais lento por ordenar','UNION remove duplicatas; UNION ALL as mantém','UNION exige ORDER BY','Não há diferença'],1,'UNION elimina linhas duplicadas (custo extra); UNION ALL apenas concatena.'),
 Q('d7q2','MINUS','O operador MINUS do Oracle corresponde, no padrão ANSI/SQLite, a…',['EXCEPT','INTERSECT','UNION','NOT IN'],0,'EXCEPT devolve linhas da primeira consulta que não aparecem na segunda.'),
 Q('d7q3','Requisitos','Para combinar duas consultas com operadores de conjunto é preciso que…',['Tenham o mesmo nome de tabela','Tenham o mesmo número de colunas e tipos compatíveis','Tenham o mesmo WHERE','Ambas usem DISTINCT'],1,'Número de colunas igual e tipos compatíveis posição a posição.'),
 Q('d7q4','ORDER BY','Em uma consulta com UNION, o ORDER BY pode aparecer…',['Em cada SELECT individual','Apenas ao final da consulta composta','Somente antes do UNION','Em nenhum lugar'],1,'Um único ORDER BY ao final, referenciando colunas/aliases da primeira consulta.'),
 P({id:'d7p1',title:'UNION',tables:RH_TABLES,ordered:true,challenge:'Em uma coluna <code>ref</code>, junte os <b>cargos</b> dos funcionários e os <b>nomes dos departamentos</b>, sem repetição, em ordem alfabética.',
  solution:'SELECT cargo AS ref FROM funcionarios UNION SELECT nome FROM departamentos ORDER BY ref',starter:'SELECT cargo AS ref FROM funcionarios\nUNION\n',hints:['O ORDER BY vem só no final.']}),
 P({id:'d7p2',title:'INTERSECT',tables:RH_TABLES,challenge:'Liste os <code>departamento_id</code> que têm funcionário <b>com comissão</b> <u>e</u> funcionário com <b>salário ≥ 8500</b> (INTERSECT).',
  solution:'SELECT departamento_id FROM funcionarios WHERE comissao IS NOT NULL INTERSECT SELECT departamento_id FROM funcionarios WHERE salario >= 8500',starter:'SELECT departamento_id FROM funcionarios WHERE \nINTERSECT\n',hints:['Duas consultas sobre a mesma tabela, uma por condição.']}),
 P({id:'d7p3',title:'EXCEPT (MINUS)',tables:RH_TABLES,challenge:'Liste o <code>id</code> dos departamentos que <b>não possuem funcionários</b>, usando EXCEPT.',
  solution:'SELECT id FROM departamentos EXCEPT SELECT departamento_id FROM funcionarios',starter:'SELECT id FROM departamentos\nEXCEPT\n',hints:['Todos os departamentos menos os que aparecem em funcionarios.']})
]};

const D8 = {id:'d8', group:'Certificação', icon:'8️⃣', title:'DML (INSERT/UPDATE/DELETE)', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> Manipulação de dados: <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>, controle de transação (<code>COMMIT</code>, <code>ROLLBACK</code>).</p>
<ul><li><code>UPDATE</code>/<code>DELETE</code> sem <code>WHERE</code> afetam <b>todas</b> as linhas.</li><li>Constraints (NOT NULL, FK, CHECK) são verificadas em cada comando.</li><li>Nestes exercícios você escreve o <b>script</b> (um ou mais comandos terminados por <code>;</code>); o banco é refeito a cada execução.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> aqui as chaves estrangeiras estão <b>ativadas</b>, como no Oracle. O resultado é validado por uma consulta de verificação sobre o estado final do banco.`,
 items:[
 Q('d8q1','DELETE sem WHERE','<code>DELETE FROM funcionarios;</code> (sem WHERE) faz o quê?',['Remove a tabela','Remove todas as linhas, mantendo a estrutura','Não faz nada','Remove apenas a primeira linha'],1,'Remove todas as linhas; a tabela continua existindo (DROP TABLE é que remove a estrutura).'),
 Q('d8q2','DELETE × TRUNCATE','No Oracle, qual a diferença essencial entre DELETE e TRUNCATE?',['TRUNCATE aceita WHERE','DELETE é DML e pode sofrer ROLLBACK; TRUNCATE é DDL e faz commit implícito','São idênticos','DELETE remove também a estrutura'],1,'TRUNCATE é DDL: não é desfeito com ROLLBACK e não aceita WHERE. (O SQLite não tem TRUNCATE.)'),
 Q('d8q3','COMMIT','O que o COMMIT faz?',['Desfaz a transação','Torna permanentes as alterações da transação','Apaga a tabela','Cria um savepoint'],1,'COMMIT confirma; ROLLBACK desfaz tudo desde o último COMMIT (ou até um SAVEPOINT).'),
 Q('d8q4','NOT NULL no INSERT','Um INSERT omite uma coluna NOT NULL que não tem DEFAULT. Resultado?',['A coluna recebe 0','A coluna recebe string vazia','Erro de violação de constraint','A linha é inserida com NULL'],2,'A constraint NOT NULL impede a inserção (no Oracle: ORA-01400).'),
 Q('d8q5','UPDATE sem WHERE','<code>UPDATE funcionarios SET salario = 0;</code> altera…',['Nenhuma linha','Somente a primeira linha','Todas as linhas','Apenas linhas com salário nulo'],2,'Sem WHERE, todas as linhas são atualizadas. Sempre revise o WHERE antes de executar.'),
 S({id:'d8s1',title:'INSERT',tables:RH_TABLES,challenge:"Insira o funcionário: <code>id 15, 'Lia Campos', 'Analista de RH', salário 4600, comissão NULL, departamento 30, gerente 9, admissão '2024-05-02'</code>.",
  check:'SELECT * FROM funcionarios WHERE id = 15',solution:"INSERT INTO funcionarios VALUES (15, 'Lia Campos', 'Analista de RH', 4600, NULL, 30, 9, '2024-05-02');",
  starter:'INSERT INTO funcionarios (id, nome, cargo, salario, comissao, departamento_id, gerente_id, admissao)\nVALUES (...);',hints:['Ordem das colunas da tabela: id, nome, cargo, salario, comissao, departamento_id, gerente_id, admissao.']}),
 S({id:'d8s2',title:'UPDATE com filtro',tables:RH_TABLES,challenge:"Dê <b>10% de aumento</b> a quem tem cargo começando com <code>'Desenvolvedor'</code> no departamento <b>20</b>. Ninguém mais pode ser alterado.",
  check:'SELECT id, salario FROM funcionarios ORDER BY id',solution:"UPDATE funcionarios SET salario = salario * 1.10 WHERE departamento_id = 20 AND cargo LIKE 'Desenvolvedor%';",
  starter:'UPDATE funcionarios\nSET \nWHERE ;',hints:['salario = salario * 1.10.',"cargo LIKE 'Desenvolvedor%' pega Desenvolvedor e Desenvolvedora."]}),
 S({id:'d8s3',title:'DELETE',tables:RH_TABLES,challenge:"Remova do cadastro os funcionários com cargo <code>'Estagiária'</code>.",
  check:'SELECT id, nome FROM funcionarios ORDER BY id',solution:"DELETE FROM funcionarios WHERE cargo = 'Estagiária';",starter:'DELETE FROM funcionarios\nWHERE ;',hints:["WHERE cargo = 'Estagiária'."]}),
 S({id:'d8s4',title:'UPDATE e NULL',tables:RH_TABLES,challenge:'No departamento <b>10</b>, defina <code>comissao = 0.05</code> apenas para quem <b>ainda não tem comissão</b>.',
  check:'SELECT id, comissao FROM funcionarios WHERE departamento_id = 10 ORDER BY id',solution:'UPDATE funcionarios SET comissao = 0.05 WHERE departamento_id = 10 AND comissao IS NULL;',starter:'UPDATE funcionarios\nSET \nWHERE ;',hints:['Use IS NULL, não = NULL.']}),
 S({id:'d8s5',title:'Violando uma FK',tables:RH_TABLES,challenge:'Remova o departamento <b>50</b> (Jurídico, sem funcionários) e o funcionário <b>12</b> (Hugo, que não é gerente de ninguém) com dois <code>DELETE</code>s. <i>Curiosidade:</i> tentar remover a Marta (id 1) falharia, pois ela é gerente de outras pessoas e a FK protege os dados.',
  check:'SELECT (SELECT COUNT(*) FROM departamentos) AS deps, (SELECT COUNT(*) FROM funcionarios) AS funcs',solution:'DELETE FROM departamentos WHERE id = 50; DELETE FROM funcionarios WHERE id = 12;',starter:'DELETE FROM departamentos WHERE ;\nDELETE FROM funcionarios WHERE ;',hints:['Nenhum dos dois é referenciado por outra linha, então as FKs permitem.']})
]};

const D9 = {id:'d9', group:'Certificação', icon:'9️⃣', title:'DDL e constraints', tables:RH_TABLES,
 intro:`<p><strong>Revisão do domínio.</strong> <code>CREATE TABLE</code> com constraints (<code>PRIMARY KEY, NOT NULL, UNIQUE, FOREIGN KEY, CHECK, DEFAULT</code>), <code>ALTER TABLE</code>, <code>DROP</code>, <code>CREATE VIEW</code>, <code>CREATE INDEX</code>.</p>
<ul><li>PK = UNIQUE + NOT NULL. FK exige que o valor exista na tabela pai (ou seja NULL).</li><li>A view guarda a <em>consulta</em>, não os dados.</li></ul>`,
 note:`<b>Oracle × SQLite:</b> <code>VARCHAR2(n)</code>/<code>NUMBER</code> → <code>TEXT</code>/<code>INTEGER</code>/<code>REAL</code>. O SQLite só suporta <code>ALTER TABLE … ADD COLUMN</code>/<code>RENAME</code>/<code>DROP COLUMN</code>. Nos exercícios de constraint o sistema também <b>tenta violar</b> suas regras para conferir que funcionam.`,
 items:[
 Q('d9q1','Categoria de comando','Qual dos comandos é DDL?',['INSERT','UPDATE','CREATE TABLE','SELECT'],2,'DDL define estrutura (CREATE, ALTER, DROP). INSERT/UPDATE/DELETE são DML; SELECT é consulta.'),
 Q('d9q2','PRIMARY KEY','Uma PRIMARY KEY implica…',['Apenas NOT NULL','Apenas UNIQUE','UNIQUE e NOT NULL','Nenhuma restrição adicional'],2,'Identifica unicamente a linha: valores únicos e obrigatórios.'),
 Q('d9q3','FOREIGN KEY','Uma FOREIGN KEY garante que…',['O valor é único','O valor existe na coluna referenciada da tabela pai (ou é NULL)','O valor é positivo','A tabela filha tem índice'],1,'Integridade referencial: não há "órfãos". Pode ser NULL, a menos que a coluna seja NOT NULL.'),
 Q('d9q4','DROP × DELETE','Qual a diferença entre <code>DROP TABLE t</code> e <code>DELETE FROM t</code>?',['Nenhuma','DROP remove estrutura e dados; DELETE remove só as linhas','DELETE remove a estrutura','DROP só funciona com WHERE'],1,'DROP TABLE elimina a própria tabela; DELETE esvazia (ou filtra) as linhas.'),
 Q('d9q5','VIEW','Uma view (não materializada) armazena…',['Uma cópia dos dados','A definição da consulta','Apenas índices','Somente o resultado da última execução'],1,'Cada uso da view reexecuta a consulta sobre as tabelas-base.'),
 Q('d9q6','CHECK','A constraint CHECK serve para…',['Criar índices','Validar uma condição lógica para cada linha','Garantir unicidade','Definir valor padrão'],1,'Ex.: <code>CHECK (nota BETWEEN 1 AND 5)</code> rejeita valores fora do intervalo.'),
 S({id:'d9s1',title:'CREATE TABLE com FK',tables:RH_TABLES,challenge:'Crie a tabela <code>projetos</code>: <code>id INTEGER PRIMARY KEY</code>, <code>nome TEXT NOT NULL</code>, <code>orcamento REAL</code>, <code>departamento_id INTEGER</code> com <b>FK para departamentos(id)</b>.',
  check:STRUCT('projetos'),solution:'CREATE TABLE projetos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, orcamento REAL, departamento_id INTEGER REFERENCES departamentos(id));',
  mustFail:["INSERT INTO projetos (id, nome) VALUES (1, NULL);","INSERT INTO projetos (id, nome, departamento_id) VALUES (2, 'x', 999);"],
  starter:'CREATE TABLE projetos (\n  id INTEGER PRIMARY KEY,\n  \n);',hints:['REFERENCES departamentos(id) — informe a coluna referenciada.']}),
 S({id:'d9s2',title:'ALTER TABLE',tables:RH_TABLES,challenge:'Adicione à tabela <code>funcionarios</code> a coluna <code>email</code> do tipo <code>TEXT</code>.',
  check:"SELECT name, upper(type) AS tipo FROM pragma_table_info('funcionarios') WHERE name = 'email'",solution:'ALTER TABLE funcionarios ADD COLUMN email TEXT;',starter:'ALTER TABLE funcionarios\n',hints:['ALTER TABLE … ADD COLUMN …']}),
 S({id:'d9s3',title:'CREATE VIEW',tables:RH_TABLES,challenge:'Crie a view <code>v_resumo_depto</code> com <code>departamento</code> (nome) e <code>qtd</code> (nº de funcionários), incluindo departamentos sem funcionários.',
  check:'SELECT * FROM v_resumo_depto ORDER BY departamento',solution:'CREATE VIEW v_resumo_depto AS SELECT d.nome AS departamento, COUNT(f.id) AS qtd FROM departamentos d LEFT JOIN funcionarios f ON f.departamento_id = d.id GROUP BY d.id, d.nome;',starter:'CREATE VIEW v_resumo_depto AS\nSELECT ',hints:['É o LEFT JOIN + COUNT(f.id) do domínio de junções.']}),
 S({id:'d9s4',title:'CREATE INDEX',tables:RH_TABLES,challenge:'Crie o índice <code>idx_func_depto</code> sobre <code>funcionarios(departamento_id)</code>.',
  check:"SELECT m.name AS indice, m.tbl_name AS tabela, ii.name AS coluna FROM sqlite_master m JOIN pragma_index_info(m.name) ii WHERE m.type = 'index' AND m.name NOT LIKE 'sqlite_%' ORDER BY 1",solution:'CREATE INDEX idx_func_depto ON funcionarios (departamento_id);',starter:'CREATE INDEX idx_func_depto ON ',hints:['CREATE INDEX nome ON tabela (coluna);']}),
 S({id:'d9s5',title:'CHECK e DEFAULT',tables:RH_TABLES,challenge:'Crie <code>avaliacoes</code>: <code>id INTEGER PRIMARY KEY</code>, <code>funcionario_id INTEGER NOT NULL</code> (FK para funcionarios(id)), <code>nota INTEGER NOT NULL DEFAULT 3</code> com <b>CHECK</b> de 1 a 5.',
  check:STRUCT('avaliacoes'),solution:'CREATE TABLE avaliacoes (id INTEGER PRIMARY KEY, funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id), nota INTEGER NOT NULL DEFAULT 3 CHECK (nota BETWEEN 1 AND 5));',
  mustFail:["INSERT INTO avaliacoes (id, funcionario_id, nota) VALUES (1, 1, 9);","INSERT INTO avaliacoes (id, funcionario_id, nota) VALUES (2, 999, 4);"],
  starter:'CREATE TABLE avaliacoes (\n  id INTEGER PRIMARY KEY,\n  \n);',hints:['nota INTEGER NOT NULL DEFAULT 3 CHECK (nota BETWEEN 1 AND 5).']})
]};

/* ═══════════ PROJETO: BiblioTech — sistema de biblioteca (simulado) ═══════════
   O banco é construído etapa a etapa: o seu SQL aprovado em cada etapa é guardado e
   reaplicado nas seguintes. Ao final, exporte o pacote (.db + .sql + executar.py). */
const PB = (o) => ({project:true, ...o});
const PROJ = {id:'proj', group:'Projeto', icon:'📚', title:'BiblioTech (projeto real simulado)', tables:['autores','livros','membros','emprestimos'],
 intro:`<p><strong>Cenário.</strong> A biblioteca comunitária <em>BiblioTech</em> controla tudo em planilhas e pediu um banco de dados relacional. Você é o(a) engenheiro(a) de dados responsável. O projeto segue o ciclo real:</p>
<ol><li><b>Modelagem</b> — criar as tabelas com chaves e constraints (etapas 1–4)</li><li><b>Carga</b> — povoar com os dados iniciais (5–8)</li><li><b>Consultas de negócio</b> (9–12)</li><li><b>Manutenção</b> — UPDATE/DELETE, view e índices (13–16)</li><li><b>Relatório gerencial</b> com CTE e window function (17)</li><li><b>Entrega</b> — exportar o banco real para rodar em outro computador (18)</li></ol>
<p>As etapas são sequenciais: o SQL aprovado em cada uma vira o estado do banco para a seguinte.</p>`,
 items:[
 PB(S({id:'p01',title:'1. Tabela autores',dataset:'vazio',tables:['autores'],challenge:'Crie <code>autores</code>: <code>id INTEGER PRIMARY KEY</code>, <code>nome TEXT NOT NULL</code>, <code>pais TEXT</code>.',
  check:STRUCT('autores'),solution:'CREATE TABLE autores (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, pais TEXT);',mustFail:['INSERT INTO autores (id, nome) VALUES (1, NULL);'],starter:'CREATE TABLE autores (\n  \n);',hints:['Três colunas; apenas nome é NOT NULL.']})),
 PB(S({id:'p02',title:'2. Tabela livros',dataset:'vazio',tables:['livros'],challenge:'Crie <code>livros</code> (nesta ordem): <code>id INTEGER PRIMARY KEY</code>, <code>titulo TEXT NOT NULL</code>, <code>autor_id INTEGER NOT NULL</code> (FK → autores(id)), <code>ano INTEGER</code>, <code>genero TEXT</code>, <code>isbn TEXT UNIQUE</code>, <code>exemplares INTEGER NOT NULL DEFAULT 1</code> com <b>CHECK (exemplares &gt;= 0)</b>.',
  check:STRUCT('livros'),solution:'CREATE TABLE livros (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, autor_id INTEGER NOT NULL REFERENCES autores(id), ano INTEGER, genero TEXT, isbn TEXT UNIQUE, exemplares INTEGER NOT NULL DEFAULT 1 CHECK (exemplares >= 0));',
  mustFail:["INSERT INTO livros (id, titulo, autor_id) VALUES (1, 'x', 999);","INSERT INTO autores VALUES (999, 't', 't'); INSERT INTO livros (id, titulo, autor_id, exemplares) VALUES (1, 'x', 999, -1);","INSERT INTO autores VALUES (999, 't', 't'); INSERT INTO livros (id, titulo, autor_id, isbn) VALUES (1, 'a', 999, 'X'); INSERT INTO livros (id, titulo, autor_id, isbn) VALUES (2, 'b', 999, 'X');"],
  starter:'CREATE TABLE livros (\n  id INTEGER PRIMARY KEY,\n  \n);',hints:['REFERENCES autores(id) e CHECK (exemplares >= 0).','isbn TEXT UNIQUE garante que não se repete.']})),
 PB(S({id:'p03',title:'3. Tabela membros',dataset:'vazio',tables:['membros'],challenge:'Crie <code>membros</code>: <code>id INTEGER PRIMARY KEY</code>, <code>nome TEXT NOT NULL</code>, <code>email TEXT NOT NULL UNIQUE</code>, <code>data_cadastro TEXT NOT NULL</code>.',
  check:STRUCT('membros'),solution:'CREATE TABLE membros (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, data_cadastro TEXT NOT NULL);',
  mustFail:["INSERT INTO membros VALUES (1, 'a', 'x@x.com', '2025-01-01'); INSERT INTO membros VALUES (2, 'b', 'x@x.com', '2025-01-02');"],starter:'CREATE TABLE membros (\n  \n);',hints:['email é NOT NULL e UNIQUE.']})),
 PB(S({id:'p04',title:'4. Tabela emprestimos',dataset:'vazio',tables:['emprestimos'],challenge:'Crie <code>emprestimos</code>: <code>id INTEGER PRIMARY KEY</code>, <code>livro_id INTEGER NOT NULL</code> (FK → livros), <code>membro_id INTEGER NOT NULL</code> (FK → membros), <code>data_emprestimo TEXT NOT NULL</code>, <code>data_devolucao TEXT</code> (nula enquanto o livro não voltar).',
  check:STRUCT('emprestimos'),solution:'CREATE TABLE emprestimos (id INTEGER PRIMARY KEY, livro_id INTEGER NOT NULL REFERENCES livros(id), membro_id INTEGER NOT NULL REFERENCES membros(id), data_emprestimo TEXT NOT NULL, data_devolucao TEXT);',
  mustFail:["INSERT INTO emprestimos (id, livro_id, membro_id, data_emprestimo) VALUES (1, 999, 999, '2025-01-01');"],starter:'CREATE TABLE emprestimos (\n  \n);',hints:['Duas FKs: livros(id) e membros(id).']})),
 PB(S({id:'p05',title:'5. Carga: autores',dataset:'vazio',tables:['autores'],challenge:'Insira os autores:<pre>(1, \'Machado de Assis\',   \'Brasil\')\n(2, \'Clarice Lispector\', \'Brasil\')\n(3, \'George Orwell\',     \'Reino Unido\')\n(4, \'Jane Austen\',       \'Reino Unido\')</pre>',
  check:'SELECT * FROM autores ORDER BY id',solution:"INSERT INTO autores VALUES (1,'Machado de Assis','Brasil'),(2,'Clarice Lispector','Brasil'),(3,'George Orwell','Reino Unido'),(4,'Jane Austen','Reino Unido');",starter:'INSERT INTO autores (id, nome, pais) VALUES\n',hints:['Um INSERT com várias linhas separadas por vírgula, ou vários INSERTs.']})),
 PB(S({id:'p06',title:'6. Carga: livros',dataset:'vazio',tables:['livros','autores'],challenge:'Insira os livros (id, título, autor_id, ano, gênero, isbn, exemplares):<pre>(1,\'Dom Casmurro\',1,1899,\'Romance\',\'978-0001\',3)\n(2,\'Memórias Póstumas\',1,1881,\'Romance\',\'978-0002\',2)\n(3,\'A Hora da Estrela\',2,1977,\'Romance\',\'978-0003\',1)\n(4,\'1984\',3,1949,\'Distopia\',\'978-0004\',4)\n(5,\'A Revolução dos Bichos\',3,1945,\'Fábula\',\'978-0005\',2)\n(6,\'Orgulho e Preconceito\',4,1813,\'Romance\',\'978-0006\',2)</pre>',
  check:'SELECT * FROM livros ORDER BY id',solution:"INSERT INTO livros VALUES (1,'Dom Casmurro',1,1899,'Romance','978-0001',3),(2,'Memórias Póstumas',1,1881,'Romance','978-0002',2),(3,'A Hora da Estrela',2,1977,'Romance','978-0003',1),(4,'1984',3,1949,'Distopia','978-0004',4),(5,'A Revolução dos Bichos',3,1945,'Fábula','978-0005',2),(6,'Orgulho e Preconceito',4,1813,'Romance','978-0006',2);",starter:'INSERT INTO livros VALUES\n',hints:['Copie os valores do enunciado; os autores já existem (a FK exige).']})),
 PB(S({id:'p07',title:'7. Carga: membros',dataset:'vazio',tables:['membros'],challenge:'Insira os membros:<pre>(1,\'Ana Paula\',   \'ana@mail.com\',   \'2025-01-05\')\n(2,\'Bruno Reis\',  \'bruno@mail.com\', \'2025-02-10\')\n(3,\'Carla Mendes\',\'carla@mail.com\', \'2025-03-15\')\n(4,\'Diego Faria\', \'diego@mail.com\', \'2025-04-20\')</pre>',
  check:'SELECT * FROM membros ORDER BY id',solution:"INSERT INTO membros VALUES (1,'Ana Paula','ana@mail.com','2025-01-05'),(2,'Bruno Reis','bruno@mail.com','2025-02-10'),(3,'Carla Mendes','carla@mail.com','2025-03-15'),(4,'Diego Faria','diego@mail.com','2025-04-20');",starter:'INSERT INTO membros VALUES\n',hints:['Mesma ideia da etapa anterior.']})),
 PB(S({id:'p08',title:'8. Carga: empréstimos',dataset:'vazio',tables:['emprestimos'],challenge:'Insira os empréstimos (id, livro, membro, empréstimo, devolução):<pre>(1,1,1,\'2025-05-02\',\'2025-05-12\')\n(2,4,1,\'2025-05-20\',NULL)\n(3,4,2,\'2025-05-25\',\'2025-06-05\')\n(4,3,2,\'2025-06-10\',NULL)\n(5,1,3,\'2025-06-12\',NULL)\n(6,5,3,\'2025-06-15\',\'2025-06-25\')\n(7,2,1,\'2025-06-18\',NULL)\n(8,6,4,\'2025-06-20\',NULL)</pre>',
  check:'SELECT * FROM emprestimos ORDER BY id',solution:"INSERT INTO emprestimos VALUES (1,1,1,'2025-05-02','2025-05-12'),(2,4,1,'2025-05-20',NULL),(3,4,2,'2025-05-25','2025-06-05'),(4,3,2,'2025-06-10',NULL),(5,1,3,'2025-06-12',NULL),(6,5,3,'2025-06-15','2025-06-25'),(7,2,1,'2025-06-18',NULL),(8,6,4,'2025-06-20',NULL);",starter:'INSERT INTO emprestimos VALUES\n',hints:['NULL sem aspas indica livro ainda não devolvido.']})),
 PB(P({id:'p09',title:'9. Catálogo com autor',dataset:'vazio',tables:['livros','autores'],ordered:true,challenge:'Liste <code>titulo</code> e <code>autor</code> (nome do autor) de todos os livros, ordenados por título.',
  solution:'SELECT l.titulo, a.nome AS autor FROM livros l JOIN autores a ON a.id = l.autor_id ORDER BY l.titulo',starter:'SELECT l.titulo, \nFROM livros l\nJOIN autores a ON \nORDER BY ',hints:['livros.autor_id = autores.id.']})),
 PB(P({id:'p10',title:'10. Empréstimos em aberto',dataset:'vazio',tables:['emprestimos','livros','membros'],ordered:true,challenge:'Liste os empréstimos <b>não devolvidos</b>: <code>titulo</code>, <code>membro</code> (nome) e <code>data_emprestimo</code>, ordenado por data do empréstimo.',
  solution:'SELECT l.titulo, m.nome AS membro, e.data_emprestimo FROM emprestimos e JOIN livros l ON l.id = e.livro_id JOIN membros m ON m.id = e.membro_id WHERE e.data_devolucao IS NULL ORDER BY e.data_emprestimo',starter:'SELECT l.titulo, m.nome AS membro, e.data_emprestimo\nFROM emprestimos e\nJOIN livros l ON \nJOIN membros m ON \nWHERE ',hints:['Não devolvido = data_devolucao IS NULL.']})),
 PB(P({id:'p11',title:'11. Ranking de leitores',dataset:'vazio',tables:['membros','emprestimos'],ordered:true,challenge:'Mostre <code>nome</code> do membro e <code>total</code> de empréstimos, do maior para o menor; desempate por nome.',
  solution:'SELECT m.nome, COUNT(*) AS total FROM membros m JOIN emprestimos e ON e.membro_id = m.id GROUP BY m.id, m.nome ORDER BY total DESC, m.nome',starter:'SELECT m.nome, \nFROM membros m\nJOIN emprestimos e ON \nGROUP BY \nORDER BY ',hints:['GROUP BY m.id, m.nome + COUNT(*).']})),
 PB(P({id:'p12',title:'12. Empréstimos em atraso',dataset:'vazio',tables:['emprestimos','livros','membros'],ordered:true,challenge:"Considere <b>hoje = '2025-06-30'</b> e prazo de <b>14 dias</b>. Liste os empréstimos <u>não devolvidos</u> em atraso: <code>titulo</code>, <code>membro</code> e <code>dias_atraso</code> (inteiro = dias desde o empréstimo − 14), do maior atraso para o menor.",
  solution:"SELECT l.titulo, m.nome AS membro, CAST(julianday('2025-06-30') - julianday(e.data_emprestimo) - 14 AS INTEGER) AS dias_atraso FROM emprestimos e JOIN livros l ON l.id = e.livro_id JOIN membros m ON m.id = e.membro_id WHERE e.data_devolucao IS NULL AND julianday('2025-06-30') - julianday(e.data_emprestimo) > 14 ORDER BY dias_atraso DESC",
  starter:"SELECT l.titulo, m.nome AS membro,\n       CAST(julianday('2025-06-30') - julianday(e.data_emprestimo) - 14 AS INTEGER) AS dias_atraso\nFROM emprestimos e\nJOIN livros l ON \nJOIN membros m ON \nWHERE ",hints:['julianday(data) converte a data em número de dias; a subtração dá a diferença.','Filtre: não devolvido E diferença > 14.']})),
 PB(S({id:'p13',title:'13. Registrar devolução',dataset:'vazio',tables:['emprestimos'],challenge:"O empréstimo <b>2</b> foi devolvido em <code>'2025-06-28'</code>. Registre a devolução.",
  check:'SELECT id, data_devolucao FROM emprestimos ORDER BY id',solution:"UPDATE emprestimos SET data_devolucao = '2025-06-28' WHERE id = 2;",starter:'UPDATE emprestimos\nSET \nWHERE ;',hints:['Não esqueça o WHERE id = 2!']})),
 PB(S({id:'p14',title:'14. Remover membro (FK)',dataset:'vazio',tables:['membros','emprestimos'],challenge:'O membro <b>4 (Diego)</b> pediu exclusão do cadastro, mas ele tem empréstimo. Remova primeiro os empréstimos dele e depois o membro (a FK impede a ordem inversa).',
  check:'SELECT (SELECT COUNT(*) FROM membros) AS membros, (SELECT COUNT(*) FROM emprestimos) AS emprestimos',solution:'DELETE FROM emprestimos WHERE membro_id = 4; DELETE FROM membros WHERE id = 4;',starter:'DELETE FROM emprestimos WHERE ;\nDELETE FROM membros WHERE ;',hints:['Filhos primeiro, depois o pai.']})),
 PB(S({id:'p15',title:'15. View de abertos',dataset:'vazio',tables:['emprestimos','livros','membros'],challenge:'Crie a view <code>v_emprestimos_abertos</code> com <code>emprestimo_id</code>, <code>titulo</code>, <code>membro</code> e <code>data_emprestimo</code> dos empréstimos não devolvidos.',
  check:'SELECT * FROM v_emprestimos_abertos ORDER BY emprestimo_id',solution:'CREATE VIEW v_emprestimos_abertos AS SELECT e.id AS emprestimo_id, l.titulo, m.nome AS membro, e.data_emprestimo FROM emprestimos e JOIN livros l ON l.id = e.livro_id JOIN membros m ON m.id = e.membro_id WHERE e.data_devolucao IS NULL;',starter:'CREATE VIEW v_emprestimos_abertos AS\nSELECT ',hints:['É a consulta da etapa 10 com e.id AS emprestimo_id.']})),
 PB(S({id:'p16',title:'16. Índices',dataset:'vazio',tables:['emprestimos'],challenge:'Crie os índices <code>idx_emprestimos_livro</code> (livro_id) e <code>idx_emprestimos_membro</code> (membro_id) em <code>emprestimos</code>.',
  check:"SELECT m.name AS indice, m.tbl_name AS tabela, ii.name AS coluna FROM sqlite_master m JOIN pragma_index_info(m.name) ii WHERE m.type = 'index' AND m.name NOT LIKE 'sqlite_%' ORDER BY 1",solution:'CREATE INDEX idx_emprestimos_livro ON emprestimos (livro_id); CREATE INDEX idx_emprestimos_membro ON emprestimos (membro_id);',starter:'CREATE INDEX idx_emprestimos_livro ON \n',hints:['Dois comandos CREATE INDEX.']})),
 PB(P({id:'p17',title:'17. Relatório por gênero',dataset:'vazio',tables:['emprestimos','livros'],ordered:true,challenge:'Relatório gerencial: <code>genero</code>, <code>emprestimos</code> (nº de empréstimos de livros do gênero) e <code>ranking</code> (<code>RANK()</code> por empréstimos, decrescente). Use <b>CTE</b> (WITH). Ordene por ranking e gênero.',
  solution:'WITH t AS (SELECT l.genero, COUNT(*) AS emprestimos FROM emprestimos e JOIN livros l ON l.id = e.livro_id GROUP BY l.genero) SELECT genero, emprestimos, RANK() OVER (ORDER BY emprestimos DESC) AS ranking FROM t ORDER BY ranking, genero',starter:'WITH t AS (\n  SELECT l.genero, COUNT(*) AS emprestimos\n  FROM \n  GROUP BY \n)\nSELECT genero, emprestimos, RANK() OVER (...) AS ranking\nFROM t\nORDER BY ',hints:['Agregue na CTE e aplique RANK() na consulta externa.']})),
 PB({id:'p18',title:'18. Entrega: exportar projeto',kind:'export',dataset:'vazio',tables:[],challenge:'Gere o <b>pacote de entrega</b>: banco SQLite real, scripts SQL e <code>executar.py</code>, para rodar em outro computador.'})
]};

const TRACKS = [T_BASICO, T_INTER, T_AVANC, D1, D2, D3, D4, D5, D6, D7, D8, D9, PROJ];
