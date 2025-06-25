const fs = require("fs");
const path = require("path");
const { minify } = require("terser");
const CleanCSS = require("clean-css");

async function build() {
  console.log("🔧 Starting build optimization...");

  // Create dist directory structure
  if (!fs.existsSync("dist")) fs.mkdirSync("dist", { recursive: true });
  if (!fs.existsSync("dist/assets/css"))
    fs.mkdirSync("dist/assets/css", { recursive: true });
  if (!fs.existsSync("dist/assets/js"))
    fs.mkdirSync("dist/assets/js", { recursive: true });
  if (!fs.existsSync("dist/assets/js/modules"))
    fs.mkdirSync("dist/assets/js/modules", { recursive: true });

  // Copy and update index.html to use minified assets
  let html = fs.readFileSync("index.html", "utf8");
  html = html.replace(/assets\/css\/main\.css/g, "assets/css/main.min.css");
  fs.writeFileSync("dist/index.html", html);

  // Minify CSS
  const css = fs.readFileSync("assets/css/main.css", "utf8");
  const minifiedCSS = await new CleanCSS({
    level: 2,
  }).minify(css);

  fs.writeFileSync("dist/assets/css/main.min.css", minifiedCSS.styles);

  // Minify JavaScript modules
  const jsDir = "assets/js/modules";
  const distJsDir = "dist/assets/js/modules";

  const jsFiles = fs.readdirSync(jsDir);
  for (const file of jsFiles) {
    const code = fs.readFileSync(path.join(jsDir, file), "utf8");
    const minified = await minify(code, {
      module: true,
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    });
    fs.writeFileSync(path.join(distJsDir, file), minified.code);
  }

  // Copy and minify critical JS
  const criticalJs = fs.readFileSync("assets/js/critical.js", "utf8");
  const minifiedCritical = await minify(criticalJs);
  fs.writeFileSync("dist/assets/js/critical.js", minifiedCritical.code);

  console.log("✅ Build optimization complete!");
}

build().catch(console.error);
