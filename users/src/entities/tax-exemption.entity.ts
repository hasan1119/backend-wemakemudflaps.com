import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum TaxExemptionStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Expired = "Expired",
}

@Entity()
export class TaxExemption {
  // Primary UUID for the tax exemption entry
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Tax identification number (e.g., EIN or similar)
  @Column()
  taxNumber: string;

  // Reason for tax exemption (e.g., "Non-profit", "Reseller", etc.)
  @Column()
  assumptionReason: string;

  // Media ID of the tax certificate (stored in external media service)
  @Column()
  taxCertificate: string;

  // Current status of the exemption request
  @Column({
    type: "enum",
    enum: TaxExemptionStatus,
    default: TaxExemptionStatus.Pending,
  })
  status: TaxExemptionStatus;

  // Date when the exemption certificate expires
  @Column({ type: "timestamptz", nullable: true, default: null })
  expiryDate: Date | null;

  // Establishes a many-to-one relationship with the user
  @OneToOne(() => User, (user) => user.taxExemption, {
    onDelete: "CASCADE", // Delete tax exemption if the associated user is deleted
  })
  @JoinColumn()
  user: Promise<User>;

  // Timestamp when the record was created
  @CreateDateColumn()
  createdAt: Date;

  // Timestamp when the record was last updated
  @UpdateDateColumn()
  updatedAt: Date;
}
