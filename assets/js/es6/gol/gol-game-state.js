class GOLGameState {
  constructor(){
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

  isAlive(x, y) {
    return this.getCellIndex(x, y) !== -1;
  }

  removeCell(x, y) {
    let idx = this.getCellIndex(x, y);
    if (idx !== -1){
      return this.cells[idx].splice(idx, 1);
    }
  }

  addCell(x, y, color) {
    var cell = new Cell(x, y, color);
    if (this.cells.length === 0) { // Empty list, add to Head
      this.cells.push(cell);
      return cell;
    }

    if (y < this.cells[0].y) { // Add to Head
      this.cells.unshift(cell);
      return cell;
    } else if (y > this.cells[this.cells.length - 1][0]) { // Add to Tail
      this.cells.push(cell);
      return cell;
    } else { // Add to Middle
      for (let n = 0; n < this.cells.length; n++) {
        if (this.cells[n].y < y) { continue; }
        while (this.cells[n].y === y && this.cells[n].x < x && n < this.cells.length) {
          n++;
        }
        this.cells.splice(n-1, 0, cell);
        return cell;
      }
    }
  }
}