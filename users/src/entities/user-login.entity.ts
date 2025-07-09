import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserLogin {
  // Defines the unique identifier for each login record
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Establishes a many-to-one relationship with the User entity
  @ManyToOne(() => User, { nullable: false })
  user: Promise<User>;

  // Stores the IP address of the user during login
  @Column({ nullable: true, default: null })
  ip: string | null;

  // Stores the city (if available) from which the user logged in
  @Column({ nullable: true, default: null })
  city: string | null;

  // Stores the name of the Internet Service Provider (ISP)
  @Column({ nullable: true, default: null })
  isp: string | null;

  // Stores the name of the country
  @Column({ nullable: true, default: null })
  country: string | null;

  // Stores the ISO code of the country
  @Column({ nullable: true, default: null })
  countryIso: string | null;

  // Stores the postal code (if available)
  @Column({ nullable: true, default: null })
  postalCode: string | null;

  // Stores the ISO code of the subdivision or region
  @Column({ nullable: true, default: null })
  subdivisionIso: string | null;

  // Stores the user's timezone
  @Column({ nullable: true, default: null })
  timeZone: string | null;

  // Stores the GeoNames ID for the city (if available)
  @Column({ type: "int", nullable: true, default: null })
  cityGeonameId: number | null;

  // Stores the GeoNames ID for the country
  @Column({ type: "int", nullable: true, default: null })
  countryGeonameId: number | null;

  // Stores the GeoNames ID for the subdivision (if available)
  @Column({ type: "int", nullable: true, default: null })
  subdivisionGeonameId: number | null;

  // Stores the unique ISP identifier
  @Column({ type: "int", nullable: true, default: null })
  ispId: number | null;

  // Stores the latitude coordinate of the login location
  @Column("float", { nullable: true, default: null })
  latitude: number | null;

  // Stores the longitude coordinate of the login location
  @Column("float", { nullable: true, default: null })
  longitude: number | null;

  // Stores a unique device/browser fingerprint
  @Column()
  fingerprint: string;

  // Stores a session token used during login
  @Column()
  session: string;

  // Stores the fraud probability score (0.0–1.0)
  @Column("float", { default: 0 })
  fraud: number;

  // Indicates whether the login originated from the Tor network
  @Column({ default: false })
  tor: boolean;

  // Stores the timestamp when the user logged in
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
