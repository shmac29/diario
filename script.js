// Elementos do DOM
const formDiario = document.getElementById('form-diario');
const tituloInput = document.getElementById('titulo');
const dataInput = document.getElementById('data');
const conteudoInput = document.getElementById('conteudo');
const humorSelect = document.getElementById('humor');
const listaEntradas = document.getElementById('lista-entradas');
const pesquisaInput = document.getElementById('pesquisa');
const filtroHumor = document.getElementById('filtro-humor');

// Elementos de personalização
const btnPersonalizar = document.getElementById('btn-personalizar');
const painelPersonalizacao = document.getElementById('painel-personalizacao');
const fecharPersonalizacao = document.getElementById('fechar-personalizacao');
const salvarPersonalizacao = document.getElementById('salvar-personalizacao');
const resetarPersonalizacao = document.getElementById('resetar-personalizacao');
const opcoesCorBtns = document.querySelectorAll('.cor-opcao');
const opcoesTemasBtns = document.querySelectorAll('.tema-opcao');
const opcaoFonte = document.getElementById('opcao-fonte');
const opcaoEstilo = document.getElementById('opcao-estilo');

// Configurar data atual como padrão
dataInput.valueAsDate = new Date();

// Variáveis globais
let entradas = [];
let entradaEditando = null;

// Configuração de personalização padrão
const configPadrao = {
    tema: 'padrao',
    corPrimaria: '#9c27b0',
    fonte: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    estilo: 'padrao'
};

// Variável para armazenar configurações atuais
let configAtual = { ...configPadrao };

// Emojis para os humores
const humorEmojis = {
    'feliz': '😄',
    'neutro': '😐',
    'triste': '😢',
    'ansioso': '😰',
    'inspirado': '✨'
};

// Carregar entradas do localStorage ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarEntradas();
    renderizarEntradas();
    
    // Adicionar listeners de eventos
    formDiario.addEventListener('submit', salvarEntrada);
    pesquisaInput.addEventListener('input', filtrarEntradas);
    filtroHumor.addEventListener('change', filtrarEntradas);
    
    // Adicionar animação ao formulário
    animarElementos();
    
    // Carregar e aplicar configurações de personalização
    carregarPersonalizacao();
    
    // Adicionar event listeners para personalização
    btnPersonalizar.addEventListener('click', abrirPainelPersonalizacao);
    fecharPersonalizacao.addEventListener('click', fecharPainelPersonalizacao);
    salvarPersonalizacao.addEventListener('click', salvarConfigPersonalizacao);
    resetarPersonalizacao.addEventListener('click', resetarConfigPersonalizacao);
    
    // Event listeners para opções de personalização
    opcoesCorBtns.forEach(btn => {
        btn.addEventListener('click', () => selecionarCor(btn));
    });
    
    opcoesTemasBtns.forEach(btn => {
        btn.addEventListener('click', () => selecionarTema(btn));
    });
    
    opcaoFonte.addEventListener('change', selecionarFonte);
    opcaoEstilo.addEventListener('change', selecionarEstilo);
});

// Funções principais
function carregarEntradas() {
    const entradasSalvas = localStorage.getItem('diarioEntradas');
    entradas = entradasSalvas ? JSON.parse(entradasSalvas) : [];
}

function salvarNoLocalStorage() {
    localStorage.setItem('diarioEntradas', JSON.stringify(entradas));
}

