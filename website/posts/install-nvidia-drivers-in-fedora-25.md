---
title: 在 Fedora 25 中安装 NVIDIA 驱动
tags:
  - Linux
date: 2016-12-25 10:33:00
---

此篇文章根据 [https://www.if-not-true-then-false.com/2015/fedora-nvidia-guide/](https://www.if-not-true-then-false.com/2015/fedora-nvidia-guide/) 而来。

先从 NVIDIA 官方下载 Linux 版的显示驱动，后缀名是 .run ，并为该文件添加可执行的权限。

```bash
chmod +x /path/to/NVIDIA-Linux-*.run
```

使用系统有最高权限的 root 用户。

```bash
su
```

或：

```bash
sudo -i
```

升级所有软件包。

```bash
dnf update
```

这时往往会更新系统内核，因此要重启系统让系统使用新版本的内核。

```bash
reboot
```

安装驱动所需的依赖，因为驱动是在安装时才编译的。

```bash
dnf install kernel-devel kernel-headers gcc dkms acpid
```

接下来要关闭系统默认的 `nouveau` 开源驱动。依次执行：

```bash
echo "blacklist nouveau" >> /etc/modprobe.d/blacklist.conf
GRUB_CMDLINE_LINUX="rd.lvm.lv=fedora/swap rd.lvm.lv=fedora/root rhgb quiet rd.driver.blacklist=nouveau"
```

因为更改了 GRUB ，所以要对 GRUB 进行更新。对于 BIOS 和 UEFI ，命令是不同的。

- BIOS:
```bash
grub2-mkconfig -o /boot/grub2/grub.cfg
```

- UEFI:
```bash
grub2-mkconfig -o /boot/efi/EFI/fedora/grub.cfg
```

继续：

```bash
dnf remove xorg-x11-drv-nouveau
```

如果在 **/etc/dnf/dnf.conf **中有以下一行，可以移除：

```bash
exclude=xorg-x11*
```

生成 `initramfs`：

```bash
# Backup old initramfs nouveau image
mv /boot/initramfs-$(uname -r).img /boot/initramfs-$(uname -r)-nouveau.img
# Create new initramfs image
dracut /boot/initramfs-$(uname -r).img $(uname -r)
```

原文是重启进入纯命令行模式来安装驱动，不过我好像在桌面环境下也能安装成功。命令行方法可以参考原文。如果在桌面环境，现在就可以在终端中运行从 NVIDIA 下载得来的 run 文件。注意必须拥有 root 权限。

安装过程基本上一路 YES 即可。

安装完成之后，如果要使用硬件解码，则要安装以下软件包。

```bash
dnf install vdpauinfo libva-vdpau-driver libva-utils
```

完成。
