# 🪟 Windows 部署指南

## 方案：用你的 Windows 电脑作为服务器

---

## 📦 部署步骤

### 步骤 1：在 Windows 上安装 Node.js

1. 访问：https://nodejs.org/
2. 下载 **LTS 版本**（推荐 v20.x）
3. 双击安装，一路 Next
4. 安装完成后，打开 CMD 验证：
```cmd
node --version
npm --version
```

---

### 步骤 2：部署三角洲调试助手

**方法 A：直接复制代码**

1. 在 Windows 上创建文件夹：`C:\delta-helper`
2. 从服务器复制以下文件：
```
C:\delta-helper\
├── package.json
├── .env.local
├── src/
│   └── app/
│       ├── page.tsx
│       ├── layout.tsx
│       └── api/
│           ├── analyze/
│           ├── predict/
│           └── cases/
└── ...（其他文件）
```

**方法 B：Git 克隆**（如果 Windows 有 Git）

```cmd
cd C:\
git clone <服务器地址>/delta-helper.git
cd delta-helper
```

**方法 C：打包下载**

在服务器上执行：
```bash
cd /home/admin/openclaw/workspace
tar -czf delta-helper.tar.gz delta-helper/
```

然后下载到 Windows，解压到 `C:\delta-helper`

---

### 步骤 3：安装依赖

在 Windows 上打开 CMD 或 PowerShell：

```cmd
cd C:\delta-helper
npm install
```

等待安装完成（约 2-5 分钟）

---

### 步骤 4：启动服务器

```cmd
cd C:\delta-helper
npm run dev
```

看到以下信息表示成功：
```
▲ Next.js 16.1.7 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.x.x:3000
✓ Ready in xxx ms
```

---

### 步骤 5：配置防火墙

**重要！** 让其他客服能访问你的电脑：

1. 按 `Win+R`，输入 `wf.msc`，回车
2. 左侧选择 **入站规则**
3. 右侧点击 **新建规则**
4. 选择 **端口** → 下一步
5. 选择 **TCP**，特定本地端口：`3000` → 下一步
6. 选择 **允许连接** → 下一步
7. 全选（域、专用、公用）→ 下一步
8. 名称：三角洲调试助手 → 完成

---

### 步骤 6：获取你的 IP 地址

在 CMD 中执行：

```cmd
ipconfig
```

找到 **IPv4 地址**，例如：`192.168.1.100`

---

### 步骤 7：客服访问

告诉其他 4 个客服访问：
```
http://你的 IP 地址：3000
```

例如：`http://192.168.1.100:3000`

---

## 🚀 一键启动脚本

创建 `启动.bat` 文件：

```batch
@echo off
echo 🚀 启动三角洲调试助手...
cd /d %~dp0
call npm run dev
pause
```

**使用方法：**
双击 `启动.bat` 即可启动服务器

---

## ⚠️ 注意事项

### 1. 电脑不能关机/睡眠

- 你的 Windows 电脑必须保持开机
- 关闭睡眠模式：控制面板 → 电源选项 → 从不睡眠

### 2. IP 地址可能变化

- 如果是动态 IP，每次开机可能变化
- 建议设置静态 IP，或每次查看 `ipconfig`

### 3. 网络要求

- 所有客服电脑必须在**同一局域网**（同一个 WiFi/路由器）
- 如果跨网络，需要公网 IP 或内网穿透

---

## 📋 快速检查清单

- [ ] Node.js 已安装
- [ ] 代码已复制到 Windows
- [ ] 依赖已安装（npm install）
- [ ] 服务器已启动（npm run dev）
- [ ] 防火墙已配置（开放 3000 端口）
- [ ] 获取了 IPv4 地址
- [ ] 其他客服可以访问

---

## 🔧 故障排查

### 问题 1：npm 命令找不到

**解决：** 重新安装 Node.js，勾选"Add to PATH"

### 问题 2：端口 3000 被占用

**解决：** 
```cmd
# 查找占用端口的进程
netstat -ano | findstr :3000

# 杀死进程（替换 PID）
taskkill /PID 12345 /F

# 或改用其他端口
npm run dev -- -p 3001
```

### 问题 3：其他电脑无法访问

**解决：**
1. 检查防火墙是否开放 3000 端口
2. 确认 IP 地址正确
3. 测试 ping：`ping 你的 IP`
4. 关闭 Windows 防火墙临时测试

### 问题 4：服务器自动停止

**解决：** 
- 使用 PM2 管理（推荐）
- 安装：`npm install -g pm2`
- 启动：`pm2 start npm --name "delta" -- run dev`
- 开机自启：`pm2 startup` + `pm2 save`

---

## 📞 需要帮助？

联系技术团队获取支持。
