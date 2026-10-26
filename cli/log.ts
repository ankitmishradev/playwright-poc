const useColor = process.env.NO_COLOR
    ? false
    : Boolean(process.env.FORCE_COLOR) || Boolean(process.stdout.isTTY);

const paint = (code: number) => (text: string) =>
    useColor ? `\x1b[${code}m${text}\x1b[0m` : text;

const c = {
    bold: paint(1),
    dim: paint(2),
    red: paint(31),
    green: paint(32),
    yellow: paint(33),
    cyan: paint(36)
};

export const log = {
    info: (msg: string) => console.log(`${c.cyan('ℹ')} ${msg}`),
    step: (msg: string) => console.log(`${c.cyan('›')} ${c.bold(msg)}`),
    done: (msg: string) => console.log(`${c.green('✔')} ${msg}`),
    warn: (msg: string) => console.warn(`${c.yellow('⚠')} ${msg}`),
    error: (msg: string) => console.error(`${c.red('✖')} ${c.red(msg)}`),
    detail: (label: string, value: unknown) => {
        const lines = String(value).split('\n');
        console.error(`    ${c.dim(`${label}:`)} ${lines[0]}`);
        for (const line of lines.slice(1))
            console.error(`    ${' '.repeat(label.length + 2)}${line}`);
    },
    hint: (msg: string) =>
        console.error(`    ${c.yellow('→ How to fix:')} ${msg}`)
};
