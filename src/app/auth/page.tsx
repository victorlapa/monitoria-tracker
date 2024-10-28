"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const router = useRouter();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const redirectUri =
    process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000";

  const handleGoogleAuth = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/spreadsheets&response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&access_type=offline&include_granted_scopes=true`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    // Optionally, redirect user to the dashboard if already authenticated
    if (localStorage.getItem("@gAccessToken")) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Monitoria Tracker</h1>
      <button
        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        onClick={handleGoogleAuth}
      >
        Login com Google
      </button>
    </div>
  );
};

export default AuthPage;
