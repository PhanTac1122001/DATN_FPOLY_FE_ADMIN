/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-magic-numbers */
const fs = require("fs");

const files = process.argv.slice(2);
let hasError = false;

for (const file of files) {
    if (!file.endsWith(".tsx")) {
        continue;
    }

    const content = fs.readFileSync(file, "utf8");

    // Find all <Table.Header> blocks
    const headerRegex = /<Table\.Header[\s\S]*?<\/Table\.Header>/g;
    let match;

    while ((match = headerRegex.exec(content)) !== null) {
        const headerContent = match[0];
        if (!headerContent.includes("isRowHeader")) {
            console.error(`\x1b[31m[Error] Missing 'isRowHeader' in Table component in: ${file}\x1b[0m`);
            console.error("react-aria-components requires at least one Column with isRowHeader={true} to avoid runtime crashes.");
            hasError = true;
        }
    }
}

if (hasError) {
    process.exit(1);
}
