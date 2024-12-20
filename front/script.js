document.addEventListener("DOMContentLoaded", function () {
    const cadastroForm = document.getElementById("cadastroForm");
    const loginForm = document.getElementById("loginForm");
    const dataInput = document.getElementById("data");
    const horaInput = document.getElementById("hora");

    // Função para cadastrar usuário
    const cadastrarUsuario = async (event) => {
        event.preventDefault();

        const nome = document.getElementById("nome").value;
        const sobrenome = document.getElementById("sobrenome").value;
        const email = document.getElementById("email").value;
        const dataNascimento = document.getElementById("data-nascimento").value;
        const cpf = document.getElementById("cpf").value;
        const sexo = document.getElementById("sexo").value;
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmar-senha").value;

        if (!nome || !sobrenome || !email || !dataNascimento || !cpf || !sexo || !senha || !confirmarSenha) {
            alert("Preencha todos os campos!");
            return;
        }

        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        const usuarioData = { nome, sobrenome, email, dataNascimento, cpf, sexo, senha };

        try {
            const response = await fetch("http://localhost:8081/api/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuarioData),
            });

            if (!response.ok) throw new Error("Erro ao cadastrar usuário.");

            alert("Cadastro realizado com sucesso!");
            cadastroForm.reset();
            window.location.href = "/front/login.html"; // Redireciona para a página de login após cadastro
        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error);
            alert("Erro ao realizar o cadastro.");
        }
    };

    // Função para realizar login
    const realizarLogin = async (event) => {
        event.preventDefault();

        const cpf = document.getElementById("cpf-login").value.trim();
        const senha = document.getElementById("senha-login").value.trim();

        if (!cpf || !/^[0-9]{11}$/.test(cpf)) {
            alert("CPF deve conter exatamente 11 números.");
            return;
        }
        if (!senha) {
            alert("A senha é obrigatória.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8081/api/usuarios/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf, senha }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const data = await response.json();
            alert(`Login realizado com sucesso! Bem-vindo(a), ${data.usuario.nome}.`);
            window.location.href = "/front/tela_menu_principal/menu_principal.html";
        } catch (error) {
            console.error("Erro ao realizar login:", error);
            alert(error.message || "Erro ao realizar login.");
        }
    };

    // Função para gerar horários válidos
    const gerarHorarios = () => {
        const horarios = [];
        const periodos = [
            { inicio: "08:00", fim: "11:30" },
            { inicio: "14:00", fim: "17:00" },
        ];

        periodos.forEach(({ inicio, fim }) => {
            let [hora, minuto] = inicio.split(":" ).map(Number);
            const [horaFim, minutoFim] = fim.split(":" ).map(Number);

            while (hora < horaFim || (hora === horaFim && minuto < minutoFim)) {
                horarios.push(
                    `${hora.toString().padStart(2, "0")}:${minuto
                        .toString()
                        .padStart(2, "0")}`
                );
                minuto += 30;
                if (minuto >= 60) {
                    minuto = 0;
                    hora++;
                }
            }
        });

        return horarios;
    };

    // Função para bloquear fins de semana e carregar horários
    const carregarHorariosDisponiveis = async () => {
        const dataSelecionada = new Date(dataInput.value);
        if (dataSelecionada.getDay() === 6 || dataSelecionada.getDay() === 0) {
            alert("Selecione um dia útil (segunda a sexta). ");
            dataInput.value = "";
            horaInput.innerHTML = "<option value=''>-- Horário --</option>";
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8081/api/consultas/horarios?data=${dataInput.value}`
            );
            if (!response.ok) throw new Error("Erro ao buscar horários ocupados.");

            const horariosOcupados = await response.json();
            const horariosValidos = gerarHorarios();

            horaInput.innerHTML = "<option value=''>-- Horário --</option>";
            horariosValidos.forEach((horario) => {
                if (!horariosOcupados.includes(horario)) {
                    const option = document.createElement("option");
                    option.value = horario;
                    option.textContent = horario;
                    horaInput.appendChild(option);
                }
            });
        } catch (error) {
            console.error("Erro ao carregar horários:", error);
            alert("Erro ao buscar horários disponíveis.");
        }
    };

    // Evento de alteração na data
    if (dataInput) {
        dataInput.addEventListener("input", carregarHorariosDisponiveis);
    }

    // Evento de envio do formulário
    const marcarConsulta = async (event) => {
        event.preventDefault();
    
        const cpf_usuario = sessionStorage.getItem("cpf_usuario"); // Assumindo que o CPF é salvo na sessão após o login
        const unidade = document.getElementById("unidade").value.trim();
        const especialidade = document.getElementById("especialidade").value.trim();
        const data = document.getElementById("data").value;
        const hora = document.getElementById("hora").value;
    
        if (!cpf_usuario || !unidade || !especialidade || !data || !hora) {
            alert("Preencha todos os campos!");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:8081/api/consultas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf_usuario, unidade, especialidade, data, hora }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
    
            const data = await response.json();
            alert(data.message);
            document.getElementById("form-consulta").reset();
        } catch (error) {
            console.error("Erro ao marcar consulta:", error);
            alert(error.message || "Erro ao marcar consulta.");
        }
    };    

    // Eventos para formulários
    if (cadastroForm) cadastroForm.addEventListener("submit", cadastrarUsuario);
    if (loginForm) loginForm.addEventListener("submit", realizarLogin);
});
