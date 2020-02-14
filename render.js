//
// 10.20.19
// Natural Selection Agents
//
/////////////////////////////////////////////////////////////////////////////////


// Imports
import Animal from '/scripts/animals.js';
import Food from '/scripts/food.js';
import Chart from '/scripts/graph.js';


// Initialize variables
let margins = 20;
let w = window.innerWidth - margins;
let h = window.innerHeight - margins;
let fr = 10;

let numAnimals = 10;
let numFood = 100;

let sense = 15;
let speed = 20;
let size = 10;
let health = 10;

let mutationRate = .3;
let mutationFactor = 1.3;
let reproduction = .03;
let replenish = .1;

let maxFood = 500;
let limit = 1800;

let animals = [];
let foods = [];
let simPaused = false;

let population = [];
let avgSense = [];
let avgSize = [];
let avgSpeed = [];




// AUXILLARY FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////


// Removes empty food after each step
function removeEmptyFood(foods) {
    let list = foods;
    for (var i=0; i < list.length; i++) {
        if (list[i].value == 0) {
            // console.log('empty!')
            list.splice(i, 1);
        }
    }
    return list;
}


// Removes dead animals after each step
function removeEmptyAnimal(animals) {
    let list = animals;
    for (var i=0; i < list.length; i++) {
        if (list[i].isAlive == false) {
            // console.log('empty!')
            list.splice(i, 1);
        }
    }
    return list;
}


// Pauses simulation
function togglePause() {
    if (simPaused) {
        simPaused = false;
    } else {
        simPaused = true;
    }
}

// Draws transparency
function drawPause(population) {
    background('rgba(200, 200, 255, 0.2)');

    let chart = new Chart(population);
    chart.position(
        width / 2,
        height / 2,
        2 * width / 3,
        2 * height / 3
    )

    chart.chartPoints()
    chart.drawGraph();

    noLoop();
}




// MAIN LOOPS
/////////////////////////////////////////////////////////////////////////////////


// Setting up canvas
function setup() {
    createCanvas(w, h);
    frameRate(fr)

    // Adding animals
    for (var i=0; i < numAnimals; i++) {
        let animal = new Animal(Math.random() * w, Math.random() * h);
        animal.initializeAnimal();

        // Setting traits
        animal.sense = sense;
        animal.stepSize = speed;
        animal.size = size;
        animal.initialHealth = health;
        animal.reproductionRate = reproduction;
        animal.mutationRate = mutationRate;
        animal.mutationFactor = mutationFactor;

        animals[i] = animal;
    }

    // Adding food
    for (var j=0; j < numFood; j++) {
        foods[j] = new Food(Math.random() * w, Math.random() * h);
        foods[j].replenish = replenish;
    }
}


// Draw loop
function draw() {
    
    // Run loop
    if (simPaused == false) {

        // Adds data collection
        let totalSense = 0;
        let totalSize = 0;
        let totalSpeed = 0;
        population.push(animals.length);

        // Checks for stop condition
        if (foods.length + animals.length >= limit) {
            togglePause();
        }
        if (animals.length == 0) {
            togglePause();
        }
    
        // Continues drawing
        background(0);
    
        // Replenishes and draws food
        for (var food of foods) {
            if (foods.length < maxFood) {
                food.reproduce(foods);
            }
            food.drawFood();
        }
    
        // Runs animals through time step
        for (var animal of animals) {
            if (animal.isAlive) {
    
                totalSense += animal.sense;
                totalSize += animal.size;
                totalSpeed += animal.stepSize;

                animal.drawAgent();
                // animal.drawSense();
                
                animal.checkForFood(foods);
                animal.stepAgent();
    
                animal.checkIfAlive(foods);
    
                animal.reproduce(animals)
    
            }
        }
    
        // Removes empty food and dead animals 
        foods = removeEmptyFood(foods);
        animals = removeEmptyAnimal(animals);

        // Collects data
        avgSense.push(totalSense / population[population.length - 1]);
        avgSize.push(totalSize / population[population.length - 1]);
        avgSpeed.push(totalSpeed / population[population.length - 1]);
    
        // Console commands
        console.log('NEW GEN #####################')
        console.log(animals.length)
        console.log(foods.length)

    } else {

        // Pause Loop
        console.log('################ PAUSED ################')
        console.log('generation: ' + population.length)
        console.log('population: ' + population[population.length - 1])
        console.log('avg sense: ' + avgSense[avgSense.length - 1])
        console.log('avg size: ' + avgSize[avgSize.length - 1])
        console.log('avg speed: ' + avgSpeed[avgSpeed.length - 1])
        drawPause(population)

    }
}




// INTERACTION & SCOPE
/////////////////////////////////////////////////////////////////////////////////


// Toggles pause and graphs
function mouseClicked() {
    togglePause();
    loop();
}


// Keyboard interaction
function keyPressed() {

    // Resets ecosystem
    if (keyCode == CONTROL) {
        location.reload();
    }

}

// Exposing to golobal scope
window.setup = setup; 
window.draw = draw;
window.mouseClicked = mouseClicked;
window.keyPressed = keyPressed;