BUILDDIR = _build
DOCS = $(wildcard src/*)
REDPEN = redpen -c redpen-conf-ja.xml -f markdown -l 0
.PHONY: help clean check html

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  check      to check document"
	@echo "  html       to make standalone HTML files"
	@echo "  pdf        to make pdf file"



check:
	@$(foreach doc,$(DOCS),echo "$(REDPEN) $(doc)"; REDPEN $(doc);)

clean:
	-rm -rf $(BUILDDIR)/

pdf:
	gitbook pdf . $(BUILDDIR)/docs.pdf

html:
	gitbook build . $(BUILDDIR)/html
