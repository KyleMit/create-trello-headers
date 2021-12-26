const { promisify } = require("util");
const { promises: fs } = require("fs");

const svgexport = require("svgexport");
const nunjucks = require("nunjucks");

const svgExportAsync = promisify(svgexport.render);
const cards = require("./cards.json");

main();

async function main() {
  try {
    await fs.mkdir("output/png", { recursive: true });
    await fs.mkdir("output/svg", { recursive: true });

    // process each template
    // write to output dir

    let cardPromises = cards.map(async (card) => {
      try {
        let svg = nunjucks.render("./template.svg.njk", card);
        let path = `output/svg/${card.title
          .replace(/[^A-Z]/gi, "")
          .toLowerCase()}.svg`;
        await fs.writeFile(path, svg, "utf8");
      } catch (error) {
        console.log(error);
      }
    });

    await Promise.all(cardPromises);

    let files = await fs.readdir("output/svg");

    let dataFile = files.map((file) => {
      let inputPath = `output/svg/${file}`;
      let outputPath = `output/png/${file.replace(/svg$/, "png")}`;
      return {
        input: [inputPath],
        output: [outputPath],
      };
    });

    await svgExportAsync(dataFile);
  } catch (error) {
    console.log(error);
  }
}
