const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    try {
        const x = await askQuestion('Enter x value for version (1.x.y): ');
        const y = await askQuestion('Enter y value for version (1.x.y): ');

        const version = `1.${x}.${y}`;
        const commitMessage = `version number ${version}`;

        const gitCommands = [
            'git add .',
            `git commit -m "${commitMessage}"`,
            'git push -u origin main'
        ];

        for (const cmd of gitCommands) {
            console.log(`Executing: ${cmd}`);
            await execPromise(cmd);
        }

        console.log('Push to main branch completed successfully.');
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        rl.close();
    }
}

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing ${command}:`, stderr);
                reject(error);
            } else {
                console.log(stdout);
                resolve();
            }
        });
    });
}

main();
