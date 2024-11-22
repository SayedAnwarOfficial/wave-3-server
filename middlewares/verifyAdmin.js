const verifyAdmin = (userCollection) => async (req, res, next) => {
  const user = req.user;
  const query = { email: user?.email };
  const result = await userCollection.findOne(query);

  if (!result || result?.role !== "admin") {
    return res.status(401).send({ message: "Unauthorized access admin!" });
  }

  next();
};

module.exports = verifyAdmin;
