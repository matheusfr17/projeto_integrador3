// Controla exibição do menu (mobile)
function toggleMenu() {
    document.querySelector('.menu').classList.toggle('show');
  }
  
  // Agendamento
  const form = document.getElementById('formAgendamento');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dados = {
        name: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        service: document.getElementById('servico').value,
        date: document.getElementById('data').value,
        time: document.getElementById('hora').value
      };
  
      try {
        const res = await fetch('http://localhost:3000/agendamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dados)
        });
  
        const resultado = await res.json();
        document.getElementById('mensagem').innerText = resultado.message || 'Agendamento feito com sucesso!';
      } catch (error) {
        document.getElementById('mensagem').innerText = 'Erro ao realizar agendamento.';
      }
    });
  }
  
  // Login
  const loginForm = document.getElementById('formLogin');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: document.getElementById('loginEmail').value,
          password: document.getElementById('loginSenha').value
        })
      });
  
      const resultado = await res.json();
      if (resultado.success) {
        window.location.href = 'admin.html';
      } else {
        document.getElementById('mensagemLogin').innerText = 'Login inválido';
      }
    });
  }