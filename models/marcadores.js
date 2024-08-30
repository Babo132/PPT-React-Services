class Marcadores {
    constructor() {
        this.salas = {};
        this.maxJugadores = 2;
        this.nextSalaId = 1;
    }

    obtenerSalaId() {
        return this.nextSalaId++;
    }

    unirseSala(jugador) {    
        for (let salaId in this.salas) {
            if (this.salas[salaId].jugadores.length < this.maxJugadores) {
                this.salas[salaId].jugadores.push(jugador);   
                return { status: 'joined', salaId, position: this.salas[salaId].jugadores.length - 1 };
            }
        }
        const nuevaSalaId = this.obtenerSalaId();
        this.salas[nuevaSalaId] = { jugadores: [jugador] };
        return { status: 'waiting', salaId: nuevaSalaId, position: 0 };
    }


    verSala(jugador, salaId) {    

                this.salas[salaId].jugadores.push(jugador);   
                console.log(this.salas[salaId]);
                

    }

    abandonarSala(jugador) {
        for (let salaId in this.salas) {
            const sala = this.salas[salaId];
            const index = sala.jugadores.indexOf(jugador);
            if (index !== -1) {
                sala.jugadores.splice(index, 1);
                if (sala.jugadores.length === 0) {
                    delete this.salas[salaId];
                } else if (sala.jugadores.length === 1) {
                    if (this.listaEspera?.length > 0) {
                        const nuevoJugador = this.listaEspera.shift();
                        sala.jugadores.push(nuevoJugador);   
                        return { status: 'replaced', nuevoJugador, salaId };
                    }
                }
                return { status: 'left' };
            }
        }
    }

    obtenerEstadoSala(salaId) {
        return this.salas[salaId] || { jugadores: [], listaEspera: [] };
    }

    obtenerSalasActivas() {
        return Object.keys(this.salas).map((salaId) => {
          return {
            salaId: salaId,
            jugadores: this.salas[salaId].jugadores.length,
          };
        });
      }
}

module.exports = Marcadores;
