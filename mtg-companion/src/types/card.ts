export interface ImageUris {
  small: string;
  normal: string;
  large: string;
  art_crop: string;
}

export interface CardFace {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  artist?: string;
  image_uris?: ImageUris;
}

export interface Card {
  id: string;
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  artist?: string;
  set_name: string;
  rarity: string;
  image_uris?: ImageUris;       // missing on double-faced cards
  card_faces?: CardFace[];      // use card_faces[0].image_uris instead
  legalities: Record<string, string>;
  prices: { usd: string | null; eur: string | null };
  scryfall_uri: string;
}

export interface SearchResponse {
  object: "list";
  total_cards: number;
  has_more: boolean;
  data: Card[];
}