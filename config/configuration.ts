export default () => ({
  port: Number.parseInt(process.env.APP_PORT, 10) || 3000,
});
