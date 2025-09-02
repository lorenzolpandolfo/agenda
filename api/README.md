# Agenda API

## Ferramentas necessárias
Abaixo está a lista de ferramentas necessárias para rodar o projeto:
- Python 3.13+=
- Docker

---


## Setup
Criando o virtual environment e instalando dependências
```bash
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Iniciando API
acesse o diretório raiz `/agenda` e execute
```bash
uvicorn main:app --reload
```

## Iniciando banco de dados
Acesse o diretório `/db` e execute
```bash
docker compose up -d
```

---

Caso esteja no Linux, desative o SELinux para iniciar o container PostgreSQL corretamente:
```bash
sudo setenforce 0
```