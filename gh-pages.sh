#!/bin/sh
git checkout gh-pages
git checkout master -- exquery-restxq-specification
git commit -m "Merge in of specification from master branch"
# git push #uncomment if you want to auto-push
git checkout master
