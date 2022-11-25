import type { ListSynonymSetsResponse, GetSynonymSetResponse, CreateSynonymSetResponse, PutSynonymSetResponse, DeleteSynonymSetResponse } from "npm:@elastic/enterprise-search/lib/api/app/types";
import type { Env, Options } from "../types.ts";
import { QueryParams, RequestOptions, SynonymSet } from "./types.ts";

/**
 * Elastic client
 */
export class Elastic {

  private config: Options;

  /**
   * Constructor
   *
   * @param options client options
   */
  constructor(options: Options) {
    this.config = options;
  }

  /**
   * Lists synonym sets from Elastic search
   *
   * @param page page
   * @returns list of synonym sets
   */
  public listSynonymSets = async (page?: { current?: number; size?: number; }): Promise<ListSynonymSetsResponse> => {
    const queryParams: QueryParams = [];
    if (page?.current) queryParams.push([ "page[current]", page.current ]);
    if (page?.size) queryParams.push([ "page[size]", page.size ]);

    const response = await fetch(this.makeRequest({
      path: "/synonyms",
      queryParams: queryParams
    }));

    const body = await response.json();
    if (!response.ok) throw Error("Error while listing synonym sets", { cause: JSON.stringify(body, null, 2) });
    return body;
  }

  /**
   * Tries to find synonym set from Elastic search with given id
   *
   * @param id id of synonym set
   * @returns found synonym set
   */
  public findSynonymSet = async (id: string): Promise<GetSynonymSetResponse | undefined> => {
    const response = await fetch(this.makeRequest({
      path: `/synonyms/${id}`
    }));

    if (response.status === 404) return undefined;
    const body = await response.json();
    if (!response.ok) throw Error("Error while finding synonym set", { cause: JSON.stringify(body, null, 2) });

    return body;
  }

  /**
   * Creates synonym set to Elastic search
   *
   * @param synonyms synonyms in the set
   * @returns created synonym set
   */
  public createSynonymSet = async (synonyms: string[]): Promise<CreateSynonymSetResponse> => {
    if ((synonyms.length ?? 0) < 2) throw Error("Elastic search needs at least 2 synonyms in a set");
    if ((synonyms.length ?? 0) > 32) throw Error("Elastic Search is limited to 32 synonyms per set");

    const response = await fetch(this.makeRequest({
      path: "/synonyms",
      method: "POST",
      body: JSON.stringify({ synonyms })
    }));

    const body = await response.json();
    if (!response.ok) throw Error("Error while creating synonym set", { cause: JSON.stringify(body, null, 2) });

    return body;
  }

  /**
   * Updates synonym set to Elastic search
   *
   * @param synonymSet synonym set
   * @returns updated synonym set
   */
  public updateSynonymSet = async ({ id, synonyms }: SynonymSet): Promise<PutSynonymSetResponse> => {
    if (!id) throw Error("Id missing");
    if ((synonyms.length ?? 0) > 32) throw Error("Elastic Search is limited to 32 synonyms per set");

    const response = await fetch(this.makeRequest({
      path: `/synonyms/${id}`,
      method: "PUT",
      body: JSON.stringify({ synonyms })
    }));

    const body = await response.json();
    if (!response.ok) throw Error("Error while updating synonym set", { cause: JSON.stringify(body, null, 2) });

    return body;
  }

  /**
   * Deletes synonym set from Elastic search
   *
   * @param id id of synonym set
   * @returns {object} object containing deleted property with boolean value of whether
   * a synonym set was deleted or not
   */
  public deleteSynonymSet = async (id: string): Promise<DeleteSynonymSetResponse> => {
    const response = await fetch(this.makeRequest({
      path: `/synonyms/${id}`,
      method: "DELETE"
    }));

    const body = await response.json();
    if (!response.ok) throw Error("Error while deleting synonym set", { cause: JSON.stringify(body, null, 2) });

    return body;
  }

  /**
   * Returns request to Elastic search API with given options
   *
   * @param options request options
   */
  private makeRequest = ({ method = "GET", path, body, queryParams }: RequestOptions) => {
    const baseUrl = `${this.config.url}/api/as/v1/engines/${this.config.engineName}`;
    const query = this.makeQuery(queryParams);

    return new Request(`${baseUrl}${path}${query}`, {
      method: method,
      body: body,
      headers: {
        "authorization": `Bearer ${this.config.token}`,
        "Content-Type": "application/json"
      }
    });
  }

  /**
   * Returns query string from given list of query params
   *
   * @param queryParams query parameters
   */
  private makeQuery = (queryParams?: QueryParams): string => {
    if (!queryParams || !queryParams.length) return "";

    const queryParts = queryParams.map(([ name, value ]) => `${name}=${value}`);
    const query = queryParts.join("&");
    return `?${query}`;
  }

}

/**
 * Returns pre-configured Elastic client
 *
 * @param env environment variables
 * @returns Pre-configured Elastic client
 */
export const getElastic = (env: Env) => {
  return new Elastic({
    url: env.elasticUrl,
    engineName: env.elasticAppEngine,
    token: env.elasticPrivateApiKey
  });
}

/**
 * Throws given error with given message
 *
 * @param message message
 * @param error error
 */
export const throwError = async (message: string, error: unknown) => {
  if (error instanceof Response) {
    const code = error.status;
    const body = await error.json();
    throw Error(`${message} [${code}]: ${body}`);
  } else if (error instanceof Error) {
    throw Error(`${message}: ${error.stack}`);
  } else {
    throw Error(`${message}: ${error}`);
  }
};