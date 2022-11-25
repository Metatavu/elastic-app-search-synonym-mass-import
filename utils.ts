import { Env } from "./types.ts";

/**
 * Returns environment variables from command options
 *
 * @param options command options
 */
export const getEnvFromOptions = <T extends Env>(options: T): Env => ({
  elasticPrivateApiKey: options.elasticPrivateApiKey,
  elasticAppEngine: options.elasticAppEngine,
  elasticUrl: options.elasticUrl
});

/**
 * Executes given callback function after given delay in milliseconds
 *
 * @param callback callback to call
 * @param delayInMillis delay in milliseconds
 */
export const delayed = (callback: (...args: unknown[]) => unknown, delayInMillis: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      callback();
      resolve();
    }, delayInMillis);
  });
};

/**
 * Encode given string to bytes
 *
 * @param value string to encode
 */
export const encodeToBytes = (value: string) => new TextEncoder().encode(value);

/**
 * Writes to same line
 *
 * @param value value
 */
export const writeSameLine = (value: string) => Deno.stdout.write(encodeToBytes(`\r${value}`));

/**
 * Synchronously waits for given time in seconds
 *
 * @param timeInSeconds time in seconds
 */
export const waitForSeconds = async (timeInSeconds: number) => {
  let counter = timeInSeconds;

  writeSameLine(`Waiting... (${counter})`);

  while (counter > 0) {
    counter--;
    await delayed(() => writeSameLine(`Waiting... (${counter})`), 1000);
  }
}

/**
 * Returns single string which contains given strings separated by empty lines.
 *
 * @param values values
 */
export const separatedLines = (...values: string[]) => values.join("\n\n");

/**
 * Displays loader while given process is running
 *
 * @param process process to track
 */
export const withLoader = async <T>(process: Promise<T> | (() => Promise<T>)): Promise<T> => {
  const symbols = ["|", "/", "—", "\\"];
  let index = 0;

  const next = () => {
    writeSameLine(`loading... ${symbols[index]}`);
    index < symbols.length - 1 ?
      index++ :
      index = 0;
  };

  const intervalId = setInterval(() => next(), 100);

  if (typeof process === "function") {
    try {
      return await process();
    } finally {
      clearInterval(intervalId);
      writeSameLine("");
    }
  } else {
    try {
      return await process;
    } finally {
      clearInterval(intervalId);
      writeSameLine("");
    }
  }
}