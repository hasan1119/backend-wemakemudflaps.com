import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RolePermission } from "./role-permission.entity";
import { User } from "./user.entity";

@Entity()
export class Role {
  // Defines the unique identifier for the role
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Stores the user role name (e.g., "Super Admin", "Vendor", "Inventory Manager", "Customer Support", "Sales Manager", "Marketing Manager", "Customer", "Content Editor" & "Shipping Manager" )
  @Column({ unique: true })
  name: string;

  // Stores the user role description
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // Establishes a one-to-many relationship with permissions
  @OneToMany(() => RolePermission, (permission) => permission.role, {
    nullable: true,
    cascade: true,
    eager: true,
    onDelete: "CASCADE",
  })
  defaultPermissions: RolePermission[] | null;

  // Stores the user role's system delete protection flag (e.g if true then can't be delete - only can bypass Super Admin)
  @Column({ default: false })
  systemDeleteProtection: boolean;

  // Stores the user role's system update protection flag (e.g if true then can't be delete - only can bypass Super Admin)
  @Column({ default: false })
  systemUpdateProtection: boolean;

  // Stores the user role's system permanent delete protection flag (e.g if true then can't be delete - no one can bypass)
  @Column({ default: false })
  systemPermanentDeleteProtection: boolean;

  // Stores the user role's system permanent update protection flag (e.g if true then can't be update - no one can bypass)
  @Column({ default: false })
  systemPermanentUpdateProtection: boolean;

  // Establishes a many-to-many relationship with users (e.g - users associated wit this role)
  @ManyToMany(() => User, (user) => user.roles, {})
  users: User[] | null;

  // Establishes a many-to-one relationship for created by the user
  @ManyToOne(() => User, (user) => user.createdRoles, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: "createdBy" })
  createdBy: Promise<User> | null;

  // Stores the timestamp when the role was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Stores the timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
