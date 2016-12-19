class GOLCell {
  constructor(x, y, params){
    this.x = x;
    this.y = y;
    this.params = params;
  }

  isAt(x, y){
    return this.x === x && this.y === y;
  }
}
