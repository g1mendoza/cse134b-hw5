module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.jpg");
  eleventyConfig.addPassthroughCopy("*.jpeg");
  eleventyConfig.addPassthroughCopy("*.mp4");
  eleventyConfig.addPassthroughCopy("*.mp3");
  eleventyConfig.addPassthroughCopy("*.css");
  eleventyConfig.addPassthroughCopy(".js");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

};
