export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
};

export type Product = {
  id: string;
  title: string;
  game: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  sellerId: string;
  seller: {
    name: string;
    rating: number;
    sales: number;
  };
  sales: number;
  delivery: "auto" | "manual";
  tags: string[];
};

export const categories: Category[] = [
  { id: "1", name: "Аккаунты", slug: "accounts", icon: "👤", count: 12480 },
  { id: "2", name: "Буст", slug: "boost", icon: "🚀", count: 5320 },
  { id: "3", name: "Услуги", slug: "services", icon: "🛠️", count: 3890 },
  { id: "4", name: "Валюта", slug: "currency", icon: "💰", count: 8760 },
  { id: "5", name: "Предметы", slug: "items", icon: "🎒", count: 15420 },
  { id: "6", name: "Ключи", slug: "keys", icon: "🔑", count: 4210 },
];

export const popularGames = [
  { name: "CS2", slug: "cs2", image: "/games/cs2.jpg" },
  { name: "Dota 2", slug: "dota2", image: "/games/dota2.jpg" },
  { name: "Valorant", slug: "valorant", image: "/games/valorant.jpg" },
  { name: "Genshin Impact", slug: "genshin", image: "/games/genshin.jpg" },
  { name: "League of Legends", slug: "lol", image: "/games/lol.jpg" },
  { name: "Roblox", slug: "roblox", image: "/games/roblox.jpg" },
  { name: "WoW", slug: "wow", image: "/games/wow.jpg" },
  { name: "Mobile Legends", slug: "mlbb", image: "/games/mlbb.jpg" },
];

export const products: Product[] = [
  {
    id: "p1",
    title: "CS2 Prime + 5 лет + 150+ игр | Full Access",
    game: "CS2",
    category: "accounts",
    price: 2490,
    oldPrice: 3200,
    image: "/products/cs2-acc.jpg",
    sellerId: "4ef36764-0494-4a3a-8a03-19047225bd92",
    seller: { name: "Jary", rating: 4.98, sales: 1842 },
    sales: 327,
    delivery: "auto",
    tags: ["Prime", "Full Access", "Автовыдача"],
  },

  {
    id: "p2",
    title: "Буст до Global Elite | 2-5 дней | Гарантия",
    game: "CS2",
    category: "boost",
    price: 1890,
    image: "/products/cs2-boost.jpg",
    sellerId: "",
    seller: { name: "BoostKing", rating: 4.95, sales: 956 },
    sales: 214,
    delivery: "manual",
    tags: ["Буст", "Гарантия"],
  },

  {
    id: "p3",
    title: "Genshin 60+ AR | C6 персонажи | Гарант",
    game: "Genshin Impact",
    category: "accounts",
    price: 4590,
    oldPrice: 5200,
    image: "/products/genshin-acc.jpg",
    sellerId: "",
    seller: { name: "GenshinPro", rating: 4.99, sales: 2103 },
    sales: 89,
    delivery: "manual",
    tags: ["AR60+", "C6", "Гарант"],
  },

  {
    id: "p4",
    title: "Valorant Immortal 3 | Скины + Боевой пропуск",
    game: "Valorant",
    category: "accounts",
    price: 3750,
    image: "/products/valorant-acc.jpg",
    sellerId: "",
    seller: { name: "ValStore", rating: 4.97, sales: 1340 },
    sales: 156,
    delivery: "auto",
    tags: ["Immortal", "Скины"],
  },

  {
    id: "p5",
    title: "Dota 2 Immortal + 5000 MMR | Full Access",
    game: "Dota 2",
    category: "accounts",
    price: 2890,
    image: "/products/dota-acc.jpg",
    sellerId: "",
    seller: { name: "DotaMarket", rating: 4.96, sales: 876 },
    sales: 98,
    delivery: "manual",
    tags: ["Immortal", "5000 MMR"],
  },

  {
    id: "p6",
    title: "Прокачка WoW The War Within | 1-80 lvl",
    game: "WoW",
    category: "boost",
    price: 3200,
    image: "/products/wow-boost.jpg",
    sellerId: "",
    seller: { name: "WoWBoost", rating: 4.94, sales: 654 },
    sales: 67,
    delivery: "manual",
    tags: ["Прокачка", "1-80"],
  },

  {
    id: "p7",
    title: "Roblox 50 000 Robux | Автовыдача 5 мин",
    game: "Roblox",
    category: "currency",
    price: 1890,
    oldPrice: 2100,
    image: "/products/robux.jpg",
    sellerId: "",
    seller: { name: "RobuxFast", rating: 4.99, sales: 4521 },
    sales: 1203,
    delivery: "auto",
    tags: ["Robux", "Автовыдача"],
  },

  {
    id: "p8",
    title: "MLBB 100+ звёзд | Mythic | Гарантия",
    game: "Mobile Legends",
    category: "accounts",
    price: 1450,
    image: "/products/mlbb-acc.jpg",
    sellerId: "",
    seller: { name: "MLBBShop", rating: 4.93, sales: 1120 },
    sales: 245,
    delivery: "manual",
    tags: ["Mythic", "100+ звёзд"],
  },
];