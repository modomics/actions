# Modomics Actions

Customer-facing GitHub Actions for continuous codebase analysis.

## Available Actions

### [`analyse`](./analyse)

Runs Modomics analysis on your codebase and uploads a warehouse bundle as a workflow artifact.

```yaml
- uses: modomics/actions/analyse@v1
  with:
    npm-token: ${{ secrets.MODOMICS_NPM_TOKEN }}
```

See [`analyse/action.yml`](./analyse/action.yml) for all available inputs and outputs.

## Licence

MIT
