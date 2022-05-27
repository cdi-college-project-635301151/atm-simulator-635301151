const verifyToken = (req, res, next) => {
  if (!bearerHeader) return res.sendStatus(402);
  const bearerHeader = req.header["authorization"];
  const token = bearerHeader && bearerHeader.split(" ");
  req.token = token;
  console.log(token);
  next();
};

module.exports = verifyToken;
