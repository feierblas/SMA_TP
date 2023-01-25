class Agent {

    // En p5.js, la surcharge de constructor n'est pas possible.... ainsi j'ai du faire le clonnage avec le même constructeur
    // J'avais aussi la possibilite de faire une clone de la classe sans utiliser le constructeur, mais j'ai préferer de faire comment ça a cause du développement que je voulais implémenter
    constructor(espece, vit, acc, faim, fatigue, reproduction, esperance, radius) {
        this.uid = random(99999999999)

        if (typeof espece === "object") { // CLONNAGE
            // espece correspond à l'agent qu'on veut cloner
            this.body = new Body(this, espece)
            this.espece = espece.espece
        } else {
            this.body = new Body(this, null, vit, acc, faim, fatigue, reproduction, esperance, radius)
            this.espece = espece
        }
        this.state = Comportement.RANDOM // random = n'as pas de comportement, il fait rien que bouger random //  chasser / survie / symbiose
    }
    filterPerceptionByObject() {
        let chasser = [] //
        let dangereux = []
        let protection = []

        this.body.fustrum.perceptionList.map(perception => {
            if (perception instanceof Body || perception instanceof Agent){
                perception.dist = dist(this.body.pos.x, this.body.pos.y, perception.pos.x, perception.pos.y)
               if (!perception.mort) {
                   if (this.espece === Espece.SUPERPREDATEUR && perception.agent.espece === Espece.CARNIVORE)
                       chasser.push(perception)
                   else if (this.espece === Espece.CARNIVORE && perception.agent.espece === Espece.HERBIVORE)
                       chasser.push(perception)
                   else if (this.espece === Espece.CARNIVORE && perception.agent.espece === Espece.SUPERPREDATEUR)
                       dangereux.push(perception)
                   else if (this.espece === Espece.HERBIVORE && perception.agent.espece === Espece.CARNIVORE)
                       dangereux.push(perception)
                   else if (this.espece === Espece.HERBIVORE && perception.agent.espece === Espece.SUPERPREDATEUR)
                       protection.push(perception)
               } else {
                    if (this.espece === Espece.DECOMPOSEUR){
                       chasser.push(perception)
                   }
               }
            }
            if (perception instanceof Item){
                perception.dist = dist(this.body.pos.x, this.body.pos.y, perception.pos.x, perception.pos.y)
                if (this.espece === Espece.HERBIVORE)
                    chasser.push(perception)
                if (this.espece === Espece.DECOMPOSEUR)
                    dangereux.push(perception)
            }
        })


        dangereux = dangereux.sort((agent1, agent2) =>  agent1.dist > agent2.dist ? 1 : -1);
        chasser = chasser.sort((agent1, agent2) =>  agent1.dist > agent2.dist ? 1 : -1);
        protection = protection.sort((agent1, agent2) =>  agent1.dist > agent2.dist ? 1 : -1);

        return [chasser, dangereux, protection]
    }

    setState() {
        // J'ai décider que chaque espace commencé à chasser a partir d'un % de faim
        if (this.espece === Espece.SUPERPREDATEUR) {
            if (this.body.jaugeFaim.value * 100 / this.body.jaugeFaim.max > 55) // plus de 55%
                this.state = Comportement.MANGEUR
            else
                this.state = Comportement.RANDOM
        } else if (this.espece === Espece.CARNIVORE) {
            if (this.body.jaugeFaim.value * 100 / this.body.jaugeFaim.max > 50) { // plus de 50%
                this.state = Comportement.MANGEUR
            } else {
                this.state = Comportement.RANDOM
            }
        } else if (this.espece === Espece.HERBIVORE) {
            if (this.body.jaugeFaim.value * 100 / this.body.jaugeFaim.max > 30) { // plus de 30%
                this.state = Comportement.MANGEUR
            } else {
                this.state = Comportement.RANDOM
            }
        } else if (this.espece === Espece.DECOMPOSEUR) {
            if (this.body.jaugeFaim.value * 100 / this.body.jaugeFaim.max > 5) { // plus de 5%
                this.state = Comportement.MANGEUR
            } else {
                this.state = Comportement.RANDOM
            }
        }
    }

    update() {
        let target
        let [chasser, dangereux, protection] = this.filterPerceptionByObject()

        this.setState()

        if (this.state !== Comportement.MANGEUR && dangereux.length > 0){
            if (this.espece !== Espece.DECOMPOSEUR)
                this.state = Comportement.SURVIE
            else if (dangereux[0].dist <= this.body.radius * 1.2) // radius de body est la taille du corps
                this.state = Comportement.SURVIE
        }
        else if (this.state === Comportement.MANGEUR) {
            // Si Danger plus proche que proie
            let distProie = 100
            let distDanger = 250

            if (chasser.length > 0)
                distProie = chasser[0].dist
            if (dangereux.length > 0){
                if (this.espece === Espece.DECOMPOSEUR)
                    distDanger = dangereux[0].dist <= this.body.radius * 1.2 ? dangereux[0].dist : distDanger
                else
                    distDanger = dangereux[0].dist < 100 ? dangereux[0].dist : distDanger
            }
            if (distProie > distDanger)
                this.state = Comportement.SURVIE
        }

        // Si protection en vue et on est en mode survie (mode -> symbiose)
        if (this.state === Comportement.SURVIE && protection.length > 0)
            this.state = Comportement.SYMBIOSE

        if (this.state == Comportement.MANGEUR){
            if (chasser.length > 0 ){
                target = chasser[0].pos.copy().sub(this.body.pos.copy())
            } else {
                target = createVector(random(-1,1), random(-1,1))
                while (target.mag() === 0)
                    target = createVector(random(-1,1), random(-1,1))
            }
        }
        else if (this.state == Comportement.SURVIE) {
            if (dangereux.length > 0 ){
                target = this.body.pos.copy().sub(dangereux[0].pos.copy() )
            } else {
                target = createVector(random(-1,1), random(-1,1))
                while (target.mag() === 0)
                    target = createVector(random(-1,1), random(-1,1))
            }
        }
        else if (this.state == Comportement.SYMBIOSE) {
            target = protection[0].pos.copy().sub(this.body.pos.copy())
        }
        else if (this.state == Comportement.RANDOM){
            target = createVector(random(-1,1), random(-1,1))
            while (target.mag() === 0)
                target = createVector(random(-1,1), random(-1,1))
        }
        else {
            target = createVector(0,0)
        }

        this.body.acc = this.body.acceleration.add(target.copy());

    }


    show(){
        this.body.show()
    }
}
