import { api } from "@/services/api";
import type { PanelData, PendingItem } from "@/types/numbers";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3333";

export default function OperatorPage() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [queueState, setQueueState] = useState<PanelData>({
    current: null,
    lastCalls: [],
  });
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/queue`, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    const handleQueueState = (state: PanelData) => {
      setQueueState(state);
    };

    const handlePendingList = (list: PendingItem[]) => {
      setPending(list);
    };

    const handleNewPending = (item: PendingItem) => {
      setPending((current) => [...current, item]);
    };

    socket.on("queue:state", handleQueueState);
    socket.on("queue:pending-list", handlePendingList);
    socket.on("queue:new-pending", handleNewPending);

    socket.on("connect_error", (error) => {
      console.error("Erro ao conectar no socket:", error.message);
    });

    return () => {
      socket.off("queue:state", handleQueueState);
      socket.off("queue:pending-list", handlePendingList);
      socket.off("queue:new-pending", handleNewPending);

      socket.disconnect();
    };
  }, []);

  async function callNext(id: string) {
    await api.post<string>(`/numbers/call-next/${id}`);
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col gap-5 min-h-screen bg-gray-950 text-gray-100">
      <header className="px-10 py-6 border-b border-gray-800 bg-gray-900 shadow-md flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">
          Painel de Atendimento
        </h1>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md
             text-gray-300 hover:bg-gray-800 hover:text-white
             cursor-pointer transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <main className="flex gap-6 justify-around items-stretch p-8">
        <div className="flex flex-col flex-1 gap-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-center text-gray-100">
            Aguardando
          </h2>

          <div className="flex items-stretch justify-around gap-4 flex-1">
            <div className="flex flex-col flex-1 items-center rounded-xl bg-gray-800/60 border border-gray-700 p-4">
              <h3 className="text-sm font-semibold tracking-widest text-blue-400 mb-3">
                NORMAL
              </h3>
              <div className="flex flex-col gap-2 w-full">
                {pending
                  .filter((item) => item.type === "normal")
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => callNext(item.id)}
                      className="text-lg font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-lg py-1.5 px-3 cursor-pointer transition-colors hover:bg-blue-500/20 active:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {item.queueNumber}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex flex-col flex-1 items-center rounded-xl bg-gray-800/60 border border-gray-700 p-4">
              <h3 className="text-sm font-semibold tracking-widest text-amber-400 mb-3">
                PRIORIDADE
              </h3>
              <div className="flex flex-col gap-2 w-full">
                {pending
                  .filter((item) => item.type === "priority")
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => callNext(item.id)}
                      className="text-lg font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg py-1.5 px-3 cursor-pointer transition-colors hover:bg-amber-500/20 active:bg-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {item.queueNumber}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-center text-gray-100">
            Chamadas
          </h2>

          {/* Senha atual em destaque */}
          {queueState.current && (
            <div className="flex flex-col items-center gap-1 py-4 border-b border-gray-800">
              <span className="text-xs uppercase tracking-widest text-gray-400">
                Chamando agora
              </span>
              <span className="text-4xl font-bold text-green-400 animate-pulse">
                {queueState.current}
              </span>
            </div>
          )}
          <div className="flex-1 flex flex-col items-center justify-start gap-2">
            {queueState.lastCalls.map((call, index) => (
              <span
                key={index}
                className="text-lg font-medium bg-green-500/10 text-green-300 border border-green-500/30 rounded-lg py-1.5 px-3"
              >
                {call}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
