import { startCodeRunner } from './src/runner';

(async () => {
    console.log('Starting container...');
    console.log(await startCodeRunner({
        code: 'echo \$BASH_VERSION',
        lang: 'bash',
        version: '5.2'
    }))
})()
