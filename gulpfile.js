var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var cp = require("child_process")

var fs = require("fs")
var xml = require("xmldoc")

var defaultJarSignerLocation = "C:\\Program Files\\Java\\jdk1.8.0_73\\bin\\jarsigner"
var defaultZipAlignLocation = "C:\\Program Files (x86)\\Android\\android-sdk\\build-tools\\23.0.2\\zipalign.exe"
var defaultKeystoreLocation = "C:\\Path\\To\\app.example.com.keystore"
var defaultKeystoreAlias = "app_example_com"

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

// =============================================================================
gulp.task("prepare-mac", function() {
  gutil.log(cp.execSync("git reset --hard").toString('ascii'))
  gutil.log(cp.execSync("git pull").toString('ascii'))
  gutil.log(cp.execSync("mkdir ./resources").toString('ascii'))
  gutil.log(cp.execSync("cordova clean ios").toString('ascii'))
  gutil.log(cp.execSync("rm -rf ./plugins").toString('ascii'))
  gutil.log(cp.execSync("rm -rf ./platforms").toString('ascii'))
  gutil.log(cp.execSync("ionic platform add ios").toString('ascii'))
  gutil.log(cp.execSync("ionic platform add android").toString('ascii'))
  gutil.log(cp.execSync("ionic state restore").toString('ascii'))
  gutil.log(cp.execSync("ionic hooks add").toString('ascii'))
  gutil.log(cp.execSync("npm install").toString('ascii'))
  gutil.log(cp.execSync("bower install").toString('ascii'))
  gutil.log(cp.execSync("ionic io init").toString('ascii'))
})

// Sets the package (widget) ID
gulp.task('set-package-id', function() {
  if(typeof gutil.env.packageid === "undefined") {
    gutil.log(gutil.colors.red("--packageid is not set. Aborting."))
    process.exit(1)
  }
  configXML = new xml.XmlDocument(fs.readFileSync("config.xml"))
  configXML.attr.id = gutil.env.packageid
  fs.writeFileSync("config.xml", configXML.toString())
})

// Sets the package name
gulp.task('set-package-name', function() {
  if(typeof gutil.env.packagename === "undefined") {
    gutil.log(gutil.colors.red("--packagename is not set. Aborting."))
    process.exit(1)
  }
  configXML = new xml.XmlDocument(fs.readFileSync("config.xml"))
  configXML.childNamed("name").val = gutil.env.packagename
  fs.writeFileSync("config.xml", configXML.toString())
})

// Sets the package (widget) version
gulp.task('set-package-version', function() {
  if(typeof gutil.env.packageversion === "undefined") {
    gutil.log(gutil.colors.red("--packageversion is not set. Aborting."))
    process.exit(1)
  }
  configXML = new xml.XmlDocument(fs.readFileSync("config.xml"))
  configXML.attr.version = gutil.env.packageversion
  fs.writeFileSync("config.xml", configXML.toString())
})

// Copies "icon_free.png" to "icon.png". Running ionic resources will generate icons with that icon
gulp.task('set-free-icon', function() {
  sh.rm("./resources/icon.png")
  sh.cp("./resources/icon_free.png", "./resources/icon.png")
  gutil.log(cp.execSync("ionic resources").toString('ascii'))
})

// Copies "icon_paid.png" to "icon.png". Running ionic resources will generate icons with that icon
gulp.task('set-paid-icon', function() {
  sh.rm("./resources/icon.png")
  sh.cp("./resources/icon_paid.png", "./resources/icon.png")
  gutil.log(cp.execSync("ionic resources").toString('ascii'))
})

// Signs the APK
gulp.task("jarsign", function() {
  if(typeof gutil.env.storepass === "undefined") {
    gutil.log(gutil.colors.red("--storepass is not set. Aborting."))
    process.exit(1)
  }

  if(typeof gutil.env.jarsigner === "undefined") {
    gutil.env.jarsigner = defaultJarSignerLocation
  }

  if(typeof gutil.env.keystore === "undefined") {
    gutil.env.keystore = defaultKeystoreLocation
  }

  if(typeof gutil.env.keystorealias === "undefined") {
    gutil.env.keystorealias = defaultKeystoreAlias
  }

  gutil.log(gutil.colors.green("Signing JAR"))
  gutil.log(cp.execSync("\"" + gutil.env.jarsigner + "\" -storepass " + gutil.env.storepass + " -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore \"" + gutil.env.keystore + "\" \".\\platforms\\android\\build\\outputs\\apk\\android-release-unsigned.apk\" " + gutil.env.keystorealias).toString('ascii'))

})

// Aligns the zip
gulp.task("zipalign", function() {
  if(typeof gutil.env.packageid === "undefined") {
    gutil.log(gutil.colors.red("--packageid is not set. Aborting."))
    process.exit(1)
  }

  if(typeof gutil.env.zipalign === "undefined") {
    gutil.env.zipalign = defaultZipAlignLocation
  }

  gutil.log(gutil.colors.green("Aligning zip"))
  gutil.log(cp.execSync("\"" + gutil.env.zipalign + "\" -f -v 4 \".\\platforms\\android\\build\\outputs\\apk\\android-release-unsigned.apk\" \".\\platforms\\android\\build\\outputs\\apk\\" + gutil.env.packageid + ".apk\"").toString('ascii'))

})

gulp.task('set-free-vars', ['set-free-icon'], function() {
  gutil.env.packageid = "live.auroras.app.free"
  gutil.env.packagename = "Auroras.live Free"
})

gulp.task('set-paid-vars', ['set-paid-icon'], function() {
  gutil.env.packageid = "live.auroras.app"
  gutil.env.packagename = "Auroras.live"
})

gulp.task("build-android", function() {
  gutil.log(cp.execSync("cordova build android --release").toString('ascii'))
})

gulp.task("build-ios", function() {
  gutil.log(cp.execSync("ionic prepare ios").toString('ascii'))
  gutil.log(cp.execSync("cordova build ios --release").toString('ascii'))
})

gulp.task("build-ios-free", ['set-free-vars', 'set-package-id', 'set-package-name', 'build-ios'], function() {

})

gulp.task("build-ios-paid", ['set-paid-vars', 'set-package-id', 'set-package-name', 'build-ios'], function() {

})

gulp.task('build-android-free', ['set-free-vars', 'set-package-id', 'set-package-name', 'build-android', 'jarsign', 'zipalign'], function() {

})

gulp.task('build-android-paid', ['set-paid-vars', 'set-package-id', 'set-package-name', 'build-android', 'jarsign', 'zipalign'], function() {

})

// =============================================================================

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
