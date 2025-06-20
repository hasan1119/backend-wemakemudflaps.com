import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
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
  @Column({ nullable: true })
  ip: string | null;

  // Stores the city (if available) from which the user logged in
  @Column({ nullable: true })
  city: string | null;

  // Stores the name of the Internet Service Provider (ISP)
  @Column({ nullable: true })
  isp: string | null;

  // Stores the name of the country
  @Column({ nullable: true })
  country: string | null;

  // Stores the ISO code of the country
  @Column({ nullable: true })
  countryIso: string | null;

  // Stores the postal code (if available)
  @Column({ nullable: true })
  postalCode: string | null;

  // Stores the ISO code of the subdivision or region
  @Column({ nullable: true })
  subdivisionIso: string | null;

  // Stores the user's timezone
  @Column({ nullable: true })
  timeZone: string | null;

  // Stores the GeoNames ID for the city (if available)
  @Column({ type: "int", nullable: true })
  cityGeonameId: number | null;

  // Stores the GeoNames ID for the country
  @Column({ type: "int", nullable: true })
  countryGeonameId: number | null;

  // Stores the GeoNames ID for the subdivision (if available)
  @Column({ type: "int", nullable: true })
  subdivisionGeonameId: number | null;

  // Stores the unique ISP identifier
  @Column({ type: "int", nullable: true })
  ispId: number | null;

  // Stores the latitude coordinate of the login location
  @Column("float", { nullable: true })
  latitude: number | null;

  // Stores the longitude coordinate of the login location
  @Column("float", { nullable: true })
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
  @CreateDateColumn()
  loggedInAt: Date;
}
