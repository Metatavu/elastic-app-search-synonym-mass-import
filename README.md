# Elastic App Search synonym mass import

CLI too to mass import synonym sets from XLSX file to Elastic App Search

Synonym sets should be in the following format:

- first two rows are header rows, which are not considered to contain data
- from third row forward, a row means single set of synonyms.
- A single cell should contain one or more synonyms separated by comma (spaces do not matter).
- A single synonym set can be comprised of any combination of cells in a row and lists inside cells.

Example structure:

|  Example header  |   Write anything in here...   |                            |
| :---------------: | :---------------------------: | :------------------------: |
|  Example header  |         ...and here.         |                            |
| example, exemplar | prototype, illustration, case |                            |
|        dog        |          pup, puppy          | doggy, pooch, stray, hound |

Will be translated to:

set 1: example, exemplar, prototype, illustration, case

set 2: dog, pup, puppy, doggy, pooch, stray, hound

### Usage

###### Install [Deno](https://deno.land/manual@v1.28.2/getting_started/installation)

Using Shell (macOS and Linux)

```
`curl -fsSL https://deno.land/x/install/install.sh | sh`
```

Using PowerShell (Windows)

```
`irm https://deno.land/install.ps1 | iex`
```

###### Run script

Either by installing as a script

```
deno install -n elastic-app-search-synonym-mass-import --allow-env --allow-read --allow-sys --allow-net https://raw.githubusercontent.com/metatavu/elastic-app-search-synonym-mass-import/master/cli.ts
```

and running

```
elastic-app-search-synonym-mass-import --help
```

or by running it directly from source

```
deno run --allow-env --allow-read --allow-sys --allow-net https://raw.githubusercontent.com/metatavu/elastic-app-search-synonym-mass-import/master/cli.ts --help
```
