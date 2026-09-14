import { api } from "@/services/api";
import { NumberType, type CreateNumberDto } from "@/types/numbers";
import { useEffect, useState, type FormEvent } from "react";

export default function GenerateNumberPage() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [type, setType] = useState<NumberType>(NumberType.NORMAL);
  const [loading, setLoading] = useState(false);
  const [queueNumber, setQueueNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queueNumber) return;
    const timer = setTimeout(() => setQueueNumber(null), 5000);
    return () => clearTimeout(timer);
  }, [queueNumber]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: CreateNumberDto = { name, cpf, type };
      const { data } = await api.post<string>("/numbers", payload);
      setQueueNumber(data);
      setName("");
      setCpf("");
    } catch (err) {
      setError("Não foi possível gerar a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (queueNumber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-600 px-6 text-center">
        <p className="text-2xl font-medium text-green-50 mb-4">Sua senha é</p>
        <p className="text-[120px] leading-none font-bold text-white mb-8 tabular-nums">
          {queueNumber}
        </p>
        <p className="text-lg text-green-100">Aguarde ser chamado no painel</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
          Retirar Senha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-xl font-medium text-gray-800 mb-2"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-5 text-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label
              htmlFor="cpf"
              className="block text-xl font-medium text-gray-800 mb-2"
            >
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-5 text-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <p className="block text-xl font-medium text-gray-800 mb-2">
              Tipo de atendimento
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType(NumberType.NORMAL)}
                className={`h-20 rounded-xl border-2 text-xl font-semibold transition ${
                  type === NumberType.NORMAL
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setType(NumberType.PRIORITY)}
                className={`h-20 rounded-xl border-2 text-xl font-semibold transition ${
                  type === NumberType.PRIORITY
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                Prioritário
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-20 rounded-xl bg-blue-600 text-white font-bold text-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Gerando..." : "Gerar senha"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border-2 border-red-200 px-5 py-4">
            <p className="text-lg text-red-700 text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
