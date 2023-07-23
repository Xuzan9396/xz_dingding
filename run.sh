#!/bin/bash

# 检查参数是否存在
if [ -z "$1" ]
then
    echo "请提供版本号作为参数。例如：./xx.sh v0.0.1"
    exit 1
fi

# 定义压缩文件名
zipfile="xz_dingding_$1.zip"

# 使用zip命令压缩文件
zip $zipfile main.js utils.js

mv $zipfile /Users/admin/Downloads # 复制到指定目录

echo "压缩完成：$zipfile"
