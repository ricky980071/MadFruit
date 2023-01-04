import React, { createContext, useContext, useState } from "react";
import { useUnityContext } from "react-unity-webgl";

const GameContext = createContext({
    unityProvider: null,
    sendMessage: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    name: "",
    setName: () => {},
});

const GameProvider = (props) => {
    const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "Build/Public.loader.js",
        dataUrl: "Build/Public.data.unityweb",
        frameworkUrl: "Build/Public.framework.js.unityweb",
        codeUrl: "Build/Public.wasm.unityweb",
    });
    const [name, setName] = useState("Player");
    return (
        <GameContext.Provider
        value={{
            unityProvider, sendMessage, addEventListener, removeEventListener, name, setName
        }}
        {...props}
        />
    );
};
const useGamePage = () => useContext(GameContext);

export { GameProvider, useGamePage };