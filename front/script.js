document.addEventListener("DOMContentLoaded", function () {
    const cadastroForm = document.getElementById("cadastroForm");
    const loginForm = document.getElementById("loginForm");
    const dataInput = document.getElementById("data");
    const horaInput = document.getElementById("hora");
    const formConsulta = document.getElementById("form-consulta");

    // Salvar o CPF do usuário logado
    let cpfLogado = localStorage.getItem("cpfLogado") || null;

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
            cpfLogado = data.usuario.cpf; // Salva o CPF do usuário logado
            localStorage.setItem("cpfLogado", cpfLogado); // Armazena no localStorage

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
            { inicio: "14:00", fim: "17:00" }
        ];

        periodos.forEach(({ inicio, fim }) => {
            let [hora, minuto] = inicio.split(":").map(Number);
            const [horaFim, minutoFim] = fim.split(":").map(Number);

            while (hora < horaFim || (hora === horaFim && minuto < minutoFim)) {
                horarios.push(
                    `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`
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

    // Função para carregar horários disponíveis
    const carregarHorariosDisponiveis = async () => {
        const dataSelecionada = new Date(dataInput.value);
        if (dataSelecionada.getDay() === 6 || dataSelecionada.getDay() === 0) {
            alert("Selecione um dia útil (segunda a sexta).");
            dataInput.value = "";
            horaInput.innerHTML = "<option value=''>-- Horário --</option>";
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/consultas/horarios?data=${dataInput.value}`);
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

    // Função para marcar consulta
    const marcarConsulta = async (event) => {
        event.preventDefault();

        if (!cpfLogado) {
            alert("Usuário não autenticado. Faça login novamente.");
            return;
        }

        const unidade = document.getElementById("unidade").value;
        const especialidade = document.getElementById("especialidade").value;
        const data = dataInput.value;
        const hora = horaInput.value;

        if (!unidade || !especialidade || !data || !hora) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8081/api/consultas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf_usuario: cpfLogado, unidade, especialidade, data, hora }),
            });

            if (!response.ok) throw new Error("Erro ao marcar consulta.");

            alert("Consulta marcada com sucesso!");
            formConsulta.reset();
            horaInput.innerHTML = "<option value=''>-- Horário --</option>";
        } catch (error) {
            console.error("Erro ao marcar consulta:", error);
            alert("Erro ao marcar consulta.");
        }
    };

    // Eventos para formulários
    if (cadastroForm) cadastroForm.addEventListener("submit", cadastrarUsuario);
    if (loginForm) loginForm.addEventListener("submit", realizarLogin);
    if (dataInput) dataInput.addEventListener("input", carregarHorariosDisponiveis);
    if (formConsulta) formConsulta.addEventListener("submit", marcarConsulta);
});

//validação de campos
const form = document.getElementById("cadastroForm");

        // Campos do formulário
        const campos = {
            nome: document.getElementById("nome"),
            sobrenome: document.getElementById("sobrenome"),
            email: document.getElementById("email"),
            dataNascimento: document.getElementById("data-nascimento"),
            cpf: document.getElementById("cpf"),
            sexo: document.getElementById("sexo"),
            senha: document.getElementById("senha"),
            confirmarSenha: document.getElementById("confirmar-senha"),
            termos: document.getElementById("termos"),
        };

        // Mensagens de erro
        const mensagensErro = {
            nome: document.getElementById("erroNome"),
            sobrenome: document.getElementById("erroSobrenome"),
            email: document.getElementById("erroEmail"),
            dataNascimento: document.getElementById("erroData"),
            cpf: document.getElementById("erroCpf"),
            sexo: document.getElementById("erroSexo"),
            senha: document.getElementById("erroSenha"),
            termos: document.getElementById("erroTermos"),
        };

        // Validações em tempo real
        //campos.nome.addEventListener("input", () => validarMaxLength(campos.nome, mensagensErro.nome));
        //campos.sobrenome.addEventListener("input", () => validarMaxLength(campos.sobrenome, mensagensErro.sobrenome));
        campos.email.addEventListener("input", validarEmail);
        campos.confirmarSenha.addEventListener("input", validarSenhas);

        // Funções de validação
        //function validarMaxLength(campo, mensagemErro) {
            //mensagemErro.style.display = campo.value.length > campo.maxLength ? "block" : "none";
        //}

        function validarEmail() {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            mensagensErro.email.style.display = !regexEmail.test(campos.email.value) ? "block" : "none";
        }

        function validarSenhas() {
            mensagensErro.senha.style.display = campos.senha.value !== campos.confirmarSenha.value || campos.senha.value.length < 8 ? "block" : "none";
        }

        // Validação final ao submeter
        form.addEventListener("submit", function (e) {
            let valido = true;

            if (!campos.nome.value) {
                mensagensErro.nome.style.display = "block";
                valido = false;
            }
            if (!campos.sobrenome.value) {
                mensagensErro.sobrenome.style.display = "block";
                valido = false;
            }
            if (!campos.email.value) {
                mensagensErro.email.style.display = "block";
                valido = false;
            }
            if (!campos.cpf.value) {
                mensagensErro.cpf.style.display = "block";
                valido = false;
            }
            if (!campos.dataNascimento.value) {
                mensagensErro.dataNascimento.style.display = "block";
                valido = false;
            }
            if (!campos.sexo.value) {
                mensagensErro.sexo.style.display = "block";
                valido = false;
            }
            if (!campos.senha.value) {
                mensagensErro.senha.style.display = "block";
                valido = false;
            }
            if (!campos.confirmarSenha.value) {
                mensagensErro.confirmarSenha.style.display = "block";
                valido = false;
            }
            if (!campos.termos.checked) {
                mensagensErro.termos.style.display = "block";
                valido = false;
            }

            if (!valido) e.preventDefault();
});


