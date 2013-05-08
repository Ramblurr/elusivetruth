#!/bin/sh

for i in $@; do
filename=$(basename $i)
extension=${filename##*.}
filename=${filename%%.*}
convert $i -resize "300" -gravity center -extent "300x175" $filename-300x175.$extension
convert $i -resize "300" -gravity center -extent "300x300" $filename-300x300.$extension
convert $i -resize "240" -gravity center -extent "240x133" $filename-240x133.$extension
done
