"use strict";

const use   = require("rekuire"),

      gulp     = require("gulp"),
      coverage = require('gulp-istanbul'),
      mocha    = require("gulp-mocha"),
      sequence = require("gulp-sequence"),
      debug    = require("gulp-debug"),

      Paths = use("tasks/gulp/helpers/paths");

const GLOBAL_COVERAGE_THRESHOLD = 60;

const TYPE_DEV             = 1,
      TYPE_DEV_NO_COVERAGE = 2,
      TYPE_PROD            = 3;

var type;

gulp.task("test::init-coverage", function() {
    return gulp
        .src(Paths.getPath("source-file"))
        .pipe(coverage())
        .pipe(coverage.hookRequire());
});

gulp.task("test::test-base", function() {
    if (type === TYPE_DEV) {
        return gulp
            .src(Paths.getPath("tests") + "/index.js", {
                read : false
            })
            .pipe(mocha({
                ui : "exports"
            }))
            .pipe(coverage.writeReports({
                dir : Paths.getPath("root") + "/coverage"
            }))
            .pipe(coverage.enforceThresholds({
                thresholds : {
                    global : GLOBAL_COVERAGE_THRESHOLD // enforce coverage by the given percentage
                }
            }));

    } else {
        return gulp
            .src(Paths.getPath("tests") + "/index.js", {
                read : false
            })
            .pipe(mocha({
                ui : "exports"
            }));
    }
});

gulp.task("test::test-src-dev", function(cb) {
    Paths.addPath("test-path", Paths.getPath("source-file"));
    type = TYPE_DEV;

    cb();
});

gulp.task("test::test-src-dev-no-coverage", function(cb) {
    Paths.addPath("test-path", Paths.getPath("source-file"));
    type = TYPE_DEV_NO_COVERAGE;

    cb();
});

gulp.task("test::test-src-prod", function(cb) {
    Paths.addPath("test-path", Paths.getPath("dist-file"));
    type = TYPE_PROD;

    cb();
});

gulp.task(
    "test::test-dev",
    sequence(
        "test::test-src-dev",
        "test::init-coverage",
        "test::test-base"
    )
);

gulp.task(
    "test::test-dev-no-coverage",
    sequence(
        "test::test-src-dev-no-coverage",
        "test::test-base"
    )
);

gulp.task(
    "test::test-prod",
    sequence(
        "test::test-src-prod",
        "test::test-base"
    )
);

gulp.task(
    "test",
    sequence(
        "test::test-dev",
        "test::test-prod"
    )
);
