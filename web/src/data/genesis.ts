// SAMPLE CONTENT — the genesis set (PRD §5.3) and a few sample "organic" entries for demo mode.
// Every text, address and reaction count here is written for the demo and must be confirmed or
// replaced before launch. Hashes, totals and stats are computed from these rows in src/lib/chain.ts.

export type Category = 0 | 1 | 2 | 3 | 4

export const CATEGORIES: { id: Category; name: string; plural: string }[] = [
  { id: 0, name: 'Wish', plural: 'Wishes' },
  { id: 1, name: 'Message', plural: 'Messages' },
  { id: 2, name: 'Memorial', plural: 'Memorials' },
  { id: 3, name: 'Declaration', plural: 'Declarations' },
  { id: 4, name: 'Prediction', plural: 'Predictions' },
]

export const REACTIONS = [
  { code: 0, name: 'Witnessed' },
  { code: 1, name: 'Starred' },
  { code: 2, name: 'A candle' },
  { code: 3, name: 'Love' },
] as const

const A = {
  guild: '0x3f1c8d2a6b0e47c5a9d1f2e3b4c5d6e7f8a99b2e',
  ada: '0x7a2e91c4d5b3f6a8e0c1d2b3a4f5e6d7c8b90c41',
  tunde: '0xb41d7e2f9a3c5d6e8f0a1b2c3d4e5f6a7b8c2f07',
  mira: '0x09e4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f85d13',
  kofi: '0x5c7a2b9e8d1f3a4c6e0b2d4f6a8c0e2b4d6f71a8',
  lena: '0xe2b0f9a8c7d6e5f4a3b2c1d0e9f8a7b6c5d43e66',
  sam: '0x2d8f1e0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c0b95',
  noor: '0xa6c3e5f7092b4d6f8a1c3e5f7b9d0a2c4e6f2c50',
  ife: '0x14f2a6e8c0b2d4f6a8c0e2b4d6f8a0c2e4b6d9e3',
  jun: '0xc9b7a5e3f1d0c8b6a4e2f0d9c7b5a3e1f0d8a4c2',
  rosa: '0x6e1a3c5e7f9b0d2f4a6c8e0b2d4f6a8c0e2b51f8',
  pablo: '0x8b5d3f1e9c7a5e3c1f0d8b6a4e2c0f9d7b5e0a67',
} as const

type Seed = {
  author: string
  category: Category
  text: string
  reactions: [number, number, number, number]
}

// Posted one per minute at deploy, 21 Oct 2026 from 18:00 UTC.
export const GENESIS_START = Date.UTC(2026, 9, 21, 18, 0, 0)

export const GENESIS: Seed[] = [
  { author: A.guild, category: 1, text: 'This is the first entry on Stella. Everything after it is linked to it by hash, and nothing after it can be taken back.', reactions: [41, 12, 0, 6] },
  { author: A.ada, category: 0, text: "That my mother's garden still has tomatoes in it when I'm old enough to grow my own.", reactions: [9, 22, 0, 31] },
  { author: A.guild, category: 3, text: 'We, the BOT Chain Builders Guild, will publish every grant decision we make, with reasons, on this board. Hold us to it.', reactions: [38, 17, 0, 4] },
  { author: A.mira, category: 2, text: 'Kemi Adeyemi, 1941–2026. Taught three generations of Ibadan to read. Every word here is for you.', reactions: [27, 3, 44, 19] },
  { author: A.tunde, category: 4, text: 'Before the end of 2027, a nurse in Lagos will open a savings account on-chain without knowing it was on-chain.', reactions: [14, 8, 0, 2] },
  { author: A.kofi, category: 1, text: 'I was here, on the first night the board went live. Hello to whoever reads this in 2060.', reactions: [33, 15, 0, 12] },
  { author: A.lena, category: 0, text: 'I wish for one quiet year. No moves, no new jobs, no emergencies. Just the same window every morning.', reactions: [6, 14, 0, 21] },
  { author: A.sam, category: 3, text: 'I will run the Accra half marathon in under two hours by March 2027. Writing it here so I cannot pretend I never said it.', reactions: [11, 19, 0, 7] },
  { author: A.noor, category: 1, text: 'To my daughter Amira, born 3:12 this morning: you were 3.1 kg and furious about it. This is the first thing anyone wrote about you.', reactions: [18, 26, 0, 52] },
  { author: A.ife, category: 4, text: 'The 2030 World Cup final will be decided on penalties. I am putting my name to it now.', reactions: [7, 4, 0, 1] },
  { author: A.jun, category: 2, text: 'For Biscuit, the dog who walked me to school for eleven years and waited at the gate every afternoon.', reactions: [12, 2, 29, 24] },
  { author: A.rosa, category: 0, text: 'That the clinic in my grandmother\'s village gets a doctor who stays longer than six months.', reactions: [10, 13, 0, 9] },
  { author: A.pablo, category: 1, text: 'If you are reading this and you are scared about something tomorrow: you have done harder things than this. Go to sleep.', reactions: [15, 21, 0, 34] },
  { author: A.ada, category: 3, text: 'I am going to finish my degree. Night classes, two more years. Entry #14 on the board is my proof I started.', reactions: [9, 16, 0, 13] },
  { author: A.tunde, category: 4, text: 'By 2028 more people in Nigeria will hold a stablecoin than a credit card.', reactions: [8, 5, 0, 1] },
  { author: A.mira, category: 0, text: 'I wish my brother would call. He knows the number. It has not changed in nine years.', reactions: [7, 4, 6, 25] },
  { author: A.kofi, category: 3, text: 'I am leaving the job I hate on 1 December. If I am still there on the 2nd, this entry will say so forever.', reactions: [13, 18, 0, 8] },
  { author: A.lena, category: 1, text: 'Dear future me: you were right to sell the car and keep the piano.', reactions: [5, 11, 0, 14] },
  { author: A.sam, category: 2, text: 'Grandpa Osei, who fixed every radio in Kumasi and never once charged a child. The workshop is still open.', reactions: [9, 1, 21, 11] },
  { author: A.noor, category: 0, text: 'That Amira grows up somewhere she never has to explain where she is from before she says her name.', reactions: [8, 12, 0, 27] },
  { author: A.ife, category: 1, text: 'We met on the 47 bus on 9 February 2019. She was reading the book I was about to buy. Still married, still arguing about the ending.', reactions: [14, 20, 0, 38] },
  { author: A.jun, category: 4, text: 'The next big social network will be one nobody owns. This board is a small rehearsal for it.', reactions: [12, 9, 0, 3] },
  { author: A.rosa, category: 3, text: 'I forgive my father. I am not writing it to him. I am writing it so it is done.', reactions: [16, 6, 3, 30] },
  { author: A.pablo, category: 0, text: 'One more summer at the lake with all four of us, before the kids decide they are too old for it.', reactions: [4, 10, 0, 17] },
  { author: A.guild, category: 1, text: 'Genesis set ends at entry #30. Everything after that was written by whoever showed up. Welcome.', reactions: [22, 9, 0, 3] },
  { author: A.ada, category: 1, text: 'Ten minutes on this board and I have already read three things that made me put my phone down for a while.', reactions: [6, 7, 0, 9] },
  { author: A.tunde, category: 2, text: 'For the 2,000 people who lost their homes to the Maiduguri flood in 2024. Some of you are still waiting.', reactions: [19, 2, 33, 10] },
  { author: A.mira, category: 4, text: 'Somebody will read this board out loud at a wedding before 2030.', reactions: [10, 14, 0, 12] },
  { author: A.kofi, category: 0, text: 'That my mother sees the sea once. She is 64 and has lived three hours from it her whole life.', reactions: [7, 18, 0, 29] },
  { author: A.lena, category: 3, text: 'I am learning Yoruba so I can talk to my mother-in-law without my husband translating. Starting today.', reactions: [8, 13, 0, 16] },
]

