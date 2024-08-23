const Marcadores = require("./marcadores");
class Sockets {
  constructor(io) {
    this.io = io;
    this.marcadores = new Marcadores();
    this.jugadas = {}; // Guardar las jugadas de los jugadores
    this.socketEvents();
  }

  socketEvents() {
    this.io.on("connection", (socket) => {
      console.log("cliente conectado");

      const options = [
        { id: 0, name: "Piedra", emoji: "🪨", beats: 2 },
        { id: 1, name: "Papel", emoji: "📄", beats: 0 },
        { id: 2, name: "Tijera", emoji: "✂️", beats: 1 },
      ];

      function getResult(userChoice, opponentChoice) {
        if (userChoice === opponentChoice) {
          return 0;
        }
        if (options[userChoice].beats === opponentChoice) {
          return 1;
        }
        return 2;
      }

      const jugador = { id: socket.id };
      const resultadoUnion = this.marcadores.unirseSala(jugador);

      socket.join(resultadoUnion.salaId); // Unir al socket a la sala correspondiente

      if (resultadoUnion.status === "joined") {
        const sala = this.marcadores.obtenerEstadoSala(resultadoUnion.salaId);
        const jugadores = sala.jugadores;

        if (jugadores.length === 2) {
          const jugador1 = jugadores[0].id;
          socket.emit("unido-a-la-sala");
          this.io.to(jugador1).emit("unido-a-la-sala");
        }
      } else if (resultadoUnion.status === "waiting") {
        socket.emit("en-espera");
      }

      socket.on("jugada", (choice) => {
        this.jugadas[socket.id] = choice;

        const sala = this.marcadores.obtenerEstadoSala(resultadoUnion.salaId);
        const jugadores = sala.jugadores;

        if (jugadores.length === 2) {
          const jugador1 = jugadores[0].id;
          const jugador2 = jugadores[1].id;

          if (
            this.jugadas[jugador1] !== undefined &&
            this.jugadas[jugador2] !== undefined
          ) {
            const resultadoJugador1 = getResult(
              this.jugadas[jugador1],
              this.jugadas[jugador2]
            );
            const resultadoJugador2 = getResult(
              this.jugadas[jugador2],
              this.jugadas[jugador1]
            );

            this.io
              .to(jugador1)
              .emit("resultado", {
                resultado: resultadoJugador1,
                opponentChoice: this.jugadas[jugador2],
              });
            this.io
              .to(jugador2)
              .emit("resultado", {
                resultado: resultadoJugador2,
                opponentChoice: this.jugadas[jugador1],
              });

            this.jugadas = {};
          }
        }
      });

      socket.on("disconnect", () => {
        const resultadoAbandono = this.marcadores.abandonarSala(jugador);

        if (resultadoAbandono?.status === "replaced") {
          this.io
            .to(resultadoAbandono.nuevoJugador.id)
            .emit("unido-a-la-sala", { position: resultadoAbandono.position });
        }
      });
    });
  }
}

module.exports = Sockets;
