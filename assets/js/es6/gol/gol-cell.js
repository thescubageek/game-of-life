class GOLCell {
  constructor(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;
  }

  isAt(x, y){
    return this.x === x && this.y === y;
  }
}
