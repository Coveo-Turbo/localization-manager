const Coveo = require('coveo-search-ui');

module.exports = function LocalizationManager(locales, components, searchInterface, options) {
    components = components || [];
    options = options || {};

    const disableTargetting = options.disableTargetting;

    const searchInterfaces = searchInterface ? [searchInterface] : document.querySelectorAll('.CoveoSearchInterface');

    const locale = String['locale'];
    // var localeDict = { [locale]: locales };
    var localeDict = {};
    localeDict[String['locale']] = locales;
    String.toLocaleString(localeDict);

    if (disableTargetting) {
        return;
    }

    searchInterfaces.forEach(function (searchInterface) {
        searchInterface.addEventListener(Coveo.InitializationEvents.beforeInitialization, function (e, args) {
            Coveo.options(e.target, assignLocalesToComponents(locales, components));
        });
    });
}

function assignLocalesToComponents(entries, targets) {
    targets = targets || {};
    // const { locales = {}, overrides = {} } = isolateTargetedOverrides(entries);
    const targetedOverrides = isolateTargetedOverrides(entries) || {};
    const locales = targetedOverrides['locales'] || {};
    const overrides = targetedOverrides['overrides'] || {};

    targets = targets.map(function (componentName) {
        componentName.replace(/^Coveo/, '')
    });

    targets = targets.concat(Object.keys(overrides)).filter(function (x, i, a) {
        return a.indexOf(x) == i
    });
    console.log(targets, overrides)

    return targets.reduce(function (options, componentName) {
        options[componentName] = {
            valueCaption: Object.assign({}, locales, overrides[componentName]),
        };

        return options;
    }, {});
}

function isolateTargetedOverrides(entries) {
    let locales = getLocaleEntries(entries);
    let overrides = getTargetedOverrides(entries);

    let returnValues = {
        locales: locales,
        overrides: overrides
    };

    return returnValues;
}

function getTargetedOverrides(locales) {

    return Object.entries(locales).filter(function (key) {
        return 'string' !== typeof key[1]
    }).reduce(function (result, key) {
        result[key[0].replace(/^Coveo/, '')] = key[1];
        return result;
    }, {});
}

function getLocaleEntries(locales) {
    return Object.entries(locales).filter(function (key) {
        return 'string' === typeof key[1]
    }).reduce(function (result, key) {
        result[key[0]] = key[1];
        return result;
    }, {});
}

// IE11 Polyfill for NodeList.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

// IE11 Polyfill for Object.entries
if (!Object.entries) {
    Object.entries = function( obj ){
      var ownProps = Object.keys( obj ),
          i = ownProps.length,
          resArray = new Array(i); // preallocate the Array
      while (i--)
        resArray[i] = [ownProps[i], obj[ownProps[i]]];
  
      return resArray;
    };
  }

  // IE11 Polyfill for Object.assign
  if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs) { // .length of function is 2
        'use strict';
        if (target === null || target === undefined) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
  
        var to = Object(target);
  
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];
  
          if (nextSource !== null && nextSource !== undefined) {
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }