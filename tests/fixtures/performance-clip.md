# 性能测试视频

`performance-clip.webm` 是自行生成的 160×90、10fps、1秒蓝色画面，无声音，无外部版权素材。

用于浏览器验证实际解码、按需播放与 Range 传输，不依赖外部网址或运行时视频生成。

生成命令（仅维护样本时需要 FFmpeg，运行测试不需要）：

```sh
ffmpeg -f lavfi -i color=c=0x2563eb:s=160x90:r=10 -t 1 -c:v libvpx -an performance-clip.webm
```
