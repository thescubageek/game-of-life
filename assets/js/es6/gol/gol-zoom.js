class GOLZoom {
  constructor(){
    this.current = 0;
    this.schedule = false;
    this.schemes = [];
  }

  addZoomLevel(columns, rows, cellSize){
    this.schemes.push({
      columns: columns,
      rows: rows,
      cellSize: cellSize
    })
  }
}
