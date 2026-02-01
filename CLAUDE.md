# arrctl

Unified *arr Stack CLI built with oclif.

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
