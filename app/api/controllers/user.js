const {User} = require("../../../models");

module.exports = {
 getAllUsers: async (req, res) => {
  const UserData = await User.findAll();
  res.status(200).json(UserData);
 },
 getProfile: (req, res) => {
  const user = req.user;

  res.status(200).json(user);
 },
};
