import { loadGroups } from './loadGroups.js';
import { executeTurbo } from './executeTurbo.js';
import { parseSimpleYaml } from './parseYaml.js';
import type { TurboGroupOptions, ParsedGroups, ExecuteResult } from './types.js';

/**
 * Runs a turbo task for a specific group of packages.
 *
 * @param groupName - The name of the group from turbo-groups.yaml
 * @param task - The turbo task to run (e.g., "dev", "build")
 * @param options - Configuration options
 * @returns Promise resolving to execution result
 * @throws Error if the group is not found or config file can't be loaded
 */
export async function runGroup(
    groupName: string,
    task: string,
    options: TurboGroupOptions = {}
): Promise<ExecuteResult> {
    const { configFile = 'turbo-groups.yaml', cwd } = options;

    const groups = loadGroups(configFile, cwd);
    const filters = groups[groupName];

    if (!filters) {
        const availableGroups = Object.keys(groups).join(', ');
        throw new Error(
            `Group "${groupName}" not found in ${configFile}.\n` +
            `Available groups: ${availableGroups || '(none)'}`
        );
    }

    return executeTurbo(task, filters, options);
}

/**
 * Lists all available groups from the configuration file.
 *
 * @param options - Configuration options
 * @returns Object mapping group names to their package arrays
 */
export function listGroups(options: TurboGroupOptions = {}): ParsedGroups {
    const { configFile = 'turbo-groups.yaml', cwd } = options;
    return loadGroups(configFile, cwd);
}

// Export types
export type { TurboGroupOptions, ParsedGroups, ExecuteResult };

// Export utilities for advanced usage
export { loadGroups, executeTurbo, parseSimpleYaml };

