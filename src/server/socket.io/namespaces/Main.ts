import http from "http";
import socketIO from "socket.io";

export default class Main {
  nsp: socketIO.Namespace

  constructor(httpInstance: http.Server, ioInstance: socketIO.Server) {
    this.nsp = ioInstance.of("/main");
    this.start();
  }

  async start() {
    this.nsp.on("connection", (socket) => {
      console.log("Socket connected");
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    });
  }
}