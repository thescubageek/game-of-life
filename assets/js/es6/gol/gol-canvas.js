class GOLCanvas {
  constructor(configs){
    this.configs = configs;
    this.setup();
    this.clear();
  }

  setup(){
    this.context = null;
    this.width = null;
    this.height = null;
    this.age = null;
    this.helper = new GOLHelper();
    this.game = this.configs['game'];
    this.cellList = null;

    this.columns = this.configs['columns'];
    this.rows = this.configs['rows'];
    this.cellSize = this.configs['zoom'];
    this.cellSpace = 1;

    this.canvasElem = $('#canvas');
    this.canvas = this.canvasElem[0];
    this.context = this.canvas.getContext('2d');
    this.trail = { current: true, schedule : false };

    this.handlers = { mouseDown: false, lastX: 0, lastY: 0 }

    this.canvasElem.on('mousedown', this.configs['mousedown']);
    this.canvasElem.on('mousemove', this.configs['mousemove']);
    $(document).on('mouseup', this.configs['mouseup']);
  }

  clear() {
    // Init ages (Canvas reference)
    this.age = [];
    for (let i = 0; i < this.columns; i++) {
      this.age[i] = [];
      for (let j = 0; j < this.rows; j++) {
        this.age[i][j] = 0; // Dead
      }
    }
  }

  draw(list=[]) {
    this.cellList = list;
    if (this.trail.schedule) {
      this.trail.schedule = false;
    }
    this.setDimensions();

    // Fill background
    this.context.fillRect(0, 0, this.width, this.height);

    for (let i = 0 ; i < this.columns; i++) {
      for (let j = 0 ; j < this.rows; j++) {
        let cell = this.game.getCell(i, j);
        let alive = cell ? true : false;
        let color = cell && cell[2] ? cell[2] : '#ff0000';

        this.context.fillStyle = color;
        this.drawCell(i, j, color, alive);
      }
    }
  }

  setDimensions(){
    this.width = this.height = 0;

    this.width = this.width + (this.cellSpace * this.columns) + (this.cellSize * this.columns);
    this.canvasElem.width(this.width);

    this.height = this.height + (this.cellSpace * this.rows) + (this.cellSize * this.rows);
    this.canvasElem.height(this.height);
  }

  /**
   * setNoGridOn
   */
  setNoGridOn() {
    this.cellSize = this.zoom + 1;
    this.cellSpace = 0;
  }

  /**
   * setNoGridOff
   */
  setNoGridOff() {
    this.cellSize = this.zoom;
    this.cellSpace = 1;
  }

  /**
   * drawCell
   */
  drawCell(i, j, color, alive) {
    if (alive) {
      if (this.age[i][j] > -1)
        //this.context.fillStyle = GOL.colors.schemes[GOL.colors.current].alive[this.age[i][j] % GOL.colors.schemes[GOL.colors.current].alive.length];
        this.context.fillStyle = color;
    } else {
      if (this.trail.current && this.age[i][j] < 0) {
        //this.context.fillStyle = GOL.colors.schemes[GOL.colors.current].trail[(this.age[i][j] * -1) % GOL.colors.schemes[GOL.colors.current].trail.length];
        this.context.fillStyle = '#ffffff';
      } else {
        //this.context.fillStyle = GOL.colors.schemes[GOL.colors.current].dead;
        this.context.fillStyle = '#000000';
      }
    }

    this.context.fillRect(this.cellSpace + (this.cellSpace * i) + (this.cellSize * i), this.cellSpace + (this.cellSpace * j) + (this.cellSize * j), this.cellSize, this.cellSize);
  }

  /**
   * switchCell
   */
  switchCell(i, j) {
    if(this.cellList.isAlive(i, j)) {
      this.cellList.removeCell(i, j);
      this.changeCelltoDead(i, j, '#000000');
    } else {
      //let color = this.helper.randomColor();
      //this.cellList.addCell(i, j, color, this.cellList.currentState);
      this.game.addCell(i, j, this.cellList.currentState);
      this.changeCelltoAlive(i, j, color);
    }
  }

  /**
   * keepCellAlive
   */
  keepCellAlive(i, j, color) {
    if (i >= 0 && i < this.columns && j >=0 && j < this.rows) {
      this.age[i][j]++;
      this.drawCell(i, j, color, true);
    }
  }

  /**
   * changeCelltoAlive
   */
  changeCelltoAlive(i, j, color) {
    if (i >= 0 && i < this.columns && j >=0 && j < this.rows) {
      this.age[i][j] = 1;
      this.drawCell(i, j, color, true);
    }
  }

  /**
   * changeCelltoDead
   */
  changeCelltoDead(i, j, color) {
    if (i >= 0 && i < this.columns && j >=0 && j < this.rows) {
      this.age[i][j] = -this.age[i][j]; // Keep trail
      this.drawCell(i, j, color, false);
    }
  }

  mousePosition(e) {
    // http://www.malleus.de/FAQ/getImgMousePos.html
    // http://www.quirksmode.org/js/events_properties.html#position
    var event, x, y, domObject, posx = 0, posy = 0, top = 0, left = 0, cellSize = GOL.zoom.schemes[GOL.zoom.current].cellSize + 1;

    event = e;
    if (!event) {
      event = window.event;
    }

    if (event.pageX || event.pageY)   {
      posx = event.pageX;
      posy = event.pageY;
    } else if (event.clientX || event.clientY)  {
      posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    domObject = event.target || event.srcElement;

    while ( domObject.offsetParent ) {
      left += domObject.offsetLeft;
      top += domObject.offsetTop;
      domObject = domObject.offsetParent;
    }

    domObject.pageTop = top;
    domObject.pageLeft = left;

    x = Math.ceil(((posx - domObject.pageLeft)/cellSize) - 1);
    y = Math.ceil(((posy - domObject.pageTop)/cellSize) - 1);

    return [x, y];
  }

  canvasMouseDown(event) {
    let position = this.mousePosition(event);
    this.switchCell(position[0], position[1]);
    this.handlers.lastX = position[0];
    this.handlers.lastY = position[1];
    this.handlers.mouseDown = true;
  }

  canvasMouseUp() {
    this.handlers.mouseDown = false;
  }

  canvasMouseMove(event) {
    if (this.handlers.mouseDown) {
      let position = this.mousePosition(event);
      if ((position[0] !== this.handlers.lastX) || (position[1] !== this.handlers.lastY)) {
        this.switchCell(position[0], position[1]);
        this.handlers.lastX = position[0];
        this.handlers.lastY = position[1];
      }
    }
  }
}
