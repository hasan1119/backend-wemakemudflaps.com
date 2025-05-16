import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './user-role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // First name of the user
  @Column()
  firstName: string;

  // Last name of the user
  @Column()
  lastName: string;

  // User's unique email address
  @Column({ unique: true })
  email: string;

  // Hashed password of the user
  @Column()
  password: string;

  // Gender of the user (optional)
  @Column({
    type: 'enum',
    enum: ['Male', 'Female', 'Others', 'Rather not to say'],
    nullable: true,
    default: null,
  })
  gender: string | null;

  // Each user has only one role
  @ManyToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  // Forget password token
  @Column({ nullable: true })
  resetPasswordToken: string | null;

  // Reset password token expiry
  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenExpiry: Date | null;

  // Roles created by this user
  @OneToMany(() => Role, (role) => role.createdBy)
  roles: Role[];

  // Permissions specific to each user (can be empty or null)
  @OneToMany(() => Permission, (permission) => permission.user, {
    nullable: true, // <-- optional, makes it explicit
    cascade: true, // <-- optional if you want to persist related permissions automatically
  })
  permissions?: Permission[] | null;

  // Email verified status
  @Column({ default: false })
  emailVerified: boolean;

  // Account activation status
  @Column({ default: false })
  isAccountActivated: boolean;

  // Timestamp when the user was created
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
