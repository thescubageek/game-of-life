class GOLStats {
  constructor(){
    this.stats = new Stats();
    stats.setMode(0); // 0 FPS, 1 MS

    // align top-left
    $(stats.domElement).css({
      'position': 'absolute',
      'right': '0px',
      'bottom': '0px',
      'zIndex': '-999999'
    });

    $('body').append(stats.domElement);
  }
}

export { GOLStats }