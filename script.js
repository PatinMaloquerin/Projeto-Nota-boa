// --- DADOS E ELEMENTOS GLOBAIS ---
let dadosDasDisciplinas = {};

// As variáveis do modal foram removidas
let listaView, detalhesView, listaContainer, mediaGeralAnoEl;

const PRESETS = {
    fundamental: ['Português', 'Matemática', 'Ciências', 'Educação Física', 'História', 'Geografia', 'Ensino Religioso', 'Arte', 'Inglês'],
    medio: ['Biologia', 'Física', 'Química', 'Matemática', 'Sociologia', 'Filosofia', 'Língua Portuguesa', 'Literatura', 'Inglês', 'História', 'Geografia']
};
const MEDIA_APROVACAO = 6.0;
const MEDIA_RECUPERACAO = 4.0;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Busca pelos elementos essenciais
    listaView = document.getElementById('lista-disciplinas-view');
    detalhesView = document.getElementById('detalhes-disciplina-view');
    listaContainer = document.getElementById('disciplinas-lista-container');
    mediaGeralAnoEl = document.getElementById('media-geral-ano');

    iniciarPaginaComPadrao();
    
    // Os listeners do modal foram removidos
});


// --- FUNÇÕES DE PRESETS E ADIÇÃO ---
function iniciarPaginaComPadrao() {
    dadosDasDisciplinas = {};
    PRESETS.fundamental.forEach(nome => adicionarDisciplina(nome));
    atualizarTudo();
}

function carregarPredefinicao(tipo) {
    const listaNaoVazia = Object.keys(dadosDasDisciplinas).length > 0;
    
    if (listaNaoVazia && !confirm(`Isso limpará a lista atual. Deseja carregar as matérias do Ensino ${tipo === 'fundamental' ? 'Fundamental' : 'Médio'}?`)) {
        return;
    }
    
    dadosDasDisciplinas = {};
    PRESETS[tipo].forEach(nome => adicionarDisciplina(nome));
    atualizarTudo();
}

function adicionarDisciplinaManualmente() {
    const nomeInput = document.getElementById('nome-disciplina-input');
    const nome = nomeInput.value.trim();
    if (nome) {
        adicionarDisciplina(nome);
        atualizarTudo();
        nomeInput.value = '';
        nomeInput.focus();
    } else {
        alert("Por favor, insira um nome para a disciplina.");
    }
}

function adicionarDisciplina(nome) {
    const id = 'd_' + new Date().getTime() + Math.random().toString(36).substr(2, 9);
    dadosDasDisciplinas[id] = {
        nome: nome,
        bimestres: [
            { a: null, t: null, p: null, visivel: true },
            { a: null, t: null, p: null, visivel: false },
            { a: null, t: null, p: null, visivel: false },
            { a: null, t: null, p: null, visivel: false }
        ]
    };
}

// ---- ÁREA MODIFICADA ----
// Nova função para remover disciplina usando confirm()
function removerDisciplina(id) {
    const nome = dadosDasDisciplinas[id].nome;
    if (confirm(`Você realmente quer remover a disciplina "${nome}"?`)) {
        delete dadosDasDisciplinas[id];
        atualizarTudo();
    }
}
// ---- FIM DA ÁREA MODIFICADA ----


// --- FUNÇÕES DE NAVEGAÇÃO E RENDERIZAÇÃO ---
function mostrarLista() {
    detalhesView.classList.add('hidden');
    listaView.classList.remove('hidden');
    atualizarTudo();
}

function mostrarDetalhes(id) {
    const disciplina = dadosDasDisciplinas[id];
    document.getElementById('detalhes-nome-disciplina').textContent = disciplina.nome;
    detalhesView.dataset.disciplinaId = id;
    renderizarBimestres(id);
    listaView.classList.add('hidden');
    detalhesView.classList.remove('hidden');
}

function atualizarListaDisciplinas() {
    listaContainer.innerHTML = '';
    for (const id in dadosDasDisciplinas) {
        const disciplina = dadosDasDisciplinas[id];
        const { media } = calcularMediaAnualDisciplina(id);
        
        // ---- ÁREA MODIFICADA ----
        // O onclick agora chama a nova função removerDisciplina()
        listaContainer.innerHTML += `
            <div class="disciplina-card" data-id="${id}">
                <div class="disciplina-info">
                    <h3>${disciplina.nome}</h3>
                    <span>Média Anual: ${media.toFixed(2)}</span>
                </div>
                <div class="disciplina-actions">
                    <button class="btn-details" onclick="mostrarDetalhes('${id}')">Detalhes</button>
                    <button class="btn-remove" onclick="removerDisciplina('${id}')">Remover</button>
                </div>
            </div>`;
        // ---- FIM DA ÁREA MODIFICADA ----
    }
}

