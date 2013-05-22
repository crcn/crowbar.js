```javascript
var crowbar = require("crowbar"),
router  = crowbar.router();


router.on({
  "/": {
    enter: function(route) {
      route.target = new BackboneView();
      route.target.render();
    },
    route: {
      "/students/:student": {
        enter: function(route) {
          route.target = new StudentsView({ el: route.target.$("#content") })
          route.target.render();
        }
      }
    }
  }
});


router.reflect(new crowbard.reflectors.HttpReflector());
```
