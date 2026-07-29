// ==UserScript==
// @name         T bot - Baiak Idle Protegido
// @namespace    http://tampermonkey.net/
// @version      1.98
// @match        https://*.baiakidle.com/*
// @connect      script.google.com
// @connect      googleusercontent.com
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    // ============================================================================
    // --- SISTEMA DE LICENCIAMENTO COM ID DE SESSÃO ÚNICA & TOKEN DE SEGURANÇA ---
    // ============================================================================
    const URL_API_GOOGLE = "https://script.google.com/macros/s/AKfycbwLth2lN0S26YuZriqkLsBEHBnvM3HY9zBsmGgo8Q2O_9fk7dYjh1qqUjeeG-0CA6uc/exec";

    // Gera ou recupera um ID único de sessão para este navegador/instância
    let sessaoId = localStorage.getItem('tbot_sessao_id');
    if (!sessaoId) {
        sessaoId = 'sessao_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('tbot_sessao_id', sessaoId);
    }

    // Variável em memória estrita (invisível para adulteração direta via console fácil)
    let tokenExecucaoInterno = null;

    async function verificarLicenca() {
        let chave = localStorage.getItem('tbot_licenca_chave');

        if (!chave) {
            chave = prompt("Digite sua chave de acesso mensal para o bot:");
            if (!chave) {
                alert("Você precisa de uma chave válida para usar o bot.");
                return false;
            }
            localStorage.setItem('tbot_licenca_chave', chave);
        }

        try {
            let resposta = await fetch(`${URL_API_GOOGLE}?chave=${encodeURIComponent(chave)}&sessao=${encodeURIComponent(sessaoId)}`, {
                method: 'GET',
                redirect: 'follow'
            });

            let textoResposta = await resposta.text();
            let dados;
            try {
                dados = JSON.parse(textoResposta);
            } catch (err) {
                console.error("[TBot] Resposta não é JSON válido:", textoResposta);
                alert("Erro de conexão com o servidor de licenças.");
                return false;
            }

            // Validação rígida: Se deletarem o token ou alterarem, a API obriga a reautenticação
            if (dados && dados.status === "liberado" && dados.tokenExecucao) {
                tokenExecucaoInterno = dados.tokenExecucao; // Armazena na memória volátil segura do script
                if (dados.expiracao) {
                    localStorage.setItem('tbot_licenca_expiracao', dados.expiracao);
                }
                return true;
            } else {
                localStorage.removeItem('tbot_licenca_chave');
                localStorage.removeItem('tbot_sessao_id');
                localStorage.removeItem('tbot_licenca_expiracao');
                tokenExecucaoInterno = null;
                alert(dados.mensagem || "Sua chave é inválida, expirou ou já está sendo usada em outro navegador/dispositivo!");
                return false;
            }
        } catch (e) {
            console.error("Erro ao conectar com o servidor de licenças:", e);
            alert("Erro de conexão com o servidor de licenças.");
            return false;
        }
    }

    let autorizado = await verificarLicenca();
    if (!autorizado || !tokenExecucaoInterno) {
        console.error("[TBot] Acesso negado por falta de token de execução válido.");
        return;
    }

    console.log("Licença verificada com sucesso! Iniciando o bot...");


    // ============================================================================
    // --- MÓDULO AUTO BOSS ---
    // ============================================================================
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const TEMPO_ESPERA_COMBATE = 15000;

    window.AutoBoss = window.AutoBoss || {};
    window.AutoBoss.autoBossAtivo = false;
    window.AutoBoss.listaBosses = window.AutoBoss.listaBosses || [];
    window.AutoBoss.executandoEmAndamento = false;
    window.AutoBoss.indiceInicio = 0;

    function registrarLog(mensagem, tipo = 'info') {
        if (typeof window.adicionarLogUI === 'function') {
            window.adicionarLogUI(mensagem, tipo);
        }
        const prefixo = tipo === 'sucesso' ? '[Sucesso]' : tipo === 'aviso' ? '[Aviso]' : tipo === 'erro' ? '[Erro]' : '[Auto Boss]';
        console.log(`${prefixo} ${mensagem}`);
    }

    async function abrirJanelaBosses() {
        const btnFecharAtual = document.querySelector('#boss-modal-close') || document.querySelector('button.im-closebtn');
        if (btnFecharAtual) {
            btnFecharAtual.click();
            await sleep(300);
        }

        const botaoMenu = document.querySelector('#wave-title');
        if (botaoMenu) {
            botaoMenu.click();
            await sleep(400);

            let btnChefes = document.querySelector('button.tp-opt[data-tp="boss"]');
            if (!btnChefes) {
                const botoesTp = document.querySelectorAll('button.tp-opt');
                for (let btn of botoesTp) {
                    if (btn.getAttribute('data-tp') === 'boss' || btn.textContent.toLowerCase().includes('chefe') || btn.textContent.toLowerCase().includes('boss')) {
                        btnChefes = btn;
                        break;
                    }
                }
            }

            if (btnChefes) {
                btnChefes.click();
                await sleep(800);
                return true;
            }
        }
        return false;
    }

    async function fecharJanelaBosses() {
        const btnFechar = document.querySelector('#boss-modal-close') || document.querySelector('button.im-closebtn[data-i18n*="Fechar"]');
        if (btnFechar) {
            btnFechar.click();
            await sleep(400);
            return true;
        }
    }

    function emCombateComBoss() {
        const bannerHost = document.querySelector('#banner-host');
        if (!bannerHost) return false;

        const htmlConteudo = bannerHost.innerHTML.trim();
        const estaVisivel = bannerHost.offsetParent !== null;

        if (!estaVisivel || htmlConteudo === '') {
            return false;
        }

        const textoPlaca = bannerHost.querySelector('.bossbar-plate');
        if (textoPlaca) {
            const conteudo = textoPlaca.textContent.trim();
            if (conteudo.startsWith('0 /') || conteudo.includes(' 0%')) {
                return false;
            }
        }

        return true;
    }

    function encontrarInputBusca() {
        let inputs = document.querySelectorAll('input');
        for (let input of inputs) {
            if (input.offsetParent !== null) {
                const placeholder = (input.placeholder || '').toLowerCase();
                const className = (input.className || '').toLowerCase();
                if (placeholder.includes('buscar') || placeholder.includes('fase') || placeholder.includes('boss') || placeholder.includes('pesquisar') || className.includes('pick-search')) {
                    return input;
                }
            }
        }
        for (let input of inputs) {
            if (input.offsetParent !== null && input.type === 'text') {
                return input;
            }
        }
        return null;
    }

    async function tentarAtacarBossUnico(nomeBoss, inputBusca) {
        if (!nomeBoss || !inputBusca) return false;

        inputBusca.click();
        inputBusca.focus();
        inputBusca.value = '';
        inputBusca.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(200);

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(inputBusca, nomeBoss);
        } else {
            inputBusca.value = nomeBoss;
        }

        inputBusca.dispatchEvent(new Event('input', { bubbles: true }));
        inputBusca.dispatchEvent(new Event('change', { bubbles: true }));
        inputBusca.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: nomeBoss.slice(-1) }));

        await sleep(1000);

        let cardAlvo = null;
        const cells = document.querySelectorAll('.boss-cell');

        for (let cell of cells) {
            const dataTip = (cell.getAttribute('data-tip') || '').toLowerCase();
            const textoCell = (cell.textContent || '').toLowerCase();
            if (cell.offsetParent !== null && (dataTip.includes(nomeBoss.toLowerCase()) || textoCell.includes(nomeBoss.toLowerCase()))) {
                cardAlvo = cell;
                break;
            }
        }

        if (!cardAlvo) {
            for (let cell of cells) {
                if (cell.offsetParent !== null) {
                    cardAlvo = cell;
                    break;
                }
            }
        }

        if (cardAlvo) {
            cardAlvo.click();
            await sleep(800);
            if (emCombateComBoss()) {
                return true;
            }
        }

        registrarLog(`Boss em CD ou indisponível: ${nomeBoss}`, 'aviso');
        return false;
    }

    async function aguardarFimDoCombate() {
        const inicio = Date.now();
        while (window.AutoBoss.autoBossAtivo && (Date.now() - inicio < TEMPO_ESPERA_COMBATE || emCombateComBoss())) {
            if (!emCombateComBoss()) {
                break;
            }
            await sleep(1000);
        }
        await sleep(1000);
    }

    window.AutoBoss.iniciar = async function(callbackTermino) {
        if (this.executandoEmAndamento) return;

        if (!this.autoBossAtivo || !this.listaBosses || this.listaBosses.length === 0) {
            this.autoBossAtivo = false;
            if (typeof callbackTermino === 'function') callbackTermino();
            return;
        }

        if (emCombateComBoss()) {
            registrarLog('Já em combate ao iniciar. Aguardando término...', 'aviso');
            await aguardarFimDoCombate();
        }

        this.executandoEmAndamento = true;

        const total = this.listaBosses.length;
        let indiceAtual = (typeof this.indiceInicio === 'number' && this.indiceInicio >= 0 && this.indiceInicio < total) ? this.indiceInicio : 0;

        const janelaAberta = await abrirJanelaBosses();
        if (!janelaAberta) {
            this.executandoEmAndamento = false;
            this.autoBossAtivo = false;
            if (typeof callbackTermino === 'function') callbackTermino();
            return;
        }

        registrarLog('Iniciando varredura de rotação de bosses...', 'info');

        for (let passo = 0; passo < total; passo++) {
            if (!this.autoBossAtivo) break;

            if (emCombateComBoss()) {
                await aguardarFimDoCombate();
                await abrirJanelaBosses();
            }

            const inputBusca = encontrarInputBusca();
            if (!inputBusca) {
                registrarLog('Input de busca de boss não encontrado.', 'erro');
                break;
            }

            const nomeBoss = this.listaBosses[indiceAtual];
            const sucesso = await tentarAtacarBossUnico(nomeBoss, inputBusca);

            if (sucesso) {
                registrarLog(`Em combate ativo com: ${nomeBoss}`, 'sucesso');

                await fecharJanelaBosses();
                await aguardarFimDoCombate();
                registrarLog(`Combate finalizado para: ${nomeBoss}`, 'info');
                await sleep(1500);

                indiceAtual = (indiceAtual + 1) % total;
                this.indiceInicio = indiceAtual;
                if (typeof salvarIndiceInicio === 'function') salvarIndiceInicio();
                if (typeof atualizarListaBossUI === 'function') atualizarListaBossUI();

                const reabriu = await abrirJanelaBosses();
                if (!reabriu) break;
            } else {
                await sleep(400);
                indiceAtual = (indiceAtual + 1) % total;
                this.indiceInicio = indiceAtual;
                if (typeof salvarIndiceInicio === 'function') salvarIndiceInicio();
                if (typeof atualizarListaBossUI === 'function') atualizarListaBossUI();
            }
        }

        await fecharJanelaBosses();
        this.executandoEmAndamento = false;
        this.autoBossAtivo = false;

        registrarLog('Ciclo de rotação de bosses finalizado.', 'info');

        if (typeof atualizarInterfaceBotaoBoss === 'function') {
            atualizarInterfaceBotaoBoss();
        }

        if (typeof callbackTermino === 'function') {
            callbackTermino();
        }
    };

    window.AutoBoss.ligar = function() {
        this.autoBossAtivo = true;
        registrarLog('Auto Boss ativado.', 'sucesso');
        this.iniciar();
    };

    window.AutoBoss.desligar = function() {
        this.autoBossAtivo = false;
        this.executandoEmAndamento = false;
        registrarLog('Auto Boss desligado.', 'aviso');
        if (typeof atualizarInterfaceBotaoBoss === 'function') {
            atualizarInterfaceBotaoBoss();
        }
    };


    // ============================================================================
    // --- CONFIGURAÇÕES DA AUTO VENDA, PAINEL UI, STAMINA, AUTO F5 E LOGS ---
    // ============================================================================
    const TEMPO_BASE_VENDA = (2 * 60 + 5) * 1000;
    const TEMPO_ESPERA_CONFIRMACAO = 500;

    const CHAVE_AUTO_VENDA = 'tbot_auto_venda_ativo';
    const CHAVE_AUTO_STAMINA = 'tbot_auto_stamina_ativo';
    const CHAVE_AUTO_F5 = 'tbot_auto_f5_ativo';
    const CHAVE_TEMPO_F5 = 'tbot_auto_f5_tempo';
    const CHAVE_NOME_HUNT = 'tbot_nome_hunt';
    const CHAVE_MIN_STAMINA = 'tbot_min_stamina';
    const CHAVE_MAX_STAMINA = 'tbot_max_stamina';
    const CHAVE_LOCAL_BOSSES = 'tbot_lista_bosses';
    const CHAVE_INDICE_INICIO = 'tbot_indice_inicio_boss';

    let autoVendaLigado = localStorage.getItem(CHAVE_AUTO_VENDA) === 'true';
    let gerenciadorStaminaLigado = localStorage.getItem(CHAVE_AUTO_STAMINA) === 'true';
    let autoF5Ligado = localStorage.getItem(CHAVE_AUTO_F5) === 'true';
    let tempoF5Minutos = parseInt(localStorage.getItem(CHAVE_TEMPO_F5), 10) || 30;

    let staminaLimiteMinima = parseInt(localStorage.getItem(CHAVE_MIN_STAMINA), 10) || 15;
    let staminaLimiteRetorno = parseInt(localStorage.getItem(CHAVE_MAX_STAMINA), 10) || 50;
    let nomeHuntDesejada = localStorage.getItem(CHAVE_NOME_HUNT) || 'Vexclaw';

    let estadoAtual = 'CAÇANDO';

    let intervaloVendaId = null;
    let intervaloStaminaId = null;
    let temporizadorF5Id = null;
    let monitorManutencaoId = null;

    const containerFlutuante = document.createElement('div');
    containerFlutuante.id = 'auto-clicker-container';
    Object.assign(containerFlutuante.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '999999',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        width: '240px',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'rgba(24, 24, 27, 0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
    });

    function criarLetraTArt(tamanhoFonte) {
        const span = document.createElement('span');
        span.textContent = 'T';
        Object.assign(span.style, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: tamanhoFonte,
            fontWeight: 'bold',
            color: '#facc15',
            textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
            lineHeight: '1',
            display: 'inline-block',
            verticalAlign: 'middle',
            pointerEvents: 'none'
        });
        return span;
    }

    const barraTitulo = document.createElement('div');
    Object.assign(barraTitulo.style, {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(18, 18, 20, 0.6)',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        height: '38px',
        cursor: 'move'
    });

    let estaMovendo = false;
    let offsetX = 0;
    let offsetY = 0;

    barraTitulo.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        estaMovendo = true;
        offsetX = e.clientX - containerFlutuante.getBoundingClientRect().left;
        offsetY = e.clientY - containerFlutuante.getBoundingClientRect().top;
        containerFlutuante.style.bottom = 'auto';
        containerFlutuante.style.right = 'auto';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!estaMovendo) return;
        containerFlutuante.style.left = `${e.clientX - offsetX}px`;
        containerFlutuante.style.top = `${e.clientY - offsetY}px`;
    }

    function onMouseUp() {
        estaMovendo = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    const miniTHeader = document.createElement('div');
    Object.assign(miniTHeader.style, {
        width: '24px',
        height: '24px',
        backgroundColor: 'rgba(17, 17, 21, 0.8)',
        border: '1.5px solid #b45309',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
    });
    miniTHeader.appendChild(criarLetraTArt('16px'));

    const tituloTexto = document.createElement('span');
    tituloTexto.textContent = 'T bot';
    Object.assign(tituloTexto.style, {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#facc15',
        fontSize: '13px',
        fontWeight: 'bold',
        pointerEvents: 'none'
    });

    const btnMinimizar = document.createElement('button');
    btnMinimizar.textContent = '-';
    btnMinimizar.title = 'Minimizar';
    Object.assign(btnMinimizar.style, {
        background: 'rgba(17, 17, 21, 0.8)',
        border: '1.5px solid #b45309',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fbbf24',
        fontSize: '16px',
        fontWeight: 'bold',
        paddingBottom: '3px'
    });

    barraTitulo.appendChild(miniTHeader);
    barraTitulo.appendChild(tituloTexto);
    barraTitulo.appendChild(btnMinimizar);

    const iconeMinimizado = document.createElement('div');
    iconeMinimizado.title = 'Abrir Bot (Arraste para mover)';
    Object.assign(iconeMinimizado.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '999999',
        width: '46px',
        height: '46px',
        backgroundColor: 'rgba(17, 17, 21, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '2px solid #b45309',
        borderRadius: '50%',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.7)'
    });
    iconeMinimizado.appendChild(criarLetraTArt('26px'));

    let iconeMovendo = false;
    let iconeStartX = 0;
    let iconeStartY = 0;
    let foiArrastado = false;

    iconeMinimizado.addEventListener('mousedown', (e) => {
        iconeMovendo = true;
        foiArrastado = false;
        iconeStartX = e.clientX - iconeMinimizado.getBoundingClientRect().left;
        iconeStartY = e.clientY - iconeMinimizado.getBoundingClientRect().top;
        iconeMinimizado.style.bottom = 'auto';
        iconeMinimizado.style.right = 'auto';
        document.addEventListener('mousemove', onMiniMouseMove);
        document.addEventListener('mouseup', onMiniMouseUp);
    });

    function onMiniMouseMove(e) {
        if (!iconeMovendo) return;
        foiArrastado = true;
        iconeMinimizado.style.left = `${e.clientX - iconeStartX}px`;
        iconeMinimizado.style.top = `${e.clientY - iconeStartY}px`;
    }

    function onMiniMouseUp() {
        iconeMovendo = false;
        document.removeEventListener('mousemove', onMiniMouseMove);
        document.removeEventListener('mouseup', onMiniMouseUp);
    }

    iconeMinimizado.addEventListener('click', () => {
        if (foiArrastado) return;
        containerFlutuante.style.left = `${iconeMinimizado.getBoundingClientRect().left}px`;
        containerFlutuante.style.top = `${iconeMinimizado.getBoundingClientRect().top}px`;
        containerFlutuante.style.bottom = 'auto';
        containerFlutuante.style.right = 'auto';
        iconeMinimizado.style.display = 'none';
        containerFlutuante.style.display = 'flex';
    });

    btnMinimizar.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = containerFlutuante.getBoundingClientRect();
        iconeMinimizado.style.left = `${rect.left}px`;
        iconeMinimizado.style.top = `${rect.top}px`;
        iconeMinimizado.style.bottom = 'auto';
        iconeMinimizado.style.right = 'auto';
        containerFlutuante.style.display = 'none';
        iconeMinimizado.style.display = 'flex';
    });

    document.body.appendChild(iconeMinimizado);

    const barraAbas = document.createElement('div');
    Object.assign(barraAbas.style, {
        display: 'flex',
        backgroundColor: 'rgba(9, 9, 11, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    });

    const btnAbaGeral = document.createElement('button');
    btnAbaGeral.textContent = 'Geral';
    const btnAbaBoss = document.createElement('button');
    btnAbaBoss.textContent = 'Auto Boss';
    const btnAbaLog = document.createElement('button');
    btnAbaLog.textContent = 'Logs';

    const estiloAba = {
        flex: '1',
        padding: '6px 2px',
        background: 'none',
        border: 'none',
        color: '#a1a1aa',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s',
        textAlign: 'center'
    };

    Object.assign(btnAbaGeral.style, estiloAba);
    Object.assign(btnAbaBoss.style, estiloAba);
    Object.assign(btnAbaLog.style, estiloAba);

    function ativarAba(abaSelecionada) {
        btnAbaGeral.style.color = '#71717a'; btnAbaGeral.style.borderBottomColor = 'transparent';
        btnAbaBoss.style.color = '#71717a'; btnAbaBoss.style.borderBottomColor = 'transparent';
        btnAbaLog.style.color = '#71717a'; btnAbaLog.style.borderBottomColor = 'transparent';

        conteudoGeral.style.display = 'none';
        conteudoBoss.style.display = 'none';
        conteudoLog.style.display = 'none';

        if (abaSelecionada === 'geral') {
            btnAbaGeral.style.color = '#facc15';
            btnAbaGeral.style.borderBottomColor = '#facc15';
            conteudoGeral.style.display = 'flex';
        } else if (abaSelecionada === 'boss') {
            btnAbaBoss.style.color = '#facc15';
            btnAbaBoss.style.borderBottomColor = '#facc15';
            conteudoBoss.style.display = 'flex';
        } else if (abaSelecionada === 'log') {
            btnAbaLog.style.color = '#facc15';
            btnAbaLog.style.borderBottomColor = '#facc15';
            conteudoLog.style.display = 'flex';
        }
    }

    btnAbaGeral.addEventListener('click', () => ativarAba('geral'));
    btnAbaBoss.addEventListener('click', () => ativarAba('boss'));
    btnAbaLog.addEventListener('click', () => ativarAba('log'));

    barraAbas.appendChild(btnAbaGeral);
    barraAbas.appendChild(btnAbaBoss);
    barraAbas.appendChild(btnAbaLog);

    const corpoPainel = document.createElement('div');
    corpoPainel.style.padding = '10px';

    const conteudoGeral = document.createElement('div');
    Object.assign(conteudoGeral.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    });

    conteudoGeral.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(18, 18, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 10px;">
            <span style="color: #d4d4d8; font-size: 12px; font-weight: bold;">Auto Venda</span>
            <button id="btn-venda" style="width: 60px; padding: 6px 10px; font-size: 11px; font-weight: bold; color: #fff; border: 1px solid #555; border-radius: 15px; cursor: pointer; background: rgba(58, 58, 58, 0.7);">OFF</button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(18, 18, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 10px;">
            <span style="color: #d4d4d8; font-size: 12px; font-weight: bold;">Stamina</span>
            <button id="btn-stamina" style="width: 60px; padding: 6px 10px; font-size: 11px; font-weight: bold; color: #fff; border: 1px solid #555; border-radius: 15px; cursor: pointer; background: rgba(58, 58, 58, 0.7);">OFF</button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(18, 18, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 10px;">
            <span style="color: #d4d4d8; font-size: 12px; font-weight: bold;">Auto F5</span>
            <button id="btn-autof5" style="width: 60px; padding: 6px 10px; font-size: 11px; font-weight: bold; color: #fff; border: 1px solid #555; border-radius: 15px; cursor: pointer; background: rgba(58, 58, 58, 0.7);">OFF</button>
        </div>

        <div style="background: rgba(18, 18, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 10px; border-radius: 10px; color: #d4d4d8; font-size: 11px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-weight: bold; color: #facc15; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">Configurações Bot</div>
            <label style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #a1a1aa;">Nome Hunt:</span>
                <input type="text" id="input-nome-hunt" value="${nomeHuntDesejada}" style="width: 90px; padding: 4px; background: rgba(9, 9, 11, 0.7); color: #f4f4f5; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 11px; outline: none;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #a1a1aa;">Ir p/ Treino (%):</span>
                <input type="number" id="input-min-stamina" value="${staminaLimiteMinima}" style="width: 45px; padding: 4px; text-align: center; background: rgba(9, 9, 11, 0.7); color: #f4f4f5; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 11px; outline: none;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #a1a1aa;">Voltar Hunt (%):</span>
                <input type="number" id="input-max-stamina" value="${staminaLimiteRetorno}" style="width: 45px; padding: 4px; text-align: center; background: rgba(9, 9, 11, 0.7); color: #f4f4f5; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 11px; outline: none;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #a1a1aa;">Intervalo F5 (min):</span>
                <input type="number" id="input-tempo-f5" value="${tempoF5Minutos}" style="width: 45px; padding: 4px; text-align: center; background: rgba(9, 9, 11, 0.7); color: #f4f4f5; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 11px; outline: none;">
            </label>
            <div style="display: flex; gap: 6px; margin-top: 4px;">
                <button id="btn-teste-treino" style="flex: 1; background: rgba(39, 39, 42, 0.8); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.1); padding: 6px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: bold;">Treino</button>
                <button id="btn-teste-hunt" style="flex: 1; background: rgba(202, 138, 4, 0.9); color: #000; border: none; padding: 6px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: bold;">Hunt</button>
            </div>
        </div>
    `;

    const conteudoBoss = document.createElement('div');
    Object.assign(conteudoBoss.style, {
        display: 'none',
        flexDirection: 'column',
        gap: '8px'
    });

    conteudoBoss.innerHTML = `
        <div style="background: rgba(18, 18, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 10px; border-radius: 10px; color: #d4d4d8; font-size: 11px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-weight: bold; color: #facc15; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">Gerenciador Auto Boss</div>

            <div style="display: flex; gap: 4px;">
                <input type="text" id="input-nome-boss" placeholder="Nome do Boss..." style="flex: 1; padding: 5px; background: rgba(9, 9, 11, 0.7); color: #f4f4f5; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 11px; outline: none;">
                <button id="btn-add-boss" style="background: rgba(46, 93, 50, 0.9); color: #fff; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">+</button>
            </div>

            <div style="color: #facc15; font-size: 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                <span id="contador-bosses-label">Rotação (0 / 40):</span>
            </div>
            <div id="boss-list-container" style="min-height: 90px; max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; background: rgba(9, 9, 11, 0.6); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                <span style="color: #71717a; text-align: center; margin-top: 30px;">Nenhum boss cadastrado</span>
            </div>

            <button id="btn-toggle-autoboss" style="width: 100%; background: rgba(58, 58, 58, 0.7); color: #fff; border: 1px solid #555; padding: 8px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11px; margin-top: 4px;">Auto Boss: OFF</button>
        </div>
    `;

    const conteudoLog = document.createElement('div');
    Object.assign(conteudoLog.style, {
        display: 'none',
        flexDirection: 'column',
        gap: '6px'
    });

    conteudoLog.innerHTML = `
        <div style="background: rgba(18, 18, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 8px; border-radius: 10px; color: #d4d4d8; font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">
                <span style="font-weight: bold; color: #facc15;">Terminal de Logs</span>
                <button id="btn-limpar-logs" style="background: rgba(63, 63, 70, 0.7); color: #d4d4d8; border: none; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 9px;">Limpar</button>
            </div>
            <div id="log-container-box" style="height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; background: rgba(9, 9, 11, 0.85); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); font-family: monospace; font-size: 10px;">
                <span style="color: #71717a;">[Sistema] T Bot iniciado com sucesso.</span>
            </div>
        </div>
    `;

    corpoPainel.appendChild(conteudoGeral);
    corpoPainel.appendChild(conteudoBoss);
    corpoPainel.appendChild(conteudoLog);
    containerFlutuante.appendChild(barraTitulo);
    containerFlutuante.appendChild(barraAbas);
    containerFlutuante.appendChild(corpoPainel);
    document.body.appendChild(containerFlutuante);

    ativarAba('geral');

    window.adicionarLogUI = function(mensagem, tipo = 'info') {
        const box = document.getElementById('log-container-box');
        if (!box) return;

        const agora = new Date();
        const horaFormatada = agora.toTimeString().split(' ')[0];

        let corTexto = '#d4d4d8';
        if (tipo === 'sucesso') corTexto = '#4ade80';
        if (tipo === 'aviso') corTexto = '#fbbf24';
        if (tipo === 'erro') corTexto = '#ef4444';

        const linhaLog = document.createElement('div');
        Object.assign(linhaLog.style, {
            color: corTexto,
            wordBreak: 'break-word',
            lineHeight: '1.2'
        });
        linhaLog.textContent = `[${horaFormatada}] ${mensagem}`;

        box.appendChild(linhaLog);
        box.scrollTop = box.scrollHeight;
    };

    setTimeout(() => {
        const exp = localStorage.getItem('tbot_licenca_expiracao');
        if (exp) {
            window.adicionarLogUI(`Licença ativa até: ${exp}`, 'sucesso');
        } else {
            window.adicionarLogUI(`Licença ativa com sucesso.`, 'sucesso');
        }
    }, 500);

    document.getElementById('btn-limpar-logs').addEventListener('click', () => {
        const box = document.getElementById('log-container-box');
        if (box) {
            box.innerHTML = '<span style="color: #71717a;">[Sistema] Logs limpos.</span>';
            const exp = localStorage.getItem('tbot_licenca_expiracao');
            if (exp) {
                window.adicionarLogUI(`Licença ativa até: ${exp}`, 'sucesso');
            } else {
                window.adicionarLogUI(`Licença ativa com sucesso.`, 'sucesso');
            }
        }
    });

    function salvarListaBoss() {
        if (window.AutoBoss) {
            localStorage.setItem(CHAVE_LOCAL_BOSSES, JSON.stringify(window.AutoBoss.listaBosses));
        }
    }

    function salvarIndiceInicio() {
        if (window.AutoBoss) {
            localStorage.setItem(CHAVE_INDICE_INICIO, window.AutoBoss.indiceInicio);
        }
    }

    function carregarConfiguracoesBoss() {
        const dadosSalvos = localStorage.getItem(CHAVE_LOCAL_BOSSES);
        if (dadosSalvos && window.AutoBoss) {
            try {
                window.AutoBoss.listaBosses = JSON.parse(dadosSalvos);
            } catch (e) {
                console.error('[TBot] Erro ao carregar a lista de bosses:', e);
            }
        }
        const indiceSalvo = localStorage.getItem(CHAVE_INDICE_INICIO);
        if (indiceSalvo !== null && window.AutoBoss) {
            window.AutoBoss.indiceInicio = parseInt(indiceSalvo, 10) || 0;
        }
    }

    function atualizarInterfaceBotaoBoss() {
        const btnToggleBoss = document.getElementById('btn-toggle-autoboss');
        if (!btnToggleBoss) return;

        if (window.AutoBoss && window.AutoBoss.autoBossAtivo) {
            btnToggleBoss.textContent = 'Auto Boss: ON';
            btnToggleBoss.style.backgroundColor = 'rgba(46, 93, 50, 0.85)';
            btnToggleBoss.style.borderColor = '#4ca64c';
        } else {
            btnToggleBoss.textContent = 'Auto Boss: OFF';
            btnToggleBoss.style.backgroundColor = 'rgba(58, 58, 58, 0.7)';
            btnToggleBoss.style.borderColor = '#555';
        }
    }

    function atualizarListaBossUI() {
        const container = document.getElementById('boss-list-container');
        const labelContador = document.getElementById('contador-bosses-label');
        const qtdAtual = window.AutoBoss && window.AutoBoss.listaBosses ? window.AutoBoss.listaBosses.length : 0;

        if (labelContador) {
            labelContador.textContent = `Rotação (${qtdAtual} / 40):`;
            if (qtdAtual >= 40) {
                labelContador.style.color = '#ef4444';
            } else {
                labelContador.style.color = '#facc15';
            }
        }

        if (!window.AutoBoss || !window.AutoBoss.listaBosses || window.AutoBoss.listaBosses.length === 0) {
            container.innerHTML = '<span style="color: #71717a; text-align: center; margin-top: 30px;">Nenhum boss cadastrado</span>';
            return;
        }

        container.innerHTML = '';
        window.AutoBoss.listaBosses.forEach((boss, index) => {
            const item = document.createElement('div');
            const ehOInicio = (index === window.AutoBoss.indiceInicio);

            Object.assign(item.style, {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: ehOInicio ? 'rgba(74, 222, 128, 0.2)' : 'rgba(24, 24, 27, 0.8)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: ehOInicio ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.08)'
            });

            item.innerHTML = `
                <span class="btn-set-inicio" data-index="${index}" title="Clique para definir como ponto de partida" style="color: ${ehOInicio ? '#4ade80' : '#e4e4e7'}; font-weight: ${ehOInicio ? 'bold' : '500'}; cursor: pointer; flex: 1;">
                    ${boss} ${ehOInicio ? ' (Início)' : ''}
                </span>
                <span data-index="${index}" class="btn-del-boss" style="color: #ef4444; cursor: pointer; font-weight: bold; padding: 0 4px;" title="Remover">×</span>
            `;
            container.appendChild(item);
        });

        document.querySelectorAll('.btn-set-inicio').forEach(span => {
            span.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                if (window.AutoBoss) {
                    window.AutoBoss.indiceInicio = idx;
                    salvarIndiceInicio();
                    atualizarListaBossUI();
                    window.adicionarLogUI(`Ponto de partida alterado para o índice [${idx}].`, 'info');
                }
            });
        });

        document.querySelectorAll('.btn-del-boss').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                if (window.AutoBoss && window.AutoBoss.listaBosses) {
                    const removido = window.AutoBoss.listaBosses.splice(idx, 1);
                    if (window.AutoBoss.indiceInicio >= window.AutoBoss.listaBosses.length) {
                        window.AutoBoss.indiceInicio = Math.max(0, window.AutoBoss.listaBosses.length - 1);
                    }
                    window.adicionarLogUI(`Boss removido da rota: ${removido}`, 'aviso');
                }
                salvarListaBoss();
                salvarIndiceInicio();
                atualizarListaBossUI();
            });
        });
    }

    document.getElementById('btn-add-boss').addEventListener('click', () => {
        const input = document.getElementById('input-nome-boss');
        const valorInput = input.value.trim();
        if (!valorInput) return;

        if (!window.AutoBoss.listaBosses) {
            window.AutoBoss.listaBosses = [];
        }

        if (window.AutoBoss.listaBosses.length >= 40) {
            window.adicionarLogUI('Limite máximo de 40 bosses atingido!', 'erro');
            return;
        }

        const nomeBoss = valorInput.toLowerCase();
        if (!window.AutoBoss.listaBosses.includes(nomeBoss)) {
            window.AutoBoss.listaBosses.push(nomeBoss);
            salvarListaBoss();
            atualizarListaBossUI();
            window.adicionarLogUI(`Boss adicionado à rota: ${nomeBoss} (${window.AutoBoss.listaBosses.length}/40)`, 'sucesso');
        }
        input.value = '';
    });

    const btnToggleBoss = document.getElementById('btn-toggle-autoboss');
    btnToggleBoss.addEventListener('click', () => {
        if (window.AutoBoss.autoBossAtivo) {
            window.AutoBoss.desligar();
        } else {
            window.AutoBoss.ligar();
        }
        atualizarInterfaceBotaoBoss();
    });

    setTimeout(() => {
        carregarConfiguracoesBoss();
        atualizarListaBossUI();
        atualizarInterfaceBotaoBoss();
    }, 200);

    document.getElementById('input-nome-hunt').addEventListener('input', (e) => {
        nomeHuntDesejada = e.target.value.trim() || 'Vexclaw';
        localStorage.setItem(CHAVE_NOME_HUNT, nomeHuntDesejada);
    });
    document.getElementById('input-min-stamina').addEventListener('input', (e) => {
        staminaLimiteMinima = parseInt(e.target.value, 10) || 0;
        localStorage.setItem(CHAVE_MIN_STAMINA, staminaLimiteMinima);
    });
    document.getElementById('input-max-stamina').addEventListener('input', (e) => {
        staminaLimiteRetorno = parseInt(e.target.value, 10) || 0;
        localStorage.setItem(CHAVE_MAX_STAMINA, staminaLimiteRetorno);
    });
    document.getElementById('input-tempo-f5').addEventListener('input', (e) => {
        tempoF5Minutos = parseInt(e.target.value, 10) || 30;
        localStorage.setItem(CHAVE_TEMPO_F5, tempoF5Minutos);
        if (autoF5Ligado) {
            reiniciarTemporizadorF5();
        }
    });

    const btnVenda = document.getElementById('btn-venda');
    const btnStamina = document.getElementById('btn-stamina');
    const btnAutoF5 = document.getElementById('btn-autof5');

    function clicarNoBotao(seletor) {
        const botao = document.querySelector(seletor);
        if (botao) {
            botao.click();
            return true;
        }
        return false;
    }

    function clicarConfirmacaoPorTexto(textoBotao) {
        const botoes = document.querySelectorAll('button');
        for (let botao of botoes) {
            if (botao.textContent.trim() === textoBotao) {
                botao.click();
                return true;
            }
        }
        return false;
    }

    function obterIntervaloAleatorio() {
        const variacaoMs = Math.random() * 35000;
        return TEMPO_BASE_VENDA + variacaoMs;
    }

    function agendarProximaVenda() {
        if (!autoVendaLigado) return;
        const proximoTempo = obterIntervaloAleatorio();
        if (intervaloVendaId) clearTimeout(intervaloVendaId);
        intervaloVendaId = setTimeout(() => {
            executarFluxoVenda();
            agendarProximaVenda();
        }, proximoTempo);
    }

    function executarFluxoVenda() {
        if (autoVendaLigado) {
            const primeiroClique = clicarNoBotao('#sell-all');
            if (primeiroClique) {
                window.adicionarLogUI('Auto Venda acionada...', 'info');
                setTimeout(() => {
                    clicarConfirmacaoPorTexto('Vender tudo');
                    window.adicionarLogUI('Itens vendidos com sucesso.', 'sucesso');
                }, TEMPO_ESPERA_CONFIRMACAO);
            }
        }
    }

    function ligarAutoVenda() {
        autoVendaLigado = true;
        localStorage.setItem(CHAVE_AUTO_VENDA, 'true');
        btnVenda.style.backgroundColor = 'rgba(46, 93, 50, 0.85)';
        btnVenda.style.borderColor = '#4ca64c';
        btnVenda.textContent = 'ON';
        window.adicionarLogUI('Auto Venda ativado (Mín: 2:05 + Jitter).', 'sucesso');
        executarFluxoVenda();
        agendarProximaVenda();
    }

    function desligarAutoVenda() {
        autoVendaLigado = false;
        localStorage.setItem(CHAVE_AUTO_VENDA, 'false');
        btnVenda.style.backgroundColor = 'rgba(58, 58, 58, 0.7)';
        btnVenda.style.borderColor = '#555';
        btnVenda.textContent = 'OFF';
        window.adicionarLogUI('Auto Venda desligado.', 'aviso');
        if (intervaloVendaId) {
            clearTimeout(intervaloVendaId);
            intervaloVendaId = null;
        }
    }

    btnVenda.addEventListener('click', () => {
        if (autoVendaLigado) desligarAutoVenda();
        else ligarAutoVenda();
    });

    function dispararF5() {
        window.adicionarLogUI('Executando Auto F5 (Recarregando página)...', 'aviso');
        setTimeout(() => { location.reload(); }, 500);
    }

    function reiniciarTemporizadorF5() {
        if (temporizadorF5Id) {
            clearTimeout(temporizadorF5Id);
            temporizadorF5Id = null;
        }
        if (autoF5Ligado) {
            const ms = tempoF5Minutos * 60 * 1000;
            temporizadorF5Id = setTimeout(dispararF5, ms);
        }
    }

    function verificarTelaManutencao() {
        if (!autoF5Ligado) return;
        const textoManutencao = document.body.innerText.includes('JOGO EM MANUTENÇÃO');
        if (!textoManutencao) {
            window.adicionarLogUI('Servidor voltou / Manutenção encerrada. Desligando Auto F5.', 'sucesso');
            desligarAutoF5();
        }
    }

    function ligarAutoF5() {
        autoF5Ligado = true;
        localStorage.setItem(CHAVE_AUTO_F5, 'true');
        btnAutoF5.style.backgroundColor = 'rgba(46, 93, 50, 0.85)';
        btnAutoF5.style.borderColor = '#4ca64c';
        btnAutoF5.textContent = 'ON';
        window.adicionarLogUI(`Auto F5 ativado (Tempo: ${tempoF5Minutos} min).`, 'sucesso');
        reiniciarTemporizadorF5();

        if (!monitorManutencaoId) {
            monitorManutencaoId = setInterval(verificarTelaManutencao, 3000);
        }
    }

    function desligarAutoF5() {
        autoF5Ligado = false;
        localStorage.setItem(CHAVE_AUTO_F5, 'false');
        btnAutoF5.style.backgroundColor = 'rgba(58, 58, 58, 0.7)';
        btnAutoF5.style.borderColor = '#555';
        btnAutoF5.textContent = 'OFF';
        window.adicionarLogUI('Auto F5 desligado.', 'aviso');
        if (temporizadorF5Id) {
            clearTimeout(temporizadorF5Id);
            temporizadorF5Id = null;
        }
        if (monitorManutencaoId) {
            clearInterval(monitorManutencaoId);
            monitorManutencaoId = null;
        }
    }

    btnAutoF5.addEventListener('click', () => {
        if (autoF5Ligado) desligarAutoF5();
        else ligarAutoF5();
    });

    function lerStaminaAtual() {
        const painelStaminaDOM = document.querySelector('#stamina-panel');
        if (!painelStaminaDOM) return null;
        const match = painelStaminaDOM.textContent.match(/(\d+)%/);
        return match && match[1] ? parseInt(match[1], 10) : null;
    }

    function selecionarHuntDinamica() {
        let inputBusca = null;
        const inputs = document.querySelectorAll('input');
        for (let input of inputs) {
            const placeholder = input.placeholder || '';
            if (placeholder.toLowerCase().includes('buscar') || placeholder.toLowerCase().includes('fase')) {
                inputBusca = input;
                break;
            }
        }

        if (inputBusca) {
            inputBusca.focus();
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(inputBusca, nomeHuntDesejada);
            } else {
                inputBusca.value = nomeHuntDesejada;
            }

            inputBusca.dispatchEvent(new Event('input', { bubbles: true }));
            inputBusca.dispatchEvent(new Event('change', { bubbles: true }));

            setTimeout(() => {
                const elementos = document.querySelectorAll('*');
                let elementoTextoAlvo = null;

                for (let el of elementos) {
                    if (el.children.length === 0 && el.textContent && el.textContent.trim().toLowerCase() === nomeHuntDesejada.toLowerCase()) {
                        elementoTextoAlvo = el;
                        break;
                    }
                }

                if (!elementoTextoAlvo) {
                    for (let el of elementos) {
                        if (el.textContent && el.textContent.trim().toLowerCase().includes(nomeHuntDesejada.toLowerCase())) {
                            elementoTextoAlvo = el;
                            break;
                        }
                    }
                }

                if (elementoTextoAlvo) {
                    elementoTextoAlvo.click();
                    setTimeout(() => {
                        const botoes = document.querySelectorAll('button');
                        for (let btn of botoes) {
                            if (btn.textContent.trim() === 'Caçar') {
                                btn.click();
                                window.adicionarLogUI(`Entrou na hunt: ${nomeHuntDesejada}`, 'sucesso');
                                return;
                            }
                        }
                    }, 600);
                }
            }, 600);
        }
    }

    function executarAcaoStamina(acao) {
        const botaoMenu = document.querySelector('#wave-title');
        if (botaoMenu) {
            botaoMenu.click();
            setTimeout(() => {
                if (acao === 'treinar') {
                    const btnTreino = document.querySelector('button.tp-opt[data-tp="exercise"]');
                    if (btnTreino) {
                        btnTreino.click();
                        window.adicionarLogUI('Indo para o Treinamento (Stamina baixa).', 'aviso');
                    }
                } else if (acao === 'hunt') {
                    const btnHunts = document.querySelector('button.tp-opt[data-tp="hunts"]');
                    if (btnHunts) {
                        btnHunts.click();
                        window.adicionarLogUI('Voltando para a Hunt...', 'aviso');
                        setTimeout(() => { selecionarHuntDinamica(); }, 800);
                    }
                }
            }, 400);
        }
    }

    document.getElementById('btn-teste-treino').addEventListener('click', () => {
        executarAcaoStamina('treinar');
        estadoAtual = 'TREINANDO';
    });

    document.getElementById('btn-teste-hunt').addEventListener('click', () => {
        executarAcaoStamina('hunt');
        estadoAtual = 'CAÇANDO';
    });

    function verificarStaminaCiclo() {
        if (!gerenciadorStaminaLigado) return;

        const staminaAtual = lerStaminaAtual();
        if (staminaAtual === null) return;

        if (staminaAtual >= staminaLimiteRetorno && estadoAtual !== 'CAÇANDO') {
            executarAcaoStamina('hunt');
            estadoAtual = 'CAÇANDO';
        }
        else if (staminaAtual <= staminaLimiteMinima && estadoAtual === 'CAÇANDO') {
            if (window.AutoBoss && window.AutoBoss.autoBossAtivo && window.AutoBoss.listaBosses && window.AutoBoss.listaBosses.length > 0) {
                estadoAtual = 'BOSS';
                window.AutoBoss.iniciar(() => {
                    atualizarInterfaceBotaoBoss();
                    executarAcaoStamina('treinar');
                    estadoAtual = 'TREINANDO';
                });
            } else {
                executarAcaoStamina('treinar');
                estadoAtual = 'TREINANDO';
            }
        }
    }

    function ligarGerenciadorStamina() {
        gerenciadorStaminaLigado = true;
        localStorage.setItem(CHAVE_AUTO_STAMINA, 'true');
        btnStamina.style.backgroundColor = 'rgba(46, 93, 50, 0.85)';
        btnStamina.style.borderColor = '#4ca64c';
        btnStamina.textContent = 'ON';
        window.adicionarLogUI('Gerenciador de Stamina ativado.', 'sucesso');

        const staminaAtual = lerStaminaAtual();
        if (staminaAtual !== null) {
            if (staminaAtual >= staminaLimiteRetorno) estadoAtual = 'TREINANDO';
            else estadoAtual = 'CAÇANDO';
        }

        verificarStaminaCiclo();
        if (!intervaloStaminaId) {
            intervaloStaminaId = setInterval(verificarStaminaCiclo, 10000);
        }
    }

    function desligarGerenciadorStamina() {
        gerenciadorStaminaLigado = false;
        localStorage.setItem(CHAVE_AUTO_STAMINA, 'false');
        btnStamina.style.backgroundColor = 'rgba(58, 58, 58, 0.7)';
        btnStamina.style.borderColor = '#555';
        btnStamina.textContent = 'OFF';
        window.adicionarLogUI('Gerenciador de Stamina desligado.', 'aviso');
        if (intervaloStaminaId) {
            clearInterval(intervaloStaminaId);
            intervaloStaminaId = null;
        }
    }

    btnStamina.addEventListener('click', () => {
        if (gerenciadorStaminaLigado) desligarGerenciadorStamina();
        else ligarGerenciadorStamina();
    });

    setTimeout(() => {
        if (autoVendaLigado) ligarAutoVenda();
        if (gerenciadorStaminaLigado) ligarGerenciadorStamina();
        if (autoF5Ligado) ligarAutoF5();
    }, 1500);


    // ============================================================================
    // --- KILL SWITCH COM SESSÃO ÚNICA & CHECAGEM DE TOKEN VOLÁTIL ---
    // ============================================================================
    setInterval(async () => {
        let chaveAtual = localStorage.getItem('tbot_licenca_chave');
        let sessaoAtual = localStorage.getItem('tbot_sessao_id');

        // Se deletarem a chave do localStorage ou o token volátil sumir, barra imediatamente
        if (!chaveAtual || !tokenExecucaoInterno) {
            alert("Erro de segurança: Token de execução ausente ou revogado. O bot será fechado.");
            localStorage.removeItem('tbot_licenca_chave');
            localStorage.removeItem('tbot_sessao_id');
            localStorage.removeItem('tbot_licenca_expiracao');
            location.reload();
            return;
        }

        try {
            let resposta = await fetch(`${URL_API_GOOGLE}?chave=${encodeURIComponent(chaveAtual)}&sessao=${encodeURIComponent(sessaoAtual)}`, { redirect: 'follow' });
            let texto = await resposta.text();
            let dados = JSON.parse(texto);

            // Verifica se o servidor invalidou ou se o token retornado mudou
            if (dados.status !== "liberado" || dados.tokenExecucao !== tokenExecucaoInterno) {
                alert("Sua chave foi conectada em outro dispositivo/navegador ou o token foi violado. O bot será desativado.");
                localStorage.removeItem('tbot_licenca_chave');
                localStorage.removeItem('tbot_sessao_id');
                localStorage.removeItem('tbot_licenca_expiracao');
                location.reload();
            } else {
                if (dados.expiracao) {
                    localStorage.setItem('tbot_licenca_expiracao', dados.expiracao);
                }
            }
        } catch (e) {}
    }, 20 * 1000); // Verificação a cada 20 segundos

})();
