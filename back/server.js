const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 8081;

// Configuração do PostgreSQL
const pool = new Pool({
    user: "postgres",           // Nome do usuário do banco
    host: "localhost",          // Host do banco (localhost no caso)
    database: "DB_sistema",     // Nome do banco de dados
    password: "senha",    // Senha do usuário
    port: 5432,                 // Porta padrão do PostgreSQL
});

// Exporta o pool para reutilização
module.exports = pool;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Importa as rotas
const loginRoutes = require("./login");
const cadastroRoutes = require("./cadastro");
const marcarConsultasRoutes = require("./marcar_consulta");

app.use(loginRoutes); 
app.use(cadastroRoutes);
app.use(marcarConsultasRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
