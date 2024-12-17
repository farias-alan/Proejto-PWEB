const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./server"); // Importa o pool do server.js

const router = express.Router();

router.post("/api/usuarios", async (req, res) => {
    const { nome, sobrenome, email, dataNascimento, cpf, sexo, senha } = req.body;

    if (!nome || !sobrenome || !email || !dataNascimento || !cpf || !sexo || !senha) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        const result = await pool.query(
            "INSERT INTO cadastro (nome, sobrenome, email, data_nascimento, cpf, sexo, senha) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [nome, sobrenome, email, dataNascimento, cpf, sexo, hashedPassword]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

module.exports = router;
