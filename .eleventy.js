module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("butterf.png");
  eleventyConfig.addPassthroughCopy("giselle.JPG");
  eleventyConfig.addPassthroughCopy("*.css");
  eleventyConfig.addPassthroughCopy("*.js");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

};