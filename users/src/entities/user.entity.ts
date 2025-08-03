import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AddressBook } from "./address-book.entity";
import { Permission } from "./permission.entity";
import { TaxExemption } from "./tax-exemption.entity";
import { UserLogin } from "./user-login.entity";
import { Role } from "./user-role.entity";

export enum UserGender {
  Male = "Male",
  Female = "Female",
  Others = "Others",
  Rather_not_to_say = "Rather_not_to_say",
}

@Entity()
export class User {
  // Defines the unique identifier for the user
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Stores the user's first name
  @Column()
  firstName: string;

  // Stores the user's last name
  @Column()
  lastName: string;

  // Stores the user's unique email address
  @Column({ unique: true })
  email: string;

  // Media ID who for the avatar (string only for Apollo Federation compatibility)
  @Column({ unique: false, nullable: true, default: null })
  avatar: string | null;

  // Stores a temporary email address during profile updates
  @Column({ unique: true, nullable: true, default: null })
  tempUpdatedEmail: string | null;

  // Stores the user's hashed password
  @Column()
  password: string;

  // Stores the user's gender (optional)
  @Column({
    type: "enum",
    enum: UserGender,
    nullable: true,
    default: null,
  })
  gender: UserGender | null;

  // Stores the user's address (optional)
  @Column({
    type: "jsonb",
    nullable: true,
    default: null,
  })
  address: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
  } | null;

  // Stores the user's username
  @Column({ unique: true })
  username: string;

  // Stores the user's phone number (optional)
  @Column({ nullable: true, default: null })
  phone: string | null;

  // Establishes a many-to-many relationship with roles
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: "user_roles", // Custom pivot table for user-role relationships
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "roleId", referencedColumnName: "id" },
  })
  roles: Role[];

  // Establishes a one-to-many relationship for addresses associated with the user
  @OneToMany(() => AddressBook, (address) => address.user, {
    cascade: true, // Automatically persist/remove addresses when user is saved/deleted
  })
  addresses: AddressBook[];

  // Stores the token for password reset (optional)
  @Column({ nullable: true, default: null })
  resetPasswordToken: string | null;

  // Stores the expiry timestamp for the password reset token
  @Column({ type: "timestamp", nullable: true, default: null })
  resetPasswordTokenExpiry: Date | null;

  // Establishes a one-to-many relationship for roles created by the user
  @OneToMany(() => Role, (role) => role.createdBy)
  createdRoles: Role[];

  // Establishes a one-to-many relationship for user-specific permissions
  @OneToMany(() => Permission, (permission) => permission.user, {
    cascade: true, // Automatically persists related permissions
  })
  permissions?: Permission[];

  // Indicates whether the user's permissions can be updated
  @Column({ default: true })
  canUpdatePermissions: boolean;

  // Indicates whether the user's role can be updated
  @Column({ default: false })
  canUpdateRole: boolean;

  // Indicates whether the user's email is verified
  @Column({ default: false })
  emailVerified: boolean;

  // Stores a company name of the user (optional)
  @Column({ type: "text", nullable: true, default: null })
  company: string | null;

  // Stores the user's personal or professional website (optional)
  @Column({ nullable: true, default: null })
  website: string | null;

  // Stores a short biography or description of the user (optional)
  @Column({ type: "text", nullable: true, default: null })
  bio: string | null;

  // Stores the verification status of a temporary email during profile updates
  @Column({ default: null, nullable: true })
  tempEmailVerified: boolean | null;

  // Indicates whether the user's account is activated
  @Column({ default: false })
  isAccountActivated: boolean;

  // Establishes a one-to-many relationship for login records
  @OneToMany(() => UserLogin, (login) => login.user)
  logins: UserLogin[];

  // Establishes a one-to-many relationship for tax exemption records
  @OneToOne(() => TaxExemption, (exemption) => exemption.user)
  taxExemption: TaxExemption;

  // Stores the timestamp when the user was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Stores the timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
