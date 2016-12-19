class GOLHelper {
  /**
   * Create a random pattern
   */
  randomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  randomPrimaryColor(){
    switch (Math.floor(Math.random() * 3)){
      case 0:
        return "#FF0000";
        break;
      case 1:
        return "#00FF00";
        break;
      case 2:
        return "#0000FF";
        break;
    }
  }
}