function salvarEntrada(e) {
    e.preventDefault();
    
    if (!tituloInput.value.trim() || !conteudoInput.value.trim()) {
        mostrarMensagem('Por favor, preencha todos os campos!', 'erro');
        return;
    }
    
    const novaEntrada = {
        id: entradaEditando ? entradaEditando.id : Date.now(),
        titulo: tituloInput.value.trim(),
        data: dataInput.value,
        conteudo: conteudoInput.value.trim(),
        humor: humorSelect.value,
        dataCriacao: entradaEditando ? entradaEditando.dataCriacao : new Date().toISOString()
    };
    
    if (entradaEditando) {
        // Atualizar entrada existente
        const index = entradas.findIndex(entrada => entrada.id === entradaEditando.id);
        entradas[index] = novaEntrada;
        entradaEditando = null;
        mostrarMensagem('História atualizada com sucesso!', 'sucesso');
    } else {
        // Adicionar nova entrada
        entradas.push(novaEntrada);
        mostrarMensagem('Nova história adicionada!', 'sucesso');
    }
    
    salvarNoLocalStorage();
    formDiario.reset();
    dataInput.valueAsDate = new Date();
    renderizarEntradas();
    
    // Efeito visual no botão
    const botao = formDiario.querySelector('button');
    botao.classList.add('pulsando');
    setTimeout(() => botao.classList.remove('pulsando'), 500);
}

function renderizarEntradas(entradasFiltradas = null) {
    const entradasParaMostrar = entradasFiltradas || entradas;
    
    // Ordenar por data (mais recente primeiro)
    const entradasOrdenadas = [...entradasParaMostrar].sort((a, b) => 
        new Date(b.data) - new Date(a.data)
    );
    
    listaEntradas.innerHTML = '';
    
    if (entradasOrdenadas.length === 0) {
        listaEntradas.innerHTML = '<p class="sem-entradas">Nenhuma história encontrada. Que tal começar a escrever?</p>';
        return;
    }
    
    entradasOrdenadas.forEach((entrada, index) => {
        const entradaEl = document.createElement('div');
        entradaEl.classList.add('entrada-item');
        entradaEl.style.animationDelay = `${index * 0.1}s`;
        
        // Formatar data para exibição
        const dataFormatada = new Date(entrada.data).toLocaleDateString('pt-BR');
        
        // Preparar o conteúdo com quebras de linha adequadas
        const conteudoFormatado = entrada.conteudo.replace(/\n/g, '<br>');
        
        entradaEl.innerHTML = `
            <div class="entrada-cabecalho">
                <div class="entrada-titulo">${entrada.titulo}</div>
                <div class="entrada-data">${dataFormatada}</div>
            </div>
            <div class="entrada-conteudo">
                ${conteudoFormatado}
            </div>
            <div>
                <span class="entrada-humor humor-${entrada.humor}">${humorEmojis[entrada.humor]} ${entrada.humor.charAt(0).toUpperCase() + entrada.humor.slice(1)}</span>
            </div>
            <div class="entrada-acoes">
                <button class="btn-editar" data-id="${entrada.id}"><i class="fas fa-edit"></i> Editar</button>
                <button class="btn-excluir" data-id="${entrada.id}"><i class="fas fa-trash-alt"></i> Excluir</button>
            </div>
        `;
        
        // Adicionar event listeners para os botões
        entradaEl.querySelector('.btn-editar').addEventListener('click', () => editarEntrada(entrada.id));
        entradaEl.querySelector('.btn-excluir').addEventListener('click', () => excluirEntrada(entrada.id));
        
        listaEntradas.appendChild(entradaEl);
    });
}

function filtrarEntradas() {
    const termoPesquisa = pesquisaInput.value.toLowerCase();
    const humorFiltro = filtroHumor.value;
    
    const entradasFiltradas = entradas.filter(entrada => {
        const correspondeTermoPesquisa = 
            entrada.titulo.toLowerCase().includes(termoPesquisa) || 
            entrada.conteudo.toLowerCase().includes(termoPesquisa);
            
        const correspondeHumor = humorFiltro === '' || entrada.humor === humorFiltro;
        
        return correspondeTermoPesquisa && correspondeHumor;
    });
    
    renderizarEntradas(entradasFiltradas);
}

