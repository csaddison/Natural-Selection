//
// 10.20.19
// Natural Selection Agents
//
/////////////////////////////////////////////////////////////////////////////////


// Imports
import * as Vector from '/scripts/vectors.js'
import Food from '/scripts/food.js';




/////////////////////////////////////////////////////////////////////////////////


// Basic brownian motion agent
class Agent {

    constructor(posX, posY) {
        this.position = [posX, posY];
        this.size = 7;
        this.stepSize = 3;
        this.isBrownian = false;
        this.shade = [200, 100, 100];
        this.setInitialDirection();
    }

    // Sets initial velocity for linear agents
    setInitialDirection() {
        if (this.isBrownian) {
            this.direction = [];
        } else {
            let r = Math.random() * 2 * Math.PI;
            this.direction = [
                this.stepSize * Math.cos(r),
                this.stepSize * Math.sin(r)
            ]
        }
    }

    // Sets boundaries for reflection
    checkBoundaries(vx, vy) {
        if (this.isBrownian) {
            if (this.position[0] + vx < 0 || this.position[0] + vx >= width) {
                vx = -vx;
            }
            if (this.position[1] + vy < 0 || this.position[1] + vy >= height) {
                vy = -vy;
            }
        } else {
            if (this.position[0] < 0 || this.position[0] >= width) {
                vx = -vx;
            }
            if (this.position[1] < 0 || this.position[1] >= height) {
                vy = -vy;
            }
        }
        return [vx, vy];
    }

    // Controls movement of agent
    stepAgent() {
        if (this.isBrownian) {

            let r = Math.random() * 2 * Math.PI;
            let vx = this.stepSize * Math.cos(r);
            let vy = this.stepSize * Math.sin(r);

            this.direction = this.checkBoundaries(vx, vy);
            this.position = Vector.addVectors(this.position, this.direction);

        } else {
            this.direction = this.checkBoundaries(this.direction[0], this.direction[1]);
            this.position = Vector.addVectors(this.position, this.direction);
        }
    }

    // Draws agent
    drawAgent() {
        noStroke();
        fill(this.shade);
        circle(this.position[0], this.position[1], this.size);
    }

}




/////////////////////////////////////////////////////////////////////////////////


// Animal class extension
export default class Animal extends Agent {

    // Adds new animal properties
    initializeAnimal() {
        this.initialHealth = 100
        this.health = this.initialHealth;
        this.cost = 1;
        this.isAlive = true;
        
        this.thresholdRatio = .9;
        this.thresholdHealth = this.initialHealth * this.thresholdRatio;
        this.reproductionRate = .02
        this.mutationRate = .9
        this.mutationFactor = 1.0

        this.timeLimit = 20;

        this.sense = 50;
        this.lowerThird = 1/3;
        this.upperThird = 2/3;

        this.changesBehavior = false;
        this.dt = 0;
        if (this.changesBehavior) {
            this.isBrownian = false;
        }

        this.minSize = 3;
    }

    // Draw sense
    drawSense() {
        stroke(this.shade);
        noFill();
        circle(this.position[0], this.position[1], this.sense * 2);
    }

    // Becomes food if dead
    becomeFood(foods) {
        foods.push(new Food(this.position[0], this.position[1]));
    }

    // Check living status
    checkIfAlive(foodList) {
        if (this.health <= 0) {
            this.isAlive = false;
            this.becomeFood(foodList);
        }
    }

    // Mutates gene based on percentage
    mutate(gene) {
        let newGene = gene * (1 - this.mutationRate) + this.mutationFactor * (Math.random() * this.mutationRate * gene);
        return newGene;
    }

    // Copys and mutates genes
    copyGenes(child) {
        child.timeLimit = this.timeLimit //this.mutate(this.timeLimit);
        child.reproductionRate = this.reproductionRate //this.mutate(this.reproductionRate);
        child.mutationRate = this.mutationRate //this.mutate(this.mutationRate);
        child.thresholdHealth = this.thresholdHealth //this.mutate(this.thresholdHealth);

        child.stepSize = this.mutate(this.stepSize);
        child.lowerThird = this.mutate(this.lowerThird);
        child.upperThird = this.mutate(this.upperThird);

        let mutatedSense = this.mutate(this.sense);
        if (mutatedSense < this.size) {
            child.size = this.size;
        } else {
            child.sense = mutatedSense;
        }

        let mutatedSize = this.mutate(this.size);
        if (mutatedSize < this.minSize) {
            child.size = this.minSize;
        } else {
            child.size = mutatedSize;
        }
        
        let colorShiftChance = Math.random();
        if (colorShiftChance < this.lowerThird) {
            child.shade = [
                this.mutate(this.shade[0]),
                this.shade[1],
                this.shade[2]
            ]
        } else if (colorShiftChance >= this.upperThird) {
            child.shade = [
                this.shade[0],
                this.mutate(this.shade[1]),
                this.shade[2]
            ]
        } else {
            child.shade = [
                this.shade[0],
                this.shade[1],
                this.mutate(this.shade[2])
            ]
        }
    }

    // Reproduces probablistically
    reproduce(animals) {
        let chance = Math.random();
        if (chance < this.reproductionRate && this.health > this.thresholdHealth) {
            let child = new Animal(this.position[0], this.position[1])
            child.initializeAnimal();
            this.copyGenes(child);
            animals.push(child)
        }
    }

    // Sets direction towards closest food
    steerToFood() {
        let rawDir = Vector.normalize(Vector.subtractVectors(this.closestFood.position, this.position));
        this.direction = [this.stepSize * rawDir[0], this.stepSize * rawDir[1]];
        this.position = Vector.addVectors(this.position, this.direction);
    }

    // Eat a piece of food if close enough
    eat(food) {
        this.health += food.value;
        food.value = 0;
    }

    // Checks if food is nearby and if they're close enough to eat
    checkForFood(foods) {

        let minFoodDistance = this.sense;

        for (var food of foods) {

            let distance = Vector.getMagnitude(Vector.subtractVectors(this.position, food.position));
            if (distance <= this.sense && food.value > 0) {
                this.foodIsNear = true;

                if (distance <= minFoodDistance) {
                    minFoodDistance = distance;
                    this.closestFood = food;
                }

                if (distance <= this.size || distance <= this.stepSize / 2) {
                    this.eat(food);
                }
            }
        }

        // if (minFoodDistance <= this.size) {
        //     this.eat(this.closestFood);
        // }
    }

    // Movement of animal
    stepAgent() {

        if (this.changesBehavior && this.dt >= this.timeLimit) {
            this.isBrownian = true;
        }

        if (this.foodIsNear) {

            this.steerToFood();
            this.foodIsNear = false;
            this.dt = 0;
            
        } else {
            if (this.position[0])
            super.stepAgent();
            this.health -= this.cost;
            this.dt += 1;
        }
    }
    
}