import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ForgottenPassword extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar' })
  public email!: string;

  @Exclude()
  @Column({ type: 'varchar' })
  public newPasswordToken!: string;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public timeStamp: Date | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public createdAt: Date | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public updatedAt: Date | null;
}
