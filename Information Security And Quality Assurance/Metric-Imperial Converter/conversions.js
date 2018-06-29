const conversions = {
  
  processInput: function processInput(request, response) {    
    const inputRegex = /(\d+(?:\.\d+)?)(\w+)/;
  
    // empty parameters or invalid input
    if (!request.query.input || !inputRegex.test(request.query.input)) {
      response.send("invalid number and unit");
      return;
    }

    const input = request.query.input.match(inputRegex);
    
    // initNum will be NaN if parseFloat fails
    const initNum = parseFloat(input[1]);
    if (typeof initNum !== 'number') {
      response.send("invalid number");
      return;
    }

    const initUnit = input[2];
    const returnUnit = conversions.getConvertedUnit(initUnit);
    const returnNum = conversions.convert(initNum, initUnit);

    // returnNum will be undefined if invalid unit was passed to conversions.convert()
    if (!returnNum) {
      response.send("Invalid unit");
      return;
    }

    const string = conversions.buildString(initNum, initUnit, returnUnit, returnNum);

    response.json({ initNum, initUnit, returnUnit, returnNum, string });
  
  },
  
  convert: function convert(initNum, initUnit) {
    switch (initUnit) {
    case 'gal':
      return this.galToL(initNum);
    case 'L':
      return this.lToGal(initNum);
    case 'lbs':
      return this.lbsToKg(initNum);
    case 'kg':
      return this.kgToLbs(initNum);
    case 'mi':
      return this.miToKm(initNum);
    case 'km':
      return this.kmtoMi(initNum);
    }
  },
  
  getConvertedUnit: function getConvertedUnits(initUnit) {
    switch (initUnit) {
    case 'gal':
      return 'L';
    case 'L':
      return 'gal';
    case 'lbs':
      return 'kg';
    case 'kg':
      return'lbs';
    case 'mi':
      return 'km';   
    case 'km':
      return 'mi';  
    }
  },
  
  getFullUnitName: function getFullUnitName(initUnit) {
    switch (initUnit) {
      case 'gal':
        return 'gallons';
      case 'L':
        return 'liters';
      case 'lbs':
        return 'pounds';
      case 'kg':
        return'kilograms';
      case 'mi':
        return 'miles';   
      case 'km':
        return 'kilometers';  
      }
  },

  galToL: function galToL(initNum) {
    return initNum * 3.78541;
  },
  
  lToGal: function lToGal(initNum) {
    return initNum * 0.264172;
  },
  
  lbsToKg: function lbsToKg(initNum){
    return initNum * 2.20462;
  },
    
  kgToLbs: function kgToLbs(initNum) {
    return initNum * 0.453592;
  },
  
  miToKm: function miToKm(initNum) {
    return initNum * 1.60934;
  },
  
  kmtoMi: function kmtoMi(initNum) {
    return initNum * 0.621371;
  },
  
  buildString: function buildString(initNum, initUnit, returnUnit, returnNum) {
    return `${initNum} ${this.getFullUnitName(initUnit)} converts to ${returnNum} ${this.getFullUnitName(returnUnit)}`; 
  },

};

module.exports = conversions;
