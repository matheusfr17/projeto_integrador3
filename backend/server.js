const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:5500', credentials: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'segredo123',
  resave: false,
  saveUninitialized: false
}));

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'sandrinha'
});


db.connect(err => {
  if (err) console.error('Erro na conexão:', err);
  else console.log('Conectado ao MySQL');
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    if (results.length === 0) return res.json({ success: false });

    const usuario = results[0];
    const senhaCorreta = await bcrypt.compare(password, usuario.senha);
    if (senhaCorreta) {
      req.session.usuario = usuario;
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

// Rota de agendamento
app.post('/agendamentos', (req, res) => {
  const { name, email, service, date, time } = req.body;
  db.query('INSERT INTO agendamentos (name, email, service, date, time) VALUES (?, ?, ?, ?, ?)',
    [name, email, service, date, time],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar' });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'seuemail@gmail.com',
          pass: 'suasenha'
        }
      });

      const mailOptions = {
        to: email,
        subject: 'Confirmação de Agendamento',
        text: `Olá ${name}, seu horário para ${service} em ${date} às ${time} foi confirmado!`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error('Erro ao enviar e-mail:', error);
        else console.log('E-mail enviado:', info.response);
      });

      res.json({ message: 'Agendamento realizado com sucesso!' });
    });
});

// Rota admin protegida
app.get('/admin', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ error: 'Não autorizado' });
  db.query('SELECT * FROM agendamentos ORDER BY date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

document.getElementById('formLogin').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginSenha').value;

  const resposta = await fetch('http://localhost:3000/login', {
    method: 'POST',
    credentials: 'include', // importante para sessões!
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const resultado = await resposta.json();

  if (resultado.success) {
    window.location.href = 'admin.html'; // ← redireciona para área admin
  } else {
    document.getElementById('mensagemLogin').innerText = 'E-mail ou senha inválidos.';
  }
});
