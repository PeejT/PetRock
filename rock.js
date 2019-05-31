'use strict';
// localStorage.removeItem("savedTick");
// localStorage.removeItem("savedAttention");
// localStorage.removeItem("savedTuesday");
// localStorage.removeItem("beenTold");
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = 'Images/Sprites2.png';
const graphHeight = 16;
const attentionGradient = ctx.createLinearGradient(10, 6, 14, 24);
const ticks = {
    day: 86400000,
    week: 604800000,
    overAWeek: 691200000,
};
const feedButton = {
    x: 48,
    y: 5,
    w: 38,
    h: 22,
};

let dataTick;
let awayTick;
let attentionLevel = 0;
let dataAttention;
let tuesdayInMiliseconds;
let beenTold;
let nowTick = Date.now();
let clicked = 'nope';
let plusDataArray = [];
let drawPlusNow = 'nope';
let MissedItBy;
let nowTickGrab = 0;
let radians;
let degrees = 0; // change in relation to the progress circle in degrees

// Define Plus constructor
function Plus(x, y, velY) {
    this.x = x;
    this.y = y;
    this.velY = velY;
}

// define Plus draw method
Plus.prototype.drawPlus = function () {
    ctx.drawImage(img, 0, 46, 10, 10, this.x, this.y, 10, 10);
};

// define Plus update method
Plus.prototype.update = function () {
    if (this.y > 0) {
        this.y += this.velY;
    }
};

// Load the data
function LoadData() {
    if (window.localStorage) {
        dataTick = JSON.parse(localStorage.getItem('savedTick'));
        dataAttention = JSON.parse(localStorage.getItem('savedAttention'));
        tuesdayInMiliseconds = JSON.parse(localStorage.getItem('savedTuesday'));
        beenTold = localStorage.getItem('beenTold');
        awayTick = Math.round((nowTick - dataTick) / 1000);
        attentionLevel = dataAttention - (-Math.abs(awayTick / (ticks.day / 1000)) * graphHeight);
        attentionLevel = 16;
    } else {
        alert('No Web Storage without HTTP');
    }
}

// Work out forfeits.
function getIntervals() {
    const d = new Date();
    let interval;
    const dayOfTheWeek = (d.getDay());
    if (tuesdayInMiliseconds === undefined || tuesdayInMiliseconds === '' || tuesdayInMiliseconds === null) {
        beenTold = 'nope';
        alert('First time, huh?');
    } else if (dayOfTheWeek === 3 && (nowTick - dataTick) > ticks.overAWeek) {
        alert('You missed last Tuesdays update');
    } else { // This works if its a Tuesday, but when it's a Tuesday in two months time, for example, it still loves ya!
        if (dayOfTheWeek === 2) {
            beenTold = 'nope';
            alert('YEAH, proper FAN!'); // Should turn on hourly star rewards, proper fan!
        }

        if (beenTold === 'nope' && dayOfTheWeek !== 2) {
            if (dayOfTheWeek > 2 && dayOfTheWeek <= 6) {
                MissedItBy = dayOfTheWeek - 2;
            }

            if (dayOfTheWeek < 2) {
                MissedItBy = dayOfTheWeek + 5;
            }

            beenTold = 'yep';
            alert(`The update was ${MissedItBy} days ago`);
        }
    }

    if (beenTold === 'nope') {
        interval = 9;
    } else {
        interval = 2;
    }

    d.setDate((interval - d.getDay() + (interval + 5)) % (interval + 5) + d.getDate());
    const tuesday = d.toDateString();
    tuesdayInMiliseconds = new Date(tuesday).getTime();
    alert(`Don't forget to come back ${tuesday} for another update!`);
}

let clickTick = 0;

function updateTick() {
    nowTick = Date.now();
    if (clickTick > 1) { // If clickTick has a value, count it down to 1
        clickTick -= 1;
        degrees = clickTick;
        clickTimerConditions(clickTick);
    }
}

function updateAttention() {
    if (parseInt(attentionLevel) < 16) {
        attentionLevel += graphHeight / (ticks.day);
    } else {
        attentionLevel = 16;
    }
}

