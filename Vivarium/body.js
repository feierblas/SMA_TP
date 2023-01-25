class Body {
    // En p5.js, la surcharge de constructor n'est pas possible.... ainsi j'ai du faire le clonnage avec le même constructeur
    // J'avais aussi la possibilite de faire une clone de la classe sans utiliser le constructeur, mais j'ai préferer de faire comment ça a cause du développement que je voulais implémenter
    constructor(agent, agentClone = null,vit, acc, faim, fatigue, reproduction, esperance, radius) {
        this.radius = 20 // taille du body, rien a voir avec la valeur radius de la vision (Fustrum)
        if (agentClone === null) { // Si ce n'est pas un clone
            this.fustrum = new Fustrum(this, Math.round(random(radius[0], radius[1])))
            this.pos = createVector(random(this.radius, width - this.radius), random(this.radius, height - this.radius * 2)) // -this.radius -> pour éviter qu'il spawn moitie dans la map et autre moitie dehors
            this.vitesseMax = random(vit[0], vit[1])
            this.accelerationMax = random(acc[0], acc[1])
            this.jaugeFaim = {
                "max" : Math.round(random(faim[0], faim[1])),
                "value" : 0
            }
            this.jaugeFatigue =  {
                "max" : Math.round(random(fatigue[0], fatigue[1])),
                "value" : 0
            }
            this.jaugeReproduction = {
                "max" : Math.round(random(reproduction[0], reproduction[1])),
                "value" : 0
            }
            this.esperanceWithoutModification = Math.round(random(esperance[0], esperance[1]))
        } else { // Si c'est un clone
            this.fustrum = new Fustrum(this, agentClone.body.fustrum.radius + Math.round(random(-2, 7 * Scenario.levelUp)))
            this.pos = createVector(agentClone.body.pos.x, agentClone.body.pos.y) // -this.radius -> pour éviter qu'il spawn moitie dans la map et autre moitie dehors
            this.vitesseMax = agentClone.body.vitesseMax + random(-0.1, 0.5 * Scenario.levelUp)
            this.accelerationMax = agentClone.body.accelerationMax + random(-1, 1,2 * Scenario.levelUp)
            this.jaugeFaim = {
                "max" : agentClone.body.jaugeFaim.max + Math.round(random(-2, 5 * Scenario.levelUp)),
                "value" : 0
            }
            this.jaugeFatigue =  {
                "max" : agentClone.body.jaugeFatigue.max + Math.round(random(-2, 5 * Scenario.levelUp)),
                "value" : 0
            }
            const maxReproduction = agentClone.body.jaugeReproduction.max + Math.round(random(-3 * Scenario.levelUp, 1))
            this.jaugeReproduction = {
                "max" : maxReproduction < 50 ? 50 : maxReproduction,
                "value" : 0
            }
            this.esperanceWithoutModification = agentClone.body.esperanceWithoutModification + Math.round(random(-1, 2 * Scenario.levelUp))
        }
        this.agent = agent
        this.vitesse = createVector()
        this.acceleration = createVector()
        this.nas = 0 // 0 ans, on travail avec le millis
        this.esperance = 0
        this.mort = false
        this.dorm = false
        this.tempsDeRepos = 0
        this.bestEspace = false
    }

    reproduction(){
        return this.jaugeReproduction.value >= this.jaugeReproduction.max
    }

    update(){
        // on update ici, car comme j'ai implémenter un systeme de screen, le nas et esperance ne sont plus bon si on le déclarer dans le constructeur
        if (this.nas === 0 || this.esperance === 0) {
            this.nas = millis() // 0 ans, on travail avec le millis
            this.esperance = millis() + this.esperanceWithoutModification * 10000 // esperance de vie => 1ans = 10s
        }
        if (this.dorm){
            if (millis() > this.tempsDeRepos) {
                this.jaugeFatigue.value = 0
                this.dorm = false
            }
        }
        if (!this.mort && !this.dorm) {
            if (this.nas + millis() > this.esperance)
                this.mort = true
            else if (this.jaugeFaim.value >= this.jaugeFaim.max)
                this.mort = true
            else if (this.jaugeFatigue.value >= this.jaugeFatigue.max) {
                this.tempsDeRepos = millis() + this.jaugeFatigue.max * 100
                this.dorm = true
            }
            if (this.acceleration.mag() > this.accelerationMax / this.radius)
                this.acceleration.setMag(this.accelerationMax/this.radius)

            this.vitesse.add(this.acceleration.copy())

            if (this.vitesse.mag() > this.vitesseMax)
                this.vitesse.setMag(this.vitesseMax)

            this.bodyOut()
            this.pos.add(this.vitesse.copy())

            this.acceleration = createVector()
            this.updateJauge()
        }

    }

    updateJauge(){
        this.jaugeFatigue.value+= random(0,.2)
        this.jaugeFaim.value+= random(0,.2)
        this.jaugeReproduction.value+= random(0,.2)
    }

    bodyOut(){
        if (this.pos.x <= this.radius / 2)
            this.vitesse.x *= -1
        if (this.pos.x + this.radius / 2 >= width)
            this.vitesse.x *= -1
        if (this.pos.y <= this.radius / 2)
            this.vitesse.y *= -1
        if (this.pos.y + this.radius / 2 >= height)
            this.vitesse.y *= -1
    }

    capacity(){
        return this.accelerationMax * CoefficientCapacity.acceleration + this.vitesseMax * CoefficientCapacity.vitesse +
            this.jaugeFaim.max * CoefficientCapacity.faim + this.jaugeReproduction.max * CoefficientCapacity.reproduction +
            this.jaugeFatigue.max * CoefficientCapacity.fatigue + this.esperance * CoefficientCapacity.esperance +
            this.fustrum.radius * CoefficientCapacity.radius
    }


    show(){
        // Si c'est l'espece la plus fort génétiquement
        if (this.bestEspace && Scenario.colorHelp) {
            fill(255, 0, 255)
            circle(this.pos.x, this.pos.y, this.radius + 8);
        }


        switch (this.agent.espece){
            case Espece.SUPERPREDATEUR :
                fill(255,0,0)
                break
            case Espece.CARNIVORE :
                fill(150,80,0)
                break
            case Espece.HERBIVORE :
                fill(0,0,255)
                break
            case Espece.DECOMPOSEUR :
                fill(100)
                break
        }
        if (this.mort)
            fill(0)
        circle(this.pos.x, this.pos.y, this.radius);

        // Pour mieux suivre le scenario
        if (this.agent.state !== Comportement.RANDOM && !this.mort && Scenario.colorHelp) {
            const angle = Math.PI*2 / 10;
            const circleRadius = sin(angle/2) * 15;

            if (this.agent.state === Comportement.SURVIE)
                fill(0,255,255)
            else if (this.agent.state === Comportement.MANGEUR)
                fill(255,255,0)
            else if (this.agent.state === Comportement.SYMBIOSE)
                fill(255,0,0)

            ellipse(this.pos.x, this.pos.y, circleRadius*2, circleRadius*2);
        }
    }
}
