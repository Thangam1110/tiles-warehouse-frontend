const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/tiles",
    createProxyMiddleware({
      target: "https://tiles-warehouse-backend-5.onrender.com",
      changeOrigin: true,
      secure: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader("Origin", "https://tiles-warehouse-backend-5.onrender.com");
        proxyReq.removeHeader("Referer");
      },
    })
  );
};
