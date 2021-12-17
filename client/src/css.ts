import { data } from "../package.json";

(() =>
  console.log(/* CSS */ `body,
html {
    background-color: ${data.colors.DARK};
    color: ${data.colors.LIGHT};
    height: 100%;
    margin: 0;
}

h1 {
    font-family: "Courier New", Courier, monospace;
    font-size: medium;
    margin: 0;
    padding: 0.5rem 0;
}

header {
    outline: 1px solid ${data.colors.LIGHT};
    width: 100%;
}

#${data.ids.CENTERED_CONTENT} {
    display: flex;
    flex-direction: column;
    width: 485px;
}

#${data.ids.GAME_CONTAINER} {
    display: flex;
    height: 300px;
    outline: 1px solid ${data.colors.LIGHT}
}

#${data.ids.PRE_CLICK_CONTENT} {
    text-align: center;
}

#${data.ids.VIEWPORT_CONTAINER} {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
}`))();
