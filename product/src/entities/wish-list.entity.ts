import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { WishlistItem } from "./wish-list-item.entity";

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Optional relation to WishlistItem (if this wishlist contains items)
  @OneToMany(() => WishlistItem, (item) => item.wishlist, {
    cascade: true,
    nullable: true,
  })
  items: WishlistItem[] | null;

  // User Id associated with the wishlist (string only for Apollo Federation compatibility))
  @Column()
  createdBy: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
