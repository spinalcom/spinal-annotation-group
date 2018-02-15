
OUTDIR=www
TEMPLATE_OUTDIR=$(OUTDIR)/app/templates

SRC= app/app.js \
  app/app.config.js \
  app/app.route.js \
  app/directives/navbar.js \
  app/services/spinalCore.js \
  app/services/spinalModelDictionary.js \
  app/services/goldenLayoutService.js \
  app/services/authService.js \
  app/controllers/mainCtrl.js \
  app/controllers/navbarCtrl.js \
  app/controllers/forgeViewerCtrl.js \
  app/controllers/loginCtrl.js \
  app/run/plugin-annotation.js

OUT= $(OUTDIR)/js/app.compile.min.js

LIBSRC= bower_components/angular/angular.js \
  bower_components/angular-aria/angular-aria.js \
  bower_components/angular-animate/angular-animate.js \
  bower_components/angular-material/angular-material.js \
  bower_components/angular-route/angular-route.js \
  bower_components/jquery/dist/jquery.min.js \
  bower_components/bootstrap/dist/js/bootstrap.min.js \
  bower_components/golden-layout/dist/goldenlayout.min.js \
  bower_components/angular-material-icons/angular-material-icons.min.js \
  bower_components/jquery-ui/jquery-ui.min.js \
  bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js

LIBOUT= $(OUTDIR)/js/lib.compile.min.js

CSS= bower_components/angular-material/angular-material.css \
  bower_components/material-design-icons/iconfont/material-icons.css \
  bower_components/golden-layout/src/css/goldenlayout-base.css \
  bower_components/golden-layout/src/css/goldenlayout-dark-theme.css \
  bower_components/font-awesome/css/font-awesome.css \
  bower_components/bootstrap/dist/css/bootstrap.min.css \
  bower_components/angular-bootstrap-colorpicker/css/colorpicker.min.css \
  app/css/app.css

CSSOUT= $(OUTDIR)/css/css.compile.css

all: compile
	
create_outdir:
	@mkdir -p $(TEMPLATE_OUTDIR)
	@mkdir -p $(OUTDIR)/js
	@mkdir -p $(OUTDIR)/css
	@mkdir -p $(OUTDIR)/fonts

link: create_outdir 
	cp index.html assets www/ -r
	cp app/templates/* $(TEMPLATE_OUTDIR) -r

ln:
	cd .. && ln -s spinalhome/www spinaldrive

compile: create_outdir
	babel $(SRC) -o $(OUT) --presets es2015 --presets minify -s

lib: create_outdir
	babel $(LIBSRC) -o $(LIBOUT) --presets es2015 --presets minify -s

css: create_outdir
	cat $(CSS) | csso -o $(CSSOUT) --map file
	cp bower_components/font-awesome/fonts/* $(OUTDIR)/fonts -r

watch-js-min:
	babel $(SRC) -w -o $(OUT) --presets es2015 --presets minify -s

watch-js:
	babel $(SRC) -w -o $(OUT) --presets es2015 -s

doc:
	jsdoc2md $(SRC) > README.md

bower:
	bower install --allow-root

models:
	npm run models

init: bower compile lib css link models

run:
	@true



.PHONY: all init run compile lib link css create_outdir doc bower models
