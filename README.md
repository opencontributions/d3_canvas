# D3 v4 graphing demo
## A real-time graphing demo using [D3](https://d3js.org/) v4 and canvas elements

View the [demo](https://opencontributions.github.io/btc_gdax/)

![Alt text](/screenshot.png?raw=true "Screenshot")

Demo graphs show bitcoin buy and sell prices from GDAX websocket API wss://ws-feed.gdax.com).  Y-axis domain and zoom levels adapt to fit data.

#### Example usage:

````javascript
var can0 = d3Canvas(d3, '#container_graph_0', [142, 214, 255], 640, 480);
var can1 = d3Canvas(d3, '#container_graph_1', [255, 214, 142], 640, 480);

can0.init(500, 1000, 100, function(){
    can1.setZoom = this.zoomTransform;
    can1.setDomain([this.domainYMin, this.domainYMax]);
    can1.y1.domain([this.domainYMin + 10 * this.zoomTransform, this.domainYMax - 10 * this.zoomTransform]);
    can1.draw();
});
can1.init(500, 1000, 100, function(){
    can0.setZoom = this.zoomTransform;
    can0.setDomain([this.domainYMin, this.domainYMax]);
    can0.y1.domain([this.domainYMin + 10 * this.zoomTransform, this.domainYMax - 10 * this.zoomTransform]);
    can0.draw();
});

var loop = function() {
    can0.update(messageJSON.y);
    can1.update(messageJSON.y);
    requestAnimationFrame(loop);
};
loop();
````
