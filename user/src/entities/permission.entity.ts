import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../../entities";

@Entity()
export class Permission {
  // Auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

  /*
   * Allows predefined + permission
   * Predefined: "Brand", "Category", "Product", "Product Review", "Shipping Class", "Sub Category", "Tax Class", "Tax Status", "FAQ", "News Letter", "Pop Up Banner", "Privacy & Policy", "Terms & Conditions", "Oder", "Notification" and "Media"
   */
  // Permissions (e.g., "Brand", "Category", "Product", "Product Review", "Shipping Class", "Sub Category", "Tax Class", "Tax Status", "FAQ", "News Letter", "Pop Up Banner", "Privacy & Policy", "Term & Condition", "Oder", "Notification" and "Media"  )
  @Column({ unique: true })
  name: string;

  // Description for the permission
  @Column({ nullable: true })
  description: string;

  // The user who has this permission
  @ManyToOne(() => User, (user) => user.permissions, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: User;

  // User who created the permission (Many permission can be created by one user)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "createdBy" })
  createdBy: User | null;

  // CRUD permissions for the user
  @Column()
  canCreate: boolean;

  @Column()
  canRead: boolean;

  @Column()
  canUpdate: boolean;

  @Column()
  canDelete: boolean;

  // Timestamp when the permission was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
