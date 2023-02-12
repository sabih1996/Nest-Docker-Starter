import { Exclude, Expose } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { Roles } from './roles.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar' })
  public email!: string;

  @Column({ type: 'varchar', nullable: true })
  public avatar!: string;

  @Exclude()
  @Column({ type: 'varchar' })
  public password!: string;

  @Expose()
  @Column({ type: 'varchar', nullable: true })
  public firstName: string | null;

  @Expose()
  @Column({ type: 'varchar', nullable: true })
  public lastName: string | null;

  @Column({ type: 'varchar', nullable: true })
  public mobileNumber: string;

  @Column({ type: 'varchar', nullable: true })
  public city: string;

  @Column({ type: 'varchar', nullable: true })
  public street: string;

  @Column({ type: 'boolean', default: false })
  public status: boolean;

  @Column({ type: 'number' })
  public rolesId: number;

  @ManyToOne(() => Roles, (role) => role.user)
  roles: Roles;

  @ManyToOne(() => Country, (country) => country.user)
  country: Country;

  // this country key is used for fetching records from backend
  @ManyToOne(() => Country, (country) => country.user)
  active_country: Country;

  @ManyToMany(() => Country, (country) => country.naylamDispatchers, {
    nullable: true,
  })
  @JoinTable()
  naylamDispatcherCountries: Country[];

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public lastLoginAt: Date | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public createdAt: Date | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  public updatedAt: Date | null;
}
