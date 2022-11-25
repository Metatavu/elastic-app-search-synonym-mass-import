import type { SearchResponse } from "npm:@elastic/enterprise-search/lib/api/app/types";

/**
 * Environment variables
 */
export type Env = {
  elasticUrl: string;
  elasticAppEngine: string;
  elasticPrivateApiKey: string;
};

/**
 * Elastic client options
 */
export interface Options {
  url: string;
  token: string;
  engineName: string;
}

/**
 * Enum for content category
 */
export enum ContentCategory {
  SERVICE = "service",
  UNIT = "unit",
  NEWS = "news",
  UNCATEGORIZED = "uncategorized"
}

/**
 * App search response facet value
 */
export type AppSearchResponseFacetValue = {
  value: string;
  count: number;
};

/**
 * App search response facet
 */
export type AppSearchResponseFacet = {
  type: string;
  name: string;
  data: AppSearchResponseFacetValue[]
}

/**
 * App Search response with correct results typing
 */
export interface AppSearchResponse extends SearchResponse {
  results: { [key: string]: unknown }[];
  facets?: { [k: string]: AppSearchResponseFacet[] }
}

/**
 * Document
 */
export type Document = {
  id: string;
  [k: string]: unknown;
}

/**
 * Page info
 */
export type PageInfo = {
  current: number;
  total_pages: number;
  total_results: number;
  size: number;
};
