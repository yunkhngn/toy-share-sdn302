import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./page/Home";
import { ToyDetail } from "./page/ToyDetail";
import { Login } from "./page/Login";
import { Register } from "./page/Register";
import { MyToys } from "./page/MyToys";
import { Requests } from "./page/Requests";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/toys/:id" element={<ToyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-toys" element={<MyToys />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
