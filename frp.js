


var newDispatcher = function () {
  var ints  = 0;
  var sinks = [];
  var insert = function (sink) {
    var i = ints++;
    sinks[i] = sink;
    return function () {
      delete sinks[i];
    }
  }
  var dispatch = function (a) {
    sinks.forEach(function(aSink) {
      aSink ? aSink(a) : null;
    });
  }
  return { sinks : sinks, insert : insert, dispatch : dispatch };
}

var emptySink = () => {}

var appendSinks = function (f, g, x) {
  f (x);
  g (x);
}

var contramapSink = function (f, aSink) {
  return function (x) {
    aSink(f(x));
  }
}

var never = function () {
  return function() {};
}


var merge = function (f, g) {
  return function (aSink) {
    var unsubF = f(aSink);
    var unsubG = g(aSink);
    return function () {
      unsubF();
      unsubB();
    }
  }
}

// Events [a] -> Events a
var scatter = function (taProvider) {
  return function (aSink) {
    taProvider(function(ta) {
      ta.forEach(a => aSink(a));
    });
  }
}

var pureB = function(z) {
  return function (aSink) {
    aSink(z);
  }
}

var accumB = function (z, aaProvider) {
  var v = z;
  aaProvider(function(aa) {
    v = aa(v);
  });
  return function(aSink) {
    aSink(v);
  };
}

// Behavior a -> Events b -> Events [a, b]
var snapshot = function (aProvider, bProvider) {
  return function(abSink) {
    bProvider(function(b) {
      aProvider(function(a) {
        abSink([a, b]);
      });
    });
  }
}

var mapE = function (f, aProvider) {
  return function(bSink) {
    return aProvider(contramapSink(f, bSink));
  }
} 

var mapB = function (f, aProvider) {
  return function(bSink) {
    return aProvider(contramapSink(f, bSink));
  }
} 

var joinB = function (f, behAProvider) {
  return function(aSink) {
    behAProvider(function(aProvider) {
      aProvider(aSink);
    });
  }
}


var newEvent = function() {
  var d = newDispatcher();
  return { sinks : d.sinks, source : d.insert, sink : d.dispatch };
}

var subscribeEvent = (source,sink) => source(sink);

var pollBehavior = function(aProvider) {
  var v;
  aProvider(function(a) {
    v = a;
  });
  return v;
}



// TEST
// TODO JS-style syntax, tests

var x = newEvent();
var us = subscribeEvent(
  mapE((x) => x + 10, x.source),
  (x) => console.log(x)
  );

x.sink(1)
x.sink(2)
x.sink(3)

us();

x.sink(3) // No output



