import { data } from "../package.json";

const { colors, ids } = data.input;

console.log(/* CSS */ `body,
html {
    background-color: ${colors.secondary};
    color: ${colors.primary};
    height: 100%;
    margin: 0;
}

button {
    background: none;
    border: none;
    color: ${colors.primary};
    font-family: "Courier New", Courier, monospace;
    font-size: medium;
    padding: 0;
    margin: 0;
}

h1 {
    font-family: "Courier New", Courier, monospace;
    font-size: medium;
    font-weight: normal;
    margin: 0;
    padding: 0.5rem 0;
}

header {
    outline: 1px solid ${colors.light};
    width: 100%;
}

#${ids.centeredContent} {
    display: flex;
    flex-direction: column;
    width: 485px;
}

#${ids.gameContainer} {
    display: flex;
    height: 300px;
    outline: 1px solid ${colors.light}
}

#${ids.preClickContent} {
    text-align: center;
}

#${ids.viewportContainer} {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
}`);
