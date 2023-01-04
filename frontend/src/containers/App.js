import { useState } from "react";
import GamePage from "./GamePage";
import SignIn from "./SignIn";

function App() {  
  const [start, setStart] = useState(false);
  return (
    <>
      {start?<GamePage />:<SignIn setStart={setStart}/>}
    </>
  );
}

export default App;
