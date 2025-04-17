import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div className="background relative w-screen min-h-dvh select-none font-medium text-neutral-800 dark:text-neutral-300">
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <p className="text-5xl min-[320px]:text-7xl font-osifont mt-4 text-nowrap">
          TZO-nátor
        </p>
        <App />
      </div>
      <footer className="absolute bottom-0.5 right-1">
        <p className="text-right text-sm sm:text-base">
          Vytvořil&nbsp;
          <a href="https://github.com/Vesek" className="link">
            Vesek
          </a>
          <br />
          <a href="https://github.com/Vesek/tzonator" className="link">
            Kód
          </a>
          &nbsp;otevřený pod AGPL-3
          <br />
        </p>
        <p className="text-right max-sm:hidden">
          Vše je zpracováno na zařízení
        </p>
      </footer>
    </div>
  </StrictMode>,
);

requestAnimationFrame(() => {
  document.body.classList.remove("loading");
});
