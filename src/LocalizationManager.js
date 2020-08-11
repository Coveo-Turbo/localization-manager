const Coveo = require('coveo-search-ui');

module.exports = function LocalizationManager(locales, components = [], searchInterface, options = {}) {
    const { disableTargetting } = options;

    const searchInterfaces = searchInterface ? [searchInterface] : document.querySelectorAll('.CoveoSearchInterface');

    const locale = String['locale'];
    String.toLocaleString({ [locale]: locales });

    if (disableTargetting) {
        return;
    }

    searchInterfaces.forEach(searchInterface => {
        searchInterface.addEventListener(Coveo.InitializationEvents.beforeInitialization, function (e, args) {
            Coveo.options(e.target, assignLocalesToComponents(locales, components));
        });
    });
}

function assignLocalesToComponents(entries, targets = []) {
    const {locales = {}, overrides = {}} = isolateTargetedOverrides(entries);
    targets = targets.map(componentName => componentName.replace(/^Coveo/, ''));

    targets = targets.concat(Object.keys(overrides)).filter((x, i, a) => a.indexOf(x) == i);
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

    return {
        locales,
        overrides,
    }
}

function getTargetedOverrides(locales) {
    return Object.entries(locales).filter(([key, value]) => 'string' !== typeof value).reduce((result, [key, value]) => {
        result[key.replace(/^Coveo/, '')] = value;
        return result;
    }, {});
}

function getLocaleEntries(locales) {
    return Object.entries(locales).filter(([key, value]) => 'string' === typeof value).reduce((result, [key, value]) => {
        result[key] = value;
        return result;
    }, {});
}