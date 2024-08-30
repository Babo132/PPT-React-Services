const Marcadores = require("./marcadores");

class Sockets {
  constructor(io) {
    this.io = io;
    this.marcadores = new Marcadores();
    this.jugadas = {};
    this.socketEvents();
  }

  socketEvents() {
    this.io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);
      socket.emit("lista-salas", this.marcadores.obtenerSalasActivas());

      socket.on("obtener-lista-salas", () => {
        socket.emit("lista-salas", this.marcadores.obtenerSalasActivas());
        console.log(this.marcadores.obtenerSalasActivas());
      });

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

      socket.on("Quiere-jugar", () => {
        const jugador = { id: socket.id };
        const resultadoUnion = this.marcadores.unirseSala(jugador);
        console.log(resultadoUnion);

        socket.join(resultadoUnion.salaId);

        if (resultadoUnion.status === "joined") {
          const sala = this.marcadores.obtenerEstadoSala(resultadoUnion.salaId);
          const jugadores = sala.jugadores;

          if (jugadores.length === 2) {
            const jugador1 = jugadores[0].id;
            const jugador2 = jugadores[1].id;

            this.io.to(jugador1).emit("unido-a-la-sala");
            this.io.to(jugador2).emit("unido-a-la-sala");
          }
        } else if (resultadoUnion.status === "waiting") {
          socket.emit("en-espera");
        }

        this.io.emit("lista-salas", this.marcadores.obtenerSalasActivas());
      });

      socket.on("jugada", (choice) => {
        const jugador = { id: socket.id };
        const resultadoUnion = this.marcadores.unirseSala(jugador);
        this.jugadas[socket.id] = choice;

        socket.emit("jugada-ver", choice);
        
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

      socket.on('ver', (salaId) => {
        const jugador = { id: socket.id };

        this.marcadores.verSala(jugador, salaId)
      })

      socket.on("unirse-como-espectador", (salaId) => {
        const sala = this.marcadores.obtenerEstadoSala(salaId);
        if (sala && sala.jugadores.length === this.marcadores.maxJugadores) {
            socket.join(salaId);
            socket.emit("sala-estado", {
                salaId: salaId,
                jugadores: sala.jugadores,
            });
        } else {
            socket.emit("error", { mensaje: "Sala no disponible para ver" });
        }
    });
    
      socket.on("disconnect", () => {
        const jugador = { id: socket.id };
        const resultadoAbandono = this.marcadores.abandonarSala(jugador);
      
        if (resultadoAbandono?.status === "replaced") {
          this.io.to(resultadoAbandono.nuevoJugador.id).emit("unido-a-la-sala", { position: resultadoAbandono.position });
        }
        
        this.io.emit("lista-salas", this.marcadores.obtenerSalasActivas());
      });
      
      socket.on("reiniciar-partida", () => {
        const jugador = { id: socket.id };
        const resultadoUnion = this.marcadores.unirseSala(jugador);
      
        const sala = this.marcadores.obtenerEstadoSala(resultadoUnion.salaId);
        const jugadores = sala.jugadores;
      
        if (jugadores.length === 2) {
          const jugador1 = jugadores[0].id;
          const jugador2 = jugadores[1].id;
      
          this.io.to(jugador1).emit("reiniciar-partida");
          this.io.to(jugador2).emit("reiniciar-partida");
      
          this.jugadas = {};
        }
      });
    });
  }
}

module.exports = Sockets;
