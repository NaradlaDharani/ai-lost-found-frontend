import React, { useEffect, useState } from "react";

function StateMangement() {
  let [f, setF] = useState("🍎");
  console.log("\n\t data : " + f);
  const fhandler = () => {
    if (f == "🍎") {
      setF("🍏");
    } else if (f == "🍏") {
      setF("🍎");
    }
  };
  useEffect(fhandler, []);
  return (
    <div>
      <h2> fruit </h2>
      <h1> {f} </h1>
      <button onClick={fhandler}> click </button>
    </div>
  );
}

export default StateMangement;
