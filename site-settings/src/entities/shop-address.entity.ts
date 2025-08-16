import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ShopAddress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true, default: null })
  brunchName: string | null;

  @Column({ nullable: true, default: null })
  addressLine1: string | null;

  @Column({ nullable: true, default: null })
  addressLine2: string | null;

  @Column({
    type: "jsonb",
    nullable: true,
    default: null,
  })
  emails:
    | {
        type: "Corporate" | "Complain" | "Support" | "Other" | null;
        email: string | null;
      }[]
    | null;

  @Column({
    type: "jsonb",
    nullable: true,
    default: null,
  })
  phones:
    | {
        type: "Mobile" | "Landline" | "Fax" | "Other" | null;
        number: string | null;
      }[]
    | null;

  @Column({ nullable: true, default: null })
  city: string | null;

  @Column({ nullable: true, default: null })
  state: string | null;

  @Column({ nullable: true, default: null })
  country: string | null;

  @Column({ nullable: true, default: null })
  zipCode: string | null;

  @Column({
    type: "jsonb",
    nullable: true,
    default: null,
  })
  openingAndClosingHours: {
    opening: string | null;
    closing: string | null;
  } | null;

  @Column({ nullable: true, default: null })
  isActive: boolean | null;

  @Column({ nullable: true, default: null })
  isEveryDayOpen: boolean | null;

  @Column({
    type: "jsonb",
    nullable: true,
    default: null,
  })
  weeklyOffDays:
    | {
        day:
          | "Monday"
          | "Tuesday"
          | "Wednesday"
          | "Thursday"
          | "Friday"
          | "Saturday"
          | "Sunday";
      }[]
    | null;

  @Column({ nullable: true, default: null })
  direction: string | null; // Google map direction

  @Column({ nullable: true, default: null })
  isDefaultForTax: boolean | null;

  // Timestamp when the site setting was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
