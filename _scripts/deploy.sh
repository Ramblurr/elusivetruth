#!/bin/sh

dir=/home/ramblurr/elusivetruth/_site
dest=/srv/www/elusivetruth.net/public_html

cd $dir/../
ejekyll
rm -rf $dest
cp -r $dir $dest
