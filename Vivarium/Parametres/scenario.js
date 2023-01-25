const Scenario = {
    duréeSimu : 60, // en s
    respawn : true,
    colorHelp : true,
    levelUp : 3, // Plus grand la valeur, plus les modifications des paramètres peuvent être plus grand
    SuperPredateur: {
        nb: 5,
        parametres: {
            vitesse: [2.8, 3.5],
            acceleration: [11, 12.5],
            faim: [50,100],
            fatigue: [75,105],
            reproduction: [75,105],
            esperance: [20, 25],
            radius : [65, 105]
        }
    },
    Carnivore: {
        nb: 10,
        parametres: {
            vitesse: [2.5, 3.8],
            acceleration: [10, 13],
            faim: [80, 125],
            fatigue: [80, 120],
            reproduction: [60, 80],
            esperance: [15, 25],
            radius : [50, 120]
        }
    },
    Herbivore: {
        nb: 15,
        parametres: {
            vitesse: [1.8, 2.3],
            acceleration: [12, 17],
            faim: [100, 135],
            fatigue: [60, 100],
            reproduction: [60, 80],
            esperance: [15, 25],
            radius : [70, 90]
        }
    },
    Décomposeur: {
        nb: 5,
        parametres: {
            vitesse: [0.2, 0.8],
            acceleration: [6, 8],
            faim: [600, 750],
            fatigue: [1500, 1800],
            reproduction: [800, 900],
            esperance: [85, 120],
            radius : [400, 800]
        }
    },
    Vegetaux : {
        nb : 15,
        respawn : 75, // Le pourcentage pour qu'un végétal spawn après avoir été mangé.
    }
}