import fs from "node:fs";

console.log('Before calling fs.readFile()')

type ErrorFirstCallback = (err: Error | null, data: Buffer) => void;

const callback: ErrorFirstCallback = (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
};

fs.readFile('README.md', callback)
console.log('After calling fs.readFile()')
