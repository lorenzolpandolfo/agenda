# Documentação API Agenda

Abaixo segue a documentação da API, com cada endpoint, seus responses e dados no geral. Ao lado deste arquivo, está o
`API AGENDA.postman_collection.json`, que é uma coleção do Postman que permite se comunicar com a API de forma rápida e
fácil.

---

# User — Patient / Professional

Um usuário pode ser do tipo ***PATIENT*** (paciente) ou ***PROFESSIONAL*** (psicólogo), conforme o atributo ***role***.

Um usuário ***PROFESSIONAL***, ao se registrar, inicia com o valor ***WAITING_VALIDATION*** no atributo **status**. Após
a validação do seu CRP por parte do Conselho de Psicologia, o seu status pode ser alterado para ***READY*,** permitindo
o registro de horários livres (availabilities).

---

### **POST /user/register**

Registra um novo usuário.

Request:

```json
{
  "email": "lorenzo@gmail.com",
  "password": "123123",
  "name": "Lorenzo Pandolfo",
  // "crp":"CRP/01-12345",
  "bio": "Estudante de Programação",
  "image_url": "link_para_imagem.jpeg"
}
```

Response **200**: ****

```json
{
  "user_id": "f13ee927-601a-4b81-9def-e39b6dad5e45",
  "name": "Lorenzo Pandolfo",
  "bio": "Estudante de Programação",
  "email": "lorenzo@gmail.com",
  "role": "PATIENT",
  // PROFESSIONAL caso tenha CRP
  "status": "READY",
  // WAITING_VALIDATION caso tenha CRP
  "crp": null,
  // caso CRP não seja especificado fica null
  "image_url": "link_para_imagem.jpeg",
  "created_at": "2025-09-03T00:15:42.600633+00:00"
}
```

Validações:

- não deve ter **CRP** e **email** repetidos
- **email** deve conter somente um @ e ao menos 3 caracteres
- senha deve ter ao menos 6 dígitos
- CRP deve ter exatamente 12 dígitos (exemplo: `CRP/01-12345`)

---

### **POST /user/login**

Realiza o login de um usuário com email e senha.

Request:

```json
{
  "email": "lorenzo@mail.com",
  "password": "senha123"
}
```

