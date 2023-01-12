class Fustrum {
    constructor(body) {
        this.parent = body
        this.radius = 20 // taille
        this.radiusDetection = 50 // vision
        this.perceptionList = []
    }

    inside(obj) {
        return dist(obj.pos.x, obj.pos.y, this.parent.pos.x, this.parent.pos.y) < this.radiusDetection
    }
}