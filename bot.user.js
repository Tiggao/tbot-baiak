// ==UserScript==
// @name         T bot - Baiak Idle Protegido
// @namespace    http://tampermonkey.net/
// @version      1.91
// @match        https://*.baiakidle.com/*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    // ============================================================================
    // --- SISTEMA DE LICENCIAMENTO (API DO GOOGLE SHEETS) ---
    // ============================================================================
    const _0x1a2b = "https://script.google.com/macros/s/AKfycbwLth2lN0S26YuZriqkLsBEHBnvM3HY9zBsmGgo8Q2O_9fk7dYjh1qqUjeeG-0CA6uc/exec";

    async function _0x3c4d() {
        let _0x5e6f = localStorage.getItem('tbot_licenca_chave');

        if (!_0x5e6f) {
            _0x5e6f = prompt("Digite sua chave de acesso mensal para o bot:");
            if (!_0x5e6f) {
                alert("Você precisa de uma chave válida para usar o bot.");
                return false;
            }
            localStorage.setItem('tbot_licenca_chave', _0x5e6f);
        }

        try {
            let _0x7a8b = await fetch(`${_0x1a2b}?chave=${encodeURIComponent(_0x5e6f)}`);
            let _0x9c0d = await _0x7a8b.json();

            if (_0x9c0d.status === "liberado") {
                if (_0x9c0d.expiracao) {
                    localStorage.setItem('tbot_licenca_expiracao', _0x9c0d.expiracao);
                }
                return true;
            } else {
                localStorage.removeItem('tbot_licenca_chave');
                localStorage.removeItem('tbot_licenca_expiracao');
                alert("Sua chave é inválida ou a mensalidade venceu! Renove o acesso.");
                return false;
            }
        } catch (_0x1e2f) {
            console.error("Erro ao conectar com o servidor de licenças:", _0x1e2f);
            return false;
        }
    }

    let _0x3a4b = await _0x3c4d();
    if (!_0x3a4b) return;

    console.log("Licença verificada com sucesso! Iniciando o bot...");


    // ============================================================================
    // --- MÓDULO AUTO BOSS (MANTÉM JANELA ABERTA NO COOLDOWN + LOGS) ---
    // ============================================================================
    const _0x5c6d = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const _0x7e8f = 15000;

    window.AutoBoss = window.AutoBoss || {};
    window.AutoBoss.autoBossAtivo = false;
    window.AutoBoss.listaBosses = window.AutoBoss.listaBosses || [];
    window.AutoBoss.executandoEmAndamento = false;
    window.AutoBoss.indiceInicio = 0;

    function _0x9a0b(_0x1c2d, _0x3e4f = 'info') {
        if (typeof window.adicionarLogUI === 'function') {
            window.adicionarLogUI(_0x1c2d, _0x3e4f);
        }
        const _0x5a6b = _0x3e4f === 'sucesso' ? '[Sucesso]' : _0x3e4f === 'aviso' ? '[Aviso]' : _0x3e4f === 'erro' ? '[Erro]' : '[Auto Boss]';
        console.log(`${_0x5a6b} ${_0x1c2d}`);
    }

    async function _0x7c8d() {
        const _0x9e0f = document.querySelector('#wave-title');
        if (_0x9e0f) {
            _0x9e0f.click();
            await _0x5c6d(400);
            return true;
        }
        return false;
    }

    async function _0x1f2a() {
        if (await _0x7c8d()) {
            await _0x5c6d(400);
            const _0x3b4c = document.querySelector('button.tp-opt[data-tp="boss"]');
            if (_0x3b4c) {
                _0x3b4c.click();
                await _0x5c6d(800);
                return true;
            }
        }
        return false;
    }

    async function _0x5d6e() {
        const _0x7f8a = document.querySelector('#boss-modal-close') || document.querySelector('button.im-closebtn[data-i18n*="Fechar"]');
        if (_0x7f8a) {
            _0x7f8a.click();
            await _0x5c6d(400);
            return true;
        }
    }

    function _0x9b0c() {
        const _0x1d2e = document.querySelector('#banner-host');
        if (!_0x1d2e) return false;

        const _0x3f4a = _0x1d2e.innerHTML.trim();
        const _0x5b6c = _0x1d2e.offsetParent !== null;

        if (!_0x5b6c || _0x3f4a === '') {
            return false;
        }

        const _0x7d8e = _0x1d2e.querySelector('.bossbar-plate');
        if (_0x7d8e) {
            const _0x9f0a = _0x7d8e.textContent.trim();
            if (_0x9f0a.startsWith('0 /') || _0x9f0a.includes(' 0%')) {
                return false;
            }
        }

        return true;
    }

    function _0x1b2c() {
        let _0x3d4e = document.querySelector('input.pick-search') || document.querySelector('.boss-pane input[type="text"]') || document.querySelector('input[type="text"]');
        if (!_0x3d4e) {
            const _0x5f6a = document.querySelectorAll('input');
            for (let _0x7b8c of _0x5f6a) {
                const _0x9d0e = (_0x7b8c.placeholder || '').toLowerCase();
                if (_0x9d0e.includes('buscar') || _0x9d0e.includes('fase') || _0x9d0e.includes('boss') || _0x9d0e.includes('pesquisar') || _0x7b8c.classList.contains('pick-search')) {
                    _0x3d4e = _0x7b8c;
                    break;
                }
            }
        }
        return _0x3d4e;
    }

    async function _0x1f3e(_0x5a2b, _0x3c4f) {
        if (!_0x5a2b) return false;

        _0x3c4f.focus();
        _0x3c4f.value = '';
        _0x3c4f.dispatchEvent(new Event('input', { bubbles: true }));

        const _0x7e9a = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (_0x7e9a) {
            _0x7e9a.call(_0x3c4f, _0x5a2b);
        } else {
            _0x3c4f.value = _0x5a2b;
        }

        _0x3c4f.dispatchEvent(new Event('input', { bubbles: true }));
        _0x3c4f.dispatchEvent(new Event('change', { bubbles: true }));
        _0x3c4f.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: _0x5a2b.slice(-1) }));

        await _0x5c6d(800);

        let _0x2b4c = null;
        const _0x4d6e = document.querySelectorAll('.boss-cell');
        for (let _0x6f8a of _0x4d6e) {
            const _0x8a9b = (_0x6f8a.getAttribute('data-tip') || '').toLowerCase();
            const _0x1c3d = (_0x6f8a.textContent || '').toLowerCase();
            if (_0x6f8a.offsetParent !== null && (_0x8a9b.includes(_0x5a2b.toLowerCase()) || _0x1c3d.includes(_0x5a2b.toLowerCase()))) {
                _0x2b4c = _0x6f8a;
                break;
            }
        }

        if (!_0x2b4c) {
            for (let _0x6f8a of _0x4d6e) {
                if (_0x6f8a.offsetParent !== null) {
                    _0x2b4c = _0x6f8a;
                    break;
                }
            }
        }

        if (_0x2b4c) {
            _0x2b4c.click();
            await _0x5c6d(600);
            if (_0x9b0c()) {
                return true;
            }
        }

        _0x9a0b(`Boss em CD ou indisponível: ${_0x5a2b}`, 'aviso');
        return false;
    }

    async function _0x3f5e() {
        const _0x5a7b = Date.now();
        while (window.AutoBoss.autoBossAtivo && (Date.now() - _0x5a7b < _0x7e8f || _0x9b0c())) {
            if (!_0x9b0c()) {
                break;
            }
            await _0x5c6d(1000);
        }
        await _0x5c6d(1000);
    }

    window.AutoBoss.iniciar = async function(_0x7c9b) {
        if (this.executandoEmAndamento) return;

        if (!this.autoBossAtivo || !this.listaBosses || this.listaBosses.length === 0) {
            this.autoBossAtivo = false;
            if (typeof _0x7c9b === 'function') _0x7c9b();
            return;
        }

        if (_0x9b0c()) {
            _0x9a0b('Já em combate ao iniciar. Aguardando término...', 'aviso');
            await _0x3f5e();
        }

        this.executandoEmAndamento = true;

        const _0x9b1c = this.listaBosses.length;
        let _0x1d3f = (typeof this.indiceInicio === 'number' && this.indiceInicio >= 0 && this.indiceInicio < _0x9b1c) ? this.indiceInicio : 0;

        const _0x3e5a = await _0x1f2a();
        if (!_0x3e5a) {
            this.executandoEmAndamento = false;
            this.autoBossAtivo = false;
            if (typeof _0x7c9b === 'function') _0x7c9b();
            return;
        }

        _0x9a0b('Iniciando varredura de rotação de bosses...', 'info');

        for (let _0x5f7b = 0; _0x5f7b < _0x9b1c; _0x5f7b++) {
            if (!this.autoBossAtivo) break;

            if (_0x9b0c()) {
                await _0x3f5e();
                await _0x1f2a();
            }

            const _0x7a9c = _0x1b2c();
            if (!_0x7a9c) {
                _0x9a0b('Input de busca de boss não encontrado.', 'erro');
                break;
            }

            const _0x9c1e = this.listaBosses[_0x1d3f];
            const _0x1e3a = await _0x1f3e(_0x9c1e, _0x7a9c);

            if (_0x1e3a) {
                _0x9a0b(`Em combate ativo com: ${_0x9c1e}`, 'sucesso');

                await _0x5d6e();
                await _0x3f5e();
                _0x9a0b(`Combate finalizado para: ${_0x9c1e}`, 'info');
                await _0x5c6d(1500);

                _0x1d3f = (_0x1d3f + 1) % _0x9b1c;
                this.indiceInicio = _0x1d3f;
                if (typeof salvarIndiceInicio === 'function') salvarIndiceInicio();
                if (typeof atualizarListaBossUI === 'function') atualizarListaBossUI();

                const _0x3a5c = await _0x1f2a();
                if (!_0x3a5c) break;
            } else {
                await _0x5c6d(400);
                _0x1d3f = (_0x1d3f + 1) % _0x9b1c;
                this.indiceInicio = _0x1d3f;
                if (typeof salvarIndiceInicio === 'function') salvarIndiceInicio();
                if (typeof atualizarListaBossUI === 'function') atualizarListaBossUI();
            }
        }

        await _0x5d6e();
        this.executandoEmAndamento = false;
        this.autoBossAtivo = false;

        _0x9a0b('Ciclo de rotação de bosses finalizado.', 'info');

        if (typeof atualizarInterfaceBotaoBoss === 'function') {
            atualizarInterfaceBotaoBoss();
        }

        if (typeof _0x7c9b === 'function') {
            _0x7c9b();
        }
    };

    window.AutoBoss.ligar = function() {
        this.autoBossAtivo = true;
        _0x9a0b('Auto Boss ativado.', 'sucesso');
        this.iniciar();
    };

    window.AutoBoss.desligar = function() {
        this.autoBossAtivo = false;
        this.executandoEmAndamento = false;
        _0x9a0b('Auto Boss desligado.', 'aviso');
        if (typeof atualizarInterfaceBotaoBoss === 'function') {
            atualizarInterfaceBotaoBoss();
        }
    };


    // ============================================================================
    // --- CONFIGURAÇÕES DA AUTO VENDA, PAINEL UI, STAMINA, AUTO F5 E LOGS ---
    // ============================================================================
    const _0x5f8a = (2 * 60 + 5) * 1000;
    const _0x7a9b = 500;

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

    function _0x1e4f(_0x3c5d) {
        const _0x5e7a = document.createElement('span');
        _0x5e7a.textContent = 'T';
        Object.assign(_0x5e7a.style, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: _0x3c5d,
            fontWeight: 'bold',
            color: '#facc15',
            textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
            lineHeight: '1',
            display: 'inline-block',
            verticalAlign: 'middle',
            pointerEvents: 'none'
        });
        return _0x5e7a;
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

    barraTitulo.addEventListener('mousedown', (_0x7b9c) => {
        if (_0x7b9c.target.tagName === 'BUTTON') return;
        estaMovendo = true;
        offsetX = _0x7b9c.clientX - containerFlutuante.getBoundingClientRect().left;
        offsetY = _0x7b9c.clientY - containerFlutuante.getBoundingClientRect().top;
        containerFlutuante.style.bottom = 'auto';
        containerFlutuante.style.right = 'auto';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(_0x9a1c) {
        if (!estaMovendo) return;
        containerFlutuante.style.left = `${_0x9a1c.clientX - offsetX}px`;
        containerFlutuante.style.top = `${_0x9a1c.clientY - offsetY}px`;
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
    miniTHeader.appendChild(_0x1e4f('16px'));

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
    iconeMinimizado.appendChild(_0x1e4f('26px'));

    let iconeMovendo = false;
    let iconeStartX = 0;
    let iconeStartY = 0;
    let foiArrastado = false;

    iconeMinimizado.addEventListener('mousedown', (_0x1c3e) => {
        iconeMovendo = true;
        foiArrastado = false;
        iconeStartX = _0x1c3e.clientX - iconeMinimizado.getBoundingClientRect().left;
        iconeStartY = _0x1c3e.clientY - iconeMinimizado.getBoundingClientRect().top;
        iconeMinimizado.style.bottom = 'auto';
        iconeMinimizado.style.right = 'auto';
        document.addEventListener('mousemove', onMiniMouseMove);
        document.addEventListener('mouseup', onMiniMouseUp);
    });

    function onMiniMouseMove(_0x3d5f) {
        if (!iconeMovendo) return;
        foiArrastado = true;
        iconeMinimizado.style.left = `${_0x3d5f.clientX - iconeStartX}px`;
        iconeMinimizado.style.top = `${_0x3d5f.clientY - iconeStartY}px`;
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

    btnMinimizar.addEventListener('click', (_0x5e2a) => {
        _0x5e2a.stopPropagation();
        const _0x7a3c = containerFlutuante.getBoundingClientRect();
        iconeMinimizado.style.left = `${_0x7a3c.left}px`;
        iconeMinimizado.style.top = `${_0x7a3c.top}px`;
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

    function ativarAba(_0x9b4d) {
        btnAbaGeral.style.color = '#71717a'; btnAbaGeral.style.borderBottomColor = 'transparent';
        btnAbaBoss.style.color = '#71717a'; btnAbaBoss.style.borderBottomColor = 'transparent';
        btnAbaLog.style.color = '#71717a'; btnAbaLog.style.borderBottomColor = 'transparent';

        conteudoGeral.style.display = 'none';
        conteudoBoss.style.display = 'none';
        conteudoLog.style.display = 'none';

        if (_0x9b4d === 'geral') {
            btnAbaGeral.style.color = '#facc15';
            btnAbaGeral.style.borderBottomColor = '#facc15';
            conteudoGeral.style.display = 'flex';
        } else if (_0x9b4d === 'boss') {
            btnAbaBoss.style.color = '#facc15';
            btnAbaBoss.style.borderBottomColor = '#facc15';
            conteudoBoss.style.display = 'flex';
        } else if (_0x9b4d === 'log') {
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

    window.adicionarLogUI = function(_0x2c4d, _0x4e6f = 'info') {
        const _0x6a8b = document.getElementById('log-container-box');
        if (!_0x6a8b) return;

        const _0x8c0d = new Date();
        const _0x1e2f = _0x8c0d.toTimeString().split(' ')[0];

        let _0x3a4b = '#d4d4d8';
        if (_0x4e6f === 'sucesso') _0x3a4b = '#4ade80';
        if (_0x4e6f === 'aviso') _0x3a4b = '#fbbf24';
        if (_0x4e6f === 'erro') _0x3a4b = '#ef4444';

        const _0x5c6d = document.createElement('div');
        Object.assign(_0x5c6d.style, {
            color: _0x3a4b,
            wordBreak: 'break-word',
            lineHeight: '1.2'
        });
        _0x5c6d.textContent = `[${_0x1e2f}] ${_0x2c4d}`;

        _0x6a8b.appendChild(_0x5c6d);
        _0x6a8b.scrollTop = _0x6a8b.scrollHeight;
    };

    setTimeout(() => {
        const _0x7e8f = localStorage.getItem('tbot_licenca_expiracao');
        if (_0x7e8f) {
            window.adicionarLogUI(`Licença ativa até: ${_0x7e8f}`, 'sucesso');
        } else {
            window.adicionarLogUI(`Licença ativa com sucesso.`, 'sucesso');
        }
    }, 500);

    document.getElementById('btn-limpar-logs').addEventListener('click', () => {
        const _0x9a0b = document.getElementById('log-container-box');
        if (_0x9a0b) {
            _0x9a0b.innerHTML = '<span style="color: #71717a;">[Sistema] Logs limpos.</span>';
            const _0x7e8f = localStorage.getItem('tbot_licenca_expiracao');
            if (_0x7e8f) {
                window.adicionarLogUI(`Licença ativa até: ${_0x7e8f}`, 'sucesso');
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
        const _0x1c2d = localStorage.getItem(CHAVE_LOCAL_BOSSES);
        if (_0x1c2d && window.AutoBoss) {
            try {
                window.AutoBoss.listaBosses = JSON.parse(_0x1c2d);
            } catch (_0x3e4f) {
                console.error('[TBot] Erro ao carregar a lista de bosses:', _0x3e4f);
            }
        }
        const _0x5a6b = localStorage.getItem(CHAVE_INDICE_INICIO);
        if (_0x5a6b !== null && window.AutoBoss) {
            window.AutoBoss.indiceInicio = parseInt(_0x5a6b, 10) || 0;
        }
    }

    function atualizarInterfaceBotaoBoss() {
        const _0x7c8d = document.getElementById('btn-toggle-autoboss');
        if (!_0x7c8d) return;

        if (window.AutoBoss && window.AutoBoss.autoBossAtivo) {
            _0x7c8d.textContent = 'Auto Boss: ON';
            _0x7c8d.style.backgroundColor = 'rgba(46, 93, 50, 0.85)';
            _0x7c8d.style.borderColor = '#4ca64c';
        } else {
            _0x7c8d.textContent = 'Auto Boss: OFF';
            _0x7c8d.style.backgroundColor = 'rgba(58, 58, 58, 0.7)';
            _0x7c8d.style.borderColor = '#555';
        }
    }

    function atualizarListaBossUI() {
        const _0x9e0f = document.getElementById('boss-list-container');
        const _0x1f2a = document.getElementById('contador-bosses-label');
        const _0x3b4c = window.AutoBoss && window.AutoBoss.listaBosses ? window.AutoBoss.listaBosses.length : 0;

        if (_0x1f2a) {
            _0x1f2a.textContent = `Rotação (${_0x3b4c} / 40):`;
            if (_0x3b4c >= 40) {
                _0x1f2a.style.color = '#ef4444';
            } else {
                _0x1f2a.style.color = '#facc15';
            }
        }

        if (!window.AutoBoss || !window.AutoBoss.listaBosses || window.AutoBoss.listaBosses.length === 0) {
            _0x9e0f.innerHTML = '<span style="color: #71717a; text-align: center; margin-top: 30px;">Nenhum boss cadastrado</span>';
            return;
        }

        _0x9e0f.innerHTML = '';
        window.AutoBoss.listaBosses.forEach((_0x5d6e, _0x7f8a) => {
            const _0x9b0c = document.createElement('div');
            const _0x1d2e = (_0x7f8a === window.AutoBoss.indiceInicio);

            Object.assign(_0x9b0c.style, {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: _0x1d2e ? 'rgba(74, 222, 128, 0.2)' : 'rgba(24, 24, 27, 0.8)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: _0x1d2e ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.08)'
            });

            _0x9b0c.innerHTML = `
                <span class="btn-set-inicio" data-index="${_0x7f8a}" title="Clique para definir como ponto de partida" style="color: ${_0x1d2e ? '#4ade80' : '#e4e4e7'}; font-weight: ${_0x1d2e ? 'bold' : '500'}; cursor: pointer; flex: 1;">
                    ${_0x5d6e} ${_0x1d2e ? ' (Início)' : ''}
                </span>
                <span data-index="${_0x7f8a}" class="btn-del-boss" style="color: #ef4444; cursor: pointer; font-weight: bold; padding: 0 4px;" title="Remover">×</span>
            `;
            _0x9e0f.appendChild(_0x9b0c);
        });

        document.querySelectorAll('.btn-set-inicio').forEach(_0x3f4a => {
            _0x3f4a.addEventListener('click', (_0x5b6c) => {
                const _0x7d8e = parseInt(_0x5b6c.target.getAttribute('data-index'), 10);
                if (window.AutoBoss) {
                    window.AutoBoss.indiceInicio = _0x7d8e;
                    salvarIndiceInicio();
                    atualizarListaBossUI();
                    window.adicionarLogUI(`Ponto de partida alterado para o índice [${_0x7d8e}].`, 'info');
                }
            });
        });

        document.querySelectorAll('.btn-del-boss').forEach(_0x9f0a => {
            _0x9f0a.addEventListener('click', (_0x5b6c) => {
                const _0x7d8e = parseInt(_0x5b6c.target.getAttribute('data-index'), 10);
                if (window.AutoBoss && window.AutoBoss.listaBosses) {
                    const _0x3d4e = window.AutoBoss.listaBosses.splice(_0x7d8e, 1);
                    if (window.AutoBoss.indiceInicio >= window.AutoBoss.listaBosses.length) {
                        window.AutoBoss.indiceInicio = Math.max(0, window.AutoBoss.listaBosses.length - 1);
                    }
                    window.adicionarLogUI(`Boss removido da rota: ${_0x3d4e}`, 'aviso');
                }
                salvarListaBoss();
                salvarIndiceInicio();
                atualizarListaBossUI();
            });
        });
    }

    document.getElementById('btn-add-boss').addEventListener('click', () => {
        const _0x5f6a = document.getElementById('input-nome-boss');
        const _0x7b8c = _0x5f6a.value.trim();
        if (!_0x7b8c) return;

        if (!window.AutoBoss.listaBosses) {
            window.AutoBoss.listaBosses = [];
        }

        if (window.AutoBoss.listaBosses.length >= 40) {
            window.adicionarLogUI('Limite máximo de 40 bosses atingido!', 'erro');
            return;
        }

        const _0x9d0e = _0x7b8c.toLowerCase();
        if (!window.AutoBoss.listaBosses.includes(_0x9d0e)) {
            window.AutoBoss.listaBosses.push(_0x9d0e);
            salvarListaBoss();
            atualizarListaBossUI();
            window.adicionarLogUI(`Boss adicionado à rota: ${_0x9d0e} (${window.AutoBoss.listaBosses.length}/40)`, 'sucesso');
        }
        _0x5f6a.value = '';
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

    document.getElementById('input-nome-hunt').addEventListener('input', (_0x3d4e) => {
        nomeHuntDesejada = _0x3d4e.target.value.trim() || 'Vexclaw';
        localStorage.setItem(CHAVE_NOME_HUNT, nomeHuntDesejada);
    });
    document.getElementById('input-min-stamina').addEventListener('input', (_0x3d4e) => {
        staminaLimiteMinima = parseInt(_0x3d4e.target.value, 10) || 0;
        localStorage.setItem(CHAVE_MIN_STAMINA, staminaLimiteMinima);
    });
    document.getElementById('input-max-stamina').addEventListener('input', (_0x3d4e) => {
        staminaLimiteRetorno = parseInt(_0x3d4e.target.value, 10) || 0;
        localStorage.setItem(CHAVE_MAX_STAMINA, staminaLimiteRetorno);
    });
    document.getElementById('input-tempo-f5').addEventListener('input', (_0x3d4e) => {
        tempoF5Minutos = parseInt(_0x3d4e.target.value, 10) || 30;
        localStorage.setItem(CHAVE_TEMPO_F5, tempoF5Minutos);
        if (autoF5Ligado) {
            reiniciarTemporizadorF5();
        }
    });

    const btnVenda = document.getElementById('btn-venda');
    const btnStamina = document.getElementById('btn-stamina');
    const btnAutoF5 = document.getElementById('btn-autof5');

    function _0x5f6a(_0x7b8c) {
        const _0x9d0e = document.querySelector(_0x7b8c);
        if (_0x9d0e) {
            _0x9d0e.click();
            return true;
        }
        return false;
    }

    function _0x2b4c(_0x4d6e) {
        const _0x6f8a = document.querySelectorAll('button');
        for (let _0x8a9b of _0x6f8a) {
            if (_0x8a9b.textContent.trim() === _0x4d6e) {
                _0x8a9b.click();
                return true;
            }
        }
        return false;
    }

    function _0x1c3d() {
        const _0x3e4f = Math.random() * 35000;
        return _0x5f8a + _0x3e4f;
    }

    function agendarProximaVenda() {
        if (!autoVendaLigado) return;
        const _0x5a6b = _0x1c3d();
        if (intervaloVendaId) clearTimeout(intervaloVendaId);
        intervaloVendaId = setTimeout(() => {
            executarFluxoVenda();
            agendarProximaVenda();
        }, _0x5a6b);
    }

    function executarFluxoVenda() {
        if (autoVendaLigado) {
            const _0x7c8d = _0x5f6a('#sell-all');
            if (_0x7c8d) {
                window.adicionarLogUI('Auto Venda acionada...', 'info');
                setTimeout(() => {
                    _0x2b4c('Vender tudo');
                    window.adicionarLogUI('Itens vendidos com sucesso.', 'sucesso');
                }, _0x7a9b);
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
            const _0x9e0f = tempoF5Minutos * 60 * 1000;
            temporizadorF5Id = setTimeout(dispararF5, _0x9e0f);
        }
    }

    function verificarTelaManutencao() {
        if (!autoF5Ligado) return;
        const _0x1f2a = document.body.innerText.includes('JOGO EM MANUTENÇÃO');
        if (!_0x1f2a) {
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
        const _0x3b4c = document.querySelector('#stamina-panel');
        if (!_0x3b4c) return null;
        const _0x5d6e = _0x3b4c.textContent.match(/(\d+)%/);
        return _0x5d6e && _0x5d6e[1] ? parseInt(_0x5d6e[1], 10) : null;
    }

    function selecionarHuntDinamica() {
        let _0x7f8a = null;
        const _0x9b0c = document.querySelectorAll('input');
        for (let _0x1d2e of _0x9b0c) {
            const _0x3f4a = _0x1d2e.placeholder || '';
            if (_0x3f4a.toLowerCase().includes('buscar') || _0x3f4a.toLowerCase().includes('fase')) {
                _0x7f8a = _0x1d2e;
                break;
            }
        }

        if (_0x7f8a) {
            _0x7f8a.focus();
            const _0x5b6c = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            if (_0x5b6c) {
                _0x5b6c.call(_0x7f8a, nomeHuntDesejada);
            } else {
                _0x7f8a.value = nomeHuntDesejada;
            }

            _0x7f8a.dispatchEvent(new Event('input', { bubbles: true }));
            _0x7f8a.dispatchEvent(new Event('change', { bubbles: true }));

            setTimeout(() => {
                const _0x7d8e = document.querySelectorAll('*');
                let _0x9f0a = null;

                for (let _0x3d4e of _0x7d8e) {
                    if (_0x3d4e.children.length === 0 && _0x3d4e.textContent && _0x3d4e.textContent.trim().toLowerCase() === nomeHuntDesejada.toLowerCase()) {
                        _0x9f0a = _0x3d4e;
                        break;
                    }
                }

                if (!_0x9f0a) {
                    for (let _0x3d4e of _0x7d8e) {
                        if (_0x3d4e.textContent && _0x3d4e.textContent.trim().toLowerCase().includes(nomeHuntDesejada.toLowerCase())) {
                            _0x9f0a = _0x3d4e;
                            break;
                        }
                    }
                }

                if (_0x9f0a) {
                    _0x9f0a.click();
                    setTimeout(() => {
                        const _0x5f6a = document.querySelectorAll('button');
                        for (let _0x7b8c of _0x5f6a) {
                            if (_0x7b8c.textContent.trim() === 'Caçar') {
                                _0x7b8c.click();
                                window.adicionarLogUI(`Entrou na hunt: ${nomeHuntDesejada}`, 'sucesso');
                                return;
                            }
                        }
                    }, 600);
                }
            }, 600);
        }
    }

    function executarAcaoStamina(_0x9d0e) {
        const _0x1c2d = document.querySelector('#wave-title');
        if (_0x1c2d) {
            _0x1c2d.click();
            setTimeout(() => {
                if (_0x9d0e === 'treinar') {
                    const _0x3e4f = document.querySelector('button.tp-opt[data-tp="exercise"]');
                    if (_0x3e4f) {
                        _0x3e4f.click();
                        window.adicionarLogUI('Indo para o Treinamento (Stamina baixa).', 'aviso');
                    }
                } else if (_0x9d0e === 'hunt') {
                    const _0x5a6b = document.querySelector('button.tp-opt[data-tp="hunts"]');
                    if (_0x5a6b) {
                        _0x5a6b.click();
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

        const _0x7c8d = lerStaminaAtual();
        if (_0x7c8d === null) return;

        if (_0x7c8d >= staminaLimiteRetorno && estadoAtual !== 'CAÇANDO') {
            executarAcaoStamina('hunt');
            estadoAtual = 'CAÇANDO';
        }
        else if (_0x7c8d <= staminaLimiteMinima && estadoAtual === 'CAÇANDO') {
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

        const _0x9e0f = lerStaminaAtual();
        if (_0x9e0f !== null) {
            if (_0x9e0f >= staminaLimiteRetorno) estadoAtual = 'TREINANDO';
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
    // --- KILL SWITCH (Checa a cada 1 min em segundo plano se a licença caiu) ---
    // ============================================================================
    setInterval(async () => {
        let _0x1f2a = localStorage.getItem('tbot_licenca_chave');
        if (!_0x1f2a) return;

        try {
            let _0x3b4c = await fetch(`${_0x1a2b}?chave=${encodeURIComponent(_0x1f2a)}`);
            let _0x5d6e = await _0x3b4c.json();

            if (_0x5d6e.status !== "liberado") {
                alert("Sua assinatura expirou ou foi bloqueada! O bot será desativado.");
                location.reload();
            } else {
                if (_0x5d6e.expiracao) {
                    localStorage.setItem('tbot_licenca_expiracao', _0x5d6e.expiracao);
                }
            }
        } catch (_0x7f8a) {}
    }, 1 * 60 * 1000);

})();
