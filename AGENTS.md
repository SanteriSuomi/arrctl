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

## Windows Output Capture

On Windows MINGW64 (Git Bash), shell script wrappers may not have output captured. If a command returns no output when it should, use `.cmd` suffix:

```bash
pnpm.cmd run format
pnpm.cmd run test
./node_modules/.bin/biome.cmd check --write
```
