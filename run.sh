#!/bin/bash

# 使用 ./run.sh v0.0.7 更新判断题
# 检查参数是否存在
if [ -z "$1" ]
then
    echo "请提供版本号作为参数。例如：./xx.sh v0.0.1"
    exit 1
fi

if [ -z "$2" ]
then
    echo "请提供提交信息作为第二个参数。例如：./xx.sh v0.0.1 更新"
    exit 1
fi

# Add and commit changes
git add .
git commit -m "$2-update"
if [ $? -ne 0 ]
then
    echo "Commit failed, aborting."
    exit 1
fi

# Push changes
git push
if [ $? -ne 0 ]
then
    echo "Push failed, aborting."
    exit 1
fi

# Tag and push tags
git tag $1 -m "$2" -f
git push --tags -f

# Define zip file name
zipfile="xz_dingding_$1.zip"

# Remove old zip file if it exists
if [ -f $zipfile ]; then
    rm $zipfile
fi

# Use zip command to compress files
zip $zipfile main.js utils.js

# Move zip file to specified directory
mv $zipfile /Users/admin/Downloads
if [ $? -ne 0 ]
then
    echo "Moving zip file failed."
    exit 1
fi

echo "压缩完成：$zipfile"
