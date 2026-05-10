# Domain Events — Explicação com o Projeto forum-ddd

## Teoria

### O problema que eles resolvem

Numa aplicação DDD, quando um Aggregate Root faz algo importante (ex.: uma resposta é criada, uma melhor resposta é escolhida), **efeitos colaterais** podem precisar acontecer: enviar notificação, atualizar um ranking, disparar email, etc.

O jeito ingênuo é colocar esse efeito colateral **dentro do use case** que executou a ação principal. Mas isso **acopla** o domínio do fórum com o domínio de notificação. O use case `AnswerQuestion` teria que saber da existência de `SendNotificationUseCase`. Isso viola a separação entre subdomínios.

### A solução: eventos de domínio

Domain Events são **registros imutáveis** de algo que aconteceu no domínio, expressos na **linguagem do domínio**. Eles seguem o padrão **Publish-Subscribe**:

1. **Publisher**: O Aggregate Root cria o evento e o armazena internamente (não dispara ainda — ele só "marca" o evento).
2. **Dispatch**: Quando o repositório persiste o aggregate (salva no banco), ele dispara todos os eventos pendentes.
3. **Subscriber (EventHandler)**: Código em outro subdomínio (ex.: Notifications) escuta eventos específicos e reage a eles.

Isso dá:

- **Baixo acoplamento**: O domínio do fórum não sabe que notificações existem.
- **Consistência eventual & transacional**: O evento só é disparado se a persistência do aggregate for bem-sucedida.
- **Linguagem ubíqua**: `AnswerCreatedEvent`, `QuestionBestAnswerChosenEvent` — isso é linguagem do domínio.

---

## A prática no seu projeto

O projeto implementa Domain Events em 4 camadas. Vou percorrer um fluxo completo.

### 1. A interface `DomainEvent` (contrato)

**`src/core/events/domain-event.ts`**:

```ts
export interface DomainEvent {
  occurredAt: Date                 // Quando aconteceu
  getAggregateId(): UniqueEntityID // Qual aggregate originou o evento
}
```

### 2. Eventos concretos do domínio

Três eventos no seu projeto:

| Evento | Disparado quando... |
|---|---|
| `AnswerCreatedEvent` | Uma resposta é criada |
| `QuestionBestAnswerChosenEvent` | O autor da pergunta escolhe a melhor resposta |
| `AnswerCommentCreatedEvent` | Um comentário é adicionado a uma resposta |

Exemplo — **`AnswerCreatedEvent`**:

```ts
// src/domain/forum/enterprise/events/answer-created-event.ts
export class AnswerCreatedEvent implements DomainEvent {
  public occurredAt: Date
  public answer: Answer          // Referência ao aggregate que gerou o evento

  constructor(answer: Answer) {
    this.answer = answer
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.answer.id        // Devolve o ID do aggregate raiz
  }
}
```

### 3. O Aggregate Root adiciona o evento (Publish)

Olhe `Answer.create()` em **`src/domain/forum/enterprise/entities/answer.ts`**:

```ts
static create(props, id?) {
  const answer = new Answer({ ... }, id)

  const isNewAnswer = !id  // Só dispara se for criação nova, não reconstituição do DB

  if (isNewAnswer)
    answer.addDomainEvent(new AnswerCreatedEvent(answer))  // <--- PUBLISH

  return answer
}
```

O método `addDomainEvent` (herdado de `AggregateRoot`) faz duas coisas:

1. Adiciona o evento na lista `_domainEvents` do aggregate
2. Chama `DomainEvents.markAggregateForDispatch(this)` — registra o aggregate para disparo futuro

**`src/core/entities/aggregate-root.ts`**:

```ts
protected addDomainEvent(domainEvent: DomainEvent): void {
  this._domainEvents.push(domainEvent)
  DomainEvents.markAggregateForDispatch(this)
}
```

### 4. O repositório dispara os eventos (Dispatch)

Quando o use case chama `answersRepository.create(answer)`, ele não apenas persiste — ele também **dispara os eventos pendentes**.

**`test/repositories/in-memory-answers-repository.ts`**:

```ts
async create(answer: Answer) {
  this.items.push(answer)
  DomainEvents.dispatchEventsForAggregate(answer.id)  // <--- DISPATCH
}
```

`dispatchEventsForAggregate` faz:

1. Pega os eventos desse aggregate
2. Para cada evento, olha no `handlersMap[eventClassName]` (ex.: `handlersMap["AnswerCreatedEvent"]`)
3. Chama todos os handlers registrados para aquele tipo de evento
4. Limpa a lista de eventos do aggregate

**`src/core/events/domain-events.ts`** (simplificado):