Response **200**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "553e4d70-dc69-43db-8c69-9ab8d947e9a2"
}
```

---

### **GET /user?user_id=*UUID (param. opcional)***

Retorna informações básicas sobre usuário pelo id.

Se o ***user_id*** não for especificado, retorna dados do **usuário autenticado**.

Response **200**:

```json
{
  "id": "f13ee927-601a-4b81-9def-e39b6dad5e45",
  "name": "Lorenzo Pandolfo",
  "email": "lorenzo@gmail.com",
  "role": "PATIENT",
  "status": "READY",
  "crp": null,
  "phone": null,
  "bio": "Estudante de Programação",
  "image_url": "link_para_imagem.jpeg",
  "created_at": "2025-09-03T00:15:42.600633+00:00"
}
```

---

### GET /user/all?role=*PROFESSIONAL,PATIENT&skip=0&limit=50 (params. opcional)*

Retorna uma lista de usuários conforme o role especificado. Se não especificar, retorna todos.
Skip pula a quantidade especificada de usuários e limit limita a quantidade de usuários retornados.

Response **200**:

```json
[
  {
    "user_id": "16ed380c-ac5c-4e9c-85f0-a890786b0af4",
    "name": "Dr. Ana Silva",
    "bio": null,
    "email": "ana.silva@email.com",
    "role": "PROFESSIONAL",
    "status": "READY",
    "crp": "CRP/01-12345",
    "image_url": null,
    "created_at": "2025-09-03 22:25:40.508305+00:00"
  },
  {
    "user_id": "44370f25-a26b-4bf2-a152-b01c13990681",
    "name": "Dr. Carlos Souza",
    "bio": null,
    "email": "carlos.souza@email.com",
    "role": "PROFESSIONAL",
    "status": "READY",
    "crp": "CRP/02-54321",
    "image_url": null,
    "created_at": "2025-09-03 22:25:40.508305+00:00"
  },
  {
    "user_id": "345f2314-d753-4bf0-8f10-20e905d723c4",
    "name": "Beatriz Lima",
    "bio": null,
    "email": "beatriz.l@email.com",
    "role": "PROFESSIONAL",
    "status": "WAITING_VALIDATION",
    "crp": "CRP/03-98765",
    "image_url": null,
    "created_at": "2025-09-03 22:25:40.508305+00:00"
  },
  {
    "user_id": "d5d1b545-ee6e-4d94-bda0-6228abc94a85",
    "name": "Gustavo Müller Ps",
    "bio": "Um ps legal",
    "email": "gustavops@gmail.com",
    "role": "PROFESSIONAL",
    "status": "WAITING_VALIDATION",
    "crp": "CRP/01-12346",
    "image_url": null,
    "created_at": "2025-09-03 22:41:13.493211+00:00"
  }
]
```

---

### POST /user/update

Atualiza informações do usuário autenticado. Todos os campos do request são opcionais.

Request:

```json
{
  "name": "Lorenzo Pandolfo",
  "bio": "Estudante de programação e interessado em tecnologia.",
  "image_url": "link.jpg",
  "password": "123123"
}
```

Response **200**:

```json
{
  "id": "553e4d70-dc69-43db-8c69-9ab8d947e9a2",
  "name": "Lorenzo Pandolfo",
  "bio": "Estudante de programação e interessado em tecnologia.",
  "email": "lorenzo@gmail.com",
  "role": "PATIENT",
  "status": "READY",
  "crp": null,
  "image_url": "link.jpg",
  "created_at": "2025-09-04T01:41:54.576826Z"
}
```

Validações:

- A senha, caso especificada, deve conter ao menos 6 caracteres.
- O usuário deve estar logado

---

### GET /user/verify-crp?user_id=*UUID (param. opcional)*

Valida o CRP de um usuário ***PROFESSIONAL***, alterando no usuário o atributo **status** para ***READY***.

Se o ***user_id*** não for especificado, realiza a ação para **o usuário autenticado**.

*Este endpoint é apenas uma simulação do processo de validação realizado pelo Conselho de Psicologia.*

Response **200**:

```json
{
  "user_id": "3f4f15d1-a337-41b1-985d-677130b3bcb2",
  "crp": "CRP/01-12340",
  "status": "READY"
}
```

Validações:

- Usuário especificado deve ter role ***PROFESSIONAL***

---

# Auth

### POST /auth/refresh

Enviando um **refresh token** no **Auth Type Bearer Token** o endpoint retorna um novo access_token e refresh_token.

Response **200**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

# Availabilities — horários disponíveis

### **POST /availabilities**

Registra um horário livre na agenda do usuário autenticado.

Request:

```json
{
  "start_time": "2025-09-04T15:00:00Z",
  "end_time": "2025-09-04T16:00:00Z",
  "status": "AVAILABLE"
  // AVAILABLE, TAKEN, COMPLETED, CANCELED
}
```

Response **200**:

```json
{
  "availability_id": "3c9ae305-9c8f-40fc-9ea6-8b637cd2b98d"
}
```

validações:

- somente usuário de role ***PROFESSIONAL*** (psicólogo) pode criar um horário disponível.
- usuário deve ter status **READY**

---

### **GET /availabilities**

**Path params:**

- _**professional_id: UUID (opcional)**_: Consultar horários disponíveis de um usuário específico. Se não especificado,
  considera todos os usuários profissionais.
- _**time_filter: DAY, WEEK, MONTH, ALL (opcional)**_: Consultar horários disponíveis em especificado período de tempo.
  Se não enviado, por padrão, filtra em _**WEEK**_.
- _**status: AVAILABLE, TAKEN, COMPLETED, CANCELED (opcional)**_: Filtrar por status de horário. Se não especificado,
  cosidera _**AVAILABLE**_.
- _**skip: int (opcional)**_: Ignora os N primeiro elementos retornados.
- _**limit: int (opcional)**_: Limita o número de elementos da lista (por padrão 50).

Response **200**:

```json
[
  {
    "id": "beac2b9f-e517-4cfc-9907-2cb8ac25f633",
    "created_at": "2025-09-03T22:25:40.518858+00:00",
    "status": "AVAILABLE",
    "start_time": "2025-09-03T09:00:00+00:00",
    "end_time": "2025-09-03T10:00:00+00:00",
    "user": {
      "id": "16ed380c-ac5c-4e9c-85f0-a890786b0af4",
      "name": "Dr. Ana Silva",
      "bio": null,
      "email": "ana.silva@email.com",
      "role": "PROFESSIONAL",
      "status": "READY",
      "crp": "CRP/01-12345",
      "image_url": null,
      "created_at": "2025-09-03T22:25:40.508305Z"
    }
  },
  {
    "id": "06b2a720-ca57-43bc-b08c-24164229aaab",
    "created_at": "2025-09-03T22:25:40.521630+00:00",
    "status": "AVAILABLE",
    "start_time": "2025-09-02T08:00:00+00:00",
    "end_time": "2025-09-02T09:00:00+00:00",
    "user": {
      "id": "44370f25-a26b-4bf2-a152-b01c13990681",
      "name": "Dr. Carlos Souza",
      "bio": null,
      "email": "carlos.souza@email.com",
      "role": "PROFESSIONAL",
      "status": "READY",
      "crp": "CRP/02-54321",
      "image_url": null,
      "created_at": "2025-09-03T22:25:40.508305Z"
    }
  }
]
```

Validações:

- Caso especificado, o _**professional_id**_ deve existir e ter role _**PROFESSIONAL**_
- Status deve ser válido: (AVAILABLE, TAKEN, COMPLETED, CANCELED)

---

### POST /availabilities/change-status

Utilizado para alterar o status de um horário livre.

Request:

```json
{
  "availability_id": "a5b386a7-724c-407a-b505-d606cc609124",
  "status": "AVAILABLE"
}
```

Response **200**:

```json
{
  "start_time": "2025-09-04T10:00:00+00:00",
  "owner_id": "cc505260-5707-4a43-aeaa-2a8b11b651fd",
  "id": "a5b386a7-724c-407a-b505-d606cc609124",
  "end_time": "2025-09-04T11:00:00+00:00",
  "created_at": "2025-09-04T18:54:49.522685+00:00",
  "status": "AVAILABLE"
}
```

Validações:

- status deve ser válido: **AVAILABLE, TAKEN, COMPLETED ou CANCELED**.
- usuário logado deve ter role ***PROFESSIONAL***
- usuário deve ser o criador do horário (***owner_id*** do horário deve ser o mesmo do usuário)

---

# Schedule — consultas agendadas

Uma consulta é uma **relação entre um usuário *PATIENT* e um horário *AVAILABILITIES.***

---

### **POST /schedule**

agenda uma consulta relacionando o usuário autenticado e um id de horário disponível.

Request:

```json
{
  "availability_id": "819b036c-c9a7-4cc5-8146-cc91656042a5"
}
```

Response **200**:

```json
{
  "schedule_id": "fd7adee1-074d-4421-ba8c-391f9a7aff93"
}
```

Validações:

- o usuário autenticado deve ter role ***PATIENT***
- o registro do horário disponível (**availability_id**) deve existir
- o ***availability (horário)*** deve ter status ***AVAILABLE***
- não deve existir outro ***schedule*** para o mesmo ***availability*** (unique **availability_id**)

---

### **GET /schedule?time_filter=DAY, WEEK, MONTH, ALL**

retorna os agendamentos do usuário em determinado período de tempo.

Exemplo URI: `/schedule?time_filter=ALL`

Response **200**:

```json
[
  {
    "id": "2c41e344-7ca6-43be-a08b-1d71133b69cf",
    "patient_id": "553e4d70-dc69-43db-8c69-9ab8d947e9a2",
    "availability_id": "643742d6-6e40-4025-b229-495c25bb0166",
    "status": "TAKEN",
    "start_time": "2025-09-01T09:00:00+00:00",
    "created_at": "2025-09-04T17:23:41.422636+00:00",
    "user": {
      "id": "16ed380c-ac5c-4e9c-85f0-a890786b0af4",
      "name": "Dr. Ana Silva",
      "bio": null,
      "email": "ana.silva@email.com",
      "role": "PROFESSIONAL",
      "status": "READY",
      "crp": "CRP/01-12345",
      "image_url": null,
      "created_at": "2025-09-03T22:25:40.508305Z"
    }
  },
  {
    "id": "2c41e344-7ca6-43be-a08b-1d71133b69cf",
    "patient_id": "553e4d70-dc69-43db-8c69-9ab8d947e9a2",
    "availability_id": "643742d6-6e40-4025-b229-495c25bb0166",
    "status": "TAKEN",
    "start_time": "2025-09-01T09:00:00+00:00",
    "created_at": "2025-09-04T17:23:41.422636+00:00",
    "user": {
      "id": "16ed380c-ac5c-4e9c-85f0-a890786b0af4",
      "name": "Dr. Ana Silva",
      "bio": null,
      "email": "ana.silva@email.com",
      "role": "PROFESSIONAL",
      "status": "READY",
      "crp": "CRP/01-12345",
      "image_url": null,
      "created_at": "2025-09-03T22:25:40.508305Z"
    }
  }
]
```

---

### DELETE /schedule?schedule_id=UUID
Remove um agendamento.

Response: **204 No Content**

Validações:
- Utilizado apenas por usuário _**PATIENT**_
- Usuário autenticado deve ser o dono do agendamento
