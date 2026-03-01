class endpointReport {
    constructor(app) {
      this.app = app;
    }
  
    listRoutes() {
      const routes = [];
  
      const traverse = (stack, prefix = '') => {
        stack.forEach((layer) => {
          if (layer.route && layer.route.path) {
            // Direct route
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            routes.push({ method: methods, path: prefix + layer.route.path });
          } else if (layer.name === 'router' && layer.handle.stack) {
            // Nested router
            traverse(layer.handle.stack, prefix + (layer.regexp.source === '^\\/' ? '' : layer.regexp.source.replace(/\\\//g, '/').replace(/\^|\?\=|\(\?:|\)$/g, '')));
          }
        });
      };
  
      traverse(this.app._router.stack);
  
      return routes;
    }
  
    printRoutes() {
      const routesListeningTo = this.listRoutes();

      console.serviceStatusBoxFromArray('Route Endpoints', routesListeningTo, (item) => {
        let method = (item.method + ' '.repeat(8)).substring(0, 7);
        return `${method} /${item.path}`;
    });
    }
  }
  
  export { endpointReport };
  