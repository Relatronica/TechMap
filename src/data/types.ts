/**
 * TechMap / L'Infrastruttura Invisibile — modello dati minimo v0.2
 *
 * Principi:
 * - Retrocompatibile con i GeoJSON esistenti (campi nuovi sono opzionali).
 * - Metriche numeriche separate dalle stringhe display (capacity vs capacity_mw).
 * - Ogni claim rilevante ha fonti e livello di certezza.
 * - Il lavoro è proprietà dei siti, non un layer a sé (per ora).
 */

export type SiteType = 'data_center' | 'energy_plant' | 'raw_material';

export type DataCenterSubtype = 'colocation' | 'hyperscale' | 'enterprise';
export type EnergySubtype = 'gas' | 'solar' | 'wind' | 'hydro' | 'nuclear';
export type RawMaterialSubtype =
  | 'semiconductor_fab'
  | 'component_manufacturing'
  | 'lithium_mine'
  | 'cobalt_mine'
  | 'rare_earth_mine';

/** Estrazione vs manifattura (raw_materials mescola entrambi). */
export type SiteCategory = 'extraction' | 'manufacturing' | 'infrastructure';

export type SiteStatus =
  | 'planned'
  | 'under_construction'
  | 'operational'
  | 'decommissioned'
  | 'unknown';

/**
 * high     = documento ufficiale / dichiarazione primaria
 * medium   = fonte giornalistica o report secondario coerente
 * low      = indizio indiretto
 * estimated = modello / stima dell'autore del dataset
 */
export type Confidence = 'high' | 'medium' | 'low' | 'estimated';

/**
 * confirmed = prova diretta del legame
 * likely    = forte evidenza geografica/contrattuale senza prova esplicita
 * inferred  = ipotesi di lavoro (es. stessa rete / stesso cluster)
 * disputed  = fonti in conflitto
 */
export type Certainty = 'confirmed' | 'likely' | 'inferred' | 'disputed';

export type RelationshipType = 'powers' | 'supplies' | 'manufactures_for';

export interface SourceRef {
  title: string;
  url?: string;
  /** ISO date YYYY-MM-DD */
  accessed_at?: string;
  note?: string;
}

export interface Employment {
  /** Dipendenti diretti dichiarati / stimati */
  direct: number | null;
  /** Occupazione indiretta stimata (filiera locale) */
  indirect_est: number | null;
  /** Appalti / temporary / artigianale */
  contractors_est: number | null;
  note_it?: string;
  /**
   * Codici curati, es.:
   * unionized | shift_work | artisanal_mining | conflict_zone |
   * migrant_labor | high_skill | construction_phase
   */
  conditions_tags?: string[];
}

/** Impatto energetico e ambientale — campi null = sconosciuto, non zero. */
export interface Impact {
  /** Potenza IT / impianto in MW (numero confrontabile) */
  capacity_mw: number | null;
  /** Prelievo elettrico stimato del sito (MW medi), se diverso dalla capacity */
  power_draw_mw_est?: number | null;
  pue?: number | null;
  water_use_m3_year?: number | null;
  land_ha?: number | null;
  co2_t_year_est?: number | null;
  energy_mix_note_it?: string;
}

export interface SitePropertiesBase {
  id: string;
  name: string;
  type: SiteType;
  subtype: string;
  operator: string;
  /** Stringa display legacy, es. "60 MW (campus totale)" */
  capacity?: string;
  description_it?: string;
  country: string;
  city: string;

  status?: SiteStatus;
  site_category?: SiteCategory;
  opened_year?: number | null;
  /** ISO date ultimo controllo umano del record */
  updated_at?: string;
  confidence?: Confidence;
  sources?: SourceRef[];

  impact?: Impact;
  employment?: Employment;
  community_impact_it?: string;
  labor_risks?: string[];
}

export interface DataCenterProperties extends SitePropertiesBase {
  type: 'data_center';
  subtype: DataCenterSubtype;
}

export interface EnergyPlantProperties extends SitePropertiesBase {
  type: 'energy_plant';
  subtype: EnergySubtype;
}

export interface RawMaterialProperties extends SitePropertiesBase {
  type: 'raw_material';
  subtype: RawMaterialSubtype;
}

export interface ConnectionProperties {
  id: string;
  source_id: string;
  target_id: string;
  source_name: string;
  target_name: string;
  relationship_type: RelationshipType;
  description_it?: string;
  certainty?: Certainty;
  evidence_note_it?: string;
  /** ISO date a cui si riferisce il legame */
  as_of?: string;
  updated_at?: string;
  sources?: SourceRef[];
}

export type SiteProperties =
  | DataCenterProperties
  | EnergyPlantProperties
  | RawMaterialProperties;
