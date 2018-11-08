const gulp = require("gulp");
const electron = require("electron-connect").server.create();

gulp.task("start", () => {
    electron.start();
    gulp.watch(
        [
            "./**/*.js",
            "./**/*.html",
            "./**/*.css",
        ],
        electron.restart
    )
})