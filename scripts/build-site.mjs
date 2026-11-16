// Junta a landing page (na raiz) e o app (em /app) numa pasta só: site/
import { cpSync, rmSync, mkdirSync } from 'node:fs'
rmSync('site', { recursive: true, force: true })
mkdirSync('site', { recursive: true })
cpSync('landing', 'site', { recursive: true })
cpSync('dist', 'site/app', { recursive: true })
console.log('Pronto: pasta site/ (landing na raiz, app em /app). Publique essa pasta.')
