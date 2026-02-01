# arrctl

Unified *arr Stack CLI built with oclif.

> **Note:** `CLAUDE.md` is a symlink to this file. To create: `mklink CLAUDE.md AGENTS.md` (admin cmd)

## Dev Environment

Docker-based Radarr + qBittorrent stack for local development.

**Start:** `pnpm dev:up`
**Stop:** `pnpm dev:down`
**Reset:** `pnpm dev:reset` (clears media/downloads, preserves config + qBit integration)

| Service     | URL                     | Credentials              |
|-------------|-------------------------|--------------------------|
| Radarr      | http://localhost:8502   | admin / admin            |
| qBittorrent | http://localhost:8506   | admin / (see container logs) |

**Radarr API Key:** `d117b6f321bc477bb6beb628b5757118`

qBittorrent is pre-configured as download client in Radarr. The integration config lives in Radarr's database (`dev/radarr/config/`), so don't delete that directory if you want to preserve it.

For a full reset (including Radarr config): `rm -rf dev/radarr && pnpm dev:reset`

## Code Quality

After changes:
- `pnpm run format` - Format and auto-fix
- `pnpm run test` - Run tests
- `pnpm run lint` - Verify no issues

## Testing CLI Commands

Run `pnpm run build` before testing with `./bin/run.js` to ensure the dist folder has the latest compiled code.

## Project Structure

```
src/commands/{radarr,sonarr}/  # oclif commands by topic
src/lib/{radarr,sonarr}/
  ├── client.ts                # Typed API wrapper (fetch-based)
  └── types.ts                 # API response interfaces
src/lib/
  ├── base-command.ts          # BaseSettingsCommand for settings CRUD
  ├── config.ts                # Config loading (requireConfig)
  ├── cache.ts                 # configCache for reference data
  └── format.ts                # formatTable, formatSize utilities
test/lib/                      # Unit tests (Vitest, mocked fetch)
test/commands/                 # Command tests
```

**Patterns:** Commands use `requireConfig()` → `new Client()` → API call → `formatTable()` or `--json` output. Mutations call `configCache.clear()`.

## CLI Structure

Commands mirror Radarr WebUI navigation:
- `radarr movies/calendar/activity/wanted/system` - Top-level WebUI sections
- `radarr settings/*` - Settings menu items (profiles, quality, customformats, downloadclients, indexers, importlists, connect, metadata, tags, general, mediamanagement, ui)
- `radarr api/*` - API-only resources not exposed in WebUI (rootfolders, remotepaths, exclusions, parse)
- `radarr config` - CLI-specific configuration
