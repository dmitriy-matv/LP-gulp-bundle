const {src, dest, series, parallel, watch} = require('gulp')
const sass = require('gulp-sass')
const csso = require('gulp-csso')
const include = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const del = require('del')
const sync = require('browser-sync').create()
const concat = require('gulp-concat')
const minify = require('minify')
const imagemin  = require('gulp-imagemin')
const cache  = require('gulp-cache')


let project_folder = "dist";
let source_folder = "#src";

let path = {
    build:{
        html:project_folder+"/",
        css:project_folder+"/css/",
        js:project_folder+"/js/",
        img:project_folder+"/img/",
        fonts:project_folder+"/fonts/"
    },
    src:{
        html:source_folder+"/index.html",
        css:source_folder+"/style.scss",
        js:source_folder+"/js/script.js",
        img:source_folder+"/img/**/*.{jpg,svg,ico,webp,gif}",
        fonts:source_folder+"/fonts/*.woff"
    },
    watch:{
        html:source_folder+"/**/*.html",
        css:source_folder+"/**/*.scss",
        js:source_folder+"/js/**/*.js",
        img:source_folder+"/img/**/*.{jpg,svg,ico,webp,gif}"
    },
    clean:"./" + project_folder + "/"
}

function images(){
    return src(path.src.img)
    .pipe(cache(imagemin({
        interlaced: true
    })))
}

function fonts(){
    return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
}

function browserSync(params){
    sync.init({
        server:{
            baseDir:"./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

function js_process(){
    return src(path.src.js)
    .pipe(concat('scripts.min.js'))
    // .pipe(minify())
    .pipe(dest(path.build.js))
    .pipe(sync.stream())
}

function html(){
  return src(path.src.html)
    .pipe(include())
    .pipe(htmlmin({
        //collapseWhitespace: true
    }))
    .pipe(dest(path.build.html))
    .pipe(sync.stream())
}

function styles(){
  return src('#src/**/*.scss')
  .pipe(sass())
  .pipe(concat('styles.css'))
  .pipe(dest(path.build.css))
  .pipe(csso())
  .pipe(concat('styles.min.css'))
  .pipe(dest(path.build.css))
  .pipe(sync.stream())
}

function watch_fls(){
    watch(path.watch.css, styles)
    watch(path.watch.html, html)
    watch(path.watch.js, js_process)
}
function clean_dist(){
    return del(path.clean)
}

let build = series(html, styles, js_process, images, fonts)
let watch_b_sync = parallel(browserSync,watch_fls)

exports.styles = styles
exports.build = build
exports.clean_dist = clean_dist
exports.watch_b_sync = watch_b_sync
exports.default = series(clean_dist, parallel(watch_b_sync, build))