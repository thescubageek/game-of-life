import GOLCell from 'gol-cell';

class GOLGameState {
  constructor(){
    this.reset();
  }

  reset(){
    this.currentState = [];
    this.nextState = [];
    this.topPointer = 1;
    this.middlePointer = 1;
    this.bottomPointer = 1;
  }

  nextGeneration() {
    var key, alive = 0, neighbours, deadNeighbours, allDeadNeighbours = {}, newState = [];
    this.nextState = [];

    for (let i = 0; i < this.currentState.length; i++) {
      this.topPointer = 1;
      this.bottomPointer = 1;

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

  /**
   *
   */
  isAlive(x, y) {
    var i, j;

    for (i = 0; i < this.currentState.length; i++) {
      if (this.currentState[i][0] === y) {
        for (j = 1; j < this.currentState[i].length; j++) {
          if (this.currentState[i][j] === x) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   *
   */
  removeCell(x, y, state) {
    var i, j;

    for (i = 0; i < state.length; i++) {
      if (state[i][0] === y) {

        if (state[i].length === 2) { // Remove all Row
          state.splice(i, 1);
        } else { // Remove Element
          for (j = 1; j < state[i].length; j++) {
            if (state[i][j] === x) {
              state[i].splice(j, 1);
            }
          }
        }
      }
    }
  }

  /**
   *
   */
  addCell(x, y, state) {
    if (state.length === 0) {
      state.push([y, x]);
      return;
    }

    var k, n, m, tempRow, newState = [], added;

    if (y < state[0][0]) { // Add to Head
      newState = [[y,x]];
      for (k = 0; k < state.length; k++) {
        newState[k+1] = state[k];
      }

      for (k = 0; k < newState.length; k++) {
        state[k] = newState[k];
      }

      return;

    } else if (y > state[state.length - 1][0]) { // Add to Tail
      state[state.length] = [y, x];
      return;

    } else { // Add to Middle

      for (n = 0; n < state.length; n++) {
        if (state[n][0] === y) { // Level Exists
          tempRow = [];
          added = false;
          for (m = 1; m < state[n].length; m++) {
            if ((!added) && (x < state[n][m])) {
              tempRow.push(x);
              added = !added;
            }
            tempRow.push(state[n][m]);
          }
          tempRow.unshift(y);
          if (!added) {
            tempRow.push(x);
          }
          state[n] = tempRow;
          return;
        }

        if (y < state[n][0]) { // Create Level
          newState = [];
          for (k = 0; k < state.length; k++) {
            if (k === n) {
              newState[k] = [y,x];
              newState[k+1] = state[k];
            } else if (k < n) {
              newState[k] = state[k];
            } else if (k > n) {
              newState[k+1] = state[k];
            }
          }

          for (k = 0; k < newState.length; k++) {
            state[k] = newState[k];
          }

          return;
        }
      }
    }
  }
}

export { GOLGameState }