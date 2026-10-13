# Modomics Actions

Most engineering time is spent maintaining software that already exists, and coding agents are adding to that pile faster than teams can keep up. Modomics is a software intelligence platform that shows engineering leaders where that time goes. It measures what every module in a codebase costs to maintain, in engineering hours per year, against the value it delivers, then directs AI agents to retire, consolidate or take over the upkeep so engineers get that time back.

Customer-facing GitHub Actions for continuous codebase analysis.

## Available Actions

### [`analyse`](./analyse)

Runs Modomics analysis on your codebase and uploads a warehouse bundle as a workflow artifact.

```yaml
- uses: modomics/actions/analyse@v6
  with:
    npm-token: ${{ secrets.MODOMICS_NPM_TOKEN }}
```

See [`analyse/action.yml`](./analyse/action.yml) for all available inputs and outputs.

## Licence

MIT
