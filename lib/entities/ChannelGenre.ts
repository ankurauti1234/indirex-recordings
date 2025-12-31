import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import type { Channel } from "./Channel"

@Entity({ name: "channel_genre" })
export class ChannelGenre {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true, length: 100 })
  genreName!: string

  @OneToMany("Channel", "genre")
  channels!: Channel[]
}
