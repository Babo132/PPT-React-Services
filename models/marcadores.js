class Marcadores {
    constructor() {
        this.jugadores = [];
        this.esperando = [];
        this.maxJugadores = 2;
    }

    unirseSala(jugador) {
        if (this.jugadores.length < this.maxJugadores) {
            this.jugadores.push(jugador);
            return { status: 'joined', position: this.jugadores.length - 1 };
        } else {
            this.esperando.push(jugador);
            return { status: 'waiting', position: this.esperando.length - 1 };
        }
    }

    abandonarSala(jugador) {
        // Encontrar al jugador y removerlo
        const index = this.jugadores.indexOf(jugador);
        if (index !== -1) {
            this.jugadores.splice(index, 1);
            if (this.esperando.length > 0) {
                const nuevoJugador = this.esperando.shift();
                this.jugadores.push(nuevoJugador);
                return { status: 'replaced', nuevoJugador, position: this.jugadores.length - 1 };
            }
            return { status: 'left' };
        }
    }


    // Método para obtener el estado actual de la sala.
    obtenerEstadoSala() {
        return {
            jugadores: this.jugadores,
            listaEspera: this.listaEspera
        };
    }
}
module.exports = Marcadores;