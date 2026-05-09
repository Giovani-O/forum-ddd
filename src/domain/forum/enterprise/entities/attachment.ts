import { Entity } from '@/core/entities/entity.js'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'

interface AttachmentProps {
  title: string
  link: string
}

export class Attachment extends Entity<AttachmentProps> {
  get title() {
    return this._props.title
  }

  get link() {
    return this._props.link
  }

  static create(props: AttachmentProps, id?: UniqueEntityID) {
    const attachment = new Attachment(props, id)

    return attachment
  }
}
