import "@/styles/globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  // this state below for users is login or not:
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // we use this useEffect for show (dashboard) and (add contacts) page on navbar or not(after login successful we must show).
  useEffect(() => {
    const isAuth = async () => {
      const res = await fetch("/api/auth/status",{
        credentials: "include"
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };
    isAuth();
  }, []);
  return (
    <>
      <Head>
        <title>Contact manager project</title>
      </Head>
      <Toaster position="top-right" />
      {/* we share this state on navbar and login page: */}
      <Navbar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
      <Component
        {...pageProps}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
    </>
  );
}
