const fs = require("fs")
const ic = require("iconv-lite")
const Jimp = require("jimp")

const dir = `${__dirname}/images/`;

module.exports = {
    conv: (file, xy) => new Promise((res) => {
        console.log("start")
        const lina = p => Math.atan2((p[1].y - p[0].y), (p[1].x - p[0].x)) * (180 / Math.PI);
        // 加工
        Jimp
            .read(`${dir}${file.name}${file.type}`)
            .then((img) => {
                console.log(`${file.name} is processing...`);
                // 中点
                const cent = {
                    x: (xy[0].x + xy[1].x) / 2,
                    y: (xy[0].y + xy[1].y) / 2,
                };
                // 画像を貼り付け用に複製
                const clone = img.clone();
                // トリミング幅計算用
                const trimh = img
                    .clone()
                    .rotate(90 - lina(xy))
                    .bitmap.height;

                const width = () => {
                    if (cent.x * 2 < clone.bitmap.width) {
                        return (clone.bitmap.width - cent.x) * 2;
                    }
                    return cent.x * 2;
                };

                // 白紙に貼り付けて加工
                const paper = new Jimp(width(), cent.y * 2, 0x00000000)
                    // 画質調整
                    .quality(100)
                    // 複製画像を貼り付ける
                    .blit(
                        clone,
                        (cent.x * 2) > clone.bitmap.width ?
                        0 :
                        width() - clone.bitmap.width,
                        0,
                    )
                    // 画質保持のため倍にする
                    .scale(2)
                    // 回転
                    .rotate(90 - lina(xy))
                    // 補完モードで元のサイズに戻す
                    .scale(0.5, Jimp.RESIZE_BICUBIC);

                paper
                    // トリミング
                    .crop(0, 0, paper.bitmap.width, trimh)
                    // 書き出し
                    .write(`${dir}convert/${file.name}_${file.type}`);
                // console.log(trimh);

                // console.log('中点:', cent);
                console.log(`${file.name} is done!`);
                res(true);
            });
    }),
    conv2: async (data) => {
        const xy = data.xy;
        const lina = p => Math.atan2((p[1].y - p[0].y), (p[1].x - p[0].x)) * (180 / Math.PI);
        console.log("now")
        // 加工
        await Jimp
            .read(`${dir}${data.name}${data.ext}`)
            .then((img) => {
                console.log(`${data.name} is processing...`);
                // 中点
                const cent = {
                    x: (xy[0].x + xy[1].x) / 2,
                    y: (xy[0].y + xy[1].y) / 2,
                };
                // 画像を貼り付け用に複製
                const clone = img.clone();
                // トリミング幅計算用
                const trimh = img
                    .clone()
                    .rotate(90 - lina(xy))
                    .bitmap.height;

                const width = () => {
                    if (cent.x * 2 < clone.bitmap.width) {
                        return (clone.bitmap.width - cent.x) * 2;
                    }
                    return cent.x * 2;
                };

                // 白紙に貼り付けて加工
                const paper = new Jimp(width(), cent.y * 2, 0x00000000)
                    // 画質調整
                    .quality(100)
                    // 複製画像を貼り付ける
                    .blit(
                        clone,
                        (cent.x * 2) > clone.bitmap.width ?
                        0 :
                        width() - clone.bitmap.width,
                        0,
                    )
                    // 画質保持のため倍にする
                    .scale(2)
                    // 回転
                    .rotate(lina(xy) - 90)
                    // 補完モードで元のサイズに戻す
                    .scale(0.5, Jimp.RESIZE_BICUBIC);

                paper
                    // トリミング
                    .crop(0, 0, paper.bitmap.width, trimh)
                    // 書き出し
                    .write(`${dir}output/${data.name}_${data.ext}`);
                // console.log(trimh);

                // console.log('中点:', cent);
                console.log(`${data.name} is done!`);
            });
    },
    read: name => {
        const json = JSON.parse(fs.readFileSync(`${dir}${name}.json`, {
            encoding: "utf8"
        }))
        return {
            name: decodeURIComponent(json.name),
            ext: decodeURIComponent(json.ext),
            xy: [{
                    x: json.ax,
                    y: json.ay,
                },
                {
                    x: json.bx,
                    y: json.by,
                }
            ]
        }
    }
}