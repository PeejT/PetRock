"use strict";
/*global localStorage: false, console: false, alert: false,
Image: false, setTimeout: false, document: false, window: false */
// localStorage.removeItem("savedTick");
// localStorage.removeItem("savedAttention");
// localStorage.removeItem("savedTuesday");
// localStorage.removeItem("beenTold");

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.lineWidth = 1;
ctx.font = "8px Arial";
ctx.fillStyle = "#0095DD";
var img = new Image();
img.src = "Images/Sprites2.png";
var graphHeight = 16;
var attentionGradient = ctx.createLinearGradient(10, 6, 14, 24);
var ticks = {
    day: 86400000,
    week: 604800000,
    overAWeek: 691200000
};
var feedButton = {
    x: 48,
    y: 5,
    w: 38,
    h: 22
};
var dataTick;
var awayTick;
var attentionLevel = 0;
var dataAttention;
var tuesdayInMiliseconds;
var beenTold;
var nowTick = Date.now();
var clicked = "nope";
var plusDataArray = [];
var drawPlusNow = "nope";
var MissedItBy;
var nowTickGrab = 0;
var radians;
var degrees = 0; // change in relation to the progress circle in degrees

// Define Plus constructor
function Plus(x, y, velY) {
    this.x = x;
    this.y = y;
    this.velY = velY;
}

// define Plus draw method
Plus.prototype.drawPlus = function () {
    ctx.drawImage(img, 0, 46, 10, 10, this.x, this.y, 10, 10);
}; // define Plus update method

Plus.prototype.update = function () {
    if (this.y > 0) {
        this.y += this.velY;
    }
};

// Load the data
function LoadData() {
    if (window.localStorage) {
        dataTick = JSON.parse(localStorage.getItem("savedTick"));
        dataAttention = JSON.parse(localStorage.getItem("savedAttention"));
        tuesdayInMiliseconds = JSON.parse(localStorage.getItem("savedTuesday"));
        beenTold = localStorage.getItem("beenTold");
        awayTick = Math.round((nowTick - dataTick) / 1000);
        attentionLevel = dataAttention + (awayTick / (ticks.day / 1000)) * graphHeight;
        attentionLevel = 16;
    } else {
        alert("No Web Storage without HTTP");
    }
}

// Work out forfeits
function getIntervals() {
    var d = new Date();
    var interval;
    var dayOfTheWeek = d.getDay();

    if (
        tuesdayInMiliseconds === undefined ||
        tuesdayInMiliseconds === "" ||
        tuesdayInMiliseconds === null
    ) {
        beenTold = "nope";
        alert("First time, huh?");
    } else if (dayOfTheWeek === 3 && nowTick - dataTick > ticks.overAWeek) {
        alert("You missed last Tuesdays update");
    } else {
        // This works if its a Tuesday, but when it's a Tuesday in two months time, for example, it still loves ya!
        if (dayOfTheWeek === 2) {
            beenTold = "nope";
            alert("YEAH, proper FAN!"); // Should turn on hourly star rewards, proper fan!
        }

        if (beenTold === "nope" && dayOfTheWeek !== 2) {
            if (dayOfTheWeek > 2 && dayOfTheWeek <= 6) {
                MissedItBy = dayOfTheWeek - 2;
            }

            if (dayOfTheWeek < 2) {
                MissedItBy = dayOfTheWeek + 5;
            }

            beenTold = "yep";
            alert("The update was " + MissedItBy + " days ago");
        }
    }

    if (beenTold === "nope") {
        interval = 9;
    } else {
        interval = 2;
    }

    d.setDate(
        ((interval - d.getDay() + (interval + 5)) % (interval + 5)) + d.getDate()
    );
    var tuesday = d.toDateString();
    tuesdayInMiliseconds = new Date(tuesday).getTime();
    alert("Dont forget to come back " + tuesday + " for another update!");
}

var clickTick = 0;

function updateTick() {
    nowTick = Date.now();

    // If clickTick has a value, count it down to 1
    if (clickTick > 1) {
        clickTick -= 1;
        degrees = clickTick;
        clickTimerConditions(clickTick);
    }
}

function updateAttention() {
    if (parseInt(attentionLevel) < 16) {
        attentionLevel += graphHeight / ticks.day;
    } else {
        attentionLevel = 16;
    }
}

window.onunload = function () {
    localStorage.setItem("savedTick", JSON.stringify(nowTick));
    localStorage.setItem("savedAttention", JSON.stringify(attentionLevel));
    localStorage.setItem("savedTuesday", JSON.stringify(tuesdayInMiliseconds));
    localStorage.setItem("beenTold", beenTold);
};

