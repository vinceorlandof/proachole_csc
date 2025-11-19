# 🏥 ProAcolhe - CSC (Combate à Sífilis Congênita)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

> **Sistema de Apoio à Decisão Clínica (SADC)** focado no rastreio, manejo e tratamento da Sífilis Congênita e Adquirida no contexto da Atenção Primária.

---

## 🎯 Sobre o Projeto

O **ProAcolhe - CSC** é uma aplicação Desktop desenvolvida para modernizar o atendimento na UBS "Comunidade Viva". O sistema resolve o problema da infraestrutura instável e falta de internet operando com uma arquitetura **Offline-First**.

O objetivo principal é garantir a adesão aos **Protocolos Clínicos e Diretrizes Terapêuticas (PCDT)** do Ministério da Saúde, automatizando cálculos complexos de dosagem de Penicilina e reduzindo erros de prescrição médica.

---

## 🚀 Funcionalidades Principais

### 🧠 Calculadora Clínica Inteligente (PCDT)
Motor de decisão automatizado que processa variáveis biométricas para sugerir condutas terapêuticas:
- **Sífilis Congênita:** Cálculo preciso baseado em Peso, Idade em Dias e alterações no LCR.
- **Sífilis Adquirida:** Protocolos diferenciados para Gestantes e diferentes estágios da doença (Recente/Tardia).
- **Travas de Segurança:** Impede cálculos sem dados vitais (Peso/Altura) para evitar subdosagem.

### 📄 Gestão de Prontuários e Prescrições
- Cadastro completo de pacientes com validação de Cartão SUS (CNS).
- Geração automática de **Receituário em PDF** formatado para impressão (A4), com linha de assinatura médica automática.

### 👥 Controle de Acesso Hierárquico (RBAC)
Sistema de permissões granulares para diferentes perfis:
- **Gerente:** Gestão total de equipe e dados.
- **Médico:** Acesso completo às ferramentas clínicas.
- **Enfermeiro:** Triagem e cadastro.

### 📊 Dashboard Estatístico
- Visualização em tempo real da distribuição de casos e indicadores de saúde da unidade.

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza uma **Stack Web Moderna encapsulada em Desktop**, garantindo interface rica e alta performance.

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | React (v18) + TypeScript |
| **Build Tool** | Vite |
| **Estilização** | Tailwind CSS + Lucide React |
| **Database** | IndexedDB (via Dexie.js) - *Offline First* |
| **Desktop** | Electron |
| **Segurança** | Bcrypt.js |
| **Gráficos** | Recharts |

---

## ⚙️ Instalação e Execução

### Pré-requisitos
- Node.js (v18 ou superior)

### Rodando o Código Fonte

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/proacolhe-csc.git

# Entre na pasta
cd proacolhe-csc

# Instale as dependências
npm install

# Execute em modo de desenvolvimento (Navegador)
npm run dev

# Execute em modo Desktop (Electron)
npm run electron:dev
```

### Gerando o Executável (Build)
Para criar o instalador/executável `.exe` para Windows:

```bash
npm run dist
```
> O arquivo será gerado na pasta `release`.

---

## 🔒 Segurança e Privacidade

- **Armazenamento Local:** Todos os dados clínicos residem exclusivamente na máquina do usuário (IndexedDB), garantindo conformidade com a infraestrutura limitada da UBS e maior privacidade.
- **Criptografia:** Senhas de usuários são armazenadas apenas como hash criptográfico, nunca em texto plano.

---

## ⚕️ Aviso Legal

> ⚠️ **Importante:**

⚖️ Isenção de Responsabilidade (Disclaimer)

⚠️ PROJETO DE CARÁTER EDUCACIONAL

O presente software ("Sistema de Apoio à Decisão Clínica") é um protótipo desenvolvido por estudante para fins de avaliação acadêmica.

Proibição de Uso Comercial ou Clínico: É estritamente vedado o uso desta ferramenta em hospitais, clínicas ou para o atendimento ao público.

Ausência de Precisão Científica: Embora baseado em protocolos reais, o código não passou por rigorosos testes de qualidade de software (QA) ou validação clínica, podendo conter erros críticos.

Natureza do Software: Este é um exercício de programação e engenharia de software, não um dispositivo médico certificado.

** O AUTOR NÃO AUTORIZA NENHUM TIPO DE USO DO SOFTWARE, QUE NÃO SEJA ACADÊMICO**

---

## 👨‍💻 Autor

**Vicente O. Fresillo**
*Desenvolvedor Full Stack & Analista de Sistemas*

Desenvolvido como parte de trabalho de faculdade para a empresa fictícia Health Tech Soluções em Saúde Ltda.
