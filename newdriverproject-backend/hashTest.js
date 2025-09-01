const bcrypt = require('bcrypt');

const run = async () => {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('🔐 סיסמה מוצפנת:', hash);
};

run();
