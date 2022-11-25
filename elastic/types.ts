export type RequestOptions = {
  path: string;
  queryParams?: QueryParams;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
};

export type QueryParams = [ string, unknown ][];

/**
 * Synonym set
 */
export interface SynonymSet {
  id?: string;
  synonyms: string[];
}