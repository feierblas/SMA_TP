class Body {

    constructor(agent, vitMax, accMax, faimMax, fatigueMax, reproductionMax, esperanceMax) {
        this.fustrum = new Fustrum(this)
        this.agent = agent

        this.pos = createVector(random(width - this.fustrum.radius), random(height - this.fustrum.radius)) // -this.fustrum.radius -> pour éviter qu'il spawn moitie dans la map et autre moitie dehors
        this.vitesse = createVector()
        this.vitesseMax = vitMax
        this.acceleration = createVector()
        this.accelerationMax = accMax
        this.jaugeFaim = {
            "max" : random(0, faimMax),
            "value" : 0
        }
        this.jaugeFatigue =  {
            "max" : random(0, fatigueMax),
            "value" : 0
        }
        this.jaugeReproduction = {
            "max" : random(0, reproductionMax),
            "value" : 0
        }
        this.nas = millis() // 0 ans, on travail avec le millis
        this.esperance = millis() + random(10000, esperanceMax * 10000) // esperance de vie entre 10s et 200s
        // this.radius = 20
        this.mort = false
        this.dorm = false
        this.tempsDeRepos = 0
        this.actions = []
    }

    update(){
        if (this.dorm){
            this.tempsDeRepos = millis() + this.jaugeFaim.max * 100
            if (millis > this.tempsDeRepos) {
                this.jaugeFatigue = 0
                this.dorm = false
            }
        }
        if (!this.mort && !this.dorm) {
            if (this.nas + millis() > this.esperance)
                this.mort = true
            else if (this.jaugeReproduction === 100)
                console.log("reproduction")
            else if (this.jaugeFaim === 100)
                this.mort = true
            else if (this.jaugeFatigue === 100)
                this.dorm = true

            if (this.acceleration.mag() > this.accelerationMax / this.fustrum.radius)
                // this.acceleration = createVector(accelerationMax/this.radius)
                this.acceleration.setMag(this.accelerationMax/this.fustrum.radius)

            this.vitesse.add(this.acceleration.copy())

            if (this.vitesse.mag() > this.vitesseMax)
                this.vitesse.setMag(this.vitesseMax)

            this.pos.add(this.vitesse.copy())

            this.acceleration = createVector()
            this.bodyOut()
            this.updateJauge()
        }

    }

    updateJauge(){
        this.jaugeFatigue.value+= 0.1
        this.jaugeFaim.value+=0.1
        this.jaugeReproduction.value+=0.1
    }

    bodyOut(){
        // console.log("---------------------------")
        if (this.pos.x <= this.fustrum.radius / 2)
            this.vitesse.x *= -1
        if (this.pos.x + this.fustrum.radius / 2 >= width)
            this.vitesse.x *= -1
        if (this.pos.y <= this.fustrum.radius / 2)
            this.vitesse.y *= -1
        if (this.pos.y + this.fustrum.radius / 2 >= height)
            this.vitesse.y *= -1
    }


    show(){
        switch (this.agent.espece){
            case "superpredateur" :
                fill(255,0,0)
                break
            case "carnivore" :
                fill(200,50,0)
                break
            case "herbivore" :
                fill(0,0,255)
                break
            case "decomposeur" :
                fill(100)
                break
        }
        if (this.mort)
            fill(0)
        circle(this.pos.x, this.pos.y, this.fustrum.radius);
    }
}