// Sample organic entries, timestamped relative to page load (minutes ago) so "Posted today" is live.
export const ORGANIC: (Seed & { minutesAgo: number })[] = [
  { minutesAgo: 60 * 24 * 6 + 40, author: A.sam, category: 1, text: 'Week one of training. 8 km today. Entry #8 is watching me.', reactions: [6, 9, 0, 4] },
  { minutesAgo: 60 * 24 * 5 + 300, author: A.ife, category: 0, text: 'That the rain holds off for my sister\'s wedding on Saturday. Just one dry afternoon.', reactions: [3, 8, 0, 11] },
  { minutesAgo: 60 * 24 * 4 + 120, author: A.noor, category: 2, text: 'For Nana Afia, who held every baby in our family first. She would have held Amira too.', reactions: [5, 0, 17, 12] },
  { minutesAgo: 60 * 24 * 3 + 500, author: A.jun, category: 3, text: 'Our studio will pay every intern. Published here so it outlives the next budget meeting.', reactions: [11, 7, 0, 2] },
  { minutesAgo: 60 * 24 * 2 + 30, author: A.kofi, category: 4, text: 'Ghana qualifies for the next World Cup and scores in its first match. Screenshot this.', reactions: [4, 6, 0, 1] },
  { minutesAgo: 60 * 24 + 200, author: A.rosa, category: 1, text: 'To the stranger who paid for my bread at the shop on Allen Avenue: I am paying it forward every Friday until December.', reactions: [7, 12, 0, 15] },
  { minutesAgo: 60 * 9, author: A.ada, category: 0, text: 'Exam results come out tomorrow. I wish for a pass. Just a pass.', reactions: [2, 5, 0, 8] },
  { minutesAgo: 60 * 5 + 12, author: A.pablo, category: 3, text: 'No phone at the dinner table, starting tonight. My kids are witnesses and so are you.', reactions: [3, 4, 0, 2] },
  { minutesAgo: 60 * 2 + 5, author: A.mira, category: 1, text: 'My brother called.', reactions: [9, 6, 0, 14] },
  { minutesAgo: 26, author: A.tunde, category: 4, text: 'This board passes 100 entries before the end of November.', reactions: [1, 2, 0, 0] },
  { minutesAgo: 3, author: A.lena, category: 1, text: 'Ẹ káàárọ̀. My first sentence. She laughed, then she hugged me.', reactions: [0, 1, 0, 2] },
]

// Two sample entries that arrive while the board is open, so the live feed can be seen working.
export const INCOMING: (Seed & { afterSeconds: number })[] = [
  { afterSeconds: 25, author: A.sam, category: 0, text: 'That the bus driver who waited for me this morning has a good day. You did not have to wait.', reactions: [0, 0, 0, 0] },
  { afterSeconds: 70, author: A.noor, category: 1, text: 'Amira said her first word tonight. It was "no". Recording it for the record.', reactions: [0, 0, 0, 0] },
]
