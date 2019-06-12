"use strict";
/*global localStorage: false, console: false, alert: false,
Image: false, setTimeout: false, document: false, window: false,
requestAnimationFrame: false */
//localStorage.removeItem("savedTick");
//localStorage.removeItem("savedAttention");
//localStorage.removeItem("savedTuesday");
//localStorage.removeItem("savedStarTick");
//localStorage.removeItem("beenTold");

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.lineWidth = 1;
ctx.font = "8px Arial";
ctx.fillStyle = "#0095DD";
var img = new Image();
img.src = "Images/Sprites2.png";
var graphHeight = 16;
var attentionGradient = ctx.createLinearGradient(10, 6, 14, 24);
var tickspan = {
    day: 86400000,
    week: 604800000,
    overAWeek: 691200000
};
var feedButton = {
    x: 42,
    y: 6,
    w: 35,
    h: 22
};

var timers = {
    dataTick: 0,
    awayTick: 0,
    nowTick: Date.now(),
    nowTickGrab: 0,
    starTick: 0
};

var flags = {
    beenTold: "nope",
    clicked: "nope",
    drawPlusNow: "nope",
    starNow: false
};

var attentionLevel = 0;
var dataAttention;
var tuesdayInMiliseconds;
var plusDataArray = [];
var MissedItBy;
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
    ctx.drawImage(img, 0, 46, 10, 10, this.x, this.y, 10, 10); // Plus
};

Plus.prototype.update = function () {
    if (this.y > 0) {
        this.y += this.velY;
    }
};

// Load the data
function LoadData() {
    if (window.localStorage) {
        timers.dataTick = JSON.parse(localStorage.getItem("savedTick"));
        dataAttention = JSON.parse(localStorage.getItem("savedAttention"));
        tuesdayInMiliseconds = JSON.parse(localStorage.getItem("savedTuesday"));
        timers.starTick = JSON.parse(localStorage.getItem("savedStarTick"));
        flags.beenTold = localStorage.getItem("beenTold");
        timers.awayTick = Math.round((timers.nowTick - timers.dataTick) / 1000);
        attentionLevel = dataAttention + (timers.awayTick / (tickspan.day / 1000)) * graphHeight;
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
        flags.beenTold = "nope";
        alert("First time, huh?");
    }

    if (dayOfTheWeek === 3 && timers.nowTick - timers.dataTick > tickspan.overAWeek) {
        alert("You missed last Tuesdays update");
    }

    if (dayOfTheWeek === 2) { // If its Tuesday...
        if (timers.nowTick > timers.starTick || timers.starTick === null) { // and nowTick is bigger than starTick ---
            timers.starTick = timers.nowTick + 3600000; // set starTick to an hour from now for another star
            flags.starNow = true;
            alert("The time for a new star has passed");
        }
        flags.beenTold = "nope";
    }

    if (dayOfTheWeek !== 2) {
        timers.starTick = null;
        if (flags.beenTold === "nope") {
            if (dayOfTheWeek > 2 && dayOfTheWeek <= 6) {
                MissedItBy = dayOfTheWeek - 2;
            }

            if (dayOfTheWeek < 2) {
                MissedItBy = dayOfTheWeek + 5;
            }

            flags.beenTold = "yep";
            alert("The update was " + MissedItBy + " days ago");
        }
    }

    if (flags.beenTold === "nope") {
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
    timers.nowTick = Date.now();

    // If clickTick has a value, count it down to 1
    if (clickTick > 1) {
        clickTick -= 1;
        degrees = clickTick;
        clickTimerConditions(clickTick);
    }
}

function updateAttention() {
    if (parseInt(attentionLevel) < 16) {
        attentionLevel += graphHeight / tickspan.day;
    } else {
        attentionLevel = 16;
    }
}

window.onunload = function () {
    localStorage.setItem("savedTick", JSON.stringify(timers.nowTick));
    localStorage.setItem("savedAttention", JSON.stringify(attentionLevel));
    localStorage.setItem("savedTuesday", JSON.stringify(tuesdayInMiliseconds));
    localStorage.setItem("savedStarTick", JSON.stringify(timers.starTick));
    localStorage.setItem("beenTold", flags.beenTold);
};

var ii = 0;
var PlusArrayCount = 0;

function tickInterval() {
    if (ii === PlusArrayCount && ii !== 0) {
        ii = 0;
        plusDataArray.length = 0;
        ShowTheHeart();
        return;
    }

    timers.nowTickGrab = timers.nowTick + 400;

    if (ii < PlusArrayCount) {
        ii += 1;
    }
}

function clicker() {
    if (flags.clicked === "yep" && clickTick === 0) {
        clickTick = 180;
    }
}


//Circular timer countdown
function clickTimerConditions(ClickTickReaches1) {
    if (ClickTickReaches1 === 1) {
        flags.clicked = "nope";
        flags.drawPlusNow = "yep";
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
            flags.drawPlusNow = "nope";
            clickTick = 0;
            lovedup = false;
        }, 1000);
    }, 300);
}

function addAPlus() {
    flags.clicked = "yep";
    var plus = new Plus(47, 11, -0.3);
    plusDataArray.push(plus);
    clicker();
}


// Event listener for feed button press mouse click
canvas.addEventListener("click", function (e) {
        var rect = canvas.getBoundingClientRect();
        var x = Math.floor(e.clientX - rect.left);
        var y = Math.floor(e.clientY - rect.top);
        //alert("Mouse Position x: " + x + " y: " + y);
        if (
            flags.drawPlusNow !== "yep" &&
            parseInt(attentionLevel) > 0 &&
            x >= feedButton.x &&
            x < feedButton.x + feedButton.w &&
            y >= feedButton.y &&
            y < feedButton.y + feedButton.h
        ) {
            addAPlus();
        }
    },
    false
);

// Event listener for feed button press screen touch
document.addEventListener("touchmove", function () {});
canvas.addEventListener("touchstart", function () {

        if (flags.drawPlusNow !== "yep" && parseInt(attentionLevel) > 0) {
            addAPlus();
        }
    },
    false
);

var loop = 0;
attentionGradient.addColorStop(0, "rgba(92, 182, 88, 0.8)");
attentionGradient.addColorStop(0.66, "rgba(255, 173, 56, 0.8)");
attentionGradient.addColorStop(1, "rgba(244, 0, 5, 0.8)");

function draw() {
    radians = (Math.PI / 180) * (degrees * 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText("Now Tick: " + timers.nowTick, 100, 10);
    ctx.fillText("Star Tick: " + timers.starTick, 100, 20);
    ctx.fillText("clicked: " + flags.clicked, 150, 30);
    ctx.fillText("Array Length: " + plusDataArray.length, 150, 40);
    ctx.drawImage(img, 0, 0, 36, 22, 4, 6, 36, 22); // Status
    ctx.drawImage(img, 0, 26, 36, 16, 39, 12, 36, 16); // Rock
    ctx.fillStyle = attentionGradient;
    ctx.fillRect(7, 25, 4, -Math.abs(graphHeight) + attentionLevel);
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgb(255, 173, 56)";
    ctx.arc(58, 20, 4, 0, radians);
    ctx.stroke();

    if (lovedup === true) {
        ctx.drawImage(img, 8, 3, 9, 9, 47, 9, 9, 9); // Heart
    }

    if (flags.starNow === true) {
        ctx.drawImage(img, 24, 10, 9, 9, 66, 19, 9, 9); // Star
    }

    if (plusDataArray.length > 0 && flags.drawPlusNow === "yep") {
        if (timers.nowTick > timers.nowTickGrab) {
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
