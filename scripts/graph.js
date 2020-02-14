//
// 1.9.20
// Charting populations
//
/////////////////////////////////////////////////////////////////////////////////


// Chart class
export default class Chart {

    constructor(data) {
        this.data = data;
        this.points = [];
    }

    // Sets bounds for graph
    position(posX, posY, sizeX, sizeY) {

        this.size = [sizeX, sizeY];
        // this.position = [posX, posY];

        this.tl = [
            posX - sizeX/2,
            posY - sizeY/2
        ]
        this.bl = [
            posX - sizeX/2,
            posY + sizeY/2
        ]
        this.br = [
            posX + sizeX/2,
            posY + sizeY/2
        ]

    }

    // Converts population figures to X-Y points
    chartPoints() {

        let dx = this.size[0] / this.data.length;
        let maxPoint = Math.max.apply(Math, this.data);

        for (var i=0; i < this.data.length; i++) {

            let dataPoint = [
                this.bl[0] + (i * dx),
                this.bl[1] - this.size[1] * (this.data[i] / maxPoint)
            ]
            this.points.push(dataPoint);
        }
    }

    // Draws graph
    drawGraph() {
        stroke('white');
        noFill();

        line(this.tl[0], this.tl[1], this.bl[0], this.bl[1]);
        line(this.bl[0], this.bl[1], this.br[0], this.br[1]);
        
        beginShape();
        for (var dataPoint of this.points) {
            vertex(dataPoint[0], dataPoint[1]);
        }
        endShape();
    }
}