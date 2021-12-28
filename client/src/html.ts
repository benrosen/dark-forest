import { data } from "../package.json";

const { ids } = data.input;

console.log(/* HTML */ `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>The Dark Forest</title>
      <link rel="stylesheet" href="index.css" />
    </head>
    <body>
      <div id="${ids.viewportContainer}">
        <div id="${ids.centeredContent}">
          <div id="${ids.preClickContent}">
            <button>Enter</button>
          </div>
          <div hidden id="${ids.postClickContent}">
            <h1>EXT. SNOWY FOREST - NIGHT</h1>
            <div id="${ids.gameContainer}"></div>
          </div>
        </div>
      </div>
      <script src="index.js"></script>
    </body>
  </html> `);
