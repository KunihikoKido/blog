BUILDDIR = build

.PHONY: help clean check html

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  html       to make standalone HTML files"
	@echo "  pdf        to make pdf file"


check:
	redpen -c redpen-conf-ja.xml -f markdown -l 0 tools/*.md

clean:
	-rm -rf $(BUILDDIR)/

pdf:
	gitbook pdf . $(BUILDDIR)/myblog.pdf

html:
	gitbook build . $(BUILDDIR)/html