function editarEntrada(id) {
    entradaEditando = entradas.find(entrada => entrada.id === id);
    
    if (entradaEditando) {
        tituloInput.value = entradaEditando.titulo;
        dataInput.value = entradaEditando.data;
        conteudoInput.value = entradaEditando.conteudo;
        humorSelect.value = entradaEditando.humor;
        
        // Rolar para o formulário com animação
        window.scrollTo({
            top: formDiario.offsetTop - 20,
            behavior: 'smooth'
        });
        
        // Destacar o formulário
        const secaoFormulario = document.querySelector('.entrada-nova');
        secaoFormulario.classList.add('destacado');
        setTimeout(() => secaoFormulario.classList.remove('destacado'), 1000);
        
        // Mudar texto do botão
        const botaoSubmit = formDiario.querySelector('button[type="submit"]');
        botaoSubmit.innerHTML = '<i class="fas fa-save"></i> Atualizar História';
    }
}

function excluirEntrada(id) {
    const entradaParaExcluir = entradas.find(entrada => entrada.id === id);
    
    if (confirm(`Tem certeza que deseja excluir a história "${entradaParaExcluir.titulo}"?`)) {
        const elementoParaRemover = document.querySelector(`.entrada-item button[data-id="${id}"]`).closest('.entrada-item');
        
        // Adicionar animação de saída
        elementoParaRemover.classList.add('removendo');
        
        // Remover após a animação
        setTimeout(() => {
            entradas = entradas.filter(entrada => entrada.id !== id);
            salvarNoLocalStorage();
            renderizarEntradas();
            mostrarMensagem('História excluída!', 'info');
        }, 300);
    }
}

function mostrarMensagem(texto, tipo) {
    // Criar elemento de mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem mensagem-${tipo}`;
    mensagem.innerHTML = `<p>${texto}</p>`;
    
    // Adicionar ao DOM
    document.body.appendChild(mensagem);
    
    // Mostrar com animação
    setTimeout(() => mensagem.classList.add('visivel'), 10);
    
    // Remover após alguns segundos
    setTimeout(() => {
        mensagem.classList.remove('visivel');
        setTimeout(() => mensagem.remove(), 300);
    }, 3000);
}

function animarElementos() {
    // Adicionar classes de animação aos elementos
    const elementos = document.querySelectorAll('.form-group, h2, button');
    elementos.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.transitionDelay = `${index * 0.1}s`;
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100);
    });
} 

// Funções de personalização
function carregarPersonalizacao() {
    const configSalva = localStorage.getItem('diarioConfig');
    if (configSalva) {
        configAtual = JSON.parse(configSalva);
        aplicarPersonalizacao(configAtual);
        atualizarSelecaoUI();
    }
}

function abrirPainelPersonalizacao() {
    painelPersonalizacao.classList.add('aberto');
}

function fecharPainelPersonalizacao() {
    painelPersonalizacao.classList.remove('aberto');
}

function selecionarCor(btn) {
    const cor = btn.getAttribute('data-cor');
    configAtual.corPrimaria = cor;
    
    // Atualizar seleção visual
    opcoesCorBtns.forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    
    // Aplicar cor em tempo real
    aplicarCores(cor);
}

function selecionarTema(btn) {
    const tema = btn.getAttribute('data-tema');
    configAtual.tema = tema;
    
    // Atualizar seleção visual
    opcoesTemasBtns.forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    
    // Aplicar tema em tempo real
    aplicarTema(tema);
}

function selecionarFonte(e) {
    const fonte = e.target.value;
    configAtual.fonte = fonte;
    document.documentElement.style.setProperty('--fonte-principal', fonte);
    
    // Aplicar fonte em todos os elementos
    document.body.style.fontFamily = fonte;
}

function selecionarEstilo(e) {
    const estilo = e.target.value;
    configAtual.estilo = estilo;
    
    // Remover estilos anteriores
    document.body.classList.remove('estilo-arredondado', 'estilo-minimalista', 'estilo-vintage');
    
    // Aplicar novo estilo se não for o padrão
    if (estilo !== 'padrao') {
        document.body.classList.add(`estilo-${estilo}`);
    }
}

