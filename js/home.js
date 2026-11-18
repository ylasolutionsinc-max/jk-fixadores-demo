/* Home: faixa de códigos, seletor de telhado, processo, catálogo com lista. */
(function () {
  var C = window.JKCatalogo, M = window.JKMotion || {}, G = !!window.gsap;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  /* ---------- Faixa de códigos (acelera com a rolagem) ---------- */
  var mq = $('mq');
  if (mq) {
    var itens = [['JK301', 'Kit perfil final'], ['JK315', 'Kit emenda perfil H'], ['JK300', 'Kit intermediário U'], ['H2', 'Perfil tubular · 6000 mm'], ['JK400', 'Kit fibromadeira'], ['JK406', 'Ponta broca inox'], ['JK621', 'Mini trilho 300 mm'], ['JK037', 'Suporte kalhetão'], ['JK038', 'Suporte single'], ['JK634', 'J viga 68']];
    var html = itens.map(function (i) { return '<div class="mq__item"><b>' + i[0] + '</b><span>' + i[1] + '</span></div>'; }).join('');
    mq.innerHTML = html + html;
    if (G) {
      var x = 0, vel = 0, larg = 0;
      var medir = function () { larg = mq.scrollWidth / 2; };
      medir(); window.addEventListener('resize', medir);
      var setX = gsap.quickSetter(mq, 'x', 'px');
      if (!M.RM) ScrollTrigger.create({ onUpdate: function (s) { vel = Math.min(Math.abs(s.getVelocity()) / 220, 9); } });
      gsap.ticker.add(function (t, dt) {
        vel *= 0.93;
        x -= (0.045 + vel * 0.12) * dt * (M.RM ? 0.5 : 1);
        if (-x >= larg) x += larg;
        setX(x);
      });
    }
  }

  /* ---------- Hero: profundidade das peças no mouse ---------- */
  if (G && M.FINE && !M.RM) {
    var partes = Array.prototype.map.call(document.querySelectorAll('.hero__part'), function (el) {
      var d = +el.dataset.depth || 20;
      return { d: d, x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' }) };
    });
    document.querySelector('.hero').addEventListener('pointermove', function (e) {
      var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      partes.forEach(function (p) { p.x(nx * p.d); p.y(ny * p.d); });
    });
  }
  if (G) M.quandoPronto && M.quandoPronto(function () {
    gsap.from('.hero__part--a', { y: 80, autoAlpha: 0, rotation: -10, duration: 1.2, ease: M.E_POP, delay: .55 });
    gsap.from('.hero__part--b', { y: -60, autoAlpha: 0, rotation: 6, duration: 1.2, ease: M.E_POP, delay: .7 });
  });

  /* ---------- Seletor de telhado ---------- */
  var list = $('telList'), atual = 0, trocando = false, pendente = null;
  if (list) {
    list.innerHTML = C.TELHADOS.map(function (t, i) {
      return '<button class="tel__tab" role="tab" id="tab-' + t.id + '" aria-selected="' + (i === 0) + '" data-i="' + i + '"><span>' + esc(t.nome) + '</span><span class="mono">' + String(t.kit.length + (t.id === 'solo' || t.id === 'metalico' ? 0 : C.KIT_COMUM.length)).padStart(2, '0') + ' peças</span></button>';
    }).join('');
    var preencher = function (i) {
      var t = C.TELHADOS[i];
      $('telIdx').textContent = 'Tipo ' + (i + 1) + ' de ' + C.TELHADOS.length;
      $('telNome').textContent = t.nome;
      $('telResumo').textContent = t.resumo;
      var kit = t.kit.map(function (k) { return '<li><span class="mono">' + esc(k[0]) + '</span><span>' + esc(k[1]) + '</span></li>'; });
      if (t.id !== 'solo' && t.id !== 'metalico') kit = kit.concat(C.KIT_COMUM.slice(0, 3).map(function (k) { return '<li class="is-comum"><span class="mono">' + esc(k[0]) + '</span><span>' + esc(k[1]) + '</span></li>'; }));
      $('telKit').innerHTML = kit.join('');
      var cta = $('telCta');
      cta.href = 'orcamento.html?telhado=' + t.id;
      cta.innerHTML = (t.id === 'solo' ? 'Falar sobre projeto de solo ' : 'Orçar ' + t.nome.toLowerCase() + ' ') + ARROW;
      $('telFoto').src = C.IMG + t.foto + '.webp'; $('telFoto').alt = 'Instalação JK em ' + t.nome.toLowerCase();
      $('telPeca').src = C.IMG + t.peca + '.webp'; $('telPeca').alt = 'Peça de fixação para ' + t.nome.toLowerCase();
      list.setAttribute('aria-activedescendant', 'tab-' + t.id);
      $('telStage').setAttribute('aria-labelledby', 'tab-' + t.id);
    };
    var escolher = function (i) {
      if (i === atual) return;
      if (trocando) { pendente = i; return; }
      list.querySelectorAll('.tel__tab').forEach(function (b, k) { b.setAttribute('aria-selected', k === i); });
      var btn = list.children[i]; if (btn.scrollIntoView && innerWidth < 900) list.scrollTo({ left: btn.offsetLeft - 16, behavior: 'smooth' });
      atual = i;
      if (!G) { preencher(i); return; }
      trocando = true;
      var img = new Image(); img.src = C.IMG + C.TELHADOS[i].foto + '.webp';
      var tl = gsap.timeline({ onComplete: function () { trocando = false; if (pendente != null) { var p = pendente; pendente = null; escolher(p); } } });
      tl.to('.tel__wipe', { scaleY: 1, transformOrigin: 'bottom', duration: .45, ease: M.E_WIPE })
        .to('#telPeca', { y: 40, autoAlpha: 0, duration: .3, ease: 'power2.in' }, 0)
        .to('.tel__info > *', { y: -12, autoAlpha: 0, duration: .25, stagger: .02, ease: 'power2.in' }, 0)
        .add(function () { preencher(i); })
        .set('.tel__wipe', { transformOrigin: 'top' })
        .fromTo('#telFoto', { scale: 1.12 }, { scale: 1, duration: 1, ease: M.E_OUT })
        .to('.tel__wipe', { scaleY: 0, duration: .55, ease: M.E_WIPE }, '<')
        .fromTo('#telPeca', { y: 70, rotation: -8, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: .8, ease: M.E_POP }, '-=.35')
        .fromTo('.tel__info > *', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55, stagger: .05, ease: M.E_OUT }, '<');
    };
    list.addEventListener('click', function (e) { var b = e.target.closest('.tel__tab'); if (b) escolher(+b.dataset.i); });
    list.addEventListener('keydown', function (e) {
      var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return;
      e.preventDefault(); var n = (atual + d + C.TELHADOS.length) % C.TELHADOS.length; escolher(n); list.children[n].focus();
    });
    preencher(0);
    C.TELHADOS.forEach(function (t) { var im = new Image(); im.src = C.IMG + t.peca + '.webp'; });
  }

  /* ---------- Processo: linha amarela acompanha a rolagem ---------- */
  if (G && $('procFill')) {
    var vertical = innerWidth < 900;
    gsap.to('#procFill', { [vertical ? 'scaleY' : 'scaleX']: 1, ease: 'none', scrollTrigger: { trigger: '#proc', start: 'top 80%', end: vertical ? 'bottom 60%' : 'top 30%', scrub: M.RM ? true : .6 } });
    gsap.from('#proc li', { y: 24, autoAlpha: 0, duration: .8, stagger: .09, ease: M.E_OUT, scrollTrigger: { trigger: '#proc', start: 'top 82%', once: true } });
  }

  /* ---------- Princípios: no toque, a linha acende ao passar pelo centro ---------- */
  if (G && !M.FINE) document.querySelectorAll('.prin__list li').forEach(function (li) {
    ScrollTrigger.create({ trigger: li, start: 'top 58%', end: 'bottom 42%', toggleClass: 'is-on' });
  });

  /* ---------- Catálogo ---------- */
  var tabs = $('catTabs'), ul = $('catList'), q = $('catQ'), grupo = 'perfis';
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  if (tabs && ul) {
    tabs.innerHTML = C.GRUPOS.map(function (g, i) {
      var n = C.PRODUTOS.filter(function (p) { return p.grupo === g[0]; }).length;
      return '<button class="cat__tab" role="tab" aria-selected="' + (i === 0) + '" data-g="' + g[0] + '">' + g[1] + '<small>' + n + '</small></button>';
    }).join('');
    var linha = function (p) {
      var th = p.img ? '<img src="' + C.IMG + p.img + '.webp" alt="" loading="lazy">' : '<span>JK</span>';
      var vars = p.vars.map(function (v) { return (v.codigo ? '<em>' + v.codigo + '</em> ' : '') + esc(v.rotulo); }).join('<i>/</i>');
      return '<li class="cat__row" data-pid="' + p.id + '"' + (p.img ? ' data-img="' + C.IMG + p.img + '.webp"' : '') + '>' +
        '<div class="cat__thumb' + (p.img ? '' : ' cat__thumb--vazio') + '">' + th + '</div>' +
        '<div class="cat__nome"><b>' + esc(p.nome) + '</b><span>' + esc(p.det) + '</span></div>' +
        '<div class="cat__vars">' + vars + '</div>' +
        '<button class="cat__add" data-add="' + p.id + '" aria-label="Adicionar ' + esc(p.nome) + ' à lista"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg><span>Adicionar</span></button></li>';
    };
    var render = function (anima) {
      var termo = norm(q.value.trim());
      var itens = C.PRODUTOS.filter(function (p) {
        if (!termo) return p.grupo === grupo;
        var txt = norm(p.nome + ' ' + p.det + ' ' + p.vars.map(function (v) { return v.rotulo + ' ' + (v.codigo || ''); }).join(' '));
        return termo.split(/\s+/).every(function (t) { return txt.indexOf(t) > -1; });
      });
      ul.innerHTML = itens.map(linha).join('');
      $('catEmpty').hidden = itens.length > 0;
      tabs.querySelectorAll('.cat__tab').forEach(function (b) { b.setAttribute('aria-selected', !termo && b.dataset.g === grupo); });
      if (G && anima) gsap.from(ul.children, { y: 14, autoAlpha: 0, duration: .45, stagger: .03, ease: M.E_OUT });
      if (M.lenis) ScrollTrigger.refresh();
    };
    tabs.addEventListener('click', function (e) { var b = e.target.closest('.cat__tab'); if (!b) return; grupo = b.dataset.g; q.value = ''; render(true); });
    var tq; q.addEventListener('input', function () { clearTimeout(tq); tq = setTimeout(function () { render(false); }, 120); });
    render(false);

    // adicionar à lista
    var toast = $('toast'), tt;
    ul.addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]'); if (!b) return;
      window.JKLista.adicionar(b.dataset.add, 0, 1);
      b.classList.add('is-ok'); b.querySelector('span').textContent = 'Na lista';
      setTimeout(function () { b.classList.remove('is-ok'); b.querySelector('span').textContent = 'Adicionar'; }, 1600);
      var n = window.JKLista.ler().length;
      $('toastTxt').innerHTML = '<b>' + n + '</b> ' + (n === 1 ? 'item' : 'itens') + ' na sua lista';
      toast.classList.add('is-in'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-in'); }, 4200);
    });

    // prévia da peça seguindo o mouse
    var pv = $('catPv');
    if (G && M.FINE && pv) {
      var px = gsap.quickTo(pv, 'x', { duration: .5, ease: 'power3' }), py = gsap.quickTo(pv, 'y', { duration: .5, ease: 'power3' }), dentro = null;
      ul.addEventListener('pointermove', function (e) {
        var row = e.target.closest('.cat__row');
        if (e.target.closest('.cat__add')) row = null;
        if (row && row.dataset.img) {
          if (dentro !== row) { pv.querySelector('img').src = row.dataset.img; dentro = row; gsap.to(pv, { autoAlpha: 1, scale: 1, rotation: -3, duration: .35, ease: M.E_POP, overwrite: 'auto' }); }
          px(e.clientX + 28); py(e.clientY - 110);
        } else if (dentro) { dentro = null; gsap.to(pv, { autoAlpha: 0, scale: .8, rotation: 0, duration: .25, overwrite: 'auto' }); }
      });
      ul.addEventListener('pointerleave', function () { dentro = null; gsap.to(pv, { autoAlpha: 0, scale: .8, duration: .25, overwrite: 'auto' }); });
    }
  }
})();
