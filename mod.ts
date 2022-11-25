import { Command, Confirm, Table } from "https://deno.land/x/cliffy@v0.25.4/mod.ts";
import * as ink from "https://deno.land/x/ink@1.3/mod.ts";
import { CreateSynonymSetResponse, DeleteSynonymSetResponse, ListSynonymSetsResponse } from "npm:@elastic/enterprise-search/lib/api/app/types";
import { parseSynonymsFromXlsxFile } from "./xlsx.ts";
import { getEnvFromOptions, waitForSeconds, withLoader } from "./utils.ts";
import { getElastic } from "./elastic/client.ts";
import { SynonymSet } from "./elastic/types.ts";

const log = ink.terminal.log;
const error = ink.terminal.error;

await new Command()
  .name("Elastic App Search synonym mass importer")
  .version("0.0.1")
  .description(`
    Command line tool for importing synonyms.
      - import list of synonyms from XLSX file
      - previews the list of synonyms found (can be fast-forwarded with -y)
      - (possibly deletes existing synonyms from Elastic App Search)
      - then creates them to Elastic App Search as new Synonyms
  `)

  .env("ELASTIC_URL=<value:string>", "URL address to Elastic App Search", { required: true })
  .env("ELASTIC_APP_ENGINE=<value:string>", "Elastic App Engine name", { required: true })
  .env("ELASTIC_PRIVATE_API_KEY=<value:string>", "Elastic App Search private API key", { required: true })

  .option("-d, --delete-existing", "Delete existing synonyms from Elastic App Search")
  .arguments("<input:file>")

  .action(async (options, ...[ path ]) => {
    const env = getEnvFromOptions(options);

    try {
      log("Reading file..\n");

      const newSets = parseSynonymsFromXlsxFile(path);

      log("Synonym sets to be created:\n");
      log(Table.from(newSets).border(true).maxColWidth(20).toString());
      log(`\nTotal of ${newSets.length} synonym sets.\n`);

      const result = await Confirm.prompt({
        message: ink.colorize("<yellow>Proceed to create these synonym sets to Elastic Search?<yellow>")
      });

      if (!result) {
        log("\n<red>Cancelled.</red>\n");

        Deno.exit(1);
      }

      const elastic = getElastic(env);

      if (options.deleteExisting) {
        log("<red>Delete-existing flag is in effect! You have a brief moment to reconsider..</red>");

        await waitForSeconds(3);

        log("\n<red>Lets begin.</red>");
        log("Listing existing sets from Elastic search...");

        const pageSize = 25;
        const response = await elastic.listSynonymSets({ current: 1, size: pageSize });
        const totalPages = Math.ceil(response.meta.page.total_pages);

        const pages = [ ...Array(totalPages).keys() ];

        const batches = await withLoader(async () => {
          const results: ListSynonymSetsResponse[] = [];

          for (const page of pages) {
            results.push(await elastic.listSynonymSets({
              current: page + 1,
              size: pageSize
            }));
          }

          return results;
        });

        const existingSets: SynonymSet[] = batches.map(batch => batch.results).flat();

        if (existingSets.length) {
          log(`\nTotal of ${existingSets.length} existing sets found, deleting...`);

          const deleteResults: DeleteSynonymSetResponse[] = [];

          for (const set of existingSets) {
            deleteResults.push(await elastic.deleteSynonymSet(set.id!));
            log(`Set ${set.id} deleted.`);
          }

          log(`\n<green>Successfully deleted ${deleteResults.length} sets.</green>`);
        } else {
          log(`\nNo existing sets found.`);
        }
      }

      log(`\nCreating ${newSets.length} new synonym sets to Elastic App Search...`);

      const createdSets: CreateSynonymSetResponse[] = [];

      for (const set of newSets) {
        const createdSet = await elastic.createSynonymSet(set);
        createdSets.push(createdSet);
        log(`set ${createdSet.id!} with content [${createdSet.synonyms.join(", ")}] created`);
      }

      log(`\n<green>Success! ${createdSets.length} new synonym sets created to Elastic.</green>`);
    } catch (e) {
      error(`<red>${e.error}${e.stack}\nCaused by:\n${e.cause}</red>`);
    }
  })

  .parse(Deno.args);
