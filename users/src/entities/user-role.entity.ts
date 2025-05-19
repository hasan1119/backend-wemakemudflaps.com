import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /*
   * Allows predefined + permission
   * Predefined: "Super Admin", "Vendor", "Inventory Manager", "Customer Support", "Sales Manager", "Marketing Manager", "Customer", "Content Editor" & "Shipping Manager"
   */
  // Role name (e.g., "Super Admin", "Vendor", "Inventory Manager", "Customer Support", "Sales Manager", "Marketing Manager", "Customer", "Content Editor" & "Shipping Manager" )
  @Column({ unique: true })
  name: string;

  // Description for the user role
  @Column({ nullable: true, default: null })
  description: string | null;

  // Users associated with this role
  @OneToMany(() => User, (user) => user.role)
  users: User[];

  // User who created the role (Many roles can be created by one user)
  @ManyToOne(() => User, (user) => user.roles, { nullable: true })
  @JoinColumn({ name: "createdBy" })
  createdBy: Promise<User> | null;

  // Timestamp when the role was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({
    type: "timestamp",
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;
}
