import { spawn } from 'child_process';
import type { TurboGroupOptions, ExecuteResult } from './types.js';

/**
 * Executes a turbo task with the specified filters and options.
 *
 * @param task - The turbo task to run (e.g., "dev", "build")
 * @param filters - Array of package filters to apply
 * @param options - Configuration options
 * @returns Promise resolving to execution result
 */
export async function executeTurbo(
    task: string,
    filters: string[],
    options: TurboGroupOptions = {}
): Promise<ExecuteResult> {
    const {
        parallel = true,
        continue: continueOnError = true,
        turboFlags = [],
        cwd = process.cwd(),
    } = options;

    const filterArgs = filters.flatMap(f => ['--filter', f]);
    const cmdArgs: string[] = ['run'];

    if (parallel) {
        cmdArgs.push('--parallel');
    }

    if (continueOnError) {
        cmdArgs.push('--continue');
    }

    cmdArgs.push(task, ...filterArgs, ...turboFlags);

    const command = `turbo ${cmdArgs.join(' ')}`;
    console.log(`> ${command}`);

    return new Promise((resolve) => {
        const child = spawn('turbo', cmdArgs, {
            stdio: 'inherit',
            cwd,
            shell: process.platform === 'win32',
        });

        child.on('exit', (code) => {
            resolve({
                success: code === 0,
                exitCode: code || 0,
                command,
            });
        });

        child.on('error', (error) => {
            console.error(`Failed to execute turbo task: ${error.message}`);
            resolve({
                success: false,
                exitCode: 1,
                command,
            });
        });
    });
}

