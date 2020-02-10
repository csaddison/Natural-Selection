//
// 10.20.19
// Natural Selection Food Particles
//
/////////////////////////////////////////////////////////////////////////////////


// Food class
export default class Food {

    constructor(posX, posY) {
        this.position = [posX, posY];
        this.value = 30;
        this.size = 1;

        this.replenish = .005
    }

    // Draws food particles
    drawFood() {
        if (this.value > 0) {
            noStroke();
            fill('lime');
            circle(this.position[0], this.position[1], this.size);
        }
    }

    // Reproduces probablistically
    reproduce(foods) {
        let chance = Math.random();
        if (chance < this.replenish) {
            let child = new Food(Math.random() * width, Math.random() * height)
            foods.push(child)
        }
    }
    
}