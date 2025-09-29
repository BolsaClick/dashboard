// pages/api/socketio.ts
import { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";

export const config = {
  api: {
    bodyParser: false, // necessário para o Socket.IO
  },
};

let io: IOServer | undefined;

export default function handler(req: NextApiRequest, res: any) {
  const server: any = res.socket.server;

  if (!server.io) {
    console.log("🔌 Criando Socket.IO server...");

    const ioServer = new IOServer(server, {
      path: "/api/socketio",
      cors: {
        origin: "*", // ⚠️ cuidado em produção
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    ioServer.on("connection", (socket) => {
      console.log("🟢 Cliente conectado:", socket.id);

      socket.on("joinTransaction", (transactionId: string) => {
        socket.join(transactionId);
        console.log(`🔗 ${socket.id} entrou na sala ${transactionId}`);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Cliente desconectado:", socket.id);
      });
    });

    server.io = ioServer;
    io = ioServer;
  } else {
    console.log("♻️ Socket.IO já inicializado");
  }

  // 🔴 não chame res.end() aqui!
  res.status(200).json({ msg: "Socket.IO server running" });
}

// 🔹 Função auxiliar para webhook
export function notifyPayment(transactionId: string, status: string) {
  if (io) {
    io.to(transactionId).emit("paymentStatus", { transactionId, status });
    console.log(`📡 Enviado para sala ${transactionId}: ${status}`);
  } else {
    console.warn("⚠️ Socket.IO não inicializado");
  }
}
