// Leve · movimento do site. Sem bibliotecas: só o navegador.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = matchMedia('(pointer: fine)').matches
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]

  // Ano no rodapé
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()))

  // Navegação, barra de progresso e barra de compra no celular
  const nav = $('.nav'), bar = $('.progress'), buy = $('.buybar'), hero = $('.hero'), pricing = $('#precos, #pricing')
  let ticking = false
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight
    if (nav) nav.classList.toggle('scrolled', y > 30)
    if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`
    if (buy && hero) {
      const pr = pricing && pricing.getBoundingClientRect()
      const inPricing = pr && pr.top < innerHeight && pr.bottom > 0
      buy.classList.toggle('show', y > hero.offsetHeight * 0.8 && !inPricing)
    }
    manifesto()
    ticking = false
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll) } }, { passive: true })

  // Manifesto: cada palavra acende conforme a pessoa rola
  const man = $('.manifesto'); let words = []
  if (man) {
    const gold = (man.dataset.gold || '').split('|').filter(Boolean)
    const text = man.textContent.trim().replace(/\s+/g, ' ')
    man.textContent = ''
    text.split(' ').forEach(w => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w
      if (gold.includes(w.replace(/[.,:;]/g, ''))) s.classList.add('g')
      man.append(s, ' ')
    })
    words = $$('.w', man)
  }
  function manifesto() {
    if (!man) return
    const r = man.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3)))
    const n = Math.round(p * words.length)
    words.forEach((w, k) => w.classList.toggle('lit', reduce || k < n))
  }

  // Entradas ao rolar
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return
    e.target.classList.add('in'); io.unobserve(e.target)
    if (e.target.hasAttribute('data-count')) count(e.target)
  }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' })
  $$('[data-reveal], .split-line, [data-count]').forEach(el => io.observe(el))

  // Números que sobem
  function count(el) {
    const end = +el.dataset.count, dur = 1800, t0 = performance.now()
    if (reduce) { el.textContent = end; return }
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(end * e); if (k < 1) requestAnimationFrame(step) }
    requestAnimationFrame(step)
  }

  // Vitrine: o celular troca de tela conforme o capítulo
  const chapters = $$('.chapter'), shots = $$('.show-phone .screen img'), dots = $$('.show-phone .dots i')
  if (chapters.length) {
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return
      const i = chapters.indexOf(e.target)
      chapters.forEach((c, k) => c.classList.toggle('active', k === i))
      shots.forEach((s, k) => s.classList.toggle('on', k === i))
      dots.forEach((d, k) => d.classList.toggle('on', k === i))
    }), { rootMargin: '-45% 0px -45% 0px' })
    chapters.forEach(c => co.observe(c))
  }

  // Celular do topo inclina com o mouse
  const dev = $('.hero .device')
  if (dev && fine && !reduce) {
    addEventListener('mousemove', e => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5
      dev.style.setProperty('--ry', `${-8 + x * 14}deg`); dev.style.setProperty('--rx', `${4 - y * 10}deg`)
    }, { passive: true })
  }
  // Telas do celular do topo se alternam sozinhas
  const heroShots = $$('.hero .screen img')
  if (heroShots.length > 1 && !reduce) {
    let k = 0
    setInterval(() => { heroShots[k].classList.remove('on'); k = (k + 1) % heroShots.length; heroShots[k].classList.add('on') }, 4200)
  }

  // Luz que segue o mouse nos cartões
  if (fine) $$('.cell').forEach(c => c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect()
    c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`)
  }))

  // Botão dourado "magnético"
  if (fine && !reduce) $$('.btn-gold').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)` })
    b.addEventListener('mouseleave', () => { b.style.transform = '' })
  })

  // Perguntas frequentes
  $$('.qa button').forEach(b => b.addEventListener('click', () => {
    const qa = b.closest('.qa'), open = !qa.classList.contains('open')
    qa.classList.toggle('open', open); b.setAttribute('aria-expanded', open)
  }))

  onScroll()
})()

// Cliques medidos (Google Analytics / Meta Pixel, se instalados)
function leveTrack(name, data) {
  try {
    const log = JSON.parse(localStorage.getItem('leve:eventos') || '[]')
    log.push({ name, data, t: Date.now() }); localStorage.setItem('leve:eventos', JSON.stringify(log.slice(-200)))
    if (window.gtag) gtag('event', name, data || {})
    if (window.fbq) fbq('trackCustom', name, data || {})
  } catch (e) {}
}
document.querySelectorAll('[data-track]').forEach(el => el.addEventListener('click', () => {
  leveTrack(el.dataset.track)
  const p = document.getElementById('plano'); if (p && el.dataset.plan) p.value = el.dataset.plan
}))
// Botões de compra apontam para o checkout (repassa utm/afiliado da URL)
function leveCheckout(url) {
  if (!url) return
  document.querySelectorAll('[data-buy]').forEach(a => {
    a.href = url + (location.search ? (url.includes('?') ? '&' : '?') + location.search.slice(1) : '')
    a.target = '_blank'; a.rel = 'noopener'
  })
}
