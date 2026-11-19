/* ═══════════ Trilha interativa — estrutura inspirada no SQLBolt ═══════════
   A sequência de lições (SELECT → filtros → JOINs → NULLs → expressões → agregações →
   ordem de execução → INSERT/UPDATE/DELETE → CREATE/ALTER/DROP → subqueries → conjuntos)
   segue a ideia do site https://sqlbolt.com. Exercícios, textos e dados são ORIGINAIS.
   Dados do banco "cinema" são fictícios.                                                  */

const SEED_CINEMA = `
CREATE TABLE filmes (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, diretor TEXT NOT NULL, ano INTEGER NOT NULL, duracao_min INTEGER NOT NULL);
CREATE TABLE bilheteria (filme_id INTEGER PRIMARY KEY REFERENCES filmes(id), nota REAL, vendas_nacional REAL, vendas_internacional REAL);
CREATE TABLE predios (nome TEXT PRIMARY KEY, capacidade INTEGER NOT NULL);
CREATE TABLE equipe (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, funcao TEXT NOT NULL, predio TEXT, anos_casa INTEGER NOT NULL);
CREATE TABLE rascunho (id INTEGER);
CREATE VIEW v_antiga AS SELECT id, titulo FROM filmes;
INSERT INTO filmes VALUES
 (1,'Cidade de Deus','Fernando Meirelles',2002,130),(2,'Central do Brasil','Walter Salles',1998,113),
 (3,'O Auto da Compadecida','Guel Arraes',2000,104),(4,'Tropa de Elite','José Padilha',2007,115),
 (5,'Ainda Estou Aqui','Walter Salles',2024,137),(6,'Parasita','Bong Joon-ho',2019,132),
 (7,'Interestelar','Christopher Nolan',2014,169),(8,'A Origem','Christopher Nolan',2010,148),
 (9,'O Menino e o Mundo','Alê Abreu',2013,80),(10,'Bacurau','Kleber Mendonça Filho',2019,131),
 (11,'Curta Experimental','Ana Lima',2023,45);
INSERT INTO bilheteria VALUES
 (1,8.6,30.0,26.0),(2,8.0,12.5,8.0),(3,8.2,22.0,NULL),(4,7.9,44.0,5.0),(5,8.3,38.0,60.0),
 (6,8.5,12.0,255.0),(7,8.7,188.0,547.0),(8,8.8,292.0,533.0),(9,8.4,1.2,15.0),(10,7.7,3.0,11.0);
INSERT INTO predios VALUES ('Matriz',120),('Anexo A',45),('Anexo B',30),('Galpão',15);
INSERT INTO equipe VALUES
 (1,'Lia','Diretora','Matriz',12),(2,'Marco','Engenheiro','Matriz',5),(3,'Teresa','Engenheira','Anexo A',9),
 (4,'Otto','Artista','Anexo A',2),(5,'Rita','Artista','Anexo A',7),(6,'Davi','Gerente','Matriz',10),
 (7,'Elis','Engenheira','Matriz',3),(8,'Caio','Artista',NULL,1),(9,'Bela','Gerente','Anexo B',6);`;
SEEDS.cinema = SEED_CINEMA;

const CT = ['filmes', 'bilheteria'];
const OL = (...steps) => '<ol>' + steps.map(s => `<li>${s}</li>`).join('') + '</ol>';
/* gera os itens A/B de uma lição */
const SBL = (n, label, title, theory, tables, tasks) => tasks.map((t, i) => ({
  id: `sb${n}${'ab'[i]}`, title: `${label} · ${title} (${'AB'[i]})`, kind: t.check ? 'script' : 'query', dataset: 'cinema',
  ordered: t.check ? true : !!t.ordered, lesson: n, tables, theory, ...t
}));

