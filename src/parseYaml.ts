import type { ParsedGroups } from './types.js';

/**
 * Simple YAML parser for turbo-groups.yaml format.
 *
 * Parses groups in the format:
 *   groupName:
 *     - package1
 *     - package2
 *
 * @param content - The YAML file content as a string
 * @returns Parsed groups object mapping group names to package arrays
 */
export function parseSimpleYaml(content: string): ParsedGroups {
    const groups: ParsedGroups = {};
    let currentGroup: string | null = null;

    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        if (trimmed.endsWith(':')) {
            currentGroup = trimmed.slice(0, -1);
            groups[currentGroup] = [];
        } else if (trimmed.startsWith('-') && currentGroup) {
            const val = trimmed.substring(1).trim();
            if (val) {
                groups[currentGroup].push(val);
            }
        }
    });

    return groups;
}

