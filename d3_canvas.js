function d3Canvas(d3, parent, rgb, width, height) {
    'use strict';

    var yScale = 200;

    var avgCurrent = 0;
    var avgThreshold = 3;
    var domainXInterval = 1;

    var f;
    var time = 0;
    var i1 = 0;

    var canvas = d3.select(parent).append('canvas')
        .attr('width', width)
        .attr('height', height);
    var ctx = canvas.node().getContext('2d');

    var buffer = {};
    buffer.data = [];

    var x1;
    var y1 = d3.scaleLinear().range([height, 0]);

    var line = d3.line()
        .x(function(d) {
            return x1(d.time - i1);
        })
        .y(function(d) {
            return parseFloat(y1(d.y).toFixed(4));
        })
        .context(ctx);
    
    var fill = d3.area()
        .x(function(d) {
            return x1(d.time - i1);
        })
        .y0(height)
        .y1(function(d) {
            return parseFloat(y1(d.y).toFixed(4));
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

    var update = function(y) {
        buffer.data.push({
            time: time,
            y: y
        });
        time += domainXInterval;
        if (time >= f) {
            buffer.data.shift();
            i1 += domainXInterval;
        }
        avg = 0;
        avgI = 0;
        avgL = buffer.data.length;
        for (avgI; avgI < avgL; avgI++) {
            avg += parseInt(buffer.data[avgI].y, 10);
        }
        avg = avg / avgL;
        if (avgCurrent < avg - avgThreshold || avgCurrent > avg + avgThreshold) {
            avgCurrent = avg;
            this.domainYMin = avg - yScale;
            this.domainYMax = avg + yScale;
            y1.domain([this.domainYMin + 10 * this.zoomTransform, this.domainYMax - 10 * this.zoomTransform]);
            this.cb();
        }
        
        
        draw();
    };
    var setZoom = function(transform) {
        this.zoomTransform = transform;
    };
    var setDomain = function(domain) {
        this.domainYMin = domain[0];
        this.domainYMax = domain[1];
    };
    return {
        init: function(domainYMin, domainYRange, domainXMax, cb) {
            if (typeof cb !== 'undefined') {
                this.cb = cb;
            }
            this.canvas = canvas;
            this.zoomTransform = 1;

            this.domainYMin = domainYMin;
            this.domainYRange = domainYRange;
            this.domainYMax = this.domainYMin + this.domainYRange;

            this.domainXMax = domainXMax;

            y1.domain([this.domainYMin, this.domainYMax]);
            x1 = d3.scaleTime().range([0, width]).domain([0, domainXMax]);

            f = this.domainXMax + domainXInterval * 2;
            this.canvas.call(d3.zoom().scaleExtent([1, 100])
                .on('zoom', this.zoom.bind(this)));
            draw();
        },
        update: function(y) {
            update.call(this, y);
        },
        zoom: function() {
            if (this.domainYMax - 10 * d3.event.transform.k < this.domainYMin + 10 * d3.event.transform.k) {
                d3.event.transform.k = this.zoomTransform;
                return;
            }
            this.zoomTransform = d3.event.transform.k;
            y1.domain([this.domainYMin + 10 * this.zoomTransform, this.domainYMax - 10 * this.zoomTransform]);
            this.cb();
            draw();
            
        },
        y1: y1,
        setZoom: setZoom,
        setDomain: setDomain,
        draw: draw
    };
}