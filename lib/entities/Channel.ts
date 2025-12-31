import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from "typeorm"
import { ChannelGenre } from "./ChannelGenre"
import { VideoRecording } from "./VideoRecording"

@Entity({ name: "channel" })
@Unique(["channelId"])
export class Channel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: "channel_id", length: 50 })
  channelId!: string

  @Column({ length: 150 })
  name!: string

  @Column({ name: "logo_url", type: "varchar", length: 500, nullable: true })
  logoUrl?: string | null

  @ManyToOne(() => ChannelGenre, (genre) => genre.channels, { nullable: false })
  genre!: ChannelGenre

  @OneToMany(() => VideoRecording, (recording) => recording.channel)
  recordings!: VideoRecording[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}