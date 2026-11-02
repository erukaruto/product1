/*
  The free online placement test (English, CEFR). Same 15 questions as LinguaDrop's
  tes-penempatan page (src/data/placement.js), so results line up with what visitors answered.
*/
export interface PlacementQuestion {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  section: 'Grammar' | 'Vocabulary' | 'Reading'
  text?: string
  prompt: string
  options: [string, string, string, string]
  answer: number
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  { level: 'A1', section: 'Grammar', prompt: 'She ___ a teacher at a primary school.', options: ['is', 'are', 'am', 'be'], answer: 0 },
  { level: 'A1', section: 'Vocabulary', prompt: 'I always drink a cup of coffee in the ___.', options: ['morning', 'kitchen table', 'shoe', 'window'], answer: 0 },
  { level: 'A1', section: 'Grammar', prompt: 'There ___ two books on the desk.', options: ['is', 'are', 'be', 'has'], answer: 1 },
  { level: 'A2', section: 'Grammar', prompt: 'Yesterday we ___ to the beach with our cousins.', options: ['go', 'goes', 'went', 'gone'], answer: 2 },
  { level: 'A2', section: 'Vocabulary', prompt: 'Could you ___ me the salt, please?', options: ['pass', 'take', 'borrow', 'put'], answer: 0 },
  { level: 'A2', section: 'Reading', text: 'The city library opens at 9 a.m. and closes at 5 p.m. on weekdays. On Saturdays it closes at noon, and on Sundays it is closed.', prompt: 'When does the library close on Saturday?', options: ['At 9 a.m.', 'At 12 p.m.', 'At 5 p.m.', 'It does not open'], answer: 1 },
  { level: 'B1', section: 'Grammar', prompt: 'If it rains tomorrow, we ___ the football match.', options: ['cancel', 'will cancel', 'would cancel', 'cancelled'], answer: 1 },
  { level: 'B1', section: 'Vocabulary', prompt: 'The meeting was ___ because the manager was ill.', options: ['called off', 'called up', 'called out', 'called back'], answer: 0 },
  { level: 'B1', section: 'Grammar', prompt: 'She has lived in Bandung ___ 2019.', options: ['for', 'since', 'from', 'during'], answer: 1 },
  { level: 'B2', section: 'Grammar', prompt: 'I wish I ___ more time to prepare for last year’s exam.', options: ['have', 'had', 'had had', 'would have'], answer: 2 },
  { level: 'B2', section: 'Reading', text: 'Although the new policy was meant to reduce traffic in the city centre, critics argue that it has merely shifted congestion to the neighbouring streets.', prompt: 'What do the critics say about the policy?', options: ['It reduced traffic overall', 'It moved traffic to other streets', 'It was never introduced', 'It improved public transport'], answer: 1 },
  { level: 'B2', section: 'Vocabulary', prompt: 'Her argument was so ___ that nobody in the room could disagree.', options: ['compelling', 'compulsive', 'complacent', 'compliant'], answer: 0 },
  { level: 'C1', section: 'Grammar', prompt: 'Not only ___ late, but he also forgot the documents.', options: ['he arrived', 'did he arrive', 'he did arrive', 'arrived he'], answer: 1 },
  { level: 'C1', section: 'Vocabulary', prompt: 'The new findings ___ doubt on the earlier theory.', options: ['cast', 'threw', 'put', 'gave'], answer: 0 },
  { level: 'C2', section: 'Reading', text: 'The author acknowledges the ambition of the reforms, yet she doubts they will survive their first contact with reality.', prompt: 'The author’s attitude towards the reforms is best described as…', options: ['wholehearted', 'sceptical', 'indifferent', 'hostile'], answer: 1 },
]

/** 0–3 A1, 4–6 A2, 7–9 B1, 10–12 B2, 13–14 C1, 15 C2 */
export function levelFromScore(correct: number) {
  return correct <= 3 ? 'A1' : correct <= 6 ? 'A2' : correct <= 9 ? 'B1' : correct <= 12 ? 'B2' : correct <= 14 ? 'C1' : 'C2'
}
