import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FlatRate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // // The title of the flat rate (e.g., "Standard Flat Rate", "Express Flat Rate")
  // @Column()
  // title: string;

  // // Indicates whether the flat rate is active or not
  // @Column({ default: false })
  // status: boolean;

  // // Description of the flat rate, explaining its details or usage
  // @Column({ type: "text", nullable: true, default: null })
  // description: string | null;

  // User ID who created the flat rate (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the flat rate was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
