const glob = require("glob-promise")
const markdownIt = require("markdown-it")
const fs = require("fs")

module.exports = function (eleventyConfig) {
  function getFilename(path) {
    let origFilename = path.split("/").pop()
    let parts = origFilename.split(".")
    parts.pop()
    origFilename = parts.join(".")
    return origFilename
  }

  const Image = require("@11ty/eleventy-img")
  ;(async () => {
    let options = {
      widths: [128],
      formats: ["png"],
      outputDir: "public/128",
      filenameFormat: function (id, src, width, format, options) {
        const filename = getFilename(src)
        return `${filename}.${format}`
      },
    }
    let files = await glob("./src/raw/*.{jpg,jpeg,png,gif}")
    const images = {}
    for (const f of files) {
      console.log("doing f", f)
      const md = await Image(f, options)
      const sign = getFilename(f)
      const metadata = md.png.map((p) => {
        return { format: p.format, height: p.height, width: p.width, url: `128/${sign}.png` }
      })
      images[sign] = metadata
      console.log(metadata)
    }
    fs.writeFileSync(`public/index.json`, JSON.stringify(images, undefined, 2))
  })()

  // Markdown
  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
    })
  )

  // STATIC FILES
  eleventyConfig.addPassthroughCopy({ "./src/static/": "/" })

  return {
    dir: {
      input: "src",
      output: "public",
      data: "./_data",
      includes: "./_includes",
      layouts: "./_layouts",
    },
    templateFormats: ["md", "njk", "11ty.js"],
    htmlTemplateEngine: "njk",
  }
}
