import { initTabs } from '../tabs.js'
import { classRow } from '../classes.js'
import { openClasses } from '../../data/school.js'
import { $ } from '../ui.js'

initTabs()
const upcoming = openClasses().filter((c) => c.seats > 0).sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 4)
$('[data-upcoming]').innerHTML = upcoming.map(classRow).join('')
