# Elastic App Search synonym mass import

CLI too to mass import synonym sets from XLSX file to Elastic App Search

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