function salvarConfigPersonalizacao() {
    localStorage.setItem('diarioConfig', JSON.stringify(configAtual));
    mostrarMensagem('Personalização salva com sucesso!', 'sucesso');
    fecharPainelPersonalizacao();
}

function resetarConfigPersonalizacao() {
    configAtual = { ...configPadrao };
    localStorage.removeItem('diarioConfig');
    aplicarPersonalizacao(configPadrao);
    atualizarSelecaoUI();
    mostrarMensagem('Configurações padrão restauradas!', 'info');
}

function aplicarPersonalizacao(config) {
    // Aplicar tema
    aplicarTema(config.tema);
    
    // Aplicar estilo
    aplicarEstilo(config.estilo);
    
    // Aplicar cor primária
    aplicarCores(config.corPrimaria);
    
    // Aplicar fonte
    aplicarFonte(config.fonte);
}

// Funções auxiliares para aplicar cada tipo de personalização
function aplicarTema(tema) {
    // Remover todos os temas anteriores
    document.body.className = document.body.className
        .split(' ')
        .filter(cls => !cls.startsWith('tema-'))
        .join(' ');
    
    // Aplicar novo tema se não for o padrão
    if (tema !== 'padrao') {
        document.body.classList.add(`tema-${tema}`);
    }
    
    // Aplicar variáveis CSS específicas para cada tema
    switch (tema) {
        case 'escuro':
            document.documentElement.style.setProperty('--fundo-gradiente', 'linear-gradient(120deg, #263238 0%, #37474f 100%)');
            document.documentElement.style.setProperty('--fundo-claro', '#455a64');
            document.documentElement.style.setProperty('--texto-escuro', '#eceff1');
            document.documentElement.style.setProperty('--texto-claro', '#eceff1');
            break;
        case 'natureza':
            document.documentElement.style.setProperty('--fundo-gradiente', 'linear-gradient(120deg, #c8e6c9 0%, #b3e5fc 100%)');
            document.documentElement.style.setProperty('--fundo-claro', '#f9f9f9');
            document.documentElement.style.setProperty('--texto-escuro', '#333');
            document.documentElement.style.setProperty('--texto-claro', 'white');
            break;
        case 'sunset':
            document.documentElement.style.setProperty('--fundo-gradiente', 'linear-gradient(120deg, #ffccbc 0%, #bbdefb 100%)');
            document.documentElement.style.setProperty('--fundo-claro', '#f9f9f9');
            document.documentElement.style.setProperty('--texto-escuro', '#333');
            document.documentElement.style.setProperty('--texto-claro', 'white');
            break;
        case 'neon':
            document.documentElement.style.setProperty('--fundo-gradiente', 'linear-gradient(120deg, #212121 0%, #424242 100%)');
            document.documentElement.style.setProperty('--fundo-claro', '#303030');
            document.documentElement.style.setProperty('--texto-escuro', '#ffffff');
            document.documentElement.style.setProperty('--texto-claro', '#ffffff');
            document.documentElement.style.setProperty('--cor-primaria', '#00e676');
            document.documentElement.style.setProperty('--cor-primaria-escura', '#00c853');
            document.documentElement.style.setProperty('--cor-primaria-clara', '#69f0ae');
            break;
        case 'candy':
            document.documentElement.style.setProperty('--fundo-gradiente', 'linear-gradient(120deg, #ffcdd2 0%, #f8bbd0 100%)');
            document.documentElement.style.setProperty('--fundo-claro', '#ffffff');
            document.documentElement.style.setProperty('--texto-escuro', '#5d4037');
            document.documentElement.style.setProperty('--texto-claro', '#ffffff');
            document.documentElement.style.setProperty('--cor-primaria', '#ec407a');
            document.documentElement.style.setProperty('--cor-primaria-escura', '#d81b60');
            document.documentElement.style.setProperty('--cor-primaria-clara', '#f8bbd0');
            break;
        default: // padrão
            document.documentElement.style.setProperty('--fundo-gradiente', 'linear-gradient(120deg, #e0f7fa 0%, #f3e5f5 100%)');
            document.documentElement.style.setProperty('--fundo-claro', '#f9f9f9');
            document.documentElement.style.setProperty('--texto-escuro', '#333');
            document.documentElement.style.setProperty('--texto-claro', 'white');
            // Restaurar cor primária apenas se estiver mudando de tema, não de cor
            if (configAtual.tema !== tema) {
                document.documentElement.style.setProperty('--cor-primaria', '#9c27b0');
                document.documentElement.style.setProperty('--cor-primaria-escura', '#6a1b9a');
                document.documentElement.style.setProperty('--cor-primaria-clara', '#e1bee7');
            }
    }
}

