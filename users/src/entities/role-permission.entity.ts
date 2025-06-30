import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PERMISSIONS } from "../utils/data-validation";
import type { PermissionName } from "./../utils/data-validation";
import { Role } from "./user-role.entity";

@Entity()
export class RolePermission {
  // Defines the unique identifier for the role permission
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Establishes a many-to-one relationship for the associated role
  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: "roleId" })
  role: Promise<Role>;

  // Stores the role permission name
  @Column({
    type: "enum",
    enum: PERMISSIONS,
  })
  name: PermissionName;

  // Stores the role permission description
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // Stores the role permission can create
  @Column({ nullable: false, default: false })
  canCreate: boolean;

  // Stores the role permission can read
  @Column({ nullable: false, default: false })
  canRead: boolean;

  // Stores the role permission can update
  @Column({ nullable: false, default: false })
  canUpdate: boolean;

  // Stores the role permission can delete
  @Column({ nullable: false, default: false })
  canDelete: boolean;

  // Stores the timestamp when the role permission was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Stores the timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
