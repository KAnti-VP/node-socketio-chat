// Socket kapcsolat létrehozása
let socket = io();

// DOM elemek
const loginBtn = document.getElementById("loginBtn");
const loginDiv = document.getElementById("login");
const usernameInput = document.getElementById("username");

const chatContainerDiv = document.getElementById("chatContainer");
const form = document.getElementById("form");
const chat = document.getElementById("chat");
const messageInput = document.getElementById("msginput");
const logoutBtn = document.getElementById("logoutBtn");

let currentUsername = null;

/* ======================
   LOGIN
====================== */
loginBtn.addEventListener("click", () => {
	const username = usernameInput.value.trim();
	if (!username) return;

	// Felhasználónév elküldése a szervernek
	socket.emit("set username", username);
});

/* ======================
   ÜZENET KÜLDÉS
====================== */
form.addEventListener("submit", (e) => {
	e.preventDefault();

	if (messageInput.value.trim()) {
		socket.emit("chat message", messageInput.value);
		messageInput.value = "";
	}
});

/* ======================
   LOGOUT
====================== */
logoutBtn.addEventListener("click", () => {

	// Saját logout esemény (üzleti logika)
	socket.emit("logout");

	// Kapcsolat bontása
	socket.disconnect();

	// UI visszaállítása
	loginDiv.style.display = "block";
	chatContainerDiv.style.display = "none";
	chat.innerHTML = "";

	// ÚJ socket kapcsolat létrehozása a visszalépéshez
	socket = io();
	registerSocketEvents();
});

/* ======================
   SOCKET ESEMÉNYEK
====================== */
function registerSocketEvents() {

	// Sikeres belépés
	socket.on("user set", (username) => {
		currentUsername = username;
		loginDiv.style.display = "none";
		chatContainerDiv.style.display = "block";
	});

	// Felhasználónév már létezik
	socket.on("user exists", (msg) => {
		alert(msg);
	});

	// Chat vagy rendszerüzenet fogadása
	socket.on("chat message", (msg) => {
		const item = document.createElement("li");
		item.textContent = msg;
		chat.appendChild(item);
		window.scrollTo(0, document.body.scrollHeight);
	});
}

// Első csatlakozáskor regisztráljuk
registerSocketEvents();
