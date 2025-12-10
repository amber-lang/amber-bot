import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { err, ok, Result } from 'neverthrow';
import { promisify } from 'util';

export type BashVersion = '5.2' | '5.1' | '5.0' | '4.4' | '4.3' | '4.2' | '4.1' | '4.0' | '3.2';
type ExecResult = { stdout: string; stderr: string };
const TIME = 5;

interface CodeRunnerProps {
    code: string,
    lang: 'amber' | 'bash',
    version: BashVersion
}

export async function startCodeRunner({ code, lang, version = "5.2" }: CodeRunnerProps): Promise<Result<string, string>> {
    // Write the block to a temporary file
    const tempDir = path.join(__dirname, 'amber-temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    const ext = lang === 'amber' ? 'ab' : 'sh';
    const tempFilePath = path.join(tempDir, `main.${ext}`);
    fs.writeFileSync(tempFilePath, code);
    const containerName = `amber_bot_container_${Date.now()}`;
    const cmdArgs = [
        `--name ${containerName}`,
        '--rm',
        '--network none',
        '--platform linux/amd64',
        '--stop-signal SIGKILL',
        `-v ${tempDir}:/scripts:ro`,
        '--user 1000:1000',
        '--cpus=".5"',
        '--memory="256m"'
    ].join(' ');

    const runCommand = lang === 'amber'
        ? 'amber /scripts/main.ab'
        : 'cat /scripts/main.sh | bash';

    try {
        const timePromise = new Promise((res) => setTimeout(() => res('time'), TIME * 1000));
        // Run the bash command in an isolated Docker container
        const execPromise = promisify(exec)(`docker run ${cmdArgs} amber-${version} sh -c "${runCommand}"`);
        const result = await Promise.race([timePromise, execPromise]) as ('time' | ExecResult);
        fs.unlinkSync(tempFilePath);
        if (result === 'time') {
            exec(`docker stop ${containerName}`);
            return err(`Execution time exceeded ${TIME} seconds and was stopped.`);
        }
        switch (true) {
            case !result.stdout.length: return ok('_No output._');
            case result.stdout.length > 1000: return ok(`\`\`\`\n${result.stdout.slice(0, 1000)}\n...\n\`\`\`\n_Output too long._`);
            default: return ok(`\`\`\`\n${result.stdout}\n\`\`\``)
        }
    } catch (error) {
        fs.unlinkSync(tempFilePath);
        const errorMsg = (error as { stderr: string }).stderr
            .replace(/^\s*(ERROR)/, '\u001b[31m$1\u001b[0m')
        return err(`\`\`\`ansi\n${errorMsg}\n\`\`\``);
    }
}
