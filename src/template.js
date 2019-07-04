// html skeleton provider
function template(title, content = ""){
  let scripts = ''; // Dynamically ship scripts based on render type
  if(content){
    scripts = `<script src="assets/js/client.js"></script>`
  } else {
    scripts = ` <script src="assets/js/bundle.js"> </script> `
  }
  let page = `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="utf-8">
                <title> ${title} </title>
                <link href="assets/css/index.css" rel="stylesheet">
              </head>
              <body>
                  <div id="app" class="todoapp">${content}</div>
                  ${scripts}
              </body>
              `;

  return page;
}

module.exports = template;