function aplicarEstilo(estilo) {
    // Remover todos os estilos anteriores
    document.body.className = document.body.className
        .split(' ')
        .filter(cls => !cls.startsWith('estilo-'))
        .join(' ');
    
    // Aplicar novo estilo se não for o padrão
    if (estilo !== 'padrao') {
        document.body.classList.add(`estilo-${estilo}`);
    }
}

function aplicarCores(corPrimaria) {
    // Aplicar cor primária
    document.documentElement.style.setProperty('--cor-primaria', corPrimaria);
    
    // Calcular cores derivadas
    const corEscura = ajustarBrilho(corPrimaria, -20);
    const corClara = ajustarBrilho(corPrimaria, 40);
    
    // Aplicar cores derivadas
    document.documentElement.style.setProperty('--cor-primaria-escura', corEscura);
    document.documentElement.style.setProperty('--cor-primaria-clara', corClara);
    
    // Converter cor para RGB para uso em transparências
    const r = parseInt(corPrimaria.substring(1, 3), 16);
    const g = parseInt(corPrimaria.substring(3, 5), 16);
    const b = parseInt(corPrimaria.substring(5, 7), 16);
    document.documentElement.style.setProperty('--cor-primaria-rgb', `${r}, ${g}, ${b}`);
}

function aplicarFonte(fonte) {
    document.documentElement.style.setProperty('--fonte-principal', fonte);
    document.body.style.fontFamily = fonte;
}

function atualizarSelecaoUI() {
    // Atualizar seleção de cor
    opcoesCorBtns.forEach(btn => {
        btn.classList.remove('ativo');
        if (btn.getAttribute('data-cor') === configAtual.corPrimaria) {
            btn.classList.add('ativo');
        }
    });
    
    // Atualizar seleção de tema
    opcoesTemasBtns.forEach(btn => {
        btn.classList.remove('ativo');
        if (btn.getAttribute('data-tema') === configAtual.tema) {
            btn.classList.add('ativo');
        }
    });
    
    // Atualizar seleção de fonte
    opcaoFonte.value = configAtual.fonte;
    
    // Atualizar seleção de estilo
    opcaoEstilo.value = configAtual.estilo;
}

// Função auxiliar para ajustar brilho de cores (para gerar cores derivadas)
function ajustarBrilho(cor, porcentagem) {
    // Converter hex para RGB
    let r = parseInt(cor.substring(1, 3), 16);
    let g = parseInt(cor.substring(3, 5), 16);
    let b = parseInt(cor.substring(5, 7), 16);
    
    // Ajustar brilho
    r = Math.max(0, Math.min(255, r + (porcentagem / 100) * 255));
    g = Math.max(0, Math.min(255, g + (porcentagem / 100) * 255));
    b = Math.max(0, Math.min(255, b + (porcentagem / 100) * 255));
    
    // Converter de volta para hex
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
} 