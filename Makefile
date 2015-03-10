REPORTER ?= spec
TESTS = $(shell find ./test -name "*.js")

mocha: ./node_modules/.bin/mocha

test: mocha
	mocha $(TESTS)