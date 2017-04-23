function d3Canvas(d3, parent, rgb, width, height, cb) {
    'use strict';
    var domainYRange = 1000;
    var domainYMin = 500;
    var domainYMax = domainYMin + domainYRange;
    var domainXMax = 100;
    var zoomTransform = 1;
    var avgCurrent = 0;
    var avgThreshold = 3;
    var yRange = 100;
    var domainXInterval = 1;
    var f = domainXMax + domainXInterval * 2;
    var i = 0;
    var i1 = 0;

    var canvas = d3.select(parent).append('canvas')
        .attr('width', width)
        .attr('height', height);
    var ctx = canvas.node().getContext('2d');

    var buffer = {};
    buffer.data = [];

    var x1 = d3.scaleTime().range([0, width]).domain([0, domainXMax]);
    var y1 = d3.scaleLinear().range([height, 0]);
    y1.domain([domainYMin, domainYMax]);

    var line = d3.line()
        .x(function(d) {
            return x1(d.time - i1);
        })
        .y(function(d) {
            return parseFloat(y1(d.price).toFixed(4));
        })
        .context(ctx);
    
    var fill = d3.area()
        .x(function(d) {
            return x1(d.time - i1);
        })
        .y0(height)
        .y1(function(d) {
            return parseFloat(y1(d.price).toFixed(4));
        })
        .context(ctx);
    var yAxis = function() {
        var ticks = y1.ticks(8);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(' + rgb.join(', ') + ', .5)';
        ctx.font = 'normal 16px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 1;
        ticks.forEach(function(d, i) {
            if (i === 0 || i === ticks.length - 1) return;
            ctx.moveTo(0, y1(d));
            ctx.lineTo(20, y1(d));
            ctx.moveTo(65, y1(d));
            ctx.lineTo(width, y1(d));
            ctx.fillText(d, 60, y1(d));
        });
        ctx.stroke();
    };
    var draw = function() {
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        line(buffer.data);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgb(' + rgb.join(', ') + ')';
        ctx.stroke();
        ctx.beginPath();
        fill(buffer.data);
        ctx.closePath();
        ctx.lineWidth = 5;
        ctx.fillStyle = 'rgba(' + rgb.join(', ') + ', .5)';
        ctx.fill();
        yAxis();
    };
    var avg, avgI, avgL;
    var update = function(data) {
        if (typeof data.price === 'undefined' || typeof data.reason === 'undefined') return;
        buffer.data.push({
            time: i,
            price: data.price
        });
        i += domainXInterval;
        if (i >= f) {
            buffer.data.shift();
            i1 += domainXInterval;
        }
        avg = 0;
        avgI = 0;
        avgL = buffer.data.length;
        for (avgI; avgI < avgL; avgI++) {
            avg += parseInt(buffer.data[avgI].price, 10);
        }
        avg = avg / avgL;
        if (avgCurrent < avg - avgThreshold || avgCurrent > avg + avgThreshold) {
            avgCurrent = avg;
            domainYMin = avg - yRange;
            domainYMax = avg + yRange;
            y1.domain([domainYMin + 10 * zoomTransform, domainYMax - 10 * zoomTransform]);
            if (typeof this.couple !== 'undefined') {
                this.couple.setZoom = zoomTransform;
                this.couple.setDomain([domainYMin, domainYMax]);
                this.couple.y1.domain([domainYMin + 10 * zoomTransform, domainYMax - 10 * zoomTransform]);
                this.couple.draw();
            }
        }
        draw();
        cb(data.price, data.reason);
    };
    var setZoom = function(transform) {
        zoomTransform = transform;
    };
    var setDomain = function(domain) {
        domainYMin = domain[0];
        domainYMax = domain[1];
    };
    return {
        init: function(couple) {
            if (typeof couple !== 'undefined') {
                this.couple = couple;
            }
            this.canvas = canvas;
            this.canvas.call(d3.zoom().scaleExtent([1, 100])
                .on('zoom', this.zoom.bind(this)));
            draw();
        },
        update: function(data) {
            update.call(this, data);
        },
        zoom: function() {
            if (domainYMax - 10 * d3.event.transform.k < domainYMin + 10 * d3.event.transform.k) {
                d3.event.transform.k = zoomTransform;
                return;
            }
            zoomTransform = d3.event.transform.k;
            y1.domain([domainYMin + 10 * zoomTransform, domainYMax - 10 * zoomTransform]);
            if (typeof this.couple !== 'undefined') {
                this.couple.setZoom = zoomTransform;
                this.couple.y1.domain([domainYMin + 10 * zoomTransform, domainYMax - 10 * zoomTransform]);
                this.couple.draw();
            }
            draw();
        },
        y1: y1,
        setZoom: setZoom,
        setDomain: setDomain,
        draw: draw
    };
}