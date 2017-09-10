/**
 * @var {Object} UpdateTypes types of updates
 */
export const UpdateTypes = {
  Notification: 1,
  Mandate: 2
};

/**
 * map over object keys and merge returned objects
 * into one big object. If a falsy value is returned
 * the value is omitted.
 *
 * @param {Object} object the object
 * @param {Function} object the mapper function
 * @return {Object} the object
 */
export function mapObject(object, fn) {
  return Object.keys(object).reduce((newObj, key, index) => {
    const next = fn(object[key], key, index);
    if (!next) {
      return newObj;
    } else {
      return {
        ...newObj,
        ...next
      };
    }
  }, {});
}

/**
 * Accepts a parameter and returns it if it's a function
 * or a noop function if it's not. This allows us to
 * accept a callback, but not worry about it if it's not
 * passed.
 * @param {Function} cb the callback
 * @return {Function} a function
 */
export function cbToCb(cb) {
  return typeof cb === 'function' ? cb : noop;
}

/**
 * does nothing
 */
export function noop() {}

/**
 * @param {String} string a string
 * @return {String} a _S_tring
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * stateKey in, default setter name out
 * @param {String} stateKey the state key
 * @return {String} default setter name for the state key
 */
export function defaultSetterName(stateKey) {
  return `set${capitalizeFirstLetter(stateKey)}`;
}

/**
 * stateKey in, default update handler name out
 * @param {String} stateKey the state key
 * @return {String} default update handler name for the state key
 */
export function defaultUpdateHandlerName(stateKey) {
  return `onUpdate${capitalizeFirstLetter(stateKey)}`;
}

/**
 * @param {any} fn is this a function?
 * @return {Boolean} yay or nay
 */
export function isFunction(fn) {
  return typeof fn === 'function';
}

/**
 * @param {any} valueOrFunction value or function
 * @param {any} attr attribute to call valueOrFunction with if it is a function
 * @return {any} value
 */
export function valueFrom(valueOrFunction, attr) {
  return isFunction(valueOrFunction) ? valueOrFunction(attr) : valueOrFunction;
}

export function updateHandlerError(stateKey) {
  throw new Error(
    `The state "${stateKey}" is controlled (you're passing states.${stateKey}.value), but there is no assigned updateHandler. Make sure that the prop states.${stateKey}.updateHandler is a function.`
  );
}
