# 安装

```bash
npm install zhimu –g
```

>提示1: 如果安装不成功, 可以尝试命令 `npm install -g zhimu`


# 使用方法

在视频所在目录运行以下命令即可，程序会递归查找所有视频文件并将字幕下载到和视频文件所在位置

```bash
zhimu
```

也可以指定目录(默认为当前目录)和视频类型(默认为`mkv`，多种类型以英文逗号分隔)，参数分别是 `-p` 和 `-t`

```bash
zhimu -p /Downloads/movies
```

```bash
zhimu -p /Downloads/movies -t mkv,mp4
```