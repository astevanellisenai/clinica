// ============================================================
// PESQUISA, ORDENAÇÃO E PAGINAÇÃO
// Reutilizado nos CRUDs, seguindo a Aula 12 do projeto Eventos.
// ============================================================

// Por padrão, exibimos cinco registros. Cada rota pode escolher outro limite.
const LIMITE_PADRAO = 5;

// 1. LER PARÂMETROS DA URL (?busca=...&ordem=...&pagina=...)
function parametros(query, ordens, ordemPadrao) {
    const busca = String(query.busca || '').trim().slice(0, 120);

    // Só podemos ordenar pelas opções definidas em cada rota.
    const ordem = Object.prototype.hasOwnProperty.call(ordens, query.ordem)
        ? query.ordem : ordemPadrao;

    const filtro = String(query.filtro || '').trim();
    const mesDigitado = String(query.mes || '');
    const mes = /^\d{4}-(0[1-9]|1[0-2])$/.test(mesDigitado)
        ? mesDigitado : '';

    const numero = Number(query.pagina);
    const pagina = Number.isSafeInteger(numero) && numero > 0
        ? numero : 1;

    return { busca, ordem, filtro, mes, pagina };
}

// 2. CONTAR OS REGISTROS E BUSCAR APENAS A PÁGINA ATUAL
async function consultar(BD, opcoes) {
    const {
        from,
        where = 'TRUE',
        values = [],
        select = '*',
        order = 'id ASC',
        pagina = 1,
        limite = LIMITE_PADRAO
    } = opcoes;

    // Garante um número positivo e inteiro de registros por página.
    const limitePorPagina = Number.isInteger(limite) && limite > 0
        ? limite : LIMITE_PADRAO;

    // Primeira consulta: quantos registros correspondem à pesquisa?
    const contagem = await BD.query(`
        SELECT COUNT(*)::int AS total
        FROM ${from}
        WHERE ${where}
    `, values);

    const totalRegistros = contagem.rows[0].total;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limitePorPagina));

    // Impede solicitar páginas além do total disponível.
    const paginaAtual = Math.min(pagina, totalPaginas);
    const offset = (paginaAtual - 1) * limitePorPagina;

    // Os valores de pesquisa vêm por parâmetros ($1, $2...).
    // As partes SQL (FROM, WHERE e ORDER) são definidas no servidor.
    const argumentos = [...values, limitePorPagina, offset];
    const parametroLimite = values.length + 1;
    const parametroOffset = values.length + 2;

    const resultado = await BD.query(`
        SELECT ${select}
        FROM ${from}
        WHERE ${where}
        ORDER BY ${order}
        LIMIT $${parametroLimite}
        OFFSET $${parametroOffset}
    `, argumentos);

    return {
        registros: resultado.rows,
        pagina: paginaAtual,
        totalPaginas,
        totalRegistros,
        limite: limitePorPagina
    };
}

module.exports = { parametros, consultar };
