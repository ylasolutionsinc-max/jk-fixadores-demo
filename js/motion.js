/* Motion compartilhado: preloader, Lenis, cabeçalho, entradas de texto e imagem. */
(function () {
  var doc = document.documentElement;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G = !!window.gsap;
  var M = window.JKMotion = { RM: RM, FINE: FINE, G: G, lenis: null, E_OUT: 'power3.out', E_POP: 'back.out(1.6)', E_WIPE: 'power4.inOut' };
  var prontos = [];
  M.quandoPronto = function (fn) { if (M.pronto) fn(); else prontos.push(fn); };
  function liberar() { M.pronto = true; prontos.splice(0).forEach(function (f) { f(); }); }

  // ---------- cabeçalho ----------
  var hd = document.getElementById('hd'), lastY = 0;
  function onScroll(y) {
    if (!hd) return;
    hd.classList.toggle('is-solid', y > 30 || hd.dataset.solid === '1');
    var desce = y > lastY && y > 320 && !hd.classList.contains('is-open');
    hd.classList.toggle('is-hidden', desce);
    lastY = y;
    var wa = document.getElementById('waFix');
    if (wa) wa.classList.toggle('is-in', y > 520);
  }
  var menuBtn = document.getElementById('menuBtn'), mnav = document.getElementById('mnav');
  if (menuBtn && mnav) {
    var abrir = function (on) {
      hd.classList.toggle('is-open', on); mnav.classList.toggle('is-open', on);
      menuBtn.setAttribute('aria-expanded', on); menuBtn.querySelector('span').textContent = on ? 'Fechar' : 'Menu';
      if (M.lenis) on ? M.lenis.stop() : M.lenis.start();
    };
    menuBtn.addEventListener('click', function () { abrir(!mnav.classList.contains('is-open')); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) abrir(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') abrir(false); });
  }

  // ---------- sem GSAP: site funciona igual, sem animação ----------
  if (!G) {
    var pre0 = document.getElementById('pre'); if (pre0) pre0.classList.add('is-done');
    window.addEventListener('scroll', function () { onScroll(scrollY); }, { passive: true });
    onScroll(scrollY); liberar(); return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.CustomEase) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create('jkOut', '.72,0,.08,1'); CustomEase.create('jkPop', 'M0,0 C0.22,0.9 0.38,1.16 1,1'); CustomEase.create('jkWipe', '.8,0,.18,1');
    M.E_OUT = 'jkOut'; M.E_POP = 'jkPop'; M.E_WIPE = 'jkWipe';
  }

  // ---------- Lenis (desligado em reduced-motion) ----------
  if (!RM && window.Lenis) {
    var lenis = M.lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    lenis.on('scroll', function (e) { ScrollTrigger.update(); onScroll(e.scroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var alvo = a.getAttribute('href'); if (alvo.length < 2) return;
      var el = document.querySelector(alvo); if (!el) return;
      e.preventDefault(); lenis.scrollTo(el, { offset: -70, duration: 1.3 });
    });
  } else {
    window.addEventListener('scroll', function () { onScroll(scrollY); }, { passive: true });
  }
  onScroll(scrollY);

  // ---------- entradas ----------
  function splitIn(el, atraso, imediato) {
    if (!window.SplitText) { gsap.from(el, { y: 30, autoAlpha: 0, duration: .9, ease: M.E_OUT, delay: atraso || 0 }); return; }
    var s = SplitText.create(el, { type: 'words', wordsClass: 'w', mask: 'words' });
    var tw = { yPercent: 110, duration: 1.05, ease: M.E_OUT, stagger: 0.045, delay: atraso || 0 };
    if (!imediato) tw.scrollTrigger = { trigger: el, start: 'top 86%', once: true };
    gsap.from(s.words, tw);
  }
  function riseIn(el, atraso, imediato) {
    var tw = { y: 28, autoAlpha: 0, duration: .9, ease: M.E_OUT, delay: atraso || 0 };
    if (!imediato) tw.scrollTrigger = { trigger: el, start: 'top 90%', once: true };
    gsap.from(el, tw);
  }
  function curtainIn(fig, atraso, imediato) {
    var img = fig.querySelector('img');
    var tl = gsap.timeline({ delay: atraso || 0, scrollTrigger: imediato ? null : { trigger: fig, start: 'top 94%', once: true } });
    tl.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: M.E_WIPE })
      .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: M.E_OUT }, 0);
  }
  M.splitIn = splitIn; M.riseIn = riseIn; M.curtainIn = curtainIn;

  function iniciarEntradas() {
    var heroSel = '.hero, .oh';
    document.querySelectorAll('[data-split]').forEach(function (el) { var h = el.closest(heroSel); splitIn(el, h ? .05 : 0, !!h); });
    var k = 0;
    document.querySelectorAll('[data-rise]').forEach(function (el) { var h = el.closest(heroSel); riseIn(el, h ? .35 + (k++) * .1 : 0, !!h); });
    document.querySelectorAll('[data-curtain]').forEach(function (el) { var h = el.closest(heroSel); curtainIn(el, h ? .15 : 0, !!h); });
    if (!RM) document.querySelectorAll('[data-parallax]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    liberar();
  }

  // ---------- preloader ----------
  var pre = document.getElementById('pre');
  var fontes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var limite = new Promise(function (r) { setTimeout(r, 1500); });
  Promise.race([fontes, limite]).then(function () {
    var visto; try { visto = sessionStorage.getItem('jk-pre'); } catch (e) { visto = '1'; }
    if (!pre || visto) {
      if (pre) pre.classList.add('is-done');
      iniciarEntradas(); return;
    }
    try { sessionStorage.setItem('jk-pre', '1'); } catch (e) {}
    var lj = pre.querySelector('.lj'), lk = pre.querySelector('.lk'), lt = pre.querySelector('.lt');
    gsap.timeline({ onComplete: function () { pre.classList.add('is-done'); } })
      .from(lj, { yPercent: 60, autoAlpha: 0, duration: .6, ease: M.E_OUT })
      .from(lk, { xPercent: 18, autoAlpha: 0, duration: .6, ease: M.E_OUT }, .12)
      .from(lt, { autoAlpha: 0, duration: .4 }, .35)
      .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: .9, ease: M.E_WIPE, onStart: iniciarEntradas }, .85);
  });
})();
