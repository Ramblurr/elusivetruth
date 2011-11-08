#!/bin/sh


dir=/home/ramblurr/elusivetruth/

ssh ramblurr@binaryelysium.com "cd $dir && git pull origin master && $dir/_scripts/deploy.sh && $dir/_scripts/deploy.sh"
