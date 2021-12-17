import { data } from "../package.json";

(() =>
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
        <div id="${data.ids.VIEWPORT_CONTAINER}">
          <div id="${data.ids.CENTERED_CONTENT}">
            <div id="${data.ids.PRE_CLICK_CONTENT}">
              <button>Start</button>
            </div>
            <div hidden id="${data.ids.POST_CLICK_CONTENT}">
              <h1>EXT. SNOWY FOREST - NIGHT</h1>
              <div id="${data.ids.GAME_CONTAINER}"></div>
            </div>
          </div>
        </div>
        <script src="index.js"></script>
      </body>
    </html> `))();
