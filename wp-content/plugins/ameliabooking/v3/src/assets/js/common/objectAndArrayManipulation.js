function usePopulateMultiDimensionalObject (needle, haystack, customFunction) {
  let stack = []
  function loop(haystack, stack) {
    for (let [location, v] of Object.entries(haystack)) {
      stack.push(location);
      if (location === needle) {
        customFunction(v)
        break;
      } else if (typeof v === 'object') {
        loop(v, stack);
      }
    }
  }
  loop(haystack, stack);
}

export { usePopulateMultiDimensionalObject }