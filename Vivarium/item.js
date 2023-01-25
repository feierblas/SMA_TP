
class Item {
    constructor() {
        this.uid = random(99999999999)
        this.pos = createVector(random(width), random(height))
    }

    show() {
        fill(0,255,0);
        circle(this.pos.x, this.pos.y, 10);
    }
}

