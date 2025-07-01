import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

// Defines the types of addresses a customer can have
export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING",
}

@Entity()
export class AddressBook {
  // Primary key UUID for the address
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Company name (e.g., "XYZ CORPORATE")
  @Column({ nullable: true })
  company: string | null;

  // Street address one line (e.g., "123 Main St")
  @Column()
  streetOne: string;

  // Street address two line (e.g., "123 Main St")
  @Column({ nullable: true })
  streetTwo: string | null;

  // City where the address is located
  @Column()
  city: string;

  // U.S. state where the address is located (e.g., "CA" for California)
  @Column()
  state: string;

  // ZIP code for the address
  @Column()
  zip: string;

  // U.S. county name (optional)
  @Column()
  country: string;

  // Type of address: shipping or billing
  @Column({
    type: "enum",
    enum: AddressType,
  })
  type: AddressType;

  // Indicates whether this address is the default for its type
  @Column({ default: false })
  isDefault: boolean;

  // Establishes a many-to-one relationship with the user
  @ManyToOne(() => User, (user) => user.addresses, {
    onDelete: "CASCADE", // Delete address if the associated user is deleted
  })
  user: Promise<User>;

  // Timestamp for when the address was created
  @CreateDateColumn()
  createdAt: Date;

  // Timestamp for the last update of the address
  @UpdateDateColumn()
  updatedAt: Date;
}
