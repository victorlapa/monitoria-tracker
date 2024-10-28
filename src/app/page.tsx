"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";

interface IEntryInfo {
  name: string;
  group: "A" | "B";
  doubt: string;
}

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [isSuccessRequest, setIsSuccessRequest] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || "";
  const redirectUri =
    process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000";

  useEffect(() => {
    const previousToken = window.localStorage.getItem("@gAccessToken");

    if (previousToken) {
      setAccessToken(previousToken);
    } else {
      const codeParams = searchParams.get("code");

      fetchAccessToken(codeParams as string);
    }
  }, []);

  const fetchAccessToken = async (code: string) => {
    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data).toString(),
      });

      const result = await response.json();

      if (response.ok) {
        const tokenResponse = result.access_token;

        setAccessToken(tokenResponse);

        window.localStorage.setItem("@gAccessToken", tokenResponse);

        router.replace("/", { scroll: false });
      } else {
        router.push("/auth");
      }
    } catch (err) {
      console.error("Error fetching access token:", err);
    }
  };

  const [formData, setFormData] = useState<IEntryInfo>({
    name: "",
    group: "A",
    doubt: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addEntryToSheet = async () => {
    setIsLoadingRequest(true);

    const { name, group, doubt } = formData;

    const range = "S.O!A:D";

    const data = {
      values: [[new Date().toLocaleDateString("pt-BR"), name, group, doubt]],
    };

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.NEXT_PUBLIC_SO_SPREADSHEET_ID}/values/${range}:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (response.ok) {
      setIsSuccessRequest(true);
      setIsLoadingRequest(false);

      setInterval(() => {
        setIsSuccessRequest(false);
      }, 2000);
    } else {
      console.error("Error adding entry:", result);
    }
  };

  return (
    <Suspense>
      <div className="flex-col flex justify-center items-center min-h-screen from-red-400 to-red-800 bg-gradient-to-br">
        <h1 className="text-4xl text-neutral-800 pb-4 font-bold">
          Registro Monitoria
        </h1>
        <form
          className="bg-white p-6 rounded shadow-md flex flex-col gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            placeholder="Nome"
            className="text-gray-700 px-2"
            name="name"
            onChange={handleChange}
            value={formData.name}
          />
          <div className="flex items-center gap-2 text-neutral-700 px-2">
            Turma:
            <button
              className={`transition-all rounded-full h-10 w-10 border border-red-800 flex justify-center items-center ${
                formData.group === "A" && "bg-red-800 text-white"
              }`}
              onClick={() => setFormData({ ...formData, group: "A" })}
              type="button"
            >
              <span>A</span>
            </button>
            <button
              className={`transition-all rounded-full h-10 w-10 border border-red-800 flex justify-center items-center ${
                formData.group === "B" && "bg-red-800 text-white"
              }`}
              onClick={() => setFormData({ ...formData, group: "B" })}
              type="button"
            >
              <span>B</span>
            </button>
          </div>
          <textarea
            placeholder="Dúvida"
            className="text-neutral-700 px-2"
            name="doubt"
            onChange={handleChange}
            value={formData.doubt}
          />
          {!isSuccessRequest ? (
            <button
              className={`transition-all bg-red-500 p-2 rounded text-white hover:bg-red-600 disabled:cursor-progress disabled:bg-neutral-600`}
              onClick={addEntryToSheet}
              disabled={isLoadingRequest}
            >
              {isLoadingRequest ? (
                <LoaderCircle
                  color="white"
                  size={24}
                  className="animate-spin m-auto"
                />
              ) : (
                "Enviar"
              )}
            </button>
          ) : (
            <button
              className={`bg-green-500 p-2 rounded text-white`}
              onClick={() => setIsLoadingRequest(!isLoadingRequest)}
            >
              <span className="flex items-center justify-center">
                Sucesso <Check color="white" size={24} />
              </span>
            </button>
          )}
        </form>
      </div>
    </Suspense>
  );
}
