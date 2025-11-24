# turbo-groups

Simplify Turborepo task execution with named package groups. Instead of manually specifying package filters for every task, define logical groups of packages and reference them by name.

## Features

- **Named Groups** - Define logical collections of packages in a simple YAML file
- **Simplified Tasks** - Run turbo tasks with group names instead of complex filter syntax
- **TypeScript Support** - Full TypeScript types included
- **CLI Tool** - Command-line interface for easy task execution
- **Programmatic API** - Use in scripts or build tools
- **Zero Dependencies** - Lightweight with no runtime dependencies

## Installation

```bash
npm install --save-dev turbo-groups
# or
pnpm add -D turbo-groups
# or
yarn add -D turbo-groups
```

## Quick Start

### 1. Create `turbo-groups.yaml` at your monorepo root

```yaml
frontend:
  - @myorg/frontend
  - @myorg/types

backend:
  - @myorg/api
  - @myorg/database
```

### 2. Use the CLI

You can use either `turbo-group` or the shorter `tg` alias:

```bash
# Run dev task for the "frontend" group
npx turbo-group frontend dev
# or
npx tg frontend dev

# Build the "frontend" group
npx turbo-group frontend build

# Run tests for the "backend" group with additional flags
npx tg backend test --force
```

### 3. Or use programmatically

```typescript
import { runGroup } from 'turbo-groups';

await runGroup('frontend', 'dev');
await runGroup('frontend', 'build', { turboFlags: ['--force'] });
```

## Usage

### CLI Usage

```bash
turbo-group <group> <task> [turbo-flags...]
# or use the alias
tg <group> <task> [turbo-flags...]
```

**Examples:**

```bash
# Development
turbo-group frontend dev

# Build specific group
turbo-group extension build

# With additional turbo flags
turbo-group backend test --force --no-cache

# List available groups
turbo-group list
```

### Programmatic Usage

#### Basic Usage

```typescript
import { runGroup } from 'turbo-groups';

// Run a task for a group
const result = await runGroup('frontend', 'dev');
if (!result.success) {
    console.error(`Task failed with exit code ${result.exitCode}`);
}
```

#### Advanced Options

```typescript
import { runGroup, listGroups } from 'turbo-groups';

// Custom configuration
await runGroup('frontend', 'build', {
    configFile: 'custom-groups.yaml',
    parallel: true,
    continue: true,
    turboFlags: ['--force'],
    cwd: '/path/to/monorepo',
});

// List all groups
const groups = listGroups();
console.log('Available groups:', Object.keys(groups));
```

#### List Groups

```typescript
import { listGroups } from 'turbo-groups';

const groups = listGroups();
// {
//   dev: ['@myorg/types', '@myorg/frontend', '@myorg/api'],
//   frontend: ['@myorg/frontend', '@myorg/types'],
//   backend: ['@myorg/api', '@myorg/database']
// }
```

## Configuration

### YAML File Format

Create a `turbo-groups.yaml` file at your monorepo root:

```yaml
# Group name (key)
groupName:
  # List of package names (must match package.json "name" field)
  - @myorg/package1
  - @myorg/package2

# Another group
anotherGroup:
  - @myorg/package3
  - @myorg/package1
```

**Rules:**
- Group names are case-sensitive
- Package names must match exactly the `name` field in each package's `package.json`
- Comments are supported (lines starting with `#`)
- Empty groups are allowed but not useful

### Custom Config File Location

By default, the tool looks for `turbo-groups.yaml` in the current working directory. You can specify a custom location:

```typescript
await runGroup('frontend', 'dev', {
    configFile: 'config/my-groups.yaml',
});
```

## Integration Examples

### package.json Scripts

Add convenient scripts to your root `package.json`:

```json
{
  "scripts": {
    "dev": "turbo-group frontend dev",
    "dev:frontend": "turbo-group frontend dev",
    "dev:backend": "turbo-group backend dev",
    "build:frontend": "turbo-group frontend build",
    "test:all": "turbo-group dev test"
  }
}
```

Then run:

```bash
pnpm dev
pnpm dev:frontend
pnpm build:frontend
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Build frontend
  run: npx turbo-group frontend build

- name: Test backend
  run: npx turbo-group backend test
```

### Build Scripts

```typescript
// build.ts
import { runGroup } from 'turbo-groups';

async function build() {
    console.log('Building frontend...');
    const result = await runGroup('frontend', 'build'); // runGroup(groupName, task)
    
    if (!result.success) {
        throw new Error(`Build failed: ${result.command}`);
    }
    
    console.log('Build completed successfully!');
}

build().catch(console.error);
```

