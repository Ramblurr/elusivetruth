#!/bin/sh

filename=$(basename $1)
extension=${filename##*.}
filename=${filename%%.*}
convert $1 -resize "300" -gravity center -extent "300x175" $filename-300x175.$extension
convert $1 -resize "300" -gravity center -extent "300x300" $filename-300x300.$extension
