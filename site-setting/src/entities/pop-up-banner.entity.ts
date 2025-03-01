import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../../entities/index";

@Entity()
export class PopupBanner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  imageUrl: string;

  @Column({ type: "text", nullable: true })
  message: string;

  @Column({ type: "boolean", nullable: true })
  isActive: boolean;

  @Column({ type: "timestamp", nullable: true })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @ManyToOne(() => User, (user) => user.popupBanners, { nullable: false })
  createdBy: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date; // For soft deletion
}
