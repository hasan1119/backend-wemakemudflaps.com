import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SiteSettings {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Name of the site setting
  @Column({ nullable: true, default: null })
  name: string | null;

  // Metadata for the site setting
  @Column({ type: "jsonb", nullable: true, default: null })
  metaData: {
    title?: string | null;
    description?: string | null;
    keywords?: string[] | null;
  } | null;

  // Favicon URL for the site setting
  @Column({ nullable: true, default: null })
  favIcon: string | null;

  // Logo URL for the site setting
  @Column({ nullable: true, default: null })
  logo: string | null;

  @Column({
    type: "text",
    array: true,
    nullable: true,
    default: null,
  })
  contactNumbers: string[] | null;

  @Column({
    type: "text",
    array: true,
    nullable: true,
    default: null,
  })
  contactEmails: string[] | null;

  // Privacy policy for the site setting
  @Column({ nullable: true, default: null })
  privacyPolicy: string | null;

  // Terms and conditions for the site setting
  @Column({ nullable: true, default: null })
  termsAndConditions: string | null;

  // User ID who created the site setting (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the site setting was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
