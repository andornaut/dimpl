'use strict';

module.exports = {
  add(array, item) {
    return array.concat([item]);
  },

  append(array, items) {
    return array.concat(items);
  },

  removeIndex(array, idx) {
    return array.slice(0, idx).concat(array.slice(idx + 1))
  },

  updateIndex(array, idx, value) {
    const newArray = array.slice();

    newArray[idx] = value;
    return newArray;
  }
};
