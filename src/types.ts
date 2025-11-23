/**
 * Configuration options for running turbo tasks with groups
 */
export interface TurboGroupOptions {
    /**
     * Path to the monorepo groups YAML file
     * @default "turbo-groups.yaml"
     */
    configFile?: string;

    /**
     * Whether to run tasks in parallel
     * @default true
     */
    parallel?: boolean;

    /**
     * Whether to continue execution if one package fails
     * @default true
     */
    continue?: boolean;

    /**
     * Additional turbo flags to pass through
     */
    turboFlags?: string[];

    /**
     * Custom working directory (defaults to process.cwd())
     */
    cwd?: string;
}

/**
 * Parsed groups from YAML configuration
 */
export interface ParsedGroups {
    [groupName: string]: string[];
}

/**
 * Result of executing a turbo task
 */
export interface ExecuteResult {
    success: boolean;
    exitCode: number;
    command: string; // The actual turbo command that was executed
}