```ts
private static dispatch(event: DomainEvent) {
  const eventClassName = event.constructor.name  // "AnswerCreatedEvent"
  const handlers = this.handlersMap[eventClassName] ?? []
  for (const handler of handlers) handler(event)  // Executa subscriber
}
```

### 5. O subscriber escuta e reage (Subscribe)

Em **`src/domain/notification/application/subscribers/on-answer-created.ts`**:

```ts
export class OnAnswerCreated implements EventHandler {
  constructor(
    private questionsRepository: QuestionsRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()  // Se registra assim que é instanciado
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAnswerNotification.bind(this),
      AnswerCreatedEvent.name,  // "AnswerCreatedEvent" — a chave no mapa
    )
  }

  private async sendNewAnswerNotification({ answer }: AnswerCreatedEvent) {
    const question = await this.questionsRepository.findById(
      answer.questionId.toString()
    )
    if (question) {
      await this.sendNotification.execute({
        recipientId: question.authorId.toString(),
        title: `Nova resposta em ${question.title.substring(0, 40).concat('...')}`,
        content: answer.excerpt,
      })
    }
  }
}
```

Note: o subscriber **não está no domínio do fórum**. Ele está no subdomínio **Notification** (um subdomínio genérico). O acoplamento é só via o evento — que é uma classe, importada, mas o fórum não chama notificação diretamente.

### 6. O teste comprova o fluxo completo

**`src/domain/notification/application/subscribers/on-answer-created.test.ts`**:

```ts
it('should send a notification when an answer is created', async () => {
  const question = makeQuestion()
  const answer = makeAnswer({ questionId: question.id })

  inMemoryQuestionsRepository.create(question)
  inMemoryAnswersRepository.create(answer)  // <-- aqui dispara o evento

  await waitFor(() => {
    expect(sendNotificationExecuteSpy).toHaveBeenCalled()  // subscriber rodou!
  })
})
```

O `waitFor` é necessário porque os subscribers rodam de forma **síncrona, mas dependem de Promises** (o `sendNotification.execute` é async). O `waitFor` fica num loop polling até o spy ser chamado.

---

## Visualizando o fluxo

```
Use Case (AnswerQuestion.execute)
  │
  ├─► Answer.create()
  │     └─► answer.addDomainEvent(new AnswerCreatedEvent(answer))
  │           ├─► _domainEvents.push(event)
  │           └─► markAggregateForDispatch(this)
  │
  ├─► answersRepository.create(answer)
  │     ├─► this.items.push(answer)       [persistência]
  │     └─► DomainEvents.dispatchEventsForAggregate(answer.id)
  │           ├─► aggregate.domainEvents  [pega eventos pendentes]
  │           ├─► dispatch(AnswerCreatedEvent)
  │           │     └─► handlersMap["AnswerCreatedEvent"]
  │           │           └─► OnAnswerCreated.sendNewAnswerNotification(event)
  │           │                 ├─► questionsRepository.findById(questionId)
  │           │                 └─► sendNotification.execute({ ... })
  │           └─► aggregate.clearEvents()
  │
  └─► return success({ answer })
```

---

## Por que isso é poderoso?

| Antes (acoplado) | Depois (eventos) |
|---|---|
| `AnswerQuestionUseCase` importa `SendNotificationUseCase` | `AnswerQuestionUseCase` só cria resposta |
| Se amanhã precisar também atualizar um ranking, edita o use case | Cria um novo subscriber `OnAnswerCreated` no subdomínio de ranking |
| O use case fere SRP — faz várias coisas | O use case faz uma coisa só: criar resposta |
| Subdomínios se misturam | Cada subdomínio é independente |

No projeto, **Notifications** é um subdomínio **genérico**, separado de **Forum** (core). Os eventos são a ponte que permite que um subdomínio reaja a ações do outro sem acoplar os dois.

---

## Referências no código

| Arquivo | Papel |
|---|---|
| `src/core/events/domain-event.ts` | Interface base do evento |
| `src/core/events/event-handler.ts` | Interface do subscriber |
| `src/core/events/domain-events.ts` | Broker: registro, marcação, dispatch |
| `src/core/entities/aggregate-root.ts` | Adiciona eventos ao aggregate |
| `src/domain/forum/enterprise/events/answer-created-event.ts` | Evento concreto |
| `src/domain/forum/enterprise/events/question-best-answer-chosen-event.ts` | Evento concreto |
| `src/domain/forum/enterprise/events/answer-comment-created.ts` | Evento concreto |
| `src/domain/notification/application/subscribers/on-answer-created.ts` | Subscriber |
| `src/domain/notification/application/subscribers/on-question-best-answer-chosen.ts` | Subscriber |
| `src/domain/notification/application/subscribers/on-comment-created-on-answer.ts` | Subscriber |
