import { describe, expect, it, vi } from 'vitest'
import { AggregateRoot } from '../entities/aggregate-root.js'
import type { UniqueEntityID } from '../entities/unique-entity-id.js'
import type { DomainEvent } from './domain-event.js'
import { DomainEvents } from './domain-events.js'

// Evento
class CustomAggregateCreated implements DomainEvent {
  public occurredAt: Date
  private aggregate: CustomAggregate

  constructor(aggregate: CustomAggregate) {
    this.occurredAt = new Date()
    this.aggregate = aggregate
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id
  }
}

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null)

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))

    return aggregate
  }
}

describe('domain events', () => {
  it('should be able to dispatch and listen to events', () => {
    const spy = vi.fn()

    // Subscriber cadastrado (ouvindo o evento da "resposta criada")
    DomainEvents.register(spy, CustomAggregateCreated.name)

    // Criando uma resposta sem salvar no banco de dados
    const aggregate = CustomAggregate.create()

    // Estou assegurando que o evento foi criado, mas não disparado
    expect(aggregate.domainEvents).toHaveLength(1)

    // Salvando resposta no banco de dados e disparando evento
    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    // O subscriber ouve o evento e faz o que precisa ser feito
    expect(spy).toHaveBeenCalled()
    expect(aggregate.domainEvents).toHaveLength(0)
  })
})
