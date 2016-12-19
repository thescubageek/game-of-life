import GOLStats from 'gol/gol-stats';
import GOLHelper from 'gol/'
import GOLZoom from 'gol/gol-zoom';
import GOLCell from 'gol/gol-cell';
import GOLGameState from 'gol/gol-game-state';
import GOLCanvas from 'gol/gol-canvas';

class GOL {
  constructor(){
    this.stats = new GOLStats();
    this.setup();
    this.initialize();
  }

  setup(){
    this.setupVars();
    this.setupZoom();
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
        run: $('#buttonRun'),
        step: $('#buttonStep'),
        clear: $('#buttonClear'),
        export: $('#buttonExport'),
        trail: $('#buttonTrail')
      }
    }
  }

  setupStates(){
    this.initialState = '[{"39":[110]},{"40":[112]},{"41":[109,110,113,114,115]}]';
    this.trail = { current: true, schedule : false };
    this.times = { algorithm : 0, gui : 0 };
    this.clear = { schedule: false };
  }

  setupCanvas(){
    this.canvas = new GOLCanvas({
      columns: this.columns,
      rows: this.rows,
      zoom: this.zoom.schemes[this.zoom.current].cellSize
    }); // Setup render canvas
  }

  initialize(){
    this.game = new GOLGameState();  // Reset/init algorithm
    this.loadConfig();          // Load config from URL (autoplay, colors, zoom, ...)
    this.loadGameState();           // Load state from URL
    this.canvas.init();     // Init canvas GUI
    this.registerEvents();  // Register event handlers
    this.prepare();
  }

  random(min, max) {
    return min <= max ? min + Math.round(Math.random() * (max - min)) : null;
  }

  /**
   * Load config from URL
   */
  loadConfig() {
    var grid, zoom;

    this.autoplay = this.getUrlParameter('autoplay') === '1' ? true : this.autoplay;
    this.trail.current = this.getUrlParameter('trail') === '1' ? true : this.trail.current;

    // Initial zoom config
    zoom = parseInt(this.getUrlParameter('zoom'), 10);
    if (isNaN(zoom) || zoom < 1 || zoom > GOL.zoom.schemes.length) {
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
            this.listLife.addCell(state[i][y][j], parseInt(y, 10), this.randomColor(), this.listLife.currentState);
          }
        }
      }
    }
  }

  /**
   * Create a random pattern
   */
  randomState() {
    var i, liveCells = (this.rows * this.columns) * 0.12;

    for (i = 0; i < liveCells; i++) {
      this.listLife.addCell(this.random(0, this.columns-1), this.random(0, this.rows-1), this.randomColor(), this.listLife.currentState);
    }

    this.listLife.nextGeneration();
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

    this.canvas.clearWorld(); // Reset GUI
    this.canvas.drawWorld(); // Draw State

    if (this.autoplay) { // Next Flow
      this.autoplay = false;
      this.buttons.run();
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
    this.element.buttons.run.on('click', this.run);
    this.element.buttons.step.on('click', this.step);
    this.element.buttons.clear.on('click', this.clear);
    this.element.buttons.export.on('click', this.export);

    // Layout
    this.element.buttons.trail.on('click', this.trail);
  }

  keyboard(e) {
    var event = e;
    if (!event) {
      event = window.event;
    }

    if (event.keyCode === 67) { // Key: C
      this.clear();
    } else if (event.keyCode === 82 ) { // Key: R
      this.run();
    } else if (event.keyCode === 83 ) { // Key: S
      this.step();
    }
  }

  run() {
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
  step() {
    if (!this.running) {
      this.nextStep();
    }
  }

  /**
   * Button Handler - Clear World
   */
  clear() {
    if (this.running) {
      this.clear.schedule = true;
      this.running = false;
      this.element.run.value = 'Run';
    } else {
      this.cleanUp();
    }
  }

  /**
   * Button Handler - Remove/Add Trail
   */
  trail() {
    this.element.messages.layout.html(this.trail.current ? 'Trail is Off' : 'Trail is On');
    this.trail.current = !this.trail.current;
    if (this.running) {
      this.trail.schedule = true;
    } else {
      this.canvas.drawWorld();
    }
  }

  /**
   * Button Handler - Export State
   */
  export() {
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
      '&trail=' + (this.trail.current ? '1' : '0') +
      '&zoom=' + (this.zoom.current + 1) +
      '&s=['+ cellState +']';

      $('#exportUrlLink').href = params;
      $('#exportTinyUrlLink').href = 'http://tinyurl.com/api-create.php?url='+ url + params;
      $('#exportUrl').style.display = 'inline';
    }
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

    for (let i = 0; i < this.game.nextState.length; i++) {
      let x = this.game.nextState[i][0];
      let y = this.game.nextState[i][1];
      let color = this.game.nextState[i][2];

      if (this.game.nextState[i][2] === 1) {
        this.canvas.changeCelltoAlive(x, y, color);
      } else if (this.game.nextState[i][2] === 2) {
        this.canvas.keepCellAlive(x, y, color);
      } else {
        this.canvas.changeCelltoDead(x, y, color);
      }
    }

    guiTime = (new Date()) - guiTime;
    // Pos-run updates

    // Clear Trail
    if (this.trail.schedule) {
      this.trail.schedule = false;
      this.canvas.drawWorld();
    }

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
}