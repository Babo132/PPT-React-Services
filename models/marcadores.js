class Sala {
    constructor() {
        // Inicializamos la sala con dos posiciones para jugadores vacías.
        this.jugadores = [null, null]; // Jugador 1 y Jugador 2
        this.listaEspera = []; // Lista de espera de jugadores
    }

    // Método para unirse a la sala.
    unirseSala(jugador) {
        // Verificamos si hay un lugar disponible (Jugador 1 o Jugador 2).
        const indiceDisponible = this.jugadores.findIndex(j => j === null);

        if (indiceDisponible !== -1) {
            // Si hay un lugar disponible, el jugador se une a la sala.
            this.jugadores[indiceDisponible] = jugador;
            return { status: 'joined', position: indiceDisponible + 1 }; // Retorna la posición en la sala.
        } else {
            // Si no hay lugar disponible, el jugador se agrega a la lista de espera.
            this.listaEspera.push(jugador);
            return { status: 'waiting', position: this.listaEspera.length }; // Retorna la posición en la lista de espera.
        }
    }

    // Método para abandonar la sala.
    abandonarSala(jugador) {
        const indiceJugador = this.jugadores.findIndex(j => j === jugador);

        if (indiceJugador !== -1) {
            // Si el jugador está en la sala, lo removemos.
            this.jugadores[indiceJugador] = null;

            // Si hay alguien en la lista de espera, lo movemos a la sala.
            if (this.listaEspera.length > 0) {
                const siguienteJugador = this.listaEspera.shift(); // Removemos el primer jugador de la lista de espera.
                this.jugadores[indiceJugador] = siguienteJugador; // Lo colocamos en la posición vacante.
                return { status: 'replaced', nuevoJugador: siguienteJugador, position: indiceJugador + 1 };
            }

            return { status: 'left', position: indiceJugador + 1 };
        }
        return { status: 'not_in_room' };
    }

    // Método para obtener el estado actual de la sala.
    obtenerEstadoSala() {
        return {
            jugadores: this.jugadores,
            listaEspera: this.listaEspera
        };
    }
}

module.exports = Sala;



class Marcadores {

    constructor() {
        this.activos = {};
    }

    agregarMarcador( marcador ) {
        this.activos[ marcador.id ] = marcador;
        return marcador;
    }

    removerMarcador( id ) {
        delete this.activos[ id ];
    }

    actualizarMarcador( marcador ) {
        this.activos[ marcador.id ] = marcador;
    }
}

module.exports = Marcadores;