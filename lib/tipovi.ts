export interface Dokument {
  id: string;
  naslov: string;
  sadrzaj: string;
  cilj_publika: string;
  cilj_formalnost: string;
  cilj_podrucje: string;
  cilj_namjera: string;
  created_at: string;
  updated_at: string;
}

export const zadaniCiljevi = {
  cilj_publika: "Općenita",
  cilj_formalnost: "Neutralno",
  cilj_podrucje: "Poslovno",
  cilj_namjera: "Informirati",
};

export const CILJ_OPCIJE = {
  publika: ["Općenita", "Upućena", "Stručna"],
  formalnost: ["Neformalno", "Neutralno", "Formalno"],
  podrucje: ["Općenito", "Akademsko", "Poslovno", "Novinarsko", "Kreativno"],
  namjera: ["Informirati", "Opisati", "Uvjeriti", "Ispričati priču"],
} as const;
