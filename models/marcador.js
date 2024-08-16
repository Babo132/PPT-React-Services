class Juego{
    constructor(id, name, emoji, beats){
        this.id  = id;
        this.name = name;
        this.emoji = emoji;
        this.beats = beats;
    }
}

module.exports = Juego;

class Marcador {
    
    constructor(id, lng, lat) {
        
        this.id  = id;
        this.lng = lng;
        this.lat = lat;
        
    }
}

module.exports = Marcador;