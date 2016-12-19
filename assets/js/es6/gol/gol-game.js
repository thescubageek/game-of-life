class GOLGame {
  constructor(){
    this.helper = new GOLHelper();
    this.reset();
  }

  reset(){
    this.currentState = new GOLGameState();
    this.stateMap = new GOLGameState();
    this.nextState = new GOLGameState();
  }

  buildCellStateMap(cell){
    var x, y, c;
    for (y = cell.y-1; y <= cell.y+1; y++){
      for (x = cell.x-1; x <= cell.x+1; x++){
        if (x === cell.x && y === cell.y) { continue; }
        c = this.stateMap.getCell(x, y)
        if (c){
          c.params.count = c.params.count+1;
        } else {
          this.stateMap.addCell(x, y, {count: 1})
        }
      }
    }
  }

  nextGeneration() {
    var i, count, cells, cell, activeCells, alive = 0;
    cells = this.currentState.cells;

    this.stateMap.reset();
    for (i = 0; i < cells.length; i++) {
      this.buildCellStateMap(cells[i]);
    }
    activeCells = this.stateMap.cells.filter((c)=>{
      return c.params.count === 2 || c.params.count === 3;
    });

    this.nextState.reset();
    for (i = 0; i < activeCells.length; i++){
      cell = activeCells[i];
      let curCell = this.currentState.getCell(cell.x, cell.y);
      if (curCell){
        this.nextState.addCell(cell.x, cell.y, {color: curCell.params.color});
        alive++;
      } else if (cell.params.count === 3) {
        this.nextState.addCell(cell.x, cell.y, {color: this.helper.randomColor()});
        alive++;
      }
    }

    this.currentState.cells = this.nextState.cells;
    return alive;
  }
}
