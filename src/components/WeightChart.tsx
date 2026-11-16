import type { WeightLog } from '../types'
import { fmtDate, parseDay } from '../utils'
import { fmtW, t, toW, wUnit } from '../i18n'

export function WeightChart({ logs, goal, height = 200 }: { logs: WeightLog[]; goal?: number; height?: number }) {
  if (logs.length < 2) {
    return <div className="chart-empty">{t('Registre seu peso pelo menos duas vezes para ver o gráfico da sua evolução.', 'Log your weight at least twice to see your progress chart.')}</div>
  }
  const W = 340, H = height, pl = 36, pr = 12, pt = 14, pb = 26
  const xs = logs.map(l => parseDay(l.date).getTime())
  const ys = logs.map(l => toW(l.kg))
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const g = goal ? toW(goal) : undefined
  let minY = Math.min(...ys, g ?? Infinity), maxY = Math.max(...ys)
  const pad = Math.max(1, (maxY - minY) * 0.12); minY -= pad; maxY += pad
  const sx = (x: number) => pl + ((x - minX) / Math.max(1, maxX - minX)) * (W - pl - pr)
  const sy = (y: number) => pt + (1 - (y - minY) / (maxY - minY)) * (H - pt - pb)
  const pts = logs.map(l => [sx(parseDay(l.date).getTime()), sy(toW(l.kg))] as const)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts.at(-1)![0]},${H - pb} L${pts[0][0]},${H - pb} Z`
  const ticks = [maxY - pad, (minY + maxY) / 2, minY + pad]
  const first = logs[0], last = logs.at(-1)!
  const summary = t(`Peso foi de ${fmtW(first.kg)} kg em ${fmtDate(first.date)} para ${fmtW(last.kg)} kg em ${fmtDate(last.date)}.`, `Weight went from ${fmtW(first.kg)} lb on ${fmtDate(first.date)} to ${fmtW(last.kg)} lb on ${fmtDate(last.date)}.`)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={summary}>
      <defs>
        <linearGradient id="wg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity=".28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pl} x2={W - pr} y1={sy(t)} y2={sy(t)} stroke="var(--grid)" />
          <text x={pl - 6} y={sy(t) + 4} textAnchor="end" className="chart-tick">{Math.round(t)}</text>
        </g>
      ))}
      {g && g > minY && g < maxY && (
        <g>
          <line x1={pl} x2={W - pr} y1={sy(g)} y2={sy(g)} stroke="var(--accent)" strokeDasharray="5 5" strokeWidth={1.5} />
          <text x={W - pr} y={sy(g) - 6} textAnchor="end" className="chart-goal">{t('meta', 'goal')} {fmtW(goal!)} {wUnit()}</text>
        </g>
      )}
      <path d={area} fill="url(#wg)" />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 5 : 3} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2.5} />)}
      <text x={pl} y={H - 6} className="chart-tick">{fmtDate(first.date)}</text>
      <text x={W - pr} y={H - 6} textAnchor="end" className="chart-tick">{fmtDate(last.date)}</text>
    </svg>
  )
}
