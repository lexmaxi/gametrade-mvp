export type GameSearchItem = {
  name: string;
  slug: string;
  aliases: string[];
};

export const gameSearchItems: GameSearchItem[] = [
  {
    name: "Counter-Strike 2",
    slug: "cs2",
    aliases: [
      "cs2",
      "cs 2",
      "кс2",
      "кс 2",
      "ксго",
      "кс го",
      "csgo",
      "counter strike",
      "counter-strike",
      "контр страйк",
      "контра",
    ],
  },

  {
    name: "Dota 2",
    slug: "dota2",
    aliases: [
      "dota",
      "dota 2",
      "дота",
      "дота 2",
      "дотка",
      "дотан",
      "дотка 2",
    ],
  },

  {
    name: "Valorant",
    slug: "valorant",
    aliases: [
      "valorant",
      "valo",
      "валик",
      "валарант",
      "валарант",
      "валорант",
      "валор",
    ],
  },

  {
    name: "Mobile Legends",
    slug: "mlbb",
    aliases: [
      "mobile legends",
      "mobile legend",
      "ml",
      "mlbb",
      "мл",
      "млбб",
      "мобайл легендс",
      "мобайл легенд",
      "мобайл",
      "млбб",
      "млбб",
    ],
  },

  {
    name: "League of Legends",
    slug: "lol",
    aliases: [
      "league of legends",
      "league legends",
      "lol",
      "лол",
      "лига легенд",
      "лига",
      "лига лол",
    ],
  },

  {
    name: "Genshin Impact",
    slug: "genshin",
    aliases: [
      "genshin",
      "genshin impact",
      "геншин",
      "геншин импакт",
      "генш",
      "генша",
    ],
  },

  {
    name: "Roblox",
    slug: "roblox",
    aliases: [
      "roblox",
      "роблокс",
      "роблокс",
      "робла",
      "роба",
    ],
  },

  {
    name: "World of Warcraft",
    slug: "wow",
    aliases: [
      "wow",
      "world of warcraft",
      "варкрафт",
      "вов",
      "воw",
      "wow retail",
      "wow classic",
      "вов классик",
      "вов ретейл",
    ],
  },

  {
    name: "Fortnite",
    slug: "fortnite",
    aliases: [
      "fortnite",
      "фортнайт",
      "форт",
      "фн",
      "fn",
    ],
  },

  {
    name: "Minecraft",
    slug: "minecraft",
    aliases: [
      "minecraft",
      "майнкрафт",
      "майн",
      "майнкрафт",
      "mc",
      "мс",
    ],
  },

  {
    name: "Grand Theft Auto V",
    slug: "gta5",
    aliases: [
      "gta",
      "gta 5",
      "gta5",
      "гта",
      "гта 5",
      "гта5",
      "grand theft auto",
    ],
  },

  {
    name: "Escape from Tarkov",
    slug: "tarkov",
    aliases: [
      "tarkov",
      "escape from tarkov",
      "тарков",
      "ефт",
      "eft",
    ],
  },

  {
    name: "Apex Legends",
    slug: "apex",
    aliases: [
      "apex",
      "apex legends",
      "апекс",
      "апекс легендс",
    ],
  },

  {
    name: "PUBG",
    slug: "pubg",
    aliases: [
      "pubg",
      "пабг",
      "пубг",
      "пубг мобайл",
      "pubg mobile",
    ],
  },

  {
    name: "Call of Duty",
    slug: "cod",
    aliases: [
      "call of duty",
      "cod",
      "код",
      "колда",
      "кол оф дьюти",
      "warzone",
      "варзон",
      "варзона",
    ],
  },

  {
    name: "Rust",
    slug: "rust",
    aliases: [
      "rust",
      "раст",
    ],
  },

  {
    name: "Overwatch 2",
    slug: "overwatch2",
    aliases: [
      "overwatch",
      "overwatch 2",
      "овервотч",
      "овер",
      "ов",
      "ow",
      "ow2",
    ],
  },

  {
    name: "Rainbow Six Siege",
    slug: "r6",
    aliases: [
      "rainbow six",
      "rainbow six siege",
      "r6",
      "r6s",
      "радужка",
      "радуга",
      "р6",
      "р6с",
    ],
  },

  {
    name: "Dead by Daylight",
    slug: "dbd",
    aliases: [
      "dead by daylight",
      "dbd",
      "дбд",
      "дед бай дейлайт",
      "дбд",
    ],
  },

  {
    name: "War Thunder",
    slug: "warthunder",
    aliases: [
      "war thunder",
      "warthunder",
      "вар тандер",
      "вар тандер",
      "вт",
      "wt",
    ],
  },
];

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ");
}

export function getGameSearchSuggestions(
  query: string,
  limit = 5
): GameSearchItem[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  const words = normalizedQuery.split(" ").filter(Boolean);

  const results = gameSearchItems
    .map((game) => {
      const searchableValues = [
        game.name,
        game.slug,
        ...game.aliases,
      ].map(normalizeSearchText);

      let score = 0;

      for (const value of searchableValues) {
        if (value === normalizedQuery) {
          score = Math.max(score, 100);
        }

        if (value.startsWith(normalizedQuery)) {
          score = Math.max(score, 80);
        }

        if (value.includes(normalizedQuery)) {
          score = Math.max(score, 60);
        }

        const matchedWords = words.filter((word) =>
          value.includes(word)
        ).length;

        if (matchedWords > 0) {
          score = Math.max(
            score,
            30 + (matchedWords / words.length) * 20
          );
        }
      }

      return {
        game,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.game);

  return results;
}