## API Reference

### `runGroup(groupName, task, options?)`

Runs a turbo task for a specific group of packages.

**Parameters:**
- `groupName` (string): The name of the group from turbo-groups.yaml
- `task` (string): The turbo task to run (e.g., "dev", "build", "test")
- `options` (TurboGroupOptions, optional): Configuration options

**Returns:** `Promise<ExecuteResult>`

**Throws:** Error if the group is not found or config file can't be loaded

**Example:**
```typescript
// Run "dev" task on "frontend" group
await runGroup('frontend', 'dev');

// Run "build" task on "frontend" group
await runGroup('frontend', 'build');
```

### `listGroups(options?)`

Lists all available groups from the configuration file.

**Parameters:**
- `options` (TurboGroupOptions, optional): Configuration options

**Returns:** `ParsedGroups` - Object mapping group names to package arrays

### `loadGroups(configFile?, cwd?)`

Loads and parses the monorepo groups configuration file.

**Parameters:**
- `configFile` (string, optional): Path to the YAML file (default: "turbo-groups.yaml")
- `cwd` (string, optional): Working directory (default: process.cwd())

**Returns:** `ParsedGroups`

**Throws:** Error if the config file doesn't exist or can't be read

### `executeTurbo(task, filters, options?)`

Executes a turbo task with the specified filters and options.

**Parameters:**
- `task` (string): The turbo task to run
- `filters` (string[]): Array of package filters to apply
- `options` (TurboGroupOptions, optional): Configuration options

**Returns:** `Promise<ExecuteResult>`

### Types

```typescript
interface TurboGroupOptions {
    configFile?: string;      // Default: "turbo-groups.yaml"
    parallel?: boolean;       // Default: true
    continue?: boolean;       // Default: true
    turboFlags?: string[];    // Additional turbo flags
    cwd?: string;            // Working directory
}

interface ParsedGroups {
    [groupName: string]: string[];
}

interface ExecuteResult {
    success: boolean;
    exitCode: number;
    command: string;
}
```

## How It Works

1. **Reads YAML config** - Parses `turbo-groups.yaml` to extract groups
2. **Resolves group** - Looks up the specified group name
3. **Builds turbo task command** - Converts group packages into `--filter` flags
4. **Executes turbo** - Runs `turbo run` with the appropriate filters and flags

**Example transformation:**

```yaml
# turbo-groups.yaml
frontend:
  - @myorg/types
  - @myorg/frontend
```

```bash
# Command: turbo-group frontend dev
# Executes: turbo run --parallel --continue dev --filter @myorg/frontend --filter @myorg/types
```

**Note:** Both the CLI and programmatic API use the same order: `turbo-group <group> <task>` and `runGroup(groupName, task)` - group comes first, then task.

## Benefits

### Before (Without Groups)

```bash
turbo run dev --parallel --continue --filter @myorg/types --filter @myorg/frontend
```

### After (With Groups)

```bash
turbo-group frontend dev
# or
tg frontend dev
```

**Note:** The syntax is `turbo-group <group> <task>` - group comes first, then the task to run.

**Advantages:**
- ✅ Shorter, more memorable task execution
- ✅ Centralized group definitions
- ✅ Consistent flag usage (`--parallel --continue`)
- ✅ Less error-prone (no typos in package names)
- ✅ Easy to update (change group definition once)

## Requirements

- Node.js >= 16.0.0
- Turborepo >= 1.0.0 (as peer dependency)
- A monorepo setup with `turbo.json` configured

## Troubleshooting

### "Group not found" Error

**Error:**
```
Group "mygroup" not found in turbo-groups.yaml
Available groups: dev, frontend
```

**Solution:**
- Check that the group name matches exactly (case-sensitive)
- Verify the group exists in `turbo-groups.yaml`
- Check for typos in the group name

### "Config file not found" Error

**Error:**
```
Config file not found: /path/to/turbo-groups.yaml
```

**Solution:**
- Ensure `turbo-groups.yaml` exists at your monorepo root
- Or specify a custom path: `runGroup('frontend', 'dev', { configFile: 'custom/path.yaml' })` (groupName first, then task)

### Package Not Found

**Error:**
```
No packages found matching filter "@myorg/missing-package"
```

**Solution:**
- Verify the package name matches the `name` field in that package's `package.json`
- Check that the package exists in your monorepo
- Ensure the package is included in your workspace configuration (`pnpm-workspace.yaml`, `package.json` workspaces, etc.)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Related

- [Turborepo](https://turbo.build/repo) - The build system this tool wraps

## Repository

https://github.com/Abhijay/monorepo-groups

