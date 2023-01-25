class Fustrum {
    constructor(body, radius) {
        this.parent = body
        this.radius = radius // vision
        this.perceptionList = []
    }

    inside(obj) {
        return dist(obj.pos.x, obj.pos.y, this.parent.pos.x, this.parent.pos.y) < this.radius
    }
}