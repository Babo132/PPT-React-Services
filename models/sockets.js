const Marcadores = require('./marcadores')
class Sockets {
    constructor(io) {
        this.io = io;
        this.marcadores = new Marcadores();
        this.jugadas = {}; // Guardar las jugadas de los jugadores
        this.socketEvents();
    }

    socketEvents() {
        this.io.on('connection', (socket) => {
            console.log("cliente conectado");

            let options = [
                { id: 0, name: "Piedra", emoji: "🪨", beats: 2 },
                { id: 1, name: "Papel",  emoji: "📄", beats: 0 },
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
            

            if (resultadoUnion.status === 'joined') {
                socket.emit('unido-a-la-sala');
            } else if (resultadoUnion.status === 'waiting') {
                socket.emit('en-espera');
                // return { status: 'waiting', position: this.esperando.length };
            }

            socket.on('jugada', (choice) => {
                // Asigna la elección del jugador actual al objeto `jugadas`, usando el ID del socket como clave.
                this.jugadas[socket.id] = choice;
            
                // Obtiene la lista de jugadores que están en la sala actualmente.
                const jugadores = this.marcadores.obtenerEstadoSala().jugadores;
                
            
                // Si hay exactamente 2 jugadores en la sala...
                if (jugadores.length === 2) {
                    // Asigna el ID del primer jugador a la variable `jugador1`.
                    const jugador1 = jugadores[0].id;
            
                    // Asigna el ID del segundo jugador a la variable `jugador2`.
                    const jugador2 = jugadores[1].id;
            
                    // Verifica si ambos jugadores han hecho su jugada.
                    if (this.jugadas[jugador1] !== undefined && this.jugadas[jugador2] !== undefined) {
                        // Calcula el resultado para el primer jugador basándose en las jugadas de ambos jugadores.
                        const resultadoJugador1 = getResult(this.jugadas[jugador1], this.jugadas[jugador2]);
            
                        // Calcula el resultado para el segundo jugador basándose en las jugadas de ambos jugadores.
                        const resultadoJugador2 = getResult(this.jugadas[jugador2], this.jugadas[jugador1]);
            
                        // Envía el resultado del juego al primer jugador, incluyendo la elección del oponente.
                        this.io.to(jugador1).emit('resultado', { resultado: resultadoJugador1, opponentChoice: this.jugadas[jugador2] });
            
                        // Envía el resultado del juego al segundo jugador, incluyendo la elección del oponente.
                        this.io.to(jugador2).emit('resultado', { resultado: resultadoJugador2, opponentChoice: this.jugadas[jugador1] });
            
                        // Limpia las jugadas almacenadas para prepararse para la próxima ronda.
                        this.jugadas = {};
                    }
                }
            });
            

            socket.on('disconnect', () => {
                const resultadoAbandono = this.marcadores.abandonarSala(jugador);
                
                if (resultadoAbandono?.status === 'replaced') {
                    this.io.to(resultadoAbandono.nuevoJugador.id).emit('unido-a-la-sala', { position: resultadoAbandono.position });
                }
            });
        });
    }
}

module.exports = Sockets;