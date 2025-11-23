import fs from 'fs';
import path from 'path';
import { parseSimpleYaml } from './parseYaml.js';
import type { ParsedGroups } from './types.js';

/**
 * Loads and parses the monorepo groups configuration file.
 *
 * @param configFile - Path to the YAML configuration file
 * @param cwd - Working directory to resolve config file from
 * @returns Parsed groups object
 * @throws Error if the config file doesn't exist or can't be read
 */
export function loadGroups(configFile: string = 'turbo-groups.yaml', cwd?: string): ParsedGroups {
    const baseDir = cwd || process.cwd();
    const filePath = path.resolve(baseDir, configFile);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Config file not found: ${filePath}`);
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return parseSimpleYaml(content);
    } catch (error) {
        throw new Error(`Failed to read config file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

