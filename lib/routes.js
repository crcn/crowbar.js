var bindable = require("bindable"),
Route        = require("./route"),
Decorators   = require("./decorators"),
Url            = require("url"),
comerr         = require("comerr"),
qs             = require("querystring");

function Routes (router) {
  this._source    = [];
  this.router     = router;
  this.decorators = new Decorators();
}

bindable.Object.extend(Routes, {

  /**
   */


  parsePath: function (path, options, location) {

    if (!options) options = { };

    // parse route ~ /path/to/route?query=value
    var pathParts = Url.parse(path, true);

    // find based on the path
    var route   = this.find(pathParts);

    // return if 404
    if (!route) {
      throw comerr.notFound("path " + path + " not found");
    }

    // if the route name matches the pathname, then
    // rebuild the REAL path
    if (route.options.name === pathParts.pathname) {

      // rebuild the path, and parse it
      pathParts = Url.parse(route.getPathnameWithParams(options.params));

      // pass the query and params
      pathParts.query  = options.query;
      pathParts.params = options.params;
    } else {

      // otherwise, fetch the params from the route path
      pathParts.params = route.getParams(pathParts.pathname);
    }

    pathParts.route  = route;

    return pathParts;
  },

  /**
   */

  getPathnameWithParams: function (path, options) {
    var route = this.find({ pathname: path });
    if (!route) return null;

    var url = route.getPathnameWithParams(options.params);

    if (options.query) {
      url += ("?" + qs.stringify(options.query));
    }

    return url;
  },

  /**
   */

  add: function (routes, parent) {

    if (!routes) return;
    if (!parent) this.decorators.decorate(parent = new Route(null, routes, this));

    for (var key in routes) {
      if (key.substr(0, 1) === "/") {

        var routeOptions = routes[key],
        routePath = (parent.pathname || "") + key,
        route;

        this._source.push(this.decorators.decorate(route = new Route(routePath, routeOptions, this, parent)));

        // add route options. might not exist.
        this.add(routeOptions.routes || routeOptions, route);
      }
    }

    this._resort();

    return this;
  },

  /**
   */

  all: function () {
    return this._source;
  },

  /**
   */

  find: function (query) {
    for (var i = this._source.length; i--;) {
      var route = this._source[i];
      if (route.match(query)) return route;
    }
  },

  /**
   */

  _resort: function () {
    this._source = this._source.sort(function (a, b) {

      var ap = a.pathname.split("/"),
      bp     = b.pathname.split("/");

      if (ap.length > bp.length) {
        return -1;
      } else if (ap.length < bp.length) {
        return 1;
      }


      for (var i = 0, n = ap.length; i < n; i++) {

        var apn = ap[i],
        bpn     = bp[i];

        if (apn !== bpn)
        if (apn.substr(0, 1) === ":") {
          return -1;
        } else {
          return 1;
        }
      }

      return 1;
    });
  }
});


module.exports = Routes;