function empty() {
    //empty array
    plusDataArray.length = 0;
}

var ii = 0;
var PlusArrayCount = 0;

function tickInterval() {
    if (ii === PlusArrayCount && ii !== 0) {
        ii = 0;
        empty();
        ShowTheHeart();
        return;
    }

    nowTickGrab = nowTick + 400;

    if (ii < PlusArrayCount) {
        ii += 1;
    }
}

function clicker() {
    if (clicked === "yep" && clickTick === 0) {
        // If user has clicked, set clickTick counter to 300 to wait
        clickTick = 180;
    }
}

function clickTimerConditions(ClickTickReaches1) {
    // checks to see if clickTick counter has reaches 1
    if (ClickTickReaches1 === 1) {
        clicked = "nope";
        drawPlusNow = "yep";
        degrees = 0;
        PlusArrayCount = plusDataArray.length;
        tickInterval();
    }
}

var lovedup = false;

// Set timer to pause before displaying the heart: 500Ms
function ShowTheHeart() {
    setTimeout(function () {
        lovedup = true;
        setTimeout(function () {
            drawPlusNow = "nope";
            clickTick = 0;
            lovedup = false;
            return;
        }, 1000);
        return;
    }, 300);
}

// Event listener for feed button press mouse click
canvas.addEventListener("click", function (e) {
        var rect = canvas.getBoundingClientRect();
        var x = Math.floor(e.clientX - rect.left);
        var y = Math.floor(e.clientY - rect.top);
        var plus = new Plus(53, 11, -0.3);
        //alert("Mouse Position x: " + x + " y: " + y);

        if (
            drawPlusNow !== "yep" &&
            parseInt(attentionLevel) > 0 &&
            x >= feedButton.x &&
            x < feedButton.x + feedButton.w &&
            y >= feedButton.y &&
            y < feedButton.y + feedButton.h
        ) {
            if (clicked === "yep") {
                plusDataArray.push(plus);
            }

            if (clicked === "nope") {
                clicked = "yep";
                clicker();
            }
        }
    },
    false
);

// Event listener for feed button press screen touch
document.addEventListener("touchmove", function () {});
canvas.addEventListener("touchstart", function () {
        var plus = new Plus(53, 11, -0.3);

        if (drawPlusNow !== "yep" && parseInt(attentionLevel) > 0) {
            if (clicked === "yep") {
                plusDataArray.push(plus);
            }

            if (clicked === "nope") {
                clicked = "yep";
                clicker();
            }
        }
    },
    false
);

var loop = 0;

function draw() {
    radians = (Math.PI / 180) * (degrees * 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.fillText("Sec Away: " + awayTick, 150, 10);
    //ctx.fillText("Update: 31/05/2019 V1", 150, 20);
    //ctx.fillText("Draw Plus: " + drawPlusNow, 150, 30);
    //ctx.fillText("Array Length: " + plusDataArray.length, 150, 40);
    ctx.drawImage(img, 0, 0, 36, 22, 7, 5, 36, 22);
    ctx.drawImage(img, 0, 23, 38, 22, 48, 6, 38, 22);
    attentionGradient.addColorStop(0, "rgba(92, 182, 88, 0.8)");
    attentionGradient.addColorStop(0.66, "rgba(255, 173, 56, 0.8)");
    attentionGradient.addColorStop(1, "rgba(244, 0, 5, 0.8)");
    ctx.fillStyle = attentionGradient;
    ctx.fillRect(10, 24, 4, -Math.abs(graphHeight) + attentionLevel);
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgb(255, 173, 56)";
    ctx.arc(66, 16, 5, 0, radians);
    ctx.stroke();

    if (lovedup === true) {
        ctx.drawImage(img, 7, 3, 10, 10, 52, 8, 10, 10);
    }

    if (plusDataArray.length > 0 && drawPlusNow === "yep") {
        if (nowTick > nowTickGrab) {
            tickInterval();
        }

        for (loop = 0; loop < ii; loop++) {
            if (
                parseInt(plusDataArray[loop].y) === 11 &&
                parseInt(attentionLevel) > 0
            ) {
                attentionLevel -= 1;
            }

            if (plusDataArray[loop].y > 1) {
                plusDataArray[loop].drawPlus();
                plusDataArray[loop].update();
            }
        }
    }

    requestAnimationFrame(draw);
    updateTick();
    updateAttention();
}

LoadData();
getIntervals();
requestAnimationFrame(draw);
