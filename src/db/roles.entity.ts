import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  role_name: string;

  @OneToMany(() => User, (profile) => profile.roles)
  user: User[];

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public createdAt: Date | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public updatedAt: Date | null;
}
