const fs = require("fs");
const files = [
  "src/utils/assets/images/icon.png",
  "src/utils/assets/images/adaptive-icon.png",
  "src/utils/assets/images/splash-icon.png",
  "src/utils/assets/images/favicon.png",
];
for (const file of files) {
  try {
    const buf = fs.readFileSync(file);
    const header = buf.slice(0, 8).toString("hex").toUpperCase();
    let type = "unknown";
    let dims = "";
    if (header.startsWith("89504E47")) {
      type = "png";
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      dims = `${width}x${height}`;
    }
    if (header.startsWith("FFD8FF")) type = "jpg";
    console.log(file, type, dims || buf.length);
  } catch (e) {
    console.log(file, "ERROR", e.message);
  }
}
