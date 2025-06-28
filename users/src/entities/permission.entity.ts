import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PERMISSIONS } from "../utils/data-validation";
import type { PermissionName } from "./../utils/data-validation";
import { User } from "./user.entity";

@Entity()
export class Permission {
  // Defines the unique identifier for the permission
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Stores the role permission name
  @Column({
    type: "enum",
    enum: PERMISSIONS,
  })
  name: PermissionName;

  // Stores the permission description
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // Establishes a many-to-one relationship for the associated user
  @ManyToOne(() => User, (user) => user.permissions, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: Promise<User>;

  // Establishes a many-to-one relationship for created by the user
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "createdBy" })
  createdBy: Promise<User> | null;

  // Stores the permission can create
  @Column({ nullable: false, default: false })
  canCreate: boolean;

  // Stores the permission can read
  @Column({ nullable: false, default: false })
  canRead: boolean;

  // Stores the permission can update
  @Column({ nullable: false, default: false })
  canUpdate: boolean;

  // Stores the permission can delete
  @Column({ nullable: false, default: false })
  canDelete: boolean;

  // Stores the timestamp when the permission was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Stores the timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
