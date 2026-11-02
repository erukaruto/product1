import { branchName, langByCode } from '../data/school.js'
import { esc, formatDate } from './ui.js'

/** One row of the schedule list. @param {import('../data/school.js').ClassItem} c */
export function classRow(c) {
  const lang = langByCode(c.lang)
  const full = c.seats === 0
  const few = !full && c.seats <= 3
  const seats = full
    ? '<span class="badge badge-bad">Penuh</span>'
    : `<span class="badge ${few ? 'badge-warn' : 'badge-good'}">Sisa ${c.seats} kursi</span>`
  const href = `/pendaftaran.html?bahasa=${c.lang}&level=${encodeURIComponent(c.level)}&kelas=${c.id}&tempat=${c.branch}`
  return `<article class="class-row lang-${c.lang}">
    <div><h3>Bahasa ${lang.name} ${esc(c.level)}</h3><p>${esc(c.program)} · ${c.id}</p></div>
    <div><p><b>${c.days}</b></p><p>${c.time} WIB</p></div>
    <div><p>${branchName(c.branch)}</p><p>Mulai ${formatDate(c.start)} · ${esc(c.teacher.name)}</p></div>
    <div class="row">${seats}<a class="btn btn-sm${full ? '' : ' btn-primary'}" href="${href}" aria-label="${full ? 'Daftar tunggu' : 'Daftar'} kelas ${lang.name} ${esc(c.level)} ${c.days}">${full ? 'Daftar tunggu' : 'Daftar'}</a></div>
  </article>`
}
