import { UniqueEntityID } from './unique-entity-id.js'

export class Entity<Props> {
  private _id: UniqueEntityID
  protected _props: Props

  get id() {
    return this._id
  }

  protected constructor(props: Props, id?: UniqueEntityID) {
    this._props = props
    this._id = id ?? new UniqueEntityID()
  }
}
