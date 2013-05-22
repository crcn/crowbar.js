```javascript
var crowbar = require("crowbar"),
router  = crowbar.router();


router.on({
  
  //setup the main application on enter
  "/": {
    enter: function(route, next) {
      route.target = new BackboneView();
      route.target.render(next);
    },
    route: {
      "/students/:student": {
        enter: function(route, next) {
          route.target = new StudentsView({ el: route.parent.target.$("#content") })
          route.target.render(next);
        },
        exit: function(route) {
          route.parent.target.$("#content").html();
        }
      }
    }
  }
});

//reflect the browser url in the router
router.reflect(new crowbard.reflectors.HttpReflector());
```
