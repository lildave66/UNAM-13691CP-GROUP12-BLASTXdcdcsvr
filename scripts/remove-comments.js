const fs = require("fs");
const path = require("path");
const strip = require("strip-comments");

const exts = new Set([".js", ".jsx"]);
let count = 0;

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      await walk(full);
    } else if (entry.isFile() && exts.has(path.extname(entry.name))) {
      const content = await fs.promises.readFile(full, "utf8");
      const stripped = strip(content, { preserveNewlines: true });
      if (stripped !== content) {
        await fs.promises.writeFile(full, stripped, "utf8");
        count += 1;
      }
    }
  }
}

walk(path.resolve(__dirname, ".."))
  .then(() => {
    console.log("Processed", count, "files.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
