const { login } = require('../services/authService');

const loginController = async (req, res) => {
  const { username, password } = req.body;

  try {
    const resultado = await login(username, password);
    res.json(resultado);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = { loginController };