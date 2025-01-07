import "@/styles/globals.css";
import { useEffect } from "react";
import { initSocket } from "@/utils/socketManager";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    initSocket();
  }, []);

  return <Component {...pageProps} />;
}
