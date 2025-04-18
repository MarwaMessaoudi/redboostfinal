export class ServiceP {
    id?: number;
    name: string;
    description: string;
    price: number;
    duree: number;
    modePrestation: string;
    disponible: boolean;
    typeservice: string;
    temoinage: string | null;
    languesdisponible: string | null;
    image: string | null;
    isFavorite: boolean = false;

    constructor(
        name: string,
        description: string,
        price: number,
        duree: number,
        modePrestation: string,
        disponible: boolean = true,
        typeservice: string,
        temoinage: string | null = null,
        languesdisponible: string | null = null,
        image: string | null = null
    ) {
        this.id = undefined;
        this.name = name;
        this.description = description;
        this.price = price;
        this.duree = duree;
        this.modePrestation = modePrestation;
        this.disponible = disponible;
        this.typeservice = typeservice;
        this.temoinage = temoinage;
        this.languesdisponible = languesdisponible;
        this.image = image;
        this.isFavorite = false;
    }
}

export class Pack {
    id?: number;
    name: string;
    description: string;
    services: ServiceP[];
    price: number;
    isHighlighted: boolean;

    constructor(name: string, description: string, services: ServiceP[] = [], price: number, isHighlighted: boolean = false) {
        this.name = name;
        this.description = description;
        this.services = services;
        this.price = price;
        this.isHighlighted = isHighlighted;
    }
}