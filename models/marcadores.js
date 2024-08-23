class Marcadores {
    constructor() {
        this.salas = {}; // Objeto que almacenará todas las salas activas. Cada clave es el ID de una sala y el valor es un objeto con la información de la sala.
        this.maxJugadores = 2; // Número máximo de jugadores por sala.
        this.nextSalaId = 1; // ID único para asignar a cada nueva sala.
    }

    obtenerSalaId() {
        // Método para obtener el siguiente ID único para una nueva sala y aumentar el contador de IDs.
        return this.nextSalaId++;
    }

    unirseSala(jugador) {
        // Método para añadir un jugador a una sala.
        // Primero, intentamos encontrar una sala existente con espacio disponible.
        for (let salaId in this.salas) {
            if (this.salas[salaId].jugadores.length < this.maxJugadores) {
                // Si encontramos una sala con menos de maxJugadores, añadimos al jugador a esa sala.
                this.salas[salaId].jugadores.push(jugador);
                // Retornamos el estado de unión, el ID de la sala y la posición del jugador en la sala.
                return { status: 'joined', salaId, position: this.salas[salaId].jugadores.length - 1 };
            }
        }

        // Si no hay salas disponibles, creamos una nueva sala.
        const nuevaSalaId = this.obtenerSalaId(); // Obtenemos un nuevo ID para la sala.
        this.salas[nuevaSalaId] = { jugadores: [jugador] }; // Creamos la nueva sala con el jugador actual.
        // Retornamos el estado de espera, el ID de la sala y la posición del jugador en la nueva sala.
        return { status: 'waiting', salaId: nuevaSalaId, position: 0 };
    }

    abandonarSala(jugador) {
        // Método para manejar la salida de un jugador de una sala.
        for (let salaId in this.salas) {
            const sala = this.salas[salaId]; // Obtenemos la sala actual.
            const index = sala.jugadores.indexOf(jugador); // Buscamos la posición del jugador en la sala.
            if (index !== -1) {
                // Si el jugador está en la sala, lo removemos.
                sala.jugadores.splice(index, 1);
                // Si la sala queda vacía después de la salida del jugador, la eliminamos.
                if (sala.jugadores.length === 0) {
                    delete this.salas[salaId];
                } else if (sala.jugadores.length === 1) {
                    // Si solo queda un jugador en la sala, intentamos emparejarlo con alguien de la lista de espera.
                    if (this.listaEspera?.length > 0) {
                        const nuevoJugador = this.listaEspera.shift(); // Obtenemos el siguiente jugador de la lista de espera.
                        sala.jugadores.push(nuevoJugador); // Añadimos el nuevo jugador a la sala.
                        // Retornamos el estado de reemplazo, el nuevo jugador y el ID de la sala.
                        return { status: 'replaced', nuevoJugador, salaId };
                    }
                }
                // Retornamos el estado de salida si el jugador fue removido y la sala no está vacía ni fue reemplazada.
                return { status: 'left' };
            }
        }
    }

    obtenerEstadoSala(salaId) {
        // Método para obtener el estado de una sala específica.
        // Retornamos la información de la sala si existe, o un objeto con listas vacías si no existe.
        return this.salas[salaId] || { jugadores: [], listaEspera: [] };
    }
}

module.exports = Marcadores;
