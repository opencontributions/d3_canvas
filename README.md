## D3 v4 Graphing demo
### A real-time graphing demo using [D3](https://d3js.org/) v4. and canvas elements

View the [demo](https://opencontributions.github.io/btc_gdax/)

![Alt text](/screenshot.png?raw=true "Screenshot")

Graphs show bitcoin buy and sell prices (updated in real time using data from GDAX websocket API wss://ws-feed.gdax.com).  Y-axis domain and zoom levels adapt to fit data.  Instances may be coupled together for consistent zoom levels across graphs.

#### Example usage:

````javascript
var can0 = d3Canvas(d3, '#container_graph_0', [142, 214, 255], 640, 480, function(price, reason) {

});
var can1 = d3Canvas(d3, '#container_graph_1', [255, 214, 142], 640, 480, function(price, reason) {

});

can0.init(can1);
can1.init(can0);

var ws = new WebSocket('wss://ws-feed.gdax.com');
var messageJSON, message = ['0'];
ws.onmessage = function (e) {
    message = e.data;
};
ws.onopen = function() {
   ws.send('{"type": "subscribe","product_id": "BTC-USD"}');
};
var loop = function() {
    messageJSON = JSON.parse(message);
    if (messageJSON.type === 'done' && messageJSON.side === 'buy') {
        can0.update(messageJSON);
    }
    if (messageJSON.type === 'done' && messageJSON.side === 'sell') {
        can1.update(messageJSON);
    }
    requestAnimationFrame(loop);
};
loop();
````
