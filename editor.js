const fs = require("fs");
const path = require("path");
const converter = require('./convert');
const label = document.getElementById("label");
const convBtn = document.getElementById("convert");
const canvas = document.getElementById("draw");
const context = canvas.getContext("2d");
const {
    remote
} = require('electron');
const dataUriToBuffer = remote.require('data-uri-to-buffer');
const {
    showOpenDialog,
    showSaveDialog
} = remote.dialog;

let image, imageIndex, zoom, ax, ay, bx, by;

const resetCanvas = () => {
    [canvas.width, canvas.height] = [640, 480];
    context.clearRect(0, 0, canvas.width, canvas.height);
};

let dirList;
const getDirList = () => fs
    .readdirSync(`${__dirname}/images/`)
    .filter(v => [".jpg", ".png", ".bmp"].includes(path.parse(v).ext))

const isOver = () => imageIndex >= dirList.length - 1;

const nextDrawImage = () => {
    if (isOver()) {
        console.log("over")
        convert();
        return;
    }
    ax = ay = bx = by = undefined;
    imageIndex = imageIndex !== undefined ? imageIndex + 1 : 0;
    image = new Image();
    image.src = `file://${__dirname}/images/${dirList[imageIndex]}`;
    image.onload = () => {
        drawNowImage();
    }
}
const drawNowImage = () => {
    resetCanvas();
    const {
        naturalWidth,
        naturalHeight
    } = image;
    const tw = naturalWidth / canvas.width,
        th = naturalHeight / canvas.height;
    zoom = tw > th ? tw : th;
    context.drawImage(image, 0, 0, naturalWidth / zoom, naturalHeight / zoom);
}
const drawMarker = (x, y, rgb = "0, 0, 0") => {
    for (let i = 1; i <= 4; i++) {
        context.beginPath();
        context.strokeStyle = `rgba(${rgb}, ${0.25*i})`;
        context.arc(x, y, 25 * i, 0, Math.PI * 2, false);
        context.stroke();
    }
}
const mousePos = mouseEvent => {
    const rect = mouseEvent.target.getBoundingClientRect();
    return {
        mx: mouseEvent.clientX - rect.left,
        my: mouseEvent.clientY - rect.top,
        ml: mouseEvent.which === 1,
        mr: mouseEvent.which === 3
    };
}

const setup = () => {
    dirList = getDirList();
    console.log(dirList)
    nextDrawImage();
}
const update = mouseEvent => {
    label.innerText = `${imageIndex + 1} / ${dirList.length} ( ${((imageIndex + 1) / dirList.length) * 100} % )`
    const {
        mx,
        my,
        ml,
        mr
    } = mousePos(mouseEvent);
    if (ml) ax = mx, ay = my;
    if (mr) bx = mx, by = my;
    drawNowImage();
    drawMarker(mx, my)
    const a = ax !== undefined || ay !== undefined;
    const b = bx !== undefined || by !== undefined;
    if (a) drawMarker(ax, ay, "255, 0, 0")
    if (b) drawMarker(bx, by, "0, 0, 255")
    if (a && b) {
        context.strokeStyle = "black"
        context.beginPath();
        context.moveTo(ax, ay);
        context.lineTo(bx, by);
        context.stroke();
    }
}
const convert = async () => {
    label.innerText = "Converting...";
    for(let f of dirList){
        const r = converter.read(path.parse(f).name);
        console.log(r);
        await converter.conv2(r)
        console.log(1);
    }
    label.innerText = "OK";
}

setup();

canvas.addEventListener("mousemove", e => {
    update(e)
});
canvas.addEventListener("mousedown", e => {
    update(e)
});
convBtn.addEventListener("click", e => {
    convert();
})
document.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        const file = path.parse(image.src);
            const output = {
                path: image.src,
                ...file,
                ax: ax * zoom,
                ay: ay * zoom,
                bx: bx * zoom,
                by: by * zoom
            };
            fs.writeFileSync(
                `./images/${decodeURIComponent(file.name)}.json`,
                JSON.stringify(output),
                {
                    encoding: "utf8"
                }
            )
            nextDrawImage();
    }
})