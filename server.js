import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, "public")));

// Felhasználók tárolása: username -> socket.id
const users = new Map();

io.on("connection", (socket) => {
	console.log("User connected:", socket.id);

	/* ======================
	   USERNAME BEÁLLÍTÁS
	====================== */
	socket.on("set username", (username) => {

		// Ha a név már foglalt
		if (users.has(username)) {
			socket.emit("user exists", "Username already taken!");
			return;
		}

		// Felhasználó mentése
		users.set(username, socket.id);
		socket.username = username;

		console.log(`${username} joined the chat`);

		// Visszajelzés a kliensnek
		socket.emit("user set", username);

		// Rendszerüzenet mindenkinek
		io.emit("chat message", `🟢 ${username} joined the chat`);
	});

	/* ======================
	   CHAT ÜZENET
	====================== */
	socket.on("chat message", (msg) => {
		if (!socket.username) return;

		io.emit(
			"chat message",
			`${socket.username}: ${msg}`
		);
	});

	/* ======================
	   LOGOUT (Saját esemény)
	====================== */
	socket.on("logout", () => {
		if (socket.username) {
			users.delete(socket.username);

			io.emit(
				"chat message",
				`🔴 ${socket.username} left the chat`
			);

			console.log(`${socket.username} logged out`);
		}
	});

	/* ======================
	   DISCONNECT
	   (Böngésző bezárás / net hiba / logout után)
	====================== */
	socket.on("disconnect", () => {
		if (socket.username && users.has(socket.username)) {
			users.delete(socket.username);

			io.emit(
				"chat message",
				`🔴 ${socket.username} disconnected`
			);

			console.log(`${socket.username} disconnected`);
		}
	});
});

server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
