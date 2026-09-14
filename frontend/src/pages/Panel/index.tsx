import type { PanelData } from "@/types/numbers";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3333";

export default function PanelPage() {
  const [data, setData] = useState<PanelData | null>(null);
  const [isNew, setIsNew] = useState(false);

  const lastNumberRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/queue`, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    const handleQueueState = (panel: PanelData) => {
      if (panel.current && panel.current !== lastNumberRef.current) {
        lastNumberRef.current = panel.current;

        setIsNew(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setIsNew(false);
        }, 3000);
      }

      setData(panel);
    };

    socket.on("queue:state", handleQueueState);

    socket.on("connect_error", (error) => {
      console.error("Erro ao conectar no socket:", error.message);
    });

    return () => {
      socket.off("queue:state", handleQueueState);
      socket.disconnect();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="px-10 py-6 border-b border-gray-700">
        <h1 className="text-2xl font-semibold tracking-wide">
          Painel de Atendimento
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-2xl text-gray-400 mb-4">Senha atual</p>

        <div
          className={`w-full max-w-3xl rounded-3xl border-4 px-10 py-14 text-center transition-all duration-500 ${
            isNew
              ? "border-green-400 bg-green-500/10 scale-105"
              : "border-gray-700 bg-gray-800"
          }`}
        >
          {data?.current ? (
            <p className="text-[140px] leading-none font-bold tabular-nums">
              {data.current}
            </p>
          ) : (
            <p className="text-4xl text-gray-500">Aguardando chamada</p>
          )}
        </div>

        <section className="w-full max-w-3xl mt-14">
          <p className="text-xl text-gray-400 mb-4 text-center">
            Últimas chamadas
          </p>

          <div className="grid grid-cols-2 gap-6">
            {data?.lastCalls && data.lastCalls.length > 0 ? (
              data?.lastCalls.map((number, index) => (
                <div
                  key={`${number}-${index}`}
                  className="rounded-2xl bg-gray-800 border border-gray-700 px-6 py-6 text-center"
                >
                  <p className="text-5xl font-semibold tabular-nums text-gray-200">
                    {number}
                  </p>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center text-gray-600">
                Nenhuma chamada anterior
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
