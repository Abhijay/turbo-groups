#!/usr/bin/env node

import { runGroup, listGroups } from './index.js';

const args = process.argv.slice(2);

// Handle list task first (only needs 1 argument)
if (args.length === 1 && args[0] === 'list') {
    try {
        const groups = listGroups();
        const groupNames = Object.keys(groups);

        if (groupNames.length === 0) {
            console.log('No groups found in turbo-groups.yaml');
            process.exit(0);
        }

        console.log('Available groups:');
        groupNames.forEach(name => {
            const packages = groups[name];
            console.log(`  ${name}:`);
            packages.forEach(pkg => {
                console.log(`    - ${pkg}`);
            });
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

if (args.length < 2) {
    console.error('Usage: turbo-group <group> <task> [turbo-flags...]');
    console.error('       tg <group> <task> [turbo-flags...]');
    console.error('');
    console.error('Examples:');
    console.error('  turbo-group dev dev');
    console.error('  tg extension build');
    console.error('  tg backend test --force');
    console.error('');
    console.error('List available groups:');
    console.error('  turbo-group list (or tg list)');
    process.exit(1);
}

const [groupName, task, ...turboFlags] = args;

// Run the group
runGroup(groupName, task, { turboFlags })
    .then(result => {
        process.exit(result.success ? 0 : result.exitCode);
    })
    .catch(error => {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    });

