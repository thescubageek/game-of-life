class GOL {
  constructor(){
    this.stats = new GOLStats();
    this.setup();
    this.load();
  }

  setup(){
    this.setupZoom();
    this.setupVars();
    this.setupElements();
    this.setupStates();
  }

  setupVars(){
    this.columns = 0;
    this.rows = 0;
    this.generation  = 0;
    this.running = false;
    this.autoplay = false;
    this.urlParameters = null;
  }

  setupZoom(){
    this.zoom = new GOLZoom();
    this.zoom.addZoomLevel(180, 86, 4);
    this.zoom.addZoomLevel(300, 144, 2);
    this.zoom.addZoomLevel(450, 216, 1);
  }

  setupElements(){
    this.element = {
      generation: $('#generation'),
      steptime: $('#steptime'),
      livecells: $('#livecells'),
      hint: $('#hint'),
      messages: {
        layout: $('#layoutMessages')
      },
      buttons: {
        runBtn: $('#buttonRun'),
        stepBtn: $('#buttonStep'),
        clearBtn: $('#buttonClear'),
        exportBtn: $('#buttonExport')
      }
    }
  }

  setupStates(){
    this.initialState = '[{"39":[110]},{"40":[112]},{"41":[109,110,113,114,115]}]';
    this.times = { algorithm : 0, gui : 0 };
    this.clear = { schedule: false };
  }

  loadCanvas(){
    this.canvas = new GOLCanvas({
      game: this.game,
      columns: this.columns,
      rows: this.rows,
      zoom: this.zoom.schemes[this.zoom.current].cellSize
    }); // Setup render canvas
    this.canvas.clear();
  }

  load(){
    this.game = new GOLGame();  // Reset/init algorithm
    this.helper = new GOLHelper(); // method helper
    this.loadConfig();          // Load config from URL (autoplay, colors, zoom, ...)
    this.loadGameState();           // Load state from URL
    this.loadCanvas();     // Init canvas GUI
    this.registerEvents();  // Register event handlers
    this.prepare();
  }

  random(min, max) {
    return min <= max ? min + Math.round(Math.random() * (max - min)) : null;
  }

  /**
   * Run Next Step
   */
  nextStep() {
    // Algorithm run
    let algorithmTime = new Date();
    let liveCellNumber = this.game.nextGeneration();
    algorithmTime = (new Date()) - algorithmTime;

    // Canvas run
    let guiTime = new Date();

    guiTime = (new Date()) - guiTime;
    // Pos-run updates
    this.canvas.draw(this.game.currentState);

    // Running Information
    this.generation++;
    this.element.generation.innerHTML = this.generation;
    this.element.livecells.innerHTML = liveCellNumber;

    let r = 1.0/this.generation;
    this.times.algorithm = (this.times.algorithm * (1 - r)) + (algorithmTime * r);
    this.times.gui = (this.times.gui * (1 - r)) + (guiTime * r);
    this.element.steptime.html(algorithmTime + ' / '+guiTime+' ('+Math.round(this.times.algorithm) + ' / '+Math.round(this.times.gui)+')');

    // Flow Control
    if (this.running) {
      this.stats.begin();
      window.requestAnimationFrame(this.nextStep);
      this.stats.end();
    } else if (this.clear.schedule) {
      this.cleanUp();
    }
  }

  loadConfig() {
    this.autoplay = this.getUrlParameter('autoplay') === '1' ? true : this.autoplay;

    // Initial zoom config
    let zoom = parseInt(this.getUrlParameter('zoom'), 10);
    if (isNaN(zoom) || zoom < 1 || zoom > this.zoom.schemes.length) {
      zoom = 1;
    }

    this.zoom.current = zoom - 1;
    this.rows = this.zoom.schemes[this.zoom.current].rows;
    this.columns = this.zoom.schemes[this.zoom.current].columns;
  }

  getUrlParameter(name) {
    if (this.urlParameters === null) { // Cache miss
      this.urlParameters = [];
      let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

      for (let i = 0; i < hashes.length; i++) {
        let hash = hashes[i].split('=');
        this.urlParameters.push(hash[0]);
        this.urlParameters[hash[0]] = hash[1];
      }
    }
    return this.urlParameters[name];
  }

  /**
   * Load world state from URL parameter
   */
  loadGameState() {
    var s = this.getUrlParameter('s');
    if (s === 'random') {
      this.randomState();
    } else {
      if (s == undefined) {
        s = this.initialState;
      }
      let state = $.parseJSON(decodeURI(s));
      for (let i = 0; i < state.length; i++) {
        for (let y in state[i]) {
          for (let j = 0 ; j < state[i][y].length ; j++) {
            //this.game.addCell(state[i][y][j], parseInt(y, 10), this.helper.randomColor(), this.game.currentState);
            this.game.currentState.addCell(state[i][y][j], parseInt(y, 10), {color: this.helper.randomColor()});
          }
        }
      }
    }
  }

  /**
   * Create a random pattern
   */
  randomState() {
    let liveCells = (this.rows * this.columns) * 0.12;
    for (let i = 0; i < liveCells; i++) {
      //this.game.addCell(this.random(0, this.columns-1), this.random(0, this.rows-1), this.helper.randomColor(), this.game.currentState);
      this.game.currentState.addCell(this.random(0, this.columns-1), this.random(0, this.rows-1), {color: this.helper.randomColor()});
    }
  }

  /**
   * Clean up actual state and prepare a new run
   */
  cleanUp() {
    this.game.reset(); // Reset/init algorithm
    this.prepare();
  }

  /**
   * Prepare DOM elements and Canvas for a new run
   */
  prepare() {
    this.generation = this.times.algorithm = this.times.gui = 0;
    this.mouseDown = this.clear.schedule = false;

    this.element.generation.html('0');
    this.element.livecells.html('0');
    this.element.steptime.html('0 / 0 (0 / 0)');

    this.canvas.clear(); // Reset GUI
    this.canvas.draw(this.game.currentState); // Draw State

    if (this.autoplay) { // Next Flow
      this.autoplay = false;
      this.buttons.runBtn.click();
    }
  }

  /**
   * registerEvents
   * Register event handlers for this session (one time execution)
   */
  registerEvents() {
    // Keyboard Events
    $('body').on('keyup', this.keyboard);

    // Controls
    this.element.buttons.runBtn.on('click', this._run.bind(this));
    this.element.buttons.stepBtn.on('click', this._step.bind(this));
    this.element.buttons.clearBtn.on('click', this._clear.bind(this));
    this.element.buttons.exportBtn.on('click', this._export.bind(this));
  }

  keyboard(e) {
    var event = e || window.event;
    if (event.keyCode === 67) { // Key: C
      this._clear();
    } else if (event.keyCode === 82 ) { // Key: R
      this._run();
    } else if (event.keyCode === 83 ) { // Key: S
      this._step();
    }
  }

  _run() {
    this.element.hint.hide();

    this.running = !this.running;
    if (this.running) {
      this.nextStep();
      this.element.buttons.run.value = 'Stop';
    } else {
      this.element.buttons.run.value = 'Run';
    }
  }

  /**
   * Button Handler - Next Step - One Step only
   */
  _step() {
    if (!this.running) {
      this.nextStep();
    }
  }

  /**
   * Button Handler - Clear World
   */
  _clear() {
    if (this.running) {
      this.clear.schedule = true;
      this.running = false;
      this.element.run.value = 'Run';
    } else {
      this.cleanUp();
    }
  }

  /**
   * Button Handler - Export State
   */
  _export() {
    var url = '', cellState = '', params = '';

    for (let i = 0; i < this.game.currentState.length; i++) {
      cellState += '{"'+this.game.currentState[i][0]+'":[';
      for (let j = 1; j < this.game.currentState[i].length; j++) {
        cellState += this.game.currentState[i][j]+',';
      }
      cellState = cellState.substring(0, cellState.length - 1) + ']},';
    }

    cellState = cellState.substring(0, cellState.length - 1) + '';

    if (cellState.length !== 0) {
      url = (window.location.href.indexOf('?') === -1) ? window.location.href : window.location.href.slice(0, window.location.href.indexOf('?'));

      params = '?autoplay=0' +
      '&zoom=' + (this.zoom.current + 1) +
      '&s=['+ cellState +']';

      $('#exportUrlLink').href = params;
      $('#exportTinyUrlLink').href = 'http://tinyurl.com/api-create.php?url='+ url + params;
      $('#exportUrl').style.display = 'inline';
    }
  }
}
