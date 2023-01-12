class Agent {

    constructor(espece, vitMax, accMax, faimMax, fatigueMax, reproductionMax, esperanceMax) {
        this.uid = random(99999999999)
        this.body = new Body(this, vitMax, accMax, faimMax, fatigueMax, reproductionMax, esperanceMax)
        this.espece = espece
        this.state = "rien" // rien = n'as pas de state, il fait rien que bouger normal //  chasser / survie / symbiose
    }

    filterPerceptionByObject() {
        let chasser = [] //
        let dangereux = []
        // let carnivore = []
        // let herbivore = []
        // let cadavre = []

        this.body.fustrum.perceptionList.map(perception => {
            if (perception instanceof Body || perception instanceof Agent){
                // perception.dist = dist(this.body.pos.x, this.body.pos.y, perception.body.pos.x, perception.body.pos.y)
               if (this.espece === "superpredateur" && perception.espece === "carnivore")
                   chasser.push(perception)
                else if (this.espece === "carnivore" && perception.espece === "herbivore")
                    chasser.push(perception)
                else if (this.espece === "decomposeur" && perception.body.mort)
                    chasser.push(perception)

                if (this.espece === "herbivore" && perception.espece === "carnivore")
                    dangereux.push(perception)
                else if (this.espece === "carnivore" && perception.espece === "superpredateur")
                    dangereux.push(perception)
            }
            if (perception instanceof Item){
                if (this.espece === "herbivore")
                    chasser.push(perception)
                if (this.espece === "decomposeur")
                    dangereux.push(perception)
            }
        })

        if (this.espece === "decomposeur")
            dangereux = dangereux.sort((agent1, agent2) => dist(agent1.pos.x,agent1.pos.y, agent2.pos.x, agent2.pos.y));
        else
            dangereux = dangereux.sort((agent1, agent2) => dist(agent1.body.pos.x,agent1.body.pos.y, agent2.body.pos.x, agent2.body.pos.y));
        if (this.espece === "herbivore")
            chasser = chasser.sort((agent1, agent2) => dist(agent1.pos.x,agent1.pos.y, agent2.pos.x, agent2.pos.y));
        else
            chasser = chasser.sort((agent1, agent2) => dist(agent1.body.pos.x,agent1.body.pos.y, agent2.body.pos.x, agent2.body.pos.y));

        return [chasser, dangereux]
    }

    setState() {
        if (this.espece === "superpredateur") {
            if (this.body.jaugeFaim.value * 100 / this.body.jaugeFaim.max > 30) { // plus de 30%
                this.state = "chasser"
            } else {
                this.state = "rien"
            }
        } else if (this.espece === "carnivore") {
            if (this.body.jaugeFaim.value * 100 / this.body.jaugeFaim.max > 50) { // plus de 30%
                this.state = "chasser"
            } else {
                this.state = "survie"
            }
        } else if (this.espece === "herbivore") {
            if (this.body.jaugeFaim.value * 100 / this.body.jaugeFaim.max > 70) { // plus de 30%
                this.state = "chasser"
            } else {
                this.state = "survie"
            }
        } else if (this.espece === "decomposeur") {
            this.state = "chasser"
        }
        // standard =  chasser / survie / symbiose
    }

    update() {
        let target = createVector()
        let [chasser, dangereux ] = this.filterPerceptionByObject()

        if (this.state == "chasser"){
            if (chasser.length > 0 ){
                target = chasser[0].pos.copy().sub(this.body.pos.copy())
            } else {
                target = createVector(random(-1,1), random(-1,1))
                while (target.mag() === 0)
                    target = createVector(random(-1,1), random(-1,1))
            }
        } else if (this.state == "survie") {
            if (chasser.length > 0 ){
                target = chasser[0].pos.copy().sub(this.body.pos.copy())
            } else {
                target = createVector(random(-1,1), random(-1,1))
                while (target.mag() === 0)
                    target = createVector(random(-1,1), random(-1,1))
            }
        } else if (this.state == "symbiose") {

        } else {
            target = createVector(random(-1,1), random(-1,1))
            while (target.mag() === 0)
                target = createVector(random(-1,1), random(-1,1))
        }

        // console.log(this.body.jaugeFaim.value)



        // manger vegetable

        this.body.acc = this.body.acceleration.add(target.copy());

    }


    show(){
        this.body.show()
    }
}
