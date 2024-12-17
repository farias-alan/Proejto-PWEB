const express = require("express");
const pool = require("./server");

const router = express.Router();

// Endpoint para obter horários ocupados em uma data
router.get("/api/consultas/horarios", async (req, res) => {
    const { data } = req.query;

    if (!data) {
        return res.status(400).json({ message: "Data é obrigatória." });
    }

    try {
        const result = await pool.query("SELECT hora FROM consultas WHERE data = $1", [data]);
        const horariosOcupados = result.rows.map(row => row.hora);
        res.status(200).json(horariosOcupados);
    } catch (error) {
        console.error("Erro ao buscar horários:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

// Endpoint para marcar consultas
router.post("/api/consultas", async (req, res) => {
    const { cpf_usuario, unidade, especialidade, data, hora } = req.body;

    if (!cpf_usuario || !unidade || !especialidade || !data || !hora) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    try {
        const verificaHorario = await pool.query(
            "SELECT * FROM consultas WHERE data = $1 AND hora = $2",
            [data, hora]
        );

        if (verificaHorario.rows.length > 0) {
            return res.status(400).json({ message: "Horário indisponível." });
        }

        const result = await pool.query(
            "INSERT INTO consultas (cpf_usuario, unidade, especialidade, data, hora) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [cpf_usuario, unidade, especialidade, data, hora]
        );

        res.status(201).json({ message: "Consulta marcada com sucesso!", consulta: result.rows[0] });
    } catch (error) {
        console.error("Erro ao marcar consulta:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

module.exports = router;
