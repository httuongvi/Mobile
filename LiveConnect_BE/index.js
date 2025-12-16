const NodeMediaServer = require("node-media-server");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- CẤU HÌNH RTMP ---
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 10,
    ping_timeout: 30,
  },
  http: {
    port: 8000,
    allow_origin: "*",
    mediaroot: "./media",
  },
};
const nms = new NodeMediaServer(config);
nms.run();

// --- DATABASE GIẢ LẬP ---
let users = {};
let activeRooms = {};

// --- API ---
app.post("/api/register", (req, res) => {
  const { username, password, roomName } = req.body;
  if (users[username])
    return res
      .status(400)
      .json({ success: false, message: "Tài khoản đã tồn tại!" });
  users[username] = { password, roomName };
  res.json({ success: true, roomName });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password)
    return res.status(400).json({ success: false, message: "Sai thông tin" });
  res.json({ success: true, roomName: user.roomName });
});

app.get("/api/get-streams", (req, res) => {
  res.json(Object.values(activeRooms));
});

// --- HÀM CẬP NHẬT VIEW (SỬA LẠI) ---
const updateRoomCount = (roomID) => {
  if (!roomID) return;
  const room = io.sockets.adapter.rooms.get(roomID);
  const total = room ? room.size : 0;

  // 🛑 FIX: Gửi tổng số kết nối thực tế, không trừ 1 ở đây nữa để tránh sai sót
  io.to(roomID).emit("update_viewer_count", total);

  console.log(`👀 Phòng ${roomID}: Tổng ${total} kết nối (Socket)`);
};

// --- SOCKET IO ---
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // 1. KHI NGƯỜI DÙNG VÀO PHÒNG
  socket.on("join_room", (roomID) => {
    // Ép kiểu về String để đảm bảo khớp Room
    const roomStr = String(roomID);

    if (socket.currentRoom && socket.currentRoom !== roomStr) {
      socket.leave(socket.currentRoom);
      updateRoomCount(socket.currentRoom);
    }

    socket.join(roomStr);
    socket.currentRoom = roomStr;

    // Gửi thông tin stream hiện tại cho người mới vào
    if (activeRooms[roomStr]) {
      socket.emit("current_live_status", {
        startTime: activeRooms[roomStr].startTime,
        serverTime: Date.now(),
        title: activeRooms[roomStr].title,
      });
    }

    // Cập nhật view
    updateRoomCount(roomStr);
  });

  socket.on("leave_room", (roomID) => {
    socket.leave(roomID);
    delete socket.currentRoom;
    updateRoomCount(roomID);
  });

  socket.on("update_stream_info", (data) => {
    const roomStr = String(data.roomID);
    if (!activeRooms[roomStr]) {
      activeRooms[roomStr] = {
        id: roomStr,
        startTime: Date.now(),
        title: data.title,
      };
    } else {
      activeRooms[roomStr].title = data.title;
    }
  });

  socket.on("send_message", (data) =>
    io.to(String(data.roomID)).emit("receive_message", data)
  );

  socket.on("send_heart", (roomID) =>
    io.to(String(roomID)).emit("receive_heart")
  );

  // 👇 SỰ KIỆN TẶNG QUÀ
  socket.on("send_gift", (data) => {
    console.log(`🎁 ${data.senderName} sent gift in room ${data.roomID}`);
    io.to(String(data.roomID)).emit("receive_gift", data);
  });

  socket.on("end_stream", (roomID) => {
    delete activeRooms[roomID];
    io.to(String(roomID)).emit("stream_ended");
  });

  socket.on("disconnect", () => {
    const roomID = socket.currentRoom;
    if (roomID) {
      updateRoomCount(roomID);
    }
  });
});

server.listen(3000, () => console.log("✅ Server running on port 3000"));