function renderizarBimestres(id) {
    const container = document.getElementById('bimestres-container-dinamico');
    container.innerHTML = '';
    const disciplina = dadosDasDisciplinas[id];

    disciplina.bimestres.forEach((bimestre, i) => {
        if (bimestre.visivel) {
            const mediaBimestre = (bimestre.a !== null && bimestre.t !== null && bimestre.p !== null)
                ? ((bimestre.a + bimestre.t + bimestre.p) / 3).toFixed(2)
                : '0.00';
            
            container.innerHTML += `
                <div class="bimestre" id="bimestre-${id}-${i}">
                    <h4>${i + 1}º Bimestre</h4>
                    <input type="number" placeholder="Atividade" min="0" max="10" value="${bimestre.a ?? ''}" oninput="salvarNota('${id}', ${i}, 'a', this.value)">
                    <input type="number" placeholder="Trabalho" min="0" max="10" value="${bimestre.t ?? ''}" oninput="salvarNota('${id}', ${i}, 't', this.value)">
                    <input type="number" placeholder="Prova" min="0" max="10" value="${bimestre.p ?? ''}" oninput="salvarNota('${id}', ${i}, 'p', this.value)">
                    <div class="media-bimestre">Média: ${mediaBimestre}</div>
                </div>`;
        }
    });
    atualizarCalculosDisciplina(id);
}

// --- LÓGICA DE CÁLCULO E SALVAMENTO ---
function salvarNota(id, bimestreIndex, tipoNota, valor) {
    const valorNum = valor === '' ? null : parseFloat(valor);
    if (valorNum !== null && (valorNum < 0 || valorNum > 10)) {
        alert("A nota deve ser entre 0 e 10.");
        event.target.value = dadosDasDisciplinas[id].bimestres[bimestreIndex][tipoNota] ?? '';
        return;
    }
    
    dadosDasDisciplinas[id].bimestres[bimestreIndex][tipoNota] = valorNum;
    
    const bimestreAtual = dadosDasDisciplinas[id].bimestres[bimestreIndex];
    if (bimestreAtual.a !== null && bimestreAtual.t !== null && bimestreAtual.p !== null) {
        if (bimestreIndex < 3) {
            dadosDasDisciplinas[id].bimestres[bimestreIndex + 1].visivel = true;
        }
    }

    if (document.getElementById(`bimestre-${id}-${bimestreIndex + 1}`) === null && bimestreIndex < 3 && dadosDasDisciplinas[id].bimestres[bimestreIndex + 1].visivel) {
        renderizarBimestres(id);
    } else {
        atualizarCalculosDisciplina(id);
    }
}

function calcularMediaAnualDisciplina(id) {
    const disciplina = dadosDasDisciplinas[id];
    let somaDasMedias = 0;
    let bimestresCompletos = 0;
    
    disciplina.bimestres.forEach(bim => {
        if (bim.a !== null && bim.t !== null && bim.p !== null) {
            somaDasMedias += (bim.a + bim.t + bim.p) / 3;
            bimestresCompletos++;
        }
    });
    
    const media = bimestresCompletos > 0 ? somaDasMedias / bimestresCompletos : 0;
    return { media, bimestresConsiderados: bimestresCompletos };
}

function atualizarCalculosDisciplina(id) {
    const { media, bimestresConsiderados } = calcularMediaAnualDisciplina(id);
    const resultadoDiv = document.getElementById('resultado-final-disciplina');
    
    dadosDasDisciplinas[id].bimestres.forEach((bim, i) => {
        const mediaEl = document.querySelector(`#bimestre-${id}-${i} .media-bimestre`);
        if (mediaEl) {
            const mediaBim = (bim.a !== null && bim.t !== null && bim.p !== null) 
                ? ((bim.a + bim.t + bim.p) / 3) : 0;
            mediaEl.textContent = `Média: ${mediaBim.toFixed(2)}`;
        }
    });

    let situacao = "Aguardando notas...";
    resultadoDiv.className = "resultado-final";

    if (bimestresConsiderados > 0) {
        if (media >= MEDIA_APROVACAO) {
            situacao = "Aprovado(a)";
            resultadoDiv.classList.add("aprovado");
        } else if (media >= MEDIA_RECUPERACAO) {
            situacao = "Recuperação";
            resultadoDiv.classList.add("recuperacao");
        } else {
            situacao = "Reprovado(a)";
            resultadoDiv.classList.add("reprovado");
        }
    }

    resultadoDiv.innerHTML = `Média Anual: <strong>${media.toFixed(2)}</strong> <br> <small>(Com base em ${bimestresConsiderados} bimestre${bimestresConsiderados !== 1 ? 's' : ''} completo${bimestresConsiderados !== 1 ? 's' : ''})</small> <br> Situação: <strong>${situacao}</strong>`;
}

function calcularMediaGeralAno() {
    const ids = Object.keys(dadosDasDisciplinas);
    if (ids.length === 0) {
        mediaGeralAnoEl.textContent = "0.00";
        return;
    }
    const somaTotal = ids.reduce((acc, id) => acc + calcularMediaAnualDisciplina(id).media, 0);
    mediaGeralAnoEl.textContent = (somaTotal / ids.length).toFixed(2);
}

// As funções do modal foram removidas

// --- FUNÇÃO CENTRAL DE ATUALIZAÇÃO ---
function atualizarTudo() {
    atualizarListaDisciplinas();
    calcularMediaGeralAno();
}


