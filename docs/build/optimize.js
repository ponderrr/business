const fs = require("fs");
const path = require("path");
const { minify } = require("terser");
const CleanCSS = require("clean-css");

// Helper function to safely remove directory recursively
function removeDirectoryRecursive(dirPath) {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);
  const minorVersion = parseInt(nodeVersion.slice(1).split(".")[1]);

  // Check if Node.js version supports fs.rmSync (14.14.0+)
  if (majorVersion > 14 || (majorVersion === 14 && minorVersion >= 14)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } else {
    // Fallback for older Node.js versions
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
}

async function build() {
  console.log("🔧 Starting build optimization...");

  // Clean up old build files by deleting the dist directory if it exists
  try {
    if (fs.existsSync("dist")) {
      removeDirectoryRecursive("dist");
      console.log("🧹 Cleaned up old dist directory.");
    }
  } catch (err) {
    console.error("❌ Error cleaning up dist directory:", err);
    process.exit(1);
  }

  // Validate required source files before proceeding
  const requiredFiles = [
    "index.html",
    "assets/css/main.css",
    "assets/js/critical.js",
    "assets/js/modules",
  ];
  let missing = false;
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Required source file or directory missing: ${file}`);
      missing = true;
    }
  }
  if (missing) {
    console.error("❌ Build aborted due to missing source files.");
    process.exit(1);
  }

  // Create dist directory structure
  try {
    if (!fs.existsSync("dist")) fs.mkdirSync("dist", { recursive: true });
    if (!fs.existsSync("dist/assets/css"))
      fs.mkdirSync("dist/assets/css", { recursive: true });
    if (!fs.existsSync("dist/assets/js"))
      fs.mkdirSync("dist/assets/js", { recursive: true });
    if (!fs.existsSync("dist/assets/js/modules"))
      fs.mkdirSync("dist/assets/js/modules", { recursive: true });
  } catch (err) {
    console.error("❌ Error creating dist directory structure:", err);
  }

  // Copy and update index.html to use minified assets
  try {
    if (!fs.existsSync("index.html")) {
      console.error("❌ Error: index.html not found. Build aborted.");
      process.exit(1);
    }
    let html = fs.readFileSync("index.html", "utf8");
    html = html.replace(/assets\/css\/main\.css/g, "assets/css/main.min.css");
    fs.writeFileSync("dist/index.html", html);
  } catch (err) {
    console.error("❌ Error processing index.html:", err);
  }

  // Minify CSS
  try {
    const css = fs.readFileSync("assets/css/main.css", "utf8");
    const minifiedCSS = await new CleanCSS({
      level: 2,
    }).minify(css);
    if (minifiedCSS.errors && minifiedCSS.errors.length > 0) {
      throw new Error(minifiedCSS.errors.join("; "));
    }
    fs.writeFileSync("dist/assets/css/main.min.css", minifiedCSS.styles);
  } catch (err) {
    console.error(
      "❌ Error minifying CSS. Minified CSS file was not written:",
      err
    );
  }

  // Minify JavaScript modules
  const jsDir = "assets/js/modules";
  const distJsDir = "dist/assets/js/modules";
  try {
    const jsFiles = fs.readdirSync(jsDir);
    const jsFileFilter = jsFiles.filter(
      (file) => path.extname(file).toLowerCase() === ".js"
    );

    if (jsFileFilter.length === 0) {
      console.warn(
        "⚠️  Warning: No JavaScript files found in assets/js/modules directory."
      );
    } else {
      console.log(
        `📦 Processing ${jsFileFilter.length} JavaScript module(s)...`
      );
    }

    for (const file of jsFileFilter) {
      try {
        const code = fs.readFileSync(path.join(jsDir, file), "utf8");
        const minified = await minify(code, {
          module: true,
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        });
        if (!minified.code) {
          throw new Error("Terser did not return minified code.");
        }
        fs.writeFileSync(path.join(distJsDir, file), minified.code);
        console.log(`✅ Minified: ${file}`);
      } catch (err) {
        console.error(
          `❌ Error minifying JS module ${file}. Minified JS file was not written:`,
          err
        );
      }
    }
  } catch (err) {
    console.error("❌ Error reading JS modules directory:", err);
  }

  // Copy and minify critical JS
  try {
    if (!fs.existsSync("assets/js/critical.js")) {
      console.warn(
        "⚠️  Warning: assets/js/critical.js not found. Skipping critical JS minification."
      );
    } else {
      const criticalJs = fs.readFileSync("assets/js/critical.js", "utf8");
      const minifiedCritical = await minify(criticalJs);
      fs.writeFileSync("dist/assets/js/critical.js", minifiedCritical.code);
    }
  } catch (err) {
    console.error("❌ Error minifying critical JS:", err);
  }

  console.log("✅ Build optimization complete!");
}

build().catch(console.error);
