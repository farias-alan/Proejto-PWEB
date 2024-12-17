const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./server"); // Importa a conexão do banco de dados

const router = express.Router();

// Endpoint para login
router.post("/api/usuarios/login", async (req, res) => {
    const { cpf, senha } = req.body;

    // Validações de CPF e senha
    if (!cpf || !/^[0-9]{11}$/.test(cpf)) {
        return res.status(400).json({ message: "CPF deve conter exatamente 11 números." });
    }
    if (!senha) {
        return res.status(400).json({ message: "A senha é obrigatória." });
    }

    try {
        // Consulta o banco de dados pelo CPF
        const result = await pool.query("SELECT * FROM cadastro WHERE cpf = $1", [cpf]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "CPF ou senha inválidos." });
        }

        const usuario = result.rows[0];

        // Verifica se a senha fornecida corresponde ao hash armazenado
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ message: "CPF ou senha inválidos." });
        }

        // Resposta de sucesso
        res.status(200).json({
            message: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                sobrenome: usuario.sobrenome,
                cpf: usuario.cpf
            }
        });
    } catch (error) {
        console.error("Erro ao realizar login:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

module.exports = router;
