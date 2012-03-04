"use strict";

/**********************************************************************
 * <p>Augments global Y object with the same higher-order functions that
 * array-extras adds to Y.Array.  Note that, unlike arrays and NodeLists,
 * iteration order for an object is arbitrary!</p>
 *
 * @module gallery-funcprog
 */

/**
 * @class YUI
 */

// adjusted from YUI's oop.js
function dispatch(action, o)
{
	var args = Y.Array(arguments, 1, true);

	switch (Y.Array.test(o))
	{
		case 1:
			return Y.Array[action].apply(null, args);
		case 2:
			args[0] = Y.Array(o, 0, true);
			return Y.Array[action].apply(null, args);
		default:
			if (o && o[action] && o !== Y)
			{
				args.shift();
				return o[action].apply(o, args);
			}
			else
			{
				return Y.Object[action].apply(null, args);
			}
	}
}

Y.mix(Y,
{
	/**
	 * Executes the supplied function on each item in the object.
	 * Iteration stops if the supplied function does not return a truthy
	 * value.  The function receives the value, the key, and the object
	 * itself as parameters (in that order).
	 *
	 * Supports arrays, objects, and NodeLists.
	 *
	 * @param o {Object} the object to iterate
	 * @param f {Function} the function to execute on each item
	 * @param c {Object} optional context object
	 * @param proto {Boolean} if true, prototype properties are iterated on objects
	 * @return {Boolean} `true` if every item in the array returns `true` from the supplied function, `false` otherwise
	 * @static
	 */
	every: function(o, f, c, proto)
	{
		return dispatch('every', o, f, c, proto);
	},

	/**
	 * Executes the supplied function on each item in the object.  Returns
	 * a new object containing the items for which the supplied function
	 * returned a truthy value.  The function receives the value, the key,
	 * and the object itself as parameters (in that order).
	 *
	 * Supports arrays, objects, and NodeLists.
	 *
	 * @param o {Object} the object to iterate
	 * @param f {Function} the function to execute on each item
	 * @param c {Object} optional context object
	 * @param proto {Boolean} if true, prototype properties are iterated on objects
	 * @return {Object} array or object of items for which the supplied function returned a truthy value (empty if it never returned a truthy value)
	 * @static
	 */
	filter: function(o, f, c, proto)
	{
		return dispatch('filter', o, f, c, proto);
	},

	/**
	 * Executes the supplied function on each item in the object, searching
	 * for the first item that matches the supplied function.  The function
	 * receives the value, the key, and the object itself as parameters (in
	 * that order).
	 *
	 * Supports arrays, objects, and NodeLists.
	 *
	 * @param o {Object} the object to iterate
	 * @param f {Function} the function to execute on each item
	 * @param c {Object} optional context object
	 * @param proto {Boolean} if true, prototype properties are iterated on objects
	 * @return {Mixed} the first item for which the supplied function returns `true`, or `null` if it never returns `true`
	 * @static
	 */
	find: function(o, f, c, proto)
	{
		return dispatch('find', o, f, c, proto);
	},

	/**
	 * Executes the supplied function on each item in the object and
	 * returns a new object with the results.  The function receives the
	 * value, the key, and the object itself as parameters (in that order).
	 *
	 * Supports arrays, objects, and NodeLists.
	 *
	 * @param o {Object} the object to iterate
	 * @param f {String} the function to invoke
	 * @param c {Object} optional context object
	 * @param proto {Boolean} if true, prototype properties are iterated on objects
	 * @return {Object} array or object of all return values, mapped according to the item key
	 * @static
	 */
	map: function(o, f, c, proto)
	{
		return dispatch('map', o, f, c, proto);
	},

	/**
	 * Partitions an object into two new objects, one with the items for
	 * which the supplied function returns `true`, and one with the items
	 * for which the function returns `false`.  The function receives the
	 * value, the key, and the object itself as parameters (in that order).
	 *
	 * Supports arrays, objects, and NodeLists.
	 *
	 * @param o {Object} the object to iterate
	 * @param f {Function} the function to execute on each item
	 * @param c {Object} optional context object
	 * @param proto {Boolean} if true, prototype properties are iterated on objects
	 * @return {Object} object with two properties: `matches` and `rejects`. Each is an array or object containing the items that were selected or rejected by the test function (or an empty object if none).
	 * @static
	 */
	partition: function(o, f, c, proto)
	{
		return dispatch('partition', o, f, c, proto);
	},

	/**
	 * Executes the supplied function on each item in the object, folding
	 * the object into a single value.  The function receives the value
	 * returned by the previous iteration (or the initial value if this is
	 * the first iteration), the value being iterated, the key, and the
	 * object itself as parameters (in that order).
	 *
	 * Supports arrays, objects, and NodeLists.
	 *
	 * @param o {Object} the object to iterate
	 * @param init {Mixed} the initial value
	 * @param f {String} the function to invoke
	 * @param c {Object} optional context object
	 * @param proto {Boolean} if true, prototype properties are iterated on objects
	 * @return {Mixed} final result from iteratively applying the given function to each item in the object
	 * @static
	 */
	reduce: function(o, init, f, c, proto)
	{
		return dispatch('reduce', o, init, f, c, proto);
	},

	/**
	 * Executes the supplied function on each item in the object.  Returns
	 * a new object containing the items for which the supplied function
	 * returned a falsey value.  The function receives the value, the key,
	 * and the object itself as parameters (in that order).
	 *
	 * Supports arrays, objects, and NodeLists.
	 *
	 * @param o {Object} the object to iterate
	 * @param f {Function} the function to execute on each item
	 * @param c {Object} optional context object
	 * @param proto {Boolean} if true, prototype properties are iterated on objects
	 * @return {Object} array or object of items for which the supplied function returned a falsey value (empty if it never returned a falsey value)
	 * @static
	 */
	reject: function(o, f, c, proto)
	{
		return dispatch('reject', o, f, c, proto);
	}
});
