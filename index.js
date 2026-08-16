const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// 全局开启跨域，解决浏览器CORS报错
app.use(cors());
app.use(express.json());

// 固定你的目标API站点 tabitoken
const TARGET_BASE = "https://tabitoken.com/v1";

// 转发所有接口：models、chat/completions 全部兼容
app.all('/*', async (req, res) => {
  try {
    // 拼接完整目标地址
    const targetPath = req.params[0];
    const targetUrl = `${TARGET_BASE}/${targetPath}`;

    // 复制前端传来的请求头（密钥、内容类型）
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.origin;

    // 转发请求到tabitoken
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: headers,
      data: req.body,
      timeout: 60000
    });

    // 原样返回模型数据给你的酒馆APP
    res.status(response.status).json(response.data);
  } catch (err) {
    // 捕获网络/密钥错误，返回可读报错
    res.status(err.response?.status || 500).json({
      error: err.message,
      detail: err.response?.data
    });
  }
});

app.listen(port, () => {
  console.log(`代理服务运行在端口 ${port}`);
});
