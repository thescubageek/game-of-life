class GOLGame {
  constructor(){
    this.reset();
  }

  reset(){
    this.currentState = new GOLGameState();
    this.nextState = new GOLGameState();
    this.topPointer = 1;
    this.middlePointer = 1;
    this.bottomPointer = 1;
  }

  nextGeneration() {
    var key, cell, alive = 0, aliveNeighbors = [], deadNeighbors = [], newState = [];
    this.nextState = [];

    for (let i = 0; i < this.currentState.length; i++) {
      this.topPointer = 1;
      this.bottomPointer = 1;

      cell = this.currentState[i];
      if newState

      // update cell
      let cellState = cell.update(aliveNeighbors, deadNeighbors);
      if (cellState){
        this.addCell(x, y, cell.color, this.nextState);
        alive++;
      }


      for (let j = 1; j < this.currentState[i].length; j++) {
        let x = this.currentState[i][j];
        let y = this.currentState[i][0];

        // Possible dead neighbours
        deadNeighbours = [[x-1, y-1, 1], [x, y-1, 1], [x+1, y-1, 1], [x-1, y, 1], [x+1, y, 1], [x-1, y+1, 1], [x, y+1, 1], [x+1, y+1, 1]];

        // Get number of live neighbours and remove alive neighbours from deadNeighbours
        neighbours = this.getNeighboursFromAlive(x, y, i, deadNeighbours);

        // Join dead neighbours to check list
        for (let m = 0; m < 8; m++) {
          if (deadNeighbours[m] !== undefined) {
            key = deadNeighbours[m][0] + ',' + deadNeighbours[m][1]; // Create hashtable key

            if (allDeadNeighbours[key] === undefined) {
              allDeadNeighbours[key] = 1;
            } else {
              allDeadNeighbours[key]++;
            }
          }
        }

        if (!(neighbours === 0 || neighbours === 1 || neighbours > 3)) {
          this.addCell(x, y, newState);
          alive++;
          this.nextState.push([x, y, 2]); // Keep alive
        } else {
          this.nextState.push([x, y, 0]); // Kill cell
        }
      }
    }

    // Process dead neighbours
    for (key in allDeadNeighbours) {
      if (allDeadNeighbours[key] === 3) { // Add new Cell
        key = key.split(',');
        let t1 = parseInt(key[0], 10);
        let t2 = parseInt(key[1], 10);

        this.addCell(t1, t2, newState);
        alive++;
        this.nextState.push([t1, t2, 1]);
      }
    }

    this.currentState = newState;

    return alive;
  }

  /**
         *
         */
  getNeighboursFromAlive(x, y, i, possibleNeighboursList) {
    var neighbours = 0, k;

    // Top
    if (this.currentState[i-1] !== undefined) {
      if (this.currentState[i-1][0] === (y - 1)) {
        for (k = this.topPointer; k < this.currentState[i-1].length; k++) {

          if (this.currentState[i-1][k] >= (x-1) ) {

            if (this.currentState[i-1][k] === (x - 1)) {
              possibleNeighboursList[0] = undefined;
              this.topPointer = k + 1;
              neighbours++;
            }

            if (this.currentState[i-1][k] === x) {
              possibleNeighboursList[1] = undefined;
              this.topPointer = k;
              neighbours++;
            }

            if (this.currentState[i-1][k] === (x + 1)) {
              possibleNeighboursList[2] = undefined;

              if (k == 1) {
                this.topPointer = 1;
              } else {
                this.topPointer = k - 1;
              }

              neighbours++;
            }

            if (this.currentState[i-1][k] > (x + 1)) {
              break;
            }
          }
        }
      }
    }

    // Middle
    for (k = 1; k < this.currentState[i].length; k++) {
      if (this.currentState[i][k] >= (x - 1)) {

        if (this.currentState[i][k] === (x - 1)) {
          possibleNeighboursList[3] = undefined;
          neighbours++;
        }

        if (this.currentState[i][k] === (x + 1)) {
          possibleNeighboursList[4] = undefined;
          neighbours++;
        }

        if (this.currentState[i][k] > (x + 1)) {
          break;
        }
      }
    }

    // Bottom
    if (this.currentState[i+1] !== undefined) {
      if (this.currentState[i+1][0] === (y + 1)) {
        for (k = this.bottomPointer; k < this.currentState[i+1].length; k++) {
          if (this.currentState[i+1][k] >= (x - 1)) {

            if (this.currentState[i+1][k] === (x - 1)) {
              possibleNeighboursList[5] = undefined;
              this.bottomPointer = k + 1;
              neighbours++;
            }

            if (this.currentState[i+1][k] === x) {
              possibleNeighboursList[6] = undefined;
              this.bottomPointer = k;
              neighbours++;
            }

            if (this.currentState[i+1][k] === (x + 1)) {
              possibleNeighboursList[7] = undefined;

              if (k == 1) {
                this.bottomPointer = 1;
              } else {
                this.bottomPointer = k - 1;
              }

              neighbours++;
            }

            if (this.currentState[i+1][k] > (x + 1)) {
              break;
            }
          }
        }
      }
    }

    return neighbours;
  }
}
