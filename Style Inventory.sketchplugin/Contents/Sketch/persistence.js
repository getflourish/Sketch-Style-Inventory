/**
 * A persitent thread dictionary manager that handles CocoaScript boxed objects
 * and JavaScript data. JS data is saved as a JSON string because JS objects
 * can't be saved in the dictoionary directly.
 *
 * The persist object offers a setter and getter function which deal with the
 * data conversion where neccessary.
 *
 * To save data: persist.set(keyname, value);
 * To retrieve data: persist.get(keyname);
 *
 * @type {Object}
 */
var persist = {
  dict: NSThread.mainThread().threadDictionary(),

  /**
   * Check if the returend value is a CocoaScript string, if so
   * it is a JSON object and will be parsed.
   *
   * @param  {string} key The name of the element to get.
   * @return {mixed}      The saved element or null
   */
  get: function (key) {
    var val = this.dict[key]);

    if (val !== null && val.className() == '__NSCFString') {
      val = JSON.parse(val);
    }

    return val;
  },

  /**
   * Check if the given value is not a CocoaScript MOBoxedObject -
   * it is a JavaScript type and must be JSON stringified.
   *
   * @param {string} key The name of the element to save
   * @param {mixed} val  The element to save
   */
  set: function (key, val) {
    if (Object.prototype.toString.call(val) !== "[object MOBoxedObject]") {
      val = JSON.stringify(val);
    }

    this.dict[key] = val;
  }
};
