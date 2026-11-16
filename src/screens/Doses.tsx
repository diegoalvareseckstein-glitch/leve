import type { Store } from '../store'
import { adherence, buildIcs, dayKey, doseStatus, downloadFile, fmtDate, siteLabel, sortByDate, suggestSite } from '../utils'
import { BodyMap } from '../components/BodyMap'
import { Icon, Ring } from '../components/ui'
import { WEEKDAYS } from '../data'

export function Doses({ store, openDose, toast }: { store: Store; openDose: () => void; toast: (m: string) => void }) {
  const { data, update } = store
  const p = data.profile!
  const doses = sortByDate(data.doses).reverse()
  const st = doseStatus(p, data.doses)
  const adh = adherence(p, data.doses)
  const sug = suggestSite(data.doses)

  async function enableNotifications() {
    if (!('Notification' in window)) return toast('Seu navegador não suporta notificações. Use o lembrete no calendário.')
    const r = await Notification.requestPermission()
    toast(r === 'granted' ? 'Pronto! Vamos avisar quando abrir o app no dia da dose.' : 'Notificações bloqueadas. Use o lembrete no calendário.')
  }

  return (
    <div className="screen">
      <h1>Doses</h1>
      <section className="card dose-summary">
        <Ring value={adh.pct} max={100} size={112} color="var(--accent)">
          <b>{adh.pct}%</b><small>adesão</small>
        </Ring>
        <div>
          <h2>{st.label}</h2>
          <p className="muted">{p.medication} {p.doseLabel} · {p.frequency === 'weekly' ? `toda ${WEEKDAYS[p.doseWeekday]}` : 'todo dia'} às {p.doseTime}</p>
          <p className="muted small">Quem mantém as doses em dia costuma ter resultados melhores. Você registrou {adh.taken} de {adh.expected} doses previstas.</p>
        </div>
      </section>

      <section className="card">
        <h3>Rodízio do local de aplicação</h3>
        <p className="muted small">Trocar de lugar a cada dose evita caroços e irritação na pele. Sugestão de agora: <b>{siteLabel(sug)}</b>.</p>
        <BodyMap suggested={sug} lastUsed={doses[0]?.site} />
        <button className="btn primary block" onClick={openDose}>Registrar dose</button>
      </section>

      <section className="card">
        <h3><Icon name="bell" size={18} /> Lembretes</h3>
        <p className="muted small">O jeito mais confiável é adicionar ao calendário do celular. Ele avisa mesmo com o app fechado.</p>
        <div className="stack">
          <button className="btn secondary block" onClick={() => { downloadFile('lembrete-dose-leve.ics', buildIcs(p, st.next), 'text/calendar'); toast('Abra o arquivo baixado para salvar no calendário.') }}>
            📅 Adicionar lembrete ao calendário
          </button>
          <button className="btn ghost block" onClick={enableNotifications}>Ativar avisos do app</button>
        </div>
      </section>

      <section className="card">
        <h3>Histórico</h3>
        {doses.length === 0 && <p className="muted">Nenhuma dose registrada ainda.</p>}
        <ul className="list">
          {doses.map(d => (
            <li key={d.id}>
              <div>
                <b>{fmtDate(d.date, { weekday: 'short', day: '2-digit', month: 'short' })}</b> · {d.doseLabel}
                <div className="muted small">{siteLabel(d.site)}{d.note ? ` · ${d.note}` : ''}</div>
              </div>
              <button className="icon-btn" aria-label={`Apagar dose de ${fmtDate(d.date)}`}
                onClick={() => update(x => ({ ...x, doses: x.doses.filter(y => y.id !== d.id) }))}><Icon name="trash" size={18} /></button>
            </li>
          ))}
        </ul>
        {doses.length > 0 && <p className="muted small">Começou em {fmtDate(p.startDate, { day: '2-digit', month: 'long', year: 'numeric' })} · hoje {fmtDate(dayKey(), { day: '2-digit', month: 'short' })}</p>}
      </section>
    </div>
  )
}
