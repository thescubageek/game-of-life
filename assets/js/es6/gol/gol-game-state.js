class GOLGameState {
  constructor(){
    this.reset();
  }

  reset(){
    this.cells = [];
  }

  getCell(x, y){
    let idx = this.getCellIndex(x, y);
    return idx === -1 ? null : this.cells[idx];
  }

  getCellIndex(x, y){
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].isAt(x, y)){
        return i;
      }
    }
    return -1;
  }

  hasCell(x, y) {
    return this.getCellIndex(x, y) !== -1;
  }

  removeCell(x, y) {
    let idx = this.getCellIndex(x, y);
    if (idx !== -1){
      return this.cells[idx].splice(idx, 1);
    }
  }

  addCell(x, y, params) {
    var cellCount = this.cells.length;
    var cell = new GOLCell(x, y, params);
    if (cellCount === 0) { // Empty list, add to Head
      this.cells.push(cell);
    } else if (y < this.cells[0].y) { // Add to Head
      this.cells.unshift(cell);
    } else if (y > this.cells[cellCount-1].y) { // Add to Tail
      this.cells.push(cell);
    } else { // Add to Middle
      for (let n = 0; n < cellCount; n++) {
        if (this.cells[n].y < y) { continue; }
        while (n < cellCount && this.cells[n].y === y && this.cells[n].x < x) {
          n++;
        }
        this.cells.splice(n-1, 0, cell);
        break;
      }
    }
    return cell;
  }
}