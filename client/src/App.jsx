import { useEffect, useState } from "react";
import { getHealth } from "./api/client";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    getHealth()
      .then((data) => setStatus(`API ok, DB: ${data.db}`))
      .catch((err) => setStatus(`API error: ${err.message}`));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold text-gray-800">Toy Sharing</h1>
      <p className="text-gray-500">{status}</p>
    </div>
  );
}

export default App;
