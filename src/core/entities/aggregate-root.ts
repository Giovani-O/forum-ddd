// Reminder: Classes abstratas não podem ser instanciadas diretamente, outras classes estendem da classe abstrata.

import { Entity } from './entity.js'

export abstract class AggregateRoot<Props> extends Entity<Props> {
  // TODO: Implementar aggregate root
}
