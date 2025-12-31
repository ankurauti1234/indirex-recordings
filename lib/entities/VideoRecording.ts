import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from "typeorm"
import type { Channel } from "./Channel"

@Entity({ name: "video_recording" })
@Unique(["channel", "recordingDate", "hour"])
export class VideoRecording {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(
    "Channel", // Use string name instead of class reference
    "recordings",
    { nullable: false },
  )
  channel!: Channel

  @Column({ type: "date" })
  recordingDate!: string

  @Column()
  hour!: number // 0–23

  @Column()
  videoUrl!: string
}
