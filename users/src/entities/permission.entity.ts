import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

// Define PermissionName as a TypeScript type (union of literals)
export type PermissionName =
  | 'User'
  | 'Brand'
  | 'Category'
  | 'Product'
  | 'Permission'
  | 'Product Review'
  | 'Shipping Class'
  | 'Sub Category'
  | 'Tax Class'
  | 'Tax Status'
  | 'FAQ'
  | 'News Letter'
  | 'Pop Up Banner'
  | 'Privacy & Policy'
  | 'Terms & Conditions'
  | 'Order'
  | 'Role'
  | 'Notification'
  | 'Media';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Permissions
  @Column({
    type: 'enum',
    enum: [
      'User',
      'Brand',
      'Category',
      'Product',
      'Permission',
      'Product Review',
      'Shipping Class',
      'Sub Category',
      'Tax Class',
      'Tax Status',
      'FAQ',
      'News Letter',
      'Pop Up Banner',
      'Privacy & Policy',
      'Terms & Conditions',
      'Order',
      'Role',
      'Notification',
      'Media',
    ],
  })
  name: PermissionName;

  // Description for the permission
  @Column({ nullable: true })
  description: string;

  // The user who has this permission
  @ManyToOne(() => User, (user) => user.permissions, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  // User who created the permission
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy: Promise<User> | null;

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
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
