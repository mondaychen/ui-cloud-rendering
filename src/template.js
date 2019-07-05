// html skeleton provider
function template(title, content, renderId) {
  const scripts = `<script src="assets/js/client.js"></script>`;
  let page = `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="utf-8">
                <title> ${title} </title>
                <link href="assets/css/index.css" rel="stylesheet">
              </head>
              <body data-render-id="${renderId}">
                  <div id="app" class="todoapp">${content}</div>
                  ${scripts}
              </body>
              `;

  return page;
}

module.exports = template;
