// module.exports = config => {
//   // Returns a collection of blog posts in reverse date order
// config.addCollection('blog', collection => {
//   return [...collection.getFilteredByGlob('./src/posts/*.md')].reverse();
// });
//     config.addPassthroughCopy({
//         'src/_includes/assets/css/': './'
//       });
//       config.addPassthroughCopy({'./src/assets/':'./'});
//     return {
//         markdownTemplateEngine: 'njk',
//         dataTemplateEngine: 'njk',
//         htmlTemplateEngine: 'njk',
//       dir: {
//         input: 'src',
//         output: 'dist'
//       },
//       passthroughFileCopy: true
//     };
//   };

const sortByDisplayOrder = require('./src/utils/sort-by-display-order.js');
const dateFilter = require('./src/filters/date-filter.js');
const w3DateFilter = require('./src/filters/w3-date-filter.js');
const rssPlugin = require('@11ty/eleventy-plugin-rss');
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownItEmoji = require("markdown-it-emoji");
const htmlmin = require('html-minifier')
module.exports = (config) => {
  config.addPlugin(syntaxHighlight);

  // setup mermaid markdown highlighter
  const highlighter = config.markdownHighlighter;
  config.addMarkdownHighlighter((str, language) => {
    if (language === 'mermaid') {
      return `<pre class="mermaid">${str}</pre>`;
    }
    return highlighter(str, language);
  });
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  };
  const markdownLib = markdownIt(mdOptions)
    .use(markdownItAttrs)
    .use(markdownItEmoji)
    .use(require('markdown-it-sub'))
    .use(require('markdown-it-sup'))
    .use(require('markdown-it-ins'))
    .use(require('markdown-it-mark'))
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-deflist'))
    .use(require('markdown-it-abbr'))
    .use(require('markdown-it-container'), 'classname', {
      validate: name => name.trim().length,
      render: (tokens, idx) => {
        if (tokens[idx].nesting === 1) {
          return `<div class="${tokens[idx].info.trim()}">\n`;
        } else  {
          return '</div>\n';
        }
      }
    })
    .use(require('markdown-it-multimd-table'), {
      multiline:  false,
      rowspan:    false,
      headerless: false,
    }).disable("code");

  config.setLibrary("md", markdownLib);
    config.addFilter('dateFilter', dateFilter);
    config.addFilter('w3DateFilter', w3DateFilter);
    config.addPassthroughCopy('./src/images/');
    config.addPlugin(rssPlugin);
    config.setUseGitIgnore(false);

    config.addCollection('work', collection => {
        return sortByDisplayOrder(collection.getFilteredByGlob('./src/work/*.md'));
      });
      
      // Returns work items, sorted by display order then filtered by featured
      config.addCollection('featuredWork', collection => {
        return sortByDisplayOrder(collection.getFilteredByGlob('./src/work/*.md')).filter(
          x => x.data.featured
        );
      });
      config.addCollection('blog', collection => {
        return [...collection.getFilteredByGlob('./src/posts/*.md')].reverse().filter(
          x => x.data.published || !x.data.published 
        );
      });
      config.addCollection('people', collection => {
        return collection.getFilteredByGlob('./src/people/*.md').sort((a, b) => {
          return Number(a.fileSlug) > Number(b.fileSlug) ? 1 : -1;
        });
      });
      config.addPassthroughCopy({'./src/assets/':'./'});
      config.addPassthroughCopy({
        './node_modules/alpinejs/dist/cdn.js': './js/alpine.js',
      })
      config.addPassthroughCopy({
                'src/_includes/assets/css/': './'
              });
              config.addTransform('htmlmin', function (content, outputPath) {
                if (
                  process.env.ELEVENTY_ENV === 'production' &&
                  outputPath &&
                  outputPath.endsWith('.html')
                ) {
                  let minified = htmlmin.minify(content, {
                    useShortDoctype: true,
                    removeComments: true,
                    collapseWhitespace: true,
                  })
                  return minified
                }
            
                return content
              })
    return {
        markdownTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
      dir: {
        input: 'src',
        output: 'dist'
      },
      passthroughFileCopy: true
    };
   
  };