window.onunload = function () {
    localStorage.setItem('savedTick', JSON.stringify(nowTick));
    localStorage.setItem('savedAttention', JSON.stringify(attentionLevel));
    localStorage.setItem('savedTuesday', JSON.stringify(tuesdayInMiliseconds));
    localStorage.setItem('beenTold', beenTold);
};

let ii = 0;

function tickInterval() {
    nowTickGrab = nowTick + 200;
    if (ii < plusDataArray.length) {
        ii += 1;
    }
}

function clicker() {
    if (clicked === 'yep' && clickTick === 0) { // If user has clicked, set clickTick counter to 300 to wait
        clickTick = 360;
    }
}

function clickTimerConditions(ClickTickReaches1) { // checks to see if clickTick counter has reaches 1
    if (ClickTickReaches1 === 1) {
        clicked = 'nope';
        drawPlusNow = 'yep';
        waitForAllThePlus();
        tickInterval();
    }
}

function waitForAllThePlus() { // Set timer to wait for all the attention plus's to draw & reset everything when done
    let timerId2 = setTimeout(() => {
        drawPlusNow = 'nope';
        plusDataArray = [];
        clearTimeout(timerId2);
        ii = 0;
        clickTick = 0;
    }, 600 * plusDataArray.length);
}


// Event listener for feed button press mouse click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    const plus = new Plus(53, 11, -0.3);
    //alert("Mouse Position x: " + x + " y: " + y);
    if (
        drawPlusNow !== 'yep' &&
        parseInt(attentionLevel) > 0 &&
        x >= feedButton.x &&
        x < feedButton.x + feedButton.w &&
        y >= feedButton.y &&
        y < feedButton.y + feedButton.h
    ) {
        if (clicked === 'yep') {
            plusDataArray.push(plus);
        }
        if (clicked === 'nope') {
            clicked = 'yep';
            clicker();
        }
    }
}, false);

// Event listener for feed button press screen touch
let clientX,
    clientY;
document.addEventListener('touchmove', () => {});
canvas.addEventListener('touchstart', (e) => {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
    const plus = new Plus(53, 11, -0.3);
    if (drawPlusNow !== 'yep' &&
        parseInt(attentionLevel) > 0
    ) {
        if (clicked === 'yep') {
            plusDataArray.push(plus);
        }
        if (clicked === 'nope') {
            clicked = 'yep';
            clicker();
        }
    }
}, false);

function draw() {
    radians = (Math.PI / 180) * degrees
    ctx.lineWidth = 1;
    ctx.font = '8px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(`Sec Away: ${awayTick}`, 150, 10);
    ctx.fillText('Update: 31/05/2019 V1', 150, 20);
    ctx.fillText(`Sec Away: ${drawPlusNow}`, 150, 30);
    ctx.drawImage(img, 0, 0, 36, 22, 7, 5, 36, 22);
    ctx.drawImage(img, 0, 23, 38, 22, 48, 6, 38, 22);
    //ctx.fillStyle = 'rgba(92,182,88,0.3)';
    //ctx.fillRect(feedButton.x, feedButton.y, feedButton.w, 22);
    attentionGradient.addColorStop(0, 'rgba(92, 182, 88, 0.8)');
    attentionGradient.addColorStop(0.66, 'rgba(255, 173, 56, 0.8)');
    attentionGradient.addColorStop(1, 'rgba(244, 0, 5, 0.8)');
    ctx.fillStyle = attentionGradient;
    ctx.fillRect(10, 24, 4, (-Math.abs(graphHeight) + attentionLevel));
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgb(255, 173, 56)';
    ctx.arc(66, 16, 5, 0, radians);
    ctx.stroke();

    if (plusDataArray.length > 0 && drawPlusNow === 'yep') {
        if (nowTick > nowTickGrab) {
            tickInterval();
        }
        for (let loop = 0; loop < ii; loop++) {
            if ((parseInt(plusDataArray[loop].y)) === 11 && parseInt(attentionLevel) > 0) {
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
draw();
