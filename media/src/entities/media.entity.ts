import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product, User } from "../../../entities";

@Entity()
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ["image", "video", "pdf", "cvs", "docx", "excel", "ppt", "others"],
  })
  mediaType: string;

  @Column()
  mediaUrl: string;

  @ManyToOne(() => Product, (product) => product.media, {
    nullable: true,
    onDelete: "CASCADE",
  })
  product: Product;

  @ManyToOne(() => User, (user) => user.media, { nullable: false })
  createdBy: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
