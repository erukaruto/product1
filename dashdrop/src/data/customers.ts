/*
  Demo customers. Generated from a fixed seed, so the list is the same on every load.
  The first five rows are the accounts mentioned in the SaaSDrop landing page and the activity feed.
  Amara Okafor (Fieldnote) is the person quoted on the SaaSDrop home page.
*/
import type { Customer, CustomerStatus, PlanName } from '../types.ts'
import { TODAY } from './metrics.ts'

function seeded(seed: number): () => number {
  return function next() {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = seeded(20261031)
const pick = <T,>(list: T[]): T => list[Math.floor(random() * list.length)]

export const PLANS: Record<PlanName, { price: number; seatPrice: number }> = {
  Starter: { price: 19, seatPrice: 0 },
  Growth: { price: 49, seatPrice: 6 },
  Scale: { price: 129, seatPrice: 9 },
}

export const STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  past_due: 'Past due',
  canceled: 'Canceled',
}

const people = [
  'Grace Liu', 'Amara Okafor', 'Kwabena Owusu', 'Isabel Ferreira', 'Rahul Nair', 'Akiko Mori',
  'Lucia Romano', 'Bilal Chaudhry', 'Hannah Schmidt', 'Noah Fischer', 'Mei Lin', 'Lucas Moreau',
  'Fatima Zahra', 'Oliver Grant', 'Ana Souza', 'Kenji Watanabe', 'Zara Ahmed', 'Mateo Rossi',
  'Chloe Martin', 'Ravi Iyer', 'Ingrid Berg', 'Omar Haddad', 'Hana Kim', 'Felix Wagner',
  'Nia Mensah', 'Arjun Mehta', 'Elif Demir', 'Jonas Lindqvist', 'Leila Karimi', 'Marco Conti',
  'Sofia Novak', 'Kofi Asante', 'Aisha Bello', 'Lars Nilsen', 'Rosa Jiménez', 'Ivan Petrov',
  'Mina Park', 'Diego Herrera', 'Freya Olsen', 'Samir Patel', 'Julia Becker', 'Theo Laurent',
  'Ayesha Siddiqui', 'Pablo Navarro', 'Nora Quinn', 'Hiro Sato', 'Clara Dubois', 'Dewi Lestari',
]

const companies = [
  'Copperline', 'Fieldnote', 'Lumen Works', 'Harbor & Pine', 'Tidewater', 'Quarry Labs',
  'Juniper Studio', 'Kestrel Data', 'Orbital Supply', 'Pinegrove', 'Saltmarsh', 'Redwood Forms',
  'Stonefly', 'Driftwood', 'Ember & Co', 'Ironbark', 'Lantern Health', 'Meridian Tools',
  'Nimbus Desk', 'Oakline', 'Papercraft', 'Quillmate', 'Riverstone', 'Signal Hill',
  'Upland Learning', 'Willow & Wren', 'Yardstick', 'Zephyr Mail', 'Bluefin', 'Cobalt Forms',
  'Dune Studio', 'Evergreen HR', 'Foxglove', 'Granite Pay', 'Hollow Tree', 'Inkwell',
  'Jetty', 'Kiln Collective', 'Loom & Line', 'Mosaic Desk', 'Nettle', 'Outpost',
  'Parcelwise', 'Ridgeback', 'Sparrow Health', 'Thistle', 'Umber', 'Kopi Labs',
]

const countries: Array<[string, string]> = [
  ['US', 'United States'], ['US', 'United States'], ['US', 'United States'], ['GB', 'United Kingdom'],
  ['DE', 'Germany'], ['CA', 'Canada'], ['IN', 'India'], ['ID', 'Indonesia'], ['BR', 'Brazil'],
  ['NL', 'Netherlands'], ['FR', 'France'], ['JP', 'Japan'], ['AU', 'Australia'], ['NG', 'Nigeria'],
  ['ES', 'Spain'], ['SG', 'Singapore'], ['SE', 'Sweden'], ['MX', 'Mexico'],
]

const slug = (text: string) => text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '')
const daysAgo = (days: number) => new Date(TODAY.getTime() - days * 86400000)

interface Preset {
  plan: PlanName
  status: CustomerStatus
  seats: number
  joinedDays?: number
}

// Fixed rows used elsewhere in the demo.
const fixed: Record<string, Preset> = {
  Copperline: { plan: 'Growth', status: 'past_due', seats: 1 },
  Fieldnote: { plan: 'Scale', status: 'active', seats: 12 },
  'Lumen Works': { plan: 'Scale', status: 'active', seats: 5 },
  'Harbor & Pine': { plan: 'Starter', status: 'canceled', seats: 1 },
  Tidewater: { plan: 'Growth', status: 'active', seats: 2, joinedDays: 1 },
}

export const customers: Customer[] = companies.map((company, index) => {
  const name = people[index]
  const [countryCode, country] = index === 47 ? ['ID', 'Indonesia'] : pick(countries)
  const roll = random()
  const preset: Preset | undefined = fixed[company]
  const plan: PlanName = preset?.plan ?? (roll < 0.45 ? 'Starter' : roll < 0.88 ? 'Growth' : 'Scale')
  const statusRoll = random()
  const status: CustomerStatus =
    preset?.status ?? (statusRoll < 0.72 ? 'active' : statusRoll < 0.84 ? 'trial' : statusRoll < 0.93 ? 'past_due' : 'canceled')
  const seats = preset?.seats ?? (plan === 'Starter' ? 1 : 1 + Math.floor(random() * (plan === 'Scale' ? 14 : 6)))
  const { price, seatPrice } = PLANS[plan]
  const listMrr = price + Math.max(0, seats - 1) * seatPrice
  const mrr = status === 'active' || status === 'past_due' ? listMrr : 0
  const joinedDays = preset?.joinedDays ?? 20 + Math.floor(random() * 600)
  const joined = daysAgo(status === 'trial' ? Math.floor(random() * 13) + 1 : joinedDays)
  const lastSeen = daysAgo(company === 'Fieldnote' ? 14 : status === 'canceled' ? 30 + Math.floor(random() * 60) : Math.floor(random() * 6))
  const first = name.split(' ')[0]

  return {
    id: `cus_${1001 + index}`,
    name,
    email: `${slug(first)}@${slug(company)}.example`,
    company,
    plan,
    status,
    seats,
    mrr,
    listMrr,
    country,
    countryCode,
    joined,
    lastSeen,
  }
})

export function getCustomer(id: string | undefined): Customer | undefined {
  return customers.find((customer) => customer.id === id)
}
