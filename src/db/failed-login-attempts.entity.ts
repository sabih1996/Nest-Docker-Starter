import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FailedLoginAttempts extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar' })
  public email!: string;

  @Column({ type: 'int', default: 0, nullable: true })
  public attempts: number;

  @Column({ type: 'varchar' })
  public loginType: string;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public blockedAt: Date | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public createdAt: Date | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public updatedAt: Date | null;
}
