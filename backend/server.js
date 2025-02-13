const express = require('express');
const multer  = require('multer');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do armazenamento de arquivos com Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Certifique-se de criar a pasta 'uploads'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Serve arquivos estáticos (ex: index.html, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Configuração para interpretar dados de formulários multipart/form-data
// (multer já faz o parse do body para os uploads)

// Configuração do PostgreSQL usando pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://usuario:senha@host:porta/nome_do_banco'
  // Se você estiver usando o Neon, pegue o connection string no painel do Neon
});

// Endpoint para receber dados do formulário
app.post('/api/contato', upload.single('arquivo'), async (req, res) => {
  try {
    const { nome, email, contato, data } = req.body;
    // Se um arquivo foi enviado, obter seu caminho
    const arquivoPath = req.file ? req.file.path : null;

    // Insere os dados na tabela "contatos" do PostgreSQL
    const query = `
      INSERT INTO contatos (nome, email, contato, data_contato, arquivo_path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [nome, email, contato, data, arquivoPath];

    const result = await pool.query(query, values);
    res.json({ message: 'Dados inseridos com sucesso!', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
