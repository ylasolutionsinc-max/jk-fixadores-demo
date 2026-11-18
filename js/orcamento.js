/* Página de orçamento: modo projeto (pré-lista estimada) e modo lista (peças do catálogo). */
(function () {
  var C = window.JKCatalogo, R = window.JKRegras, L = window.JKLista, M = window.JKMotion || {}, G = !!window.gsap;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var radio = function (n) { var el = document.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : null; };
  var fmt = function (n) { return String(n).replace('.', ','); };
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>';
  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';

  var st = { modo: 'projeto', linhas: [10], over: {}, ultimo: null, desenhadas: {} };
  var porId = {}; C.PRODUTOS.forEach(function (p) { porId[p.id] = p; });

  /* ---------- Telhados ---------- */
  $('tels').innerHTML = C.TELHADOS.map(function (t) {
    return '<label class="tel-op"><input type="radio" name="tel" value="' + t.id + '">' +
      '<span class="tel-op__img"><img src="' + C.IMG + t.foto + '-p.webp" alt="" loading="lazy"></span>' +
      '<span class="tel-op__t">' + esc(t.nome) + '<span class="tel-op__ck">' + CHECK + '</span></span></label>';
  }).join('');
  var qs = new URLSearchParams(location.search);
  var tPre = qs.get('telhado');
  if (tPre) { var r0 = document.querySelector('input[name="tel"][value="' + CSS.escape(tPre) + '"]'); if (r0) r0.checked = true; }

  /* ---------- UF ---------- */
  $('dUF').insertAdjacentHTML('beforeend', 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').map(function (u) { return '<option>' + u + '</option>'; }).join(''));
  // lembrar dados do cliente neste navegador
  var CAMPOS = ['dNome', 'dEmp', 'dCid', 'dUF', 'dPerfil'];
  try { var mem = JSON.parse(localStorage.getItem('jk-dados') || '{}'); CAMPOS.forEach(function (k) { if (mem[k]) $(k).value = mem[k]; }); } catch (e) {}
  var salvarDados = function () { try { var o = {}; CAMPOS.forEach(function (k) { o[k] = $(k).value; }); localStorage.setItem('jk-dados', JSON.stringify(o)); } catch (e) {} };

  /* ---------- Linhas do arranjo ---------- */
  var MAXP = 60, MAXL = 20;
  function renderLinhas() {
    $('rows').innerHTML = st.linhas.map(function (n, i) {
      return '<li class="arr__row" data-i="' + i + '"><span class="mono">Linha ' + (i + 1) + '</span>' +
        '<div class="step"><button type="button" data-d="-1" aria-label="Menos uma placa na linha ' + (i + 1) + '"' + (n <= 0 ? ' disabled' : '') + '>−</button>' +
        '<input type="number" inputmode="numeric" min="0" max="' + MAXP + '" value="' + n + '" aria-label="Placas na linha ' + (i + 1) + '">' +
        '<button type="button" data-d="1" aria-label="Mais uma placa na linha ' + (i + 1) + '"' + (n >= MAXP ? ' disabled' : '') + '>+</button></div>' +
        '<span class="lbl">placas</span>' +
        '<button type="button" class="arr__del" aria-label="Remover linha ' + (i + 1) + '"' + (st.linhas.length < 2 ? ' hidden' : '') + '>' + TRASH + '</button></li>';
    }).join('');
    $('addRow').hidden = st.linhas.length >= MAXL;
  }
  $('rows').addEventListener('click', function (e) {
    var li = e.target.closest('.arr__row'); if (!li) return; var i = +li.dataset.i;
    var b = e.target.closest('[data-d]');
    if (b) { st.linhas[i] = Math.min(MAXP, Math.max(0, st.linhas[i] + (+b.dataset.d))); st.over = {}; renderLinhas(); atualizar(); li = $('rows').children[i]; li.querySelector('[data-d="' + b.dataset.d + '"]').focus(); return; }
    if (e.target.closest('.arr__del')) {
      st.linhas.splice(i, 1); st.over = {};
      if (G) gsap.to(li, { height: 0, opacity: 0, duration: .25, ease: 'power2.in', onComplete: function () { renderLinhas(); atualizar(); } });
      else { renderLinhas(); atualizar(); }
    }
  });
  $('rows').addEventListener('input', function (e) {
    var li = e.target.closest('.arr__row'); if (!li || e.target.tagName !== 'INPUT') return;
    var v = Math.min(MAXP, Math.max(0, parseInt(e.target.value, 10) || 0));
    st.linhas[+li.dataset.i] = v; st.over = {}; atualizar();
  });
  // ao sair do campo: só normaliza o valor e os botões (recriar a lista no blur derruba o foco e gera erro)
  $('rows').addEventListener('change', function (e) {
    var li = e.target.closest('.arr__row'); if (!li || e.target.tagName !== 'INPUT') return;
    var n = st.linhas[+li.dataset.i]; e.target.value = n;
    li.querySelector('[data-d="-1"]').disabled = n <= 0; li.querySelector('[data-d="1"]').disabled = n >= MAXP;
  });
  $('addRow').addEventListener('click', function () {
    st.linhas.push(st.linhas[st.linhas.length - 1] || 10); st.over = {};
    renderLinhas(); atualizar();
    var li = $('rows').lastElementChild; if (G) gsap.from(li, { y: -10, autoAlpha: 0, duration: .4, ease: M.E_OUT });
    li.querySelector('input').focus();
  });

  /* ---------- Projeto → regras ---------- */
  function projeto() {
    return {
      telhado: radio('tel'),
      linhas: st.linhas.slice(),
      placa: { comp: +$('pComp').value || 2278, larg: +$('pLarg').value || 1134, esp: +radio('esp') },
      orientacao: radio('ori'), perfil: radio('perfil'), barra: +radio('barra'), intermediario: radio('inter'),
      potencia: +$('pPot').value || null, modelo: $('pModelo').value.trim(),
    };
  }
  function nomeTelhado(id) { var t = C.TELHADOS.find(function (x) { return x.id === id; }); return t ? t.nome : ''; }

  /* ---------- Desenho do arranjo (SVG em mm) ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  /* Desenho do arranjo em planta (unidades = mm). Texto, trilho e kits são convertidos
     de px para mm pela largura real do SVG, para ficarem legíveis em qualquer arranjo. */
  function desenhar(p) {
    var svg = $('drawSvg'), linhas = p.linhas.map(function (n) { return n | 0; });
    var ret = p.orientacao !== 'paisagem', meta = p.telhado === 'metalico';
    var pw = ret ? p.placa.larg : p.placa.comp, ph = ret ? p.placa.comp : p.placa.larg;
    var gap = 20, sob = 50;
    var maxN = Math.max.apply(null, linhas.concat([1]));
    var W0 = maxN * pw + (maxN - 1) * gap + 2 * sob;
    var cw = Math.max(280, (svg.parentNode.clientWidth || 640) - 44);
    var padLpx = 14, padRpx = 70, nL = Math.max(linhas.length, 1);
    // escala (mm por px): cabe na largura e também na altura máxima, para o texto nunca encolher
    var maxHpx = Math.max(300, Math.min(480, (window.innerHeight || 800) * .62));
    var fixoHpx = 12 + nL * 30 + (nL - 1) * 26 + 50;
    var u = Math.max(W0 / (cw - padLpx - padRpx), nL * ph / Math.max(120, maxHpx - fixoHpx));
    var fs = 12.5 * u, padR = padRpx * u, labH = 30 * u, rowGap = 26 * u, cotaH = 50 * u;
    var W = cw * u, padL = Math.max(padLpx * u, (W - W0 - padR) / 2);   // centraliza arranjos estreitos
    var H = 12 * u + nL * (labH + ph) + (nL - 1) * rowGap + cotaH;
    svg.setAttribute('viewBox', '0 0 ' + Math.round(W) + ' ' + Math.round(H));
    // kits e trilho em px, mas nunca maiores que uma fração da placa (arranjos densos não viram uma faixa laranja)
    var th = Math.min(4 * u, ph * .045), cl = Math.min(15 * u, ph * .16), cwid = Math.min(7 * u, pw * .1), ns = 'vector-effect="non-scaling-stroke"';
    var h = '<defs>' +
      '<linearGradient id="pnG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#25407F"/><stop offset=".55" stop-color="#162B61"/><stop offset="1" stop-color="#0F2150"/></linearGradient>' +
      '<linearGradient id="pnS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<pattern id="dotG" width="' + (24 * u) + '" height="' + (24 * u) + '" patternUnits="userSpaceOnUse"><circle cx="' + (12 * u) + '" cy="' + (12 * u) + '" r="' + (0.9 * u) + '" fill="#9DB0DE" fill-opacity=".18"/></pattern>' +
      '</defs><rect width="100%" height="100%" fill="url(#dotG)"/>';
    var total = 0, maiorTrilho = 0, novos = [], vistos = {}, yBase = 12 * u, ultimaY = yBase, primeira = null;
    var cells = linhas.reduce(function (a, b) { return a + b; }, 0) <= 120 && pw / u >= 26;   // células só quando a placa tem tamanho para isso
    linhas.forEach(function (n, r) {
      var yl = yBase + r * (labH + ph + rowGap), y = yl + labH, x0 = padL + sob;
      h += '<text class="rl" x="' + padL + '" y="' + (yl + labH * .6) + '" font-size="' + fs + '"><tspan class="rl-b">Linha ' + (r + 1) + '</tspan><tspan dx="' + (6 * u) + '">' + n + (n === 1 ? ' placa' : ' placas') + '</tspan></text>';
      ultimaY = y + ph;
      if (!n) {
        var vw = W0 - 2 * sob;
        h += '<rect class="vz" x="' + x0 + '" y="' + y + '" width="' + vw + '" height="' + ph + '" ' + ns + '/>';
        h += '<text class="rl" x="' + (x0 + vw / 2) + '" y="' + (y + ph / 2 + fs * .35) + '" font-size="' + fs + '" text-anchor="middle">sem placas nesta linha</text>';
        return;
      }
      var len = n * pw + (n - 1) * gap; maiorTrilho = Math.max(maiorTrilho, len + 2 * sob);
      if (!primeira) primeira = { y: y, x: x0 + len };
      for (var i = 0; i < n; i++) {
        var x = x0 + i * (pw + gap), k = r + '-' + i; vistos[k] = 1; if (!st.desenhadas[k]) novos.push(k);
        h += '<g class="pg" data-k="' + k + '"><rect class="pn" x="' + x + '" y="' + y + '" width="' + pw + '" height="' + ph + '" ' + ns + '/>';
        if (cells) {
          var cols = ret ? 6 : 12, rows2 = ret ? 12 : 6, d = '', m = Math.min(pw, ph) * .035;
          for (var c = 1; c < cols; c++) d += 'M' + (x + m + (pw - 2 * m) * c / cols) + ' ' + (y + m) + 'V' + (y + ph - m);
          for (var rr = 1; rr < rows2; rr++) d += 'M' + (x + m) + ' ' + (y + m + (ph - 2 * m) * rr / rows2) + 'H' + (x + pw - m);
          h += '<path class="pn-c" d="' + d + '" ' + ns + '/>';
        }
        h += '<rect class="pn-s" x="' + x + '" y="' + y + '" width="' + pw + '" height="' + ph + '"/></g>';
      }
      [y + ph * .25, y + ph * .75].forEach(function (ty) {
        if (meta) {
          for (var j = 0; j <= n; j++) { var mx = Math.min(Math.max(x0 + j * (pw + gap) - gap / 2, x0), x0 + len); h += '<rect class="mt" x="' + (mx - 150) + '" y="' + (ty - th / 2) + '" width="300" height="' + th + '"/>'; }
        } else h += '<rect class="tr" x="' + (x0 - sob) + '" y="' + (ty - th / 2) + '" width="' + (len + 2 * sob) + '" height="' + th + '"/>';
        h += '<rect class="cf" x="' + (x0 - cwid * .6) + '" y="' + (ty - cl / 2) + '" width="' + cwid + '" height="' + cl + '"/>';
        h += '<rect class="cf" x="' + (x0 + len - cwid * .4) + '" y="' + (ty - cl / 2) + '" width="' + cwid + '" height="' + cl + '"/>';
        for (var j2 = 1; j2 < n; j2++) { var ix = x0 + j2 * (pw + gap) - gap / 2; h += '<rect class="ci" x="' + (ix - cwid / 2) + '" y="' + (ty - cl / 2) + '" width="' + cwid + '" height="' + cl + '"/>'; }
      });
      total += n;
    });
    // cotas: maior trilho embaixo e medida da placa à direita da primeira linha com placas
    if (total) {
      var cy = ultimaY + 20 * u, xa = padL, xb = padL + maiorTrilho, tk = 5 * u;
      h += '<path class="ct" d="M' + xa + ' ' + cy + 'H' + xb + 'M' + xa + ' ' + (cy - tk) + 'V' + (cy + tk) + 'M' + xb + ' ' + (cy - tk) + 'V' + (cy + tk) + '" ' + ns + '/>';
      h += '<text class="ct-t" x="' + ((xa + xb) / 2) + '" y="' + (cy + 19 * u) + '" font-size="' + fs + '" text-anchor="middle">' + (meta ? 'linha ' : 'trilho ') + fmt((maiorTrilho / 1000).toFixed(2)) + ' m</text>';
      var vx = primeira.x + sob + 14 * u;
      h += '<path class="ct" d="M' + vx + ' ' + primeira.y + 'V' + (primeira.y + ph) + 'M' + (vx - tk) + ' ' + primeira.y + 'H' + (vx + tk) + 'M' + (vx - tk) + ' ' + (primeira.y + ph) + 'H' + (vx + tk) + '" ' + ns + '/>';
      h += '<text class="ct-t" x="' + (vx + 8 * u) + '" y="' + (primeira.y + ph / 2 - fs * .15) + '" font-size="' + fs + '">' + ph + '</text>';
      h += '<text class="ct-t ct-u" x="' + (vx + 8 * u) + '" y="' + (primeira.y + ph / 2 + fs * 1.05) + '" font-size="' + (fs * .85) + '">mm</text>';
    }
    svg.innerHTML = h;
    if (G && st.desenhouUmaVez) novos.forEach(function (k) {
      var g = svg.querySelector('[data-k="' + k + '"]'); if (g) gsap.from(g, { scale: .55, opacity: 0, transformOrigin: '50% 50%', duration: .45, ease: M.E_POP });
    });
    st.desenhadas = vistos; st.desenhouUmaVez = true;
    $('drawCap').textContent = total
      ? linhas.filter(Boolean).length + (linhas.filter(Boolean).length === 1 ? ' linha · ' : ' linhas · ') + total + (total === 1 ? ' placa · ' : ' placas · ') + (ret ? 'retrato' : 'paisagem') + (meta ? ' · mini trilho na onda da telha' : ' · maior trilho ' + fmt((maiorTrilho / 1000).toFixed(2)) + ' m')
      : 'Adicione placas para ver o arranjo';
  }

  // o desenho converte px em mm pela largura do SVG: redesenha quando a largura muda
  var rzT, rzW = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      var w = $('drawSvg').parentNode.clientWidth;
      if (w && w !== rzW && st.modo === 'projeto') { rzW = w; desenhar(projeto()); }
    }, 150);
  });

  /* ---------- Resumo ---------- */
  var itensAtuais = [];
  function linhaLista(it) {
    var p = porId[it.pid]; if (!p) return null;
    var v = p.vars[it.vi] || p.vars[0];
    return { k: it.k, codigo: v.codigo || '—', nome: p.nome + (p.vars.length > 1 || v.rotulo !== 'Unidade' ? ' · ' + v.rotulo : ''), qtd: it.qtd };
  }
  function qsHtml(val, lbl) {
    return '<span class="qs"><button type="button" data-q="-1" aria-label="Diminuir ' + esc(lbl) + '">−</button><input type="number" min="0" max="9999" value="' + val + '" aria-label="Quantidade de ' + esc(lbl) + '"><button type="button" data-q="1" aria-label="Aumentar ' + esc(lbl) + '">+</button></span>';
  }
  function atualizar() {
    var body = $('resBody'), extra = L.ler().map(linhaLista).filter(Boolean);
    if (st.modo === 'projeto') {
      var p = projeto(), res = R.calcular(p);
      $('stEstrutura').hidden = p.telhado === 'solo';
      $('fPerfil').hidden = $('fBarra').hidden = p.telhado === 'metalico';
      $('legT').textContent = p.telhado === 'metalico' ? 'Mini trilho' : 'Trilho';
      desenhar(p);
      $('resK').textContent = 'Pré-lista estimada';
      $('resT').textContent = p.telhado ? nomeTelhado(p.telhado) : 'Seu projeto';
      var s = [res.resumo.placas + ' placas', res.resumo.linhas + (res.resumo.linhas === 1 ? ' linha' : ' linhas')];
      if (res.resumo.kwp) s.push(fmt(res.resumo.kwp) + ' kWp');
      $('resStats').textContent = s.join(' · ');
      itensAtuais = res.itens.map(function (i) { var q = st.over[i.id]; return { k: i.id, codigo: i.codigo || '—', nome: i.nome, qtd: q != null ? q : i.qtd, calc: i.qtd }; });
      var vazio = !p.telhado || (!itensAtuais.length && !res.semEstimativa);
      $('resVazio').hidden = !vazio && !res.semEstimativa;
      $('resVazio').textContent = res.semEstimativa ? res.avisos[0] : (!p.telhado ? 'Escolha o telhado e monte o arranjo para ver as peças.' : 'Coloque placas no arranjo para ver as peças.');
      if (res.semEstimativa) $('resVazio').hidden = false;
      $('resTb').hidden = vazio || res.semEstimativa;
      body.innerHTML = itensAtuais.map(function (i) {
        return '<tr data-k="' + i.k + '"' + (i.qtd !== i.calc ? ' class="is-edit"' : '') + '><td>' + esc(i.codigo) + '</td><td>' + esc(i.nome) + '</td><td class="q">' + qsHtml(i.qtd, i.nome) + '</td></tr>';
      }).join('');
      $('resExtra').hidden = !extra.length;
      $('resExtraList').innerHTML = extra.map(function (i) { return '<li><span>' + esc(i.nome) + '</span><b>' + i.qtd + '</b></li>'; }).join('');
      $('resAviso').hidden = false;
      var n = itensAtuais.reduce(function (s2, i) { return s2 + (i.qtd > 0 ? 1 : 0); }, 0) + extra.length;
      $('mbarN').textContent = n; $('mbarT').textContent = n === 1 ? 'item no pedido' : 'itens no pedido';
    } else {
      itensAtuais = extra;
      $('resK').textContent = 'Sua lista';
      $('resT').textContent = 'Peças escolhidas';
      var tot = extra.reduce(function (s3, i) { return s3 + i.qtd; }, 0);
      $('resStats').textContent = extra.length ? extra.length + (extra.length === 1 ? ' item · ' : ' itens · ') + tot + ' unidades' : '';
      $('resVazio').hidden = !!extra.length; $('resVazio').textContent = 'Sua lista está vazia. Adicione peças do catálogo ao lado.';
      $('resTb').hidden = !extra.length;
      body.innerHTML = extra.map(function (i) {
        return '<tr data-k="' + esc(i.k) + '"><td>' + esc(i.codigo) + '</td><td>' + esc(i.nome) + '</td><td class="q">' + qsHtml(i.qtd, i.nome) + '<button type="button" class="rm" aria-label="Remover ' + esc(i.nome) + '">×</button></td></tr>';
      }).join('');
      $('resExtra').hidden = true; $('resAviso').hidden = true;
      $('mbarN').textContent = extra.length; $('mbarT').textContent = extra.length === 1 ? 'item na lista' : 'itens na lista';
    }
  }

  // editar quantidades no resumo
  function setQtd(k, v) {
    v = Math.max(0, Math.min(9999, v | 0));
    if (st.modo === 'projeto') st.over[k] = v; else L.definir(k, v);
    atualizar();
  }
  $('resBody').addEventListener('click', function (e) {
    var tr = e.target.closest('tr'); if (!tr) return; var k = tr.dataset.k;
    var b = e.target.closest('[data-q]');
    if (b) { var atual = +tr.querySelector('input').value || 0; setQtd(k, atual + (+b.dataset.q)); var nb = $('resBody').querySelector('tr[data-k="' + CSS.escape(k) + '"] [data-q="' + b.dataset.q + '"]'); if (nb) nb.focus(); }
    if (e.target.closest('.rm')) L.definir(k, 0);
  });
  $('resBody').addEventListener('change', function (e) { var tr = e.target.closest('tr'); if (tr && e.target.tagName === 'INPUT') setQtd(tr.dataset.k, +e.target.value); });
  document.addEventListener('jk:lista', function () { if (st.modo === 'lista') atualizar(); });

  /* ---------- Modo lista: catálogo ---------- */
  var grupo = 'todos';
  $('lgrp').innerHTML = [['todos', 'Tudo']].concat(C.GRUPOS).map(function (g) { return '<button type="button" data-g="' + g[0] + '" aria-pressed="' + (g[0] === 'todos') + '">' + g[1] + '</button>'; }).join('');
  function renderCat() {
    var t = norm($('lq').value.trim());
    var lista = C.PRODUTOS.filter(function (p) {
      if (grupo !== 'todos' && !t && p.grupo !== grupo) return false;
      if (!t) return true;
      var txt = norm(p.nome + ' ' + p.det + ' ' + p.vars.map(function (v) { return v.rotulo + ' ' + (v.codigo || ''); }).join(' '));
      return t.split(/\s+/).every(function (w) { return txt.indexOf(w) > -1; });
    });
    $('lcat').innerHTML = lista.length ? lista.map(function (p) {
      var opts = p.vars.map(function (v, i) { return '<option value="' + i + '">' + esc(v.rotulo) + (v.codigo ? ' · ' + v.codigo : '') + '</option>'; }).join('');
      return '<li data-pid="' + p.id + '"><span class="th' + (p.img ? '' : ' th--v') + '">' + (p.img ? '<img src="' + C.IMG + p.img + '.webp" alt="" loading="lazy">' : 'JK') + '</span>' +
        '<span><b>' + esc(p.nome) + '</b><span class="det">' + esc(p.det) + '</span></span>' +
        '<select aria-label="Medida ou modelo de ' + esc(p.nome) + '">' + opts + '</select>' +
        '<span class="step"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="number" min="1" max="9999" value="1" aria-label="Quantidade de ' + esc(p.nome) + '"><button type="button" data-d="1" aria-label="Mais">+</button></span>' +
        '<button type="button" class="add">Adicionar</button></li>';
    }).join('') : '<li class="det" style="display:block">Nada encontrado. Descreva a peça nas observações que o vendedor procura para você.</li>';
  }
  $('lgrp').addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (!b) return; grupo = b.dataset.g; $('lq').value = ''; $('lgrp').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); renderCat(); });
  $('lq').addEventListener('input', renderCat);
  $('lcat').addEventListener('click', function (e) {
    var li = e.target.closest('li[data-pid]'); if (!li) return; var inp = li.querySelector('.step input');
    var d = e.target.closest('[data-d]'); if (d) { inp.value = Math.max(1, (+inp.value || 1) + (+d.dataset.d)); return; }
    var add = e.target.closest('.add'); if (!add) return;
    L.adicionar(li.dataset.pid, +li.querySelector('select').value, Math.max(1, +inp.value || 1));
    add.classList.add('is-ok'); add.textContent = 'Adicionado';
    setTimeout(function () { add.classList.remove('is-ok'); add.textContent = 'Adicionar'; }, 1400);
    if (G) { var tr = $('resBody').lastElementChild; if (tr) gsap.from(tr, { backgroundColor: 'rgba(246,180,0,.35)', duration: 1 }); }
  });

  /* ---------- Troca de modo ---------- */
  function modo(m, foco) {
    st.modo = m; $('resOk').textContent = '';
    document.querySelectorAll('.modo').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.modo === m); });
    $('modoProjeto').hidden = m !== 'projeto'; $('modoLista').hidden = m !== 'lista';
    if (m === 'lista') renderCat();
    ['erroTelhado', 'erroArranjo', 'erroLista', 'erroDados'].forEach(function (id) { $(id).hidden = true; });
    atualizar();
    if (G) gsap.from(m === 'projeto' ? '#modoProjeto' : '#modoLista', { y: 16, autoAlpha: 0, duration: .5, ease: M.E_OUT });
    if (foco) history.replaceState(null, '', m === 'lista' ? '#lista' : location.pathname + location.search);
    if (M.lenis && window.ScrollTrigger) ScrollTrigger.refresh();
  }
  document.querySelector('.modos').addEventListener('click', function (e) { var b = e.target.closest('.modo'); if (b) modo(b.dataset.modo, true); });

  /* ---------- Formulário ---------- */
  $('form').addEventListener('input', function (e) {
    if (e.target.closest('#rows') || e.target.closest('#lcat') || e.target.id === 'lq') return;
    if (e.target.closest('#modoProjeto')) st.over = {};
    if (e.target.name === 'tel') $('erroTelhado').hidden = true;
    if (/^d/.test(e.target.id)) { e.target.removeAttribute('aria-invalid'); salvarDados(); }
    atualizar();
  });
  $('form').addEventListener('change', function (e) { if (e.target.name === 'tel') { st.over = {}; atualizar(); } });
  $('form').addEventListener('submit', function (e) { e.preventDefault(); });

  /* ---------- Mensagem e envio ---------- */
  function mensagem() {
    var linhas = ['*Orçamento pelo site · JK Fixadores*', ''];
    var emp = $('dEmp').value.trim();
    linhas.push('*Cliente:* ' + $('dNome').value.trim() + (emp ? ' · ' + emp : ''));
    linhas.push('*Cidade:* ' + $('dCid').value.trim() + '/' + $('dUF').value + ' · ' + $('dPerfil').value);
    linhas.push('');
    var extra = L.ler().map(linhaLista).filter(Boolean);
    if (st.modo === 'projeto') {
      var p = projeto(), res = R.calcular(p), ls = p.linhas.filter(function (n) { return n > 0; });
      linhas.push('*Projeto*');
      linhas.push('Telhado: ' + nomeTelhado(p.telhado));
      linhas.push('Placa: ' + (p.modelo ? p.modelo + ', ' : '') + (p.potencia ? p.potencia + ' W, ' : '') + p.placa.comp + '×' + p.placa.larg + '×' + p.placa.esp + ' mm, ' + p.orientacao);
      linhas.push('Arranjo: ' + ls.length + (ls.length === 1 ? ' linha' : ' linhas') + ' (' + ls.join(' + ') + ') = ' + res.resumo.placas + ' placas' + (res.resumo.kwp ? ' · ' + fmt(res.resumo.kwp) + ' kWp' : ''));
      if (p.telhado !== 'solo') linhas.push('Estrutura: ' + (p.telhado === 'metalico' ? 'mini trilho' : 'perfil ' + ({ H: 'H', H2: 'H2', H2R: 'H2 reforçado', LIGHT: 'Light' })[p.perfil] + ', barra ' + p.barra + ' mm') + ', intermediário ' + (p.intermediario === 'U' ? 'U' : 'reto'));
      if (itensAtuais.length) {
        linhas.push(''); linhas.push('*Pré-lista estimada* (conferir no sistema)');
        itensAtuais.forEach(function (i) { if (i.qtd > 0) linhas.push('• ' + (i.codigo !== '—' ? i.codigo + ' ' : '') + i.nome + ': ' + i.qtd + (i.qtd !== i.calc ? ' (ajustado pelo cliente)' : '')); });
      }
      if (extra.length) { linhas.push(''); linhas.push('*Itens avulsos*'); extra.forEach(function (i) { linhas.push('• ' + (i.codigo !== '—' ? i.codigo + ' ' : '') + i.nome + ': ' + i.qtd); }); }
    } else {
      linhas.push('*Lista de peças*');
      extra.forEach(function (i) { linhas.push('• ' + (i.codigo !== '—' ? i.codigo + ' ' : '') + i.nome + ': ' + i.qtd); });
    }
    var obs = $('dObs').value.trim();
    if (obs) { linhas.push(''); linhas.push('*Observações:* ' + obs); }
    return linhas.join('\n');
  }
  function validar() {
    var erros = [];
    var marca = function (id, ok) { if (ok) $(id).removeAttribute('aria-invalid'); else { $(id).setAttribute('aria-invalid', 'true'); erros.push($(id)); } };
    if (st.modo === 'projeto') {
      var p = projeto(), placas = p.linhas.reduce(function (s, n) { return s + n; }, 0);
      $('erroTelhado').hidden = !!p.telhado; if (!p.telhado) erros.push(document.querySelector('input[name="tel"]'));
      $('erroArranjo').hidden = placas > 0; if (!placas) erros.push($('rows').querySelector('input'));
    } else {
      var vazia = !L.ler().length; $('erroLista').hidden = !vazia; if (vazia) erros.push($('lq'));
    }
    marca('dNome', $('dNome').value.trim()); marca('dCid', $('dCid').value.trim()); marca('dUF', $('dUF').value);
    $('erroDados').hidden = !!($('dNome').value.trim() && $('dCid').value.trim() && $('dUF').value);
    if (erros.length) {
      var alvo = erros[0];
      if (M.lenis) M.lenis.scrollTo(alvo.closest('fieldset') || alvo, { offset: -100, duration: .9 }); else (alvo.closest('fieldset') || alvo).scrollIntoView({ behavior: M.RM ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { alvo.focus({ preventScroll: true }); }, 500);
      $('resOk').textContent = 'Falta preencher alguns campos.';
      return false;
    }
    return true;
  }
  $('send').addEventListener('click', function () {
    if (!validar()) return;
    var url = 'https://wa.me/' + C.CONTATO.whatsapp + '?text=' + encodeURIComponent(mensagem());
    window.open(url, '_blank', 'noopener');
    try { if (window.fbq) fbq('track', 'Lead', { content_name: st.modo === 'projeto' ? 'orcamento-projeto' : 'orcamento-lista' }); } catch (e) {}
    $('resOk').textContent = 'Abrimos o WhatsApp com o pedido pronto. É só enviar.';
  });
  $('copy').addEventListener('click', function () {
    var txt = mensagem().replace(/\*/g, '');
    var ok = function () { $('resOk').textContent = 'Texto copiado.'; };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, function () { $('resOk').textContent = 'Não deu para copiar neste navegador.'; });
    else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} ta.remove(); }
  });
  $('print').addEventListener('click', function () { window.print(); });

  /* ---------- Barra do celular ---------- */
  var mbar = $('mbar');
  if ('IntersectionObserver' in window) {
    var vis = false, scrolled = false;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; mbar.classList.toggle('is-in', !vis && scrolled); }, { threshold: 0.05 }).observe($('resumo'));
    window.addEventListener('scroll', function () { scrolled = scrollY > 300; mbar.classList.toggle('is-in', !vis && scrolled); }, { passive: true });
  }

  /* ---------- Início ---------- */
  renderLinhas();
  modo(location.hash === '#lista' ? 'lista' : 'projeto');
})();
