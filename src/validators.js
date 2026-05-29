const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(body) {
  if (!body || typeof body.name !== "string" || typeof body.email !== "string" || typeof body.password !== "string") {
    return null;
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const password = body.password;

  if (!name || name.length > 120) {
    return null;
  }

  if (!emailRegex.test(email)) {
    return null;
  }

  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return null;
  }

  return { name, email, password };
}

function validateLogin(body) {
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return null;
  }

  const email = body.email.trim().toLowerCase();

  if (!emailRegex.test(email) || !body.password) {
    return null;
  }

  return { email, password: body.password };
}

function validateSecret(body) {
  if (!body || typeof body.title !== "string" || typeof body.secret_content !== "string") {
    return null;
  }

  const title = body.title.trim();
  const secret_content = body.secret_content;

  if (!title || title.length > 120) {
    return null;
  }

  if (!secret_content || secret_content.length > 4096) {
    return null;
  }

  return { title, secret_content };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateSecret
};