const SB = {id: 'sb', group: 'Prática estilo SQLBolt', icon: '🎬', title: 'Trilha interativa (18 lições)', tables: CT,
 intro: `<p>Aqui você pratica no estilo de lições curtas e progressivas: <b>conceito → 2 exercícios</b>. Os dados são de um pequeno estúdio de cinema (<code>filmes</code>, <code>bilheteria</code>, <code>equipe</code>, <code>predios</code>), todos fictícios.</p>
 <p class="hint">Estrutura inspirada no site <a href="https://sqlbolt.com" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">SQLBolt</a> (em inglês, ótimo para treinar). Os exercícios daqui são originais.</p>`,
 items: [
 ...SBL(1, 'L1', 'SELECT 101',
  `<p>Uma tabela é como uma planilha: cada <b>linha</b> é um registro (um filme) e cada <b>coluna</b> é uma propriedade (título, ano…). <code>SELECT colunas FROM tabela</code> escolhe o que mostrar; <code>SELECT *</code> mostra tudo.</p><pre>SELECT titulo, ano FROM filmes;</pre>`, ['filmes'], [
  {challenge: 'Mostre apenas o <code>titulo</code> de todos os filmes.', solution: 'SELECT titulo FROM filmes', starter: 'SELECT \nFROM filmes', hints: ['Só uma coluna: titulo.'],
   how: OL('<code>FROM filmes</code> escolhe a tabela.', '<code>SELECT titulo</code> mostra só a coluna titulo — todas as linhas continuam.')},
  {challenge: 'Mostre <code>titulo</code> e <code>diretor</code> de todos os filmes.', solution: 'SELECT titulo, diretor FROM filmes', starter: 'SELECT \nFROM filmes', hints: ['Separe as colunas por vírgula.'],
   how: OL('Liste as colunas separadas por vírgula, na ordem em que quer vê-las.', 'A ordem do SELECT define a ordem das colunas no resultado.')}]),
 ...SBL(2, 'L2', 'Filtros com números',
  `<p><code>WHERE</code> filtra linhas. Com números você pode usar <code>=</code>, <code>&lt;&gt;</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code> e <code>BETWEEN a AND b</code> (inclui os extremos).</p><pre>SELECT titulo FROM filmes WHERE ano &gt; 2015;</pre>`, ['filmes'], [
  {challenge: 'Liste <code>titulo</code> e <code>ano</code> dos filmes lançados a partir de <b>2010</b> (inclusive).', solution: 'SELECT titulo, ano FROM filmes WHERE ano >= 2010', starter: 'SELECT titulo, ano\nFROM filmes\nWHERE ', hints: ['Use >= para incluir 2010.'],
   how: OL('O filtro é sobre a coluna <code>ano</code>.', '<code>&gt;= 2010</code> inclui 2010 e tudo depois.')},
  {challenge: 'Liste <code>titulo</code> e <code>duracao_min</code> dos filmes com duração entre <b>100 e 140</b> minutos (inclusive).', solution: 'SELECT titulo, duracao_min FROM filmes WHERE duracao_min BETWEEN 100 AND 140', starter: 'SELECT titulo, duracao_min\nFROM filmes\nWHERE ', hints: ['BETWEEN 100 AND 140.'],
   how: OL('<code>BETWEEN 100 AND 140</code> é o mesmo que <code>&gt;= 100 AND &lt;= 140</code>.')}]),
 ...SBL(3, 'L3', 'Filtros com texto',
  `<p>Texto vai entre aspas simples. <code>IN ('a','b')</code> testa uma lista; <code>LIKE</code> procura padrões: <code>%</code> = "qualquer coisa", <code>_</code> = "um caractere".</p><pre>SELECT titulo FROM filmes WHERE diretor LIKE 'C%';</pre>`, ['filmes'], [
  {challenge: "Liste <code>titulo</code> e <code>diretor</code> dos filmes dirigidos por <b>Walter Salles</b> ou <b>Christopher Nolan</b> (use IN).", solution: "SELECT titulo, diretor FROM filmes WHERE diretor IN ('Walter Salles', 'Christopher Nolan')", starter: "SELECT titulo, diretor\nFROM filmes\nWHERE diretor IN (", hints: ['IN recebe a lista entre parênteses.'],
   how: OL('<code>IN (...)</code> é um jeito curto de escrever vários <code>= ... OR</code>.', 'Cada nome entre aspas simples, separados por vírgula.')},
  {challenge: "Liste o <code>titulo</code> dos filmes cujo título <b>começa com a letra A</b> (use LIKE).", solution: "SELECT titulo FROM filmes WHERE titulo LIKE 'A%'", starter: "SELECT titulo\nFROM filmes\nWHERE titulo LIKE ", hints: ["O padrão é 'A%'."],
   how: OL("<code>'A%'</code> = começa com A e continua com qualquer coisa.")}]),
 ...SBL(4, 'L4', 'Ordenar e paginar',
  `<p><code>DISTINCT</code> remove repetições. <code>ORDER BY</code> ordena. <code>LIMIT n</code> limita; <code>OFFSET k</code> pula as k primeiras (útil para paginação).</p><pre>SELECT titulo FROM filmes ORDER BY ano DESC LIMIT 3 OFFSET 1;</pre>`, ['filmes'], [
  {challenge: 'Liste os <code>diretor</code>es distintos, em ordem alfabética.', ordered: true, solution: 'SELECT DISTINCT diretor FROM filmes ORDER BY diretor', starter: 'SELECT \nFROM filmes\n', hints: ['DISTINCT + ORDER BY.'],
   how: OL('<code>DISTINCT</code> faz cada diretor aparecer uma vez (Walter Salles dirigiu dois filmes).', '<code>ORDER BY diretor</code> deixa em ordem de A a Z.')},
  {challenge: 'Ordene os filmes do mais longo para o mais curto, <b>pule o primeiro</b> e mostre os <b>2 seguintes</b>: <code>titulo</code>, <code>duracao_min</code>.', ordered: true, solution: 'SELECT titulo, duracao_min FROM filmes ORDER BY duracao_min DESC LIMIT 2 OFFSET 1', starter: 'SELECT titulo, duracao_min\nFROM filmes\nORDER BY \nLIMIT  OFFSET ', hints: ['LIMIT 2 OFFSET 1.'],
   how: OL('Ordene por duração decrescente: o 1º é o mais longo.', '<code>OFFSET 1</code> pula esse; <code>LIMIT 2</code> pega os dois seguintes.')}]),
 ...SBL('R', 'Revisão', 'SELECT simples',
  `<p>Hora de juntar o que você viu: colunas, filtros combinados com <code>AND</code>, ordenação por mais de uma coluna.</p>`, ['filmes'], [
  {challenge: 'Liste <code>titulo</code>, <code>ano</code> e <code>duracao_min</code> dos filmes de <b>2000 em diante</b> com duração <b>menor que 140</b> min. Ordene por ano (mais recente primeiro) e depois por título.', ordered: true,
   solution: 'SELECT titulo, ano, duracao_min FROM filmes WHERE ano >= 2000 AND duracao_min < 140 ORDER BY ano DESC, titulo', starter: 'SELECT titulo, ano, duracao_min\nFROM filmes\nWHERE \nORDER BY ', hints: ['Duas condições ligadas por AND.', 'ORDER BY ano DESC, titulo.'],
   how: OL('Duas condições no WHERE, ligadas por <code>AND</code> (as duas precisam ser verdadeiras).', '<code>ORDER BY ano DESC, titulo</code>: primeiro o ano, e no empate o título.')}]),
 ...SBL(6, 'L6', 'JOIN',
  `<p>Os dados ficam em tabelas separadas, ligadas por uma <b>chave</b>. Aqui <code>bilheteria.filme_id</code> aponta para <code>filmes.id</code>. <code>JOIN … ON</code> junta as linhas que casam.</p><pre>SELECT f.titulo, b.nota\nFROM filmes f\nJOIN bilheteria b ON b.filme_id = f.id;</pre>`, CT, [
  {challenge: 'Mostre <code>titulo</code>, <code>vendas_nacional</code> e <code>vendas_internacional</code> de cada filme (que tenha bilheteria).', solution: 'SELECT f.titulo, b.vendas_nacional, b.vendas_internacional FROM filmes f JOIN bilheteria b ON b.filme_id = f.id', starter: 'SELECT f.titulo, \nFROM filmes f\nJOIN bilheteria b ON ', hints: ['b.filme_id = f.id.'],
   how: OL('Use apelidos curtos (<code>f</code>, <code>b</code>) para as tabelas.', 'O <code>ON</code> liga a chave estrangeira à chave primária.', 'Filmes sem bilheteria ficam de fora (INNER JOIN).')},
  {challenge: 'Liste o <code>titulo</code> dos filmes que venderam <b>mais no exterior do que no Brasil</b> (vendas_internacional &gt; vendas_nacional).', solution: 'SELECT f.titulo FROM filmes f JOIN bilheteria b ON b.filme_id = f.id WHERE b.vendas_internacional > b.vendas_nacional', starter: 'SELECT f.titulo\nFROM filmes f\nJOIN bilheteria b ON \nWHERE ', hints: ['Compare duas colunas da mesma linha.'],
   how: OL('Depois do JOIN, o WHERE compara duas colunas da tabela bilheteria.', 'Se alguma das duas for NULL, a comparação é desconhecida e o filme não aparece.')}]),
 Q('sbq6', 'L6 · Quiz: contando linhas do JOIN', 'A tabela <code>filmes</code> tem 11 linhas e <code>bilheteria</code> tem 10 linhas (todas ligadas a um filme). Quantas linhas retorna um <code>INNER JOIN</code> entre elas?', ['11', '10', '21', '0'], 1, 'INNER JOIN só mantém linhas com correspondência nas duas tabelas: os 10 filmes que têm bilheteria. O filme sem bilheteria some.'),
 ...SBL(7, 'L7', 'OUTER JOIN',
  `<p><code>LEFT JOIN</code> mantém <b>todas</b> as linhas da tabela da esquerda; quando não há correspondência, as colunas da direita vêm como <code>NULL</code>. Para achar quem <i>não</i> tem correspondência: <code>WHERE direita.chave IS NULL</code>.</p>`, CT, [
  {challenge: 'Mostre <code>titulo</code> e <code>nota</code> de <b>todos</b> os filmes, inclusive os sem bilheteria (nota aparecerá vazia).', solution: 'SELECT f.titulo, b.nota FROM filmes f LEFT JOIN bilheteria b ON b.filme_id = f.id', starter: 'SELECT f.titulo, b.nota\nFROM filmes f\nLEFT JOIN bilheteria b ON ', hints: ['LEFT JOIN em vez de JOIN.'],
   how: OL('<code>LEFT JOIN</code> preserva todos os filmes.', 'Para o filme sem bilheteria, <code>b.nota</code> vira NULL.')},
  {challenge: 'Liste o <code>titulo</code> dos filmes que <b>não têm</b> registro de bilheteria.', solution: 'SELECT f.titulo FROM filmes f LEFT JOIN bilheteria b ON b.filme_id = f.id WHERE b.filme_id IS NULL', starter: 'SELECT f.titulo\nFROM filmes f\nLEFT JOIN bilheteria b ON \nWHERE ', hints: ['Quem não casa tem b.filme_id NULL.'],
   how: OL('LEFT JOIN traz todos os filmes.', 'O <code>WHERE b.filme_id IS NULL</code> deixa só os que ficaram sem par.')}]),
 ...SBL(8, 'L8', 'NULLs',
  `<p><code>NULL</code> significa "sem valor/desconhecido". Não é 0 nem texto vazio. Compare sempre com <code>IS NULL</code> / <code>IS NOT NULL</code> — <code>= NULL</code> nunca é verdadeiro.</p>`, ['equipe', 'filmes', 'bilheteria'], [
  {challenge: 'Liste o <code>nome</code> das pessoas da equipe que <b>não estão alocadas</b> em nenhum prédio.', solution: 'SELECT nome FROM equipe WHERE predio IS NULL', starter: 'SELECT nome\nFROM equipe\nWHERE ', hints: ['IS NULL.'],
   how: OL('Pessoa sem prédio tem <code>predio</code> NULL.', 'O teste correto é <code>IS NULL</code>.')},
  {challenge: 'Liste o <code>titulo</code> dos filmes cuja <code>vendas_internacional</code> <b>está preenchida</b> (não nula).', solution: 'SELECT f.titulo FROM filmes f JOIN bilheteria b ON b.filme_id = f.id WHERE b.vendas_internacional IS NOT NULL', starter: 'SELECT f.titulo\nFROM filmes f\nJOIN bilheteria b ON \nWHERE ', hints: ['IS NOT NULL.'],
   how: OL('Junte filmes e bilheteria.', '<code>IS NOT NULL</code> remove o filme com venda internacional desconhecida.')}]),
 Q('sbq8', 'L8 · Quiz: NULL em comparações', 'Se <code>nota</code> é NULL, o que acontece com a linha em <code>WHERE nota &lt;&gt; 5</code>?', ['A linha é incluída', 'A linha não é incluída', 'Gera erro', 'NULL é tratado como 0 e a linha é incluída'], 1, 'NULL &lt;&gt; 5 resulta em UNKNOWN, e o WHERE só deixa passar o que é verdadeiro. Para incluir também os nulos: <code>nota &lt;&gt; 5 OR nota IS NULL</code>.'),
 ...SBL(9, 'L9', 'Expressões',
  `<p>Você pode calcular no SELECT: <code>+ - * /</code>, funções como <code>ROUND</code> e <code>COALESCE</code> (troca NULL por um valor). Dê nome ao resultado com <code>AS</code>. Cuidado: <code>número + NULL = NULL</code>.</p>`, CT, [
  {challenge: 'Mostre <code>titulo</code> e <code>duracao_horas</code> (duração em horas, com 1 casa decimal) de todos os filmes.', solution: 'SELECT titulo, ROUND(duracao_min / 60.0, 1) AS duracao_horas FROM filmes', starter: 'SELECT titulo, \nFROM filmes', hints: ['Divida por 60.0 (com ponto) para não arredondar para inteiro.'],
   how: OL('<code>duracao_min / 60.0</code> — o <code>.0</code> força divisão com decimais.', '<code>ROUND(x, 1)</code> arredonda para 1 casa.', '<code>AS duracao_horas</code> nomeia a coluna.')},
  {challenge: 'Mostre <code>titulo</code> e <code>vendas_total</code> (nacional + internacional, tratando vendas nulas como 0), do maior para o menor total.', ordered: true,
   solution: 'SELECT f.titulo, COALESCE(b.vendas_nacional, 0) + COALESCE(b.vendas_internacional, 0) AS vendas_total FROM filmes f JOIN bilheteria b ON b.filme_id = f.id ORDER BY vendas_total DESC, f.titulo',
   starter: 'SELECT f.titulo,\n       COALESCE() + COALESCE() AS vendas_total\nFROM filmes f\nJOIN bilheteria b ON \nORDER BY ', hints: ['COALESCE(coluna, 0) troca NULL por 0.', 'ORDER BY vendas_total DESC.'],
   how: OL('Sem COALESCE, um NULL deixaria o total inteiro NULL.', 'Some as duas colunas já "limpas" e nomeie com AS.', 'Ordene pelo alias, do maior para o menor.')}]),
 ...SBL(10, 'L10', 'Agregações (parte 1)',
  `<p><code>COUNT, SUM, AVG, MIN, MAX</code> resumem várias linhas em uma. Com <code>GROUP BY</code> o resumo é feito <b>por grupo</b>.</p><pre>SELECT predio, COUNT(*) FROM equipe GROUP BY predio;</pre>`, ['equipe'], [
  {challenge: 'Em uma linha, mostre <code>maior_tempo</code> e <code>menor_tempo</code> de casa (anos_casa) da equipe.', solution: 'SELECT MAX(anos_casa) AS maior_tempo, MIN(anos_casa) AS menor_tempo FROM equipe', starter: 'SELECT \nFROM equipe', hints: ['MAX e MIN com alias.'],
   how: OL('Sem GROUP BY, a tabela inteira é um grupo só.', '<code>MAX</code> e <code>MIN</code> devolvem um valor cada.')},
  {challenge: 'Para cada <code>funcao</code>, mostre a <code>media_anos</code> de casa arredondada a 1 casa decimal.', solution: 'SELECT funcao, ROUND(AVG(anos_casa), 1) AS media_anos FROM equipe GROUP BY funcao', starter: 'SELECT funcao, \nFROM equipe\nGROUP BY ', hints: ['GROUP BY funcao + AVG.'],
   how: OL('<code>GROUP BY funcao</code> cria um grupo por função.', '<code>AVG(anos_casa)</code> calcula a média de cada grupo; <code>ROUND</code> arredonda.')}]),
 ...SBL(11, 'L11', 'Agregações (parte 2)',
  `<p><code>HAVING</code> filtra <b>grupos</b> depois da agregação; <code>WHERE</code> filtra <b>linhas</b> antes. O <code>NULL</code> forma um grupo próprio no <code>GROUP BY</code>.</p>`, ['equipe'], [
  {challenge: 'Mostre <code>predio</code> e <code>qtd</code> de pessoas em cada prédio (quem não tem prédio forma um grupo próprio).', solution: 'SELECT predio, COUNT(*) AS qtd FROM equipe GROUP BY predio', starter: 'SELECT predio, \nFROM equipe\nGROUP BY ', hints: ['COUNT(*).'],
   how: OL('<code>GROUP BY predio</code> agrupa por prédio.', 'Quem não tem prédio (NULL) aparece como um grupo à parte.')},
  {challenge: 'Mostre <code>funcao</code> e <code>qtd</code>, somente funções com <b>2 ou mais</b> pessoas.', solution: 'SELECT funcao, COUNT(*) AS qtd FROM equipe GROUP BY funcao HAVING COUNT(*) >= 2', starter: 'SELECT funcao, \nFROM equipe\nGROUP BY \nHAVING ', hints: ['HAVING COUNT(*) >= 2.'],
   how: OL('Conte por função com GROUP BY.', '<code>HAVING</code> remove os grupos com menos de 2.')}]),
 ...SBL(12, 'L12', 'Ordem de execução',
  `<p>O banco não executa na ordem em que você escreve. A ordem <b>lógica</b> é: <code>FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</code>. Por isso o WHERE não enxerga aliases do SELECT nem agregações.</p>`, ['filmes'], [
  {challenge: 'Use tudo: considere só filmes de <b>2000 em diante</b>, agrupe por <code>diretor</code>, mostre <code>diretor</code> e <code>qtd</code>, mantenha apenas diretores com <b>2 ou mais</b> filmes e ordene por qtd (maior primeiro) e diretor.', ordered: true,
   solution: 'SELECT diretor, COUNT(*) AS qtd FROM filmes WHERE ano >= 2000 GROUP BY diretor HAVING COUNT(*) >= 2 ORDER BY qtd DESC, diretor', starter: 'SELECT diretor, COUNT(*) AS qtd\nFROM filmes\nWHERE \nGROUP BY \nHAVING \nORDER BY ', hints: ['WHERE filtra filmes; HAVING filtra grupos.'],
   how: OL('<code>WHERE ano &gt;= 2000</code> roda primeiro (filtra linhas).', '<code>GROUP BY diretor</code> forma os grupos e <code>COUNT(*)</code> conta.', '<code>HAVING</code> filtra os grupos; por fim o <code>ORDER BY</code> ordena.')}]),
 Q('sbq12', 'L12 · Quiz: ordem lógica', 'Qual é a ordem lógica de processamento de uma consulta?', ['SELECT → FROM → WHERE → GROUP BY → ORDER BY', 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT', 'WHERE → FROM → SELECT → GROUP BY → HAVING', 'FROM → SELECT → WHERE → HAVING → GROUP BY'], 1, 'Primeiro as tabelas (FROM/JOIN), depois filtra linhas (WHERE), agrupa, filtra grupos (HAVING), calcula as colunas (SELECT), ordena e limita.'),
 ...SBL(13, 'L13', 'INSERT',
  `<p><code>INSERT INTO tabela (colunas) VALUES (valores)</code> adiciona linhas. Listar as colunas evita erro de ordem. Aqui você escreve um <b>script</b>; o banco é refeito a cada execução.</p>`, CT, [
  {challenge: "Insira o filme <code>id 12, 'Mar de Dentro', diretor 'Ana Lima', ano 2025, duração 98</code>.", check: 'SELECT * FROM filmes WHERE id = 12', solution: "INSERT INTO filmes VALUES (12, 'Mar de Dentro', 'Ana Lima', 2025, 98);", starter: 'INSERT INTO filmes (id, titulo, diretor, ano, duracao_min)\nVALUES (...);', hints: ['Texto entre aspas simples.'],
   how: OL('Informe valores para todas as colunas NOT NULL.', 'Texto entre aspas simples; números sem aspas.')},
  {challenge: 'O filme <b>11</b> ainda não tem bilheteria. Insira: <code>nota 7.0, vendas_nacional 0.5, vendas_internacional 0.2</code>.', check: 'SELECT * FROM bilheteria WHERE filme_id = 11', solution: 'INSERT INTO bilheteria VALUES (11, 7.0, 0.5, 0.2);', starter: 'INSERT INTO bilheteria (filme_id, nota, vendas_nacional, vendas_internacional)\nVALUES (...);', hints: ['filme_id 11 já existe em filmes (FK).'],
   how: OL('A chave estrangeira exige que o filme 11 exista — e ele existe.', 'Ordem das colunas: filme_id, nota, vendas_nacional, vendas_internacional.')}]),
 ...SBL(14, 'L14', 'UPDATE',
  `<p><code>UPDATE tabela SET coluna = valor WHERE condição</code> altera linhas existentes. <b>Sem WHERE, altera todas.</b></p>`, CT, [
  {challenge: 'Corrija a <code>nota</code> do filme <b>10</b> para <code>7.9</code>.', check: 'SELECT filme_id, nota FROM bilheteria ORDER BY filme_id', solution: 'UPDATE bilheteria SET nota = 7.9 WHERE filme_id = 10;', starter: 'UPDATE bilheteria\nSET \nWHERE ;', hints: ['WHERE filme_id = 10.'],
   how: OL('<code>SET nota = 7.9</code> define o novo valor.', '<code>WHERE filme_id = 10</code> garante que só uma linha muda.')},
  {challenge: 'Aumente em <b>10%</b> a <code>vendas_internacional</code> dos filmes com <code>nota &gt;= 8.5</code>.', check: 'SELECT filme_id, vendas_internacional FROM bilheteria ORDER BY filme_id', solution: 'UPDATE bilheteria SET vendas_internacional = vendas_internacional * 1.10 WHERE nota >= 8.5;', starter: 'UPDATE bilheteria\nSET vendas_internacional = \nWHERE ;', hints: ['Use o valor atual: vendas_internacional * 1.10.'],
   how: OL('O novo valor é calculado a partir do antigo.', 'Quem tem venda NULL continua NULL (NULL × 1,1 = NULL).')}]),
 ...SBL(15, 'L15', 'DELETE',
  `<p><code>DELETE FROM tabela WHERE condição</code> remove linhas. <b>Sem WHERE apaga tudo.</b> Chaves estrangeiras impedem apagar um registro que ainda é referenciado — apague os filhos antes dos pais.</p>`, CT, [
  {challenge: 'Remova da bilheteria os registros com <code>nota &lt; 8.0</code>.', check: 'SELECT filme_id FROM bilheteria ORDER BY filme_id', solution: 'DELETE FROM bilheteria WHERE nota < 8.0;', starter: 'DELETE FROM bilheteria\nWHERE ;', hints: ['nota < 8.0.'],
   how: OL('O WHERE define exatamente o que sai.', 'Bilheteria é a tabela filha, então pode ser apagada sem problemas.')},
  {challenge: 'Remova de <code>filmes</code> os filmes que <b>não têm</b> registro em bilheteria (use subconsulta).', check: 'SELECT id FROM filmes ORDER BY id', solution: 'DELETE FROM filmes WHERE id NOT IN (SELECT filme_id FROM bilheteria);', starter: 'DELETE FROM filmes\nWHERE id NOT IN (', hints: ['A subconsulta lista os filme_id existentes em bilheteria.'],
   how: OL('A subconsulta devolve os ids que têm bilheteria.', '<code>NOT IN</code> pega os filmes fora dessa lista — o 11.')}]),
 ...SBL(16, 'L16', 'CREATE TABLE',
  `<p><code>CREATE TABLE nome (coluna tipo restrições, …)</code>. Restrições: <code>PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT, CHECK, REFERENCES</code>. O sistema confere a estrutura <b>e tenta violar</b> suas regras para ver se funcionam.</p>`, CT, [
  {challenge: 'Crie <code>criticas</code>: <code>id INTEGER PRIMARY KEY</code>, <code>filme_id INTEGER NOT NULL</code> (FK → filmes), <code>autor TEXT NOT NULL</code>, <code>nota INTEGER</code> com <b>CHECK de 0 a 10</b>.', check: STRUCT('criticas'),
   solution: 'CREATE TABLE criticas (id INTEGER PRIMARY KEY, filme_id INTEGER NOT NULL REFERENCES filmes(id), autor TEXT NOT NULL, nota INTEGER CHECK (nota BETWEEN 0 AND 10));',
   mustFail: ["INSERT INTO criticas (id, filme_id, autor, nota) VALUES (1, 1, NULL, 5);", "INSERT INTO criticas (id, filme_id, autor, nota) VALUES (2, 1, 'x', 11);", "INSERT INTO criticas (id, filme_id, autor, nota) VALUES (3, 999, 'x', 5);"],
   starter: 'CREATE TABLE criticas (\n  id INTEGER PRIMARY KEY,\n  \n);', hints: ['REFERENCES filmes(id) e CHECK (nota BETWEEN 0 AND 10).'],
   how: OL('Chave primária + colunas obrigatórias (<code>NOT NULL</code>).', '<code>REFERENCES filmes(id)</code> impede críticas de filmes que não existem.', '<code>CHECK (nota BETWEEN 0 AND 10)</code> rejeita notas fora do intervalo.')},
  {challenge: 'Crie <code>sessoes</code>: <code>id INTEGER PRIMARY KEY</code>, <code>filme_id INTEGER NOT NULL</code> (FK → filmes), <code>sala TEXT NOT NULL</code>, <code>preco REAL NOT NULL DEFAULT 20</code>.', check: STRUCT('sessoes'),
   solution: 'CREATE TABLE sessoes (id INTEGER PRIMARY KEY, filme_id INTEGER NOT NULL REFERENCES filmes(id), sala TEXT NOT NULL, preco REAL NOT NULL DEFAULT 20);',
   mustFail: ["INSERT INTO sessoes (id, filme_id, sala) VALUES (1, 1, NULL);", "INSERT INTO sessoes (id, filme_id, sala) VALUES (2, 999, 'A');"],
   starter: 'CREATE TABLE sessoes (\n  \n);', hints: ['DEFAULT 20 (sem aspas e sem casas decimais).'],
   how: OL('<code>DEFAULT 20</code> preenche o preço quando você não informa.', 'Combine <code>NOT NULL</code> com <code>DEFAULT</code> para nunca ficar sem preço.')}]),
 ...SBL(17, 'L17', 'ALTER TABLE',
  `<p><code>ALTER TABLE tabela ADD COLUMN coluna tipo [restrições]</code> acrescenta uma coluna sem perder os dados (as linhas antigas recebem NULL ou o <code>DEFAULT</code>).</p>`, ['filmes', 'equipe'], [
  {challenge: 'Adicione à tabela <code>filmes</code> a coluna <code>genero</code> do tipo <code>TEXT</code>.', check: "SELECT name, upper(type) AS tipo FROM pragma_table_info('filmes') WHERE name = 'genero'", solution: 'ALTER TABLE filmes ADD COLUMN genero TEXT;', starter: 'ALTER TABLE filmes\n', hints: ['ADD COLUMN genero TEXT.'],
   how: OL('<code>ADD COLUMN</code> acrescenta no fim da tabela.', 'Os filmes existentes ficam com <code>genero</code> NULL.')},
  {challenge: 'Adicione à tabela <code>equipe</code> a coluna <code>ativo INTEGER NOT NULL DEFAULT 1</code>.', check: "SELECT name, upper(type) AS tipo, \"notnull\" AS obrigatorio, dflt_value AS padrao FROM pragma_table_info('equipe') WHERE name = 'ativo'", solution: 'ALTER TABLE equipe ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1;', starter: 'ALTER TABLE equipe\n', hints: ['NOT NULL exige DEFAULT ao adicionar coluna em tabela com dados.'],
   how: OL('Uma coluna <code>NOT NULL</code> nova precisa de <code>DEFAULT</code>; senão as linhas antigas ficariam inválidas.')}]),
 ...SBL(18, 'L18', 'DROP',
  `<p><code>DROP TABLE nome</code> e <code>DROP VIEW nome</code> apagam o objeto <b>e os dados</b>, sem volta. <code>IF EXISTS</code> evita erro quando ele não existe.</p>`, ['filmes'], [
  {challenge: 'Remova a tabela <code>rascunho</code>.', check: "SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY name", solution: 'DROP TABLE rascunho;', starter: 'DROP TABLE ', hints: ['DROP TABLE rascunho;'],
   how: OL('<code>DROP TABLE</code> elimina estrutura e dados. Confirme o nome antes de executar!')},
  {challenge: 'Remova a view <code>v_antiga</code>.', check: "SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY name", solution: 'DROP VIEW v_antiga;', starter: 'DROP VIEW ', hints: ['DROP VIEW v_antiga;'],
   how: OL('Remover a view não apaga as tabelas por trás dela; só descarta a consulta salva.')}]),
 ...SBL('Sub', 'Tópico', 'Subqueries',
  `<p>Uma <b>subconsulta</b> é um SELECT dentro de outro. Pode devolver um valor (comparação), uma lista (<code>IN</code>) ou servir de tabela temporária.</p>`, CT, [
  {challenge: 'Liste <code>titulo</code> e <code>duracao_min</code> dos filmes <b>mais longos que a média</b> de duração.', solution: 'SELECT titulo, duracao_min FROM filmes WHERE duracao_min > (SELECT AVG(duracao_min) FROM filmes)', starter: 'SELECT titulo, duracao_min\nFROM filmes\nWHERE duracao_min > (', hints: ['(SELECT AVG(duracao_min) FROM filmes).'],
   how: OL('A subconsulta calcula a média (um número).', 'A consulta de fora mantém só quem passa dela.')},
  {challenge: 'Liste o <code>titulo</code> dos filmes com <code>nota &gt;= 8.5</code>, usando <code>IN</code> com subconsulta (sem JOIN).', solution: 'SELECT titulo FROM filmes WHERE id IN (SELECT filme_id FROM bilheteria WHERE nota >= 8.5)', starter: 'SELECT titulo\nFROM filmes\nWHERE id IN (', hints: ['A subconsulta devolve filme_id.'],
   how: OL('A subconsulta lista os <code>filme_id</code> com nota alta.', '<code>id IN (lista)</code> mantém só esses filmes.')}]),
 ...SBL('Set', 'Tópico', 'UNION, INTERSECT, EXCEPT',
  `<p>Operadores de conjunto combinam resultados de consultas com as mesmas colunas: <code>UNION</code> (junta, sem repetir), <code>INTERSECT</code> (só o que há nas duas), <code>EXCEPT</code> (o que há na primeira e não na segunda).</p>`, CT, [
  {challenge: 'Em uma coluna <code>titulo</code>, junte (sem repetir) os filmes <b>anteriores a 2005</b> com os de <b>nota &gt;= 8.7</b>, em ordem alfabética.', ordered: true,
   solution: 'SELECT titulo FROM filmes WHERE ano < 2005 UNION SELECT f.titulo FROM filmes f JOIN bilheteria b ON b.filme_id = f.id WHERE b.nota >= 8.7 ORDER BY titulo', starter: 'SELECT titulo FROM filmes WHERE \nUNION\n', hints: ['O ORDER BY vem só no final.'],
   how: OL('A 1ª consulta pega os filmes antigos; a 2ª, os de nota alta.', '<code>UNION</code> junta e remove repetidos; <code>ORDER BY</code> só no fim.')},
  {challenge: 'Use <code>EXCEPT</code> para listar o <code>id</code> dos filmes que <b>não têm</b> bilheteria.', solution: 'SELECT id FROM filmes EXCEPT SELECT filme_id FROM bilheteria', starter: 'SELECT id FROM filmes\nEXCEPT\n', hints: ['Todos os ids menos os de bilheteria.'],
   how: OL('Todos os ids de filmes <i>menos</i> os que aparecem em bilheteria.')}])
 ]};

TRACKS.splice(3, 0, SB);   // logo depois dos Fundamentos
