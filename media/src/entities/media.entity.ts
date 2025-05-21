import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Define Media use case as a TypeScript type (union of literals)
export type UseCase =
  | "Profile"
  | "Product"
  | "Product Review"
  | "Product Return"
  | "Order"
  | "Complain"
  | "Banner"
  | "Site Logo"
  | "Site Favicon"
  | "Carousel"
  | "Category"
  | "Sub Category"
  | "Brand"
  | "Promotion"
  | "Invoice"
  | "Shipping Label"
  | "Site Settings";

@Entity()
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ["image", "video", "pdf", "cvs", "docx", "excel", "ppt", "others"],
  })
  mediaType: string;

  @Column()
  url: string;

  // Media use case type (e.g., "profile", "product", "product review", etc.)
  @Column({
    type: "enum",
    enum: [
      "Profile",
      "Product",
      "Product Review",
      "Product Return",
      "Order",
      "Complain",
      "Banner",
      "Site Logo",
      "Site Favicon",
      "Carousel",
      "Category",
      "Sub Category",
      "Brand",
      "Promotion",
      "Invoice",
      "Shipping Label",
      "Site Settings",
    ],
  })
  useCase: UseCase;

  // User ID who created the media (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the notification